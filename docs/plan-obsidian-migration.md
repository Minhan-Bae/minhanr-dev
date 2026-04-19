# Obsidian → minhanr-dev 마이그레이션 액션플랜

> 목표: 800+ 노트의 입출력·편집·관리를 **minhanr-dev 단일 surface**에서 처리.
> Obsidian은 읽기 전용 아카이브로 격하, 벌트는 git 백업으로만 남긴다.
> 전체 16영업일(≈3주), 1인 작업자 기준.

## Source-of-truth 전환 전략 (중요)

**full 양방향 sync는 채택하지 않는다.** 파일↔DB 양방향은 conflict
resolution · rename tracking · delete order · frontmatter 왕복 손실 문제가
CRDT 수준의 복잡도를 요구해서 16일 스콥에 안 들어간다. 대신 단계별로
**SoT를 한쪽으로 유지**하는 phase-gated 방식으로 간다.

| Phase | 기간 | Obsidian | Supabase | minhanr-dev |
|---|---|---|---|---|
| **A** | Sprint 1-2 | ✍ SoT (write) | 📥 mirror (push only) | 👁 read+search |
| **B** | Sprint 3-4 | 🔒 read-only | ✍ SoT | ✍ full CRUD |
| **C** | Sprint 4+ | 💤 archived (git) | ✍ SoT | ✍ full CRUD |

- Phase A: `chokidar` or git pre-commit hook이 vault 변경 감지 → Supabase upsert. Obsidian 워크플로 유지하면서 DB 미러 쌓는다.
- Phase B: vault README에 "read-only" 공지 + pre-commit hook으로 편집 차단, Supabase가 SoT. minhanr-dev 에디터 프로덕션 투입.
- Phase C: Supabase → vault `.md` export(1일 1회 cron). vault는 이중 백업 아카이브.

**언제든 롤백 가능**: Phase B 실패시 A로 복귀, phase 간 이동은 `Sync 방향 스위치` 한 줄 설정 변경.

**진짜 어디서든 편집**(= full 양방향)이 필요해지면 Sprint 5-6 별도 과제로 떼고 Yjs/CRDT 기반 sync 레이어 추가. 본 플랜에는 포함하지 않는다.

---

## 0. 전체 아키텍처

```
             ┌──────────────────────────┐
             │       minhanr-dev        │
             │  (Next.js 16 / Vercel)   │
             │                          │
  편집/읽기 ←┤  /notes · /notes/new    │
             │  /notes/[...path]       ├→ 공개 /blog/[slug] (published only)
             │  /search · /graph       │
             └────────┬─────────┬───────┘
                      │         │
              RLS CRUD│         │signed PUT/GET
                      ▼         ▼
           ┌──────────────┐  ┌─────────────────────┐
           │   Supabase   │  │  Cloudflare R2      │
           │              │  │                     │
           │  notes       │  │  minhanr-dev-notes  │
           │  backlinks   │  │  (첨부·이미지)      │
           │  FTS tsvector│  │  public read only   │
           └──────────────┘  └─────────────────────┘
                      ▲
             archive  │
           (one-shot) │
           oikbas-vault (GitHub, read-only)
```

- **Supabase**: 프론트매터 + 본문 + tsvector FTS + 백링크 테이블
- **R2**: 이미지·첨부(에그리스 0). `minhanr-dev-images`와 별도 버킷
- **Vercel**: ISR + on-demand revalidate(Supabase trigger → webhook)

---

## 1. 스키마 (Sprint 1에서 확정)

```sql
-- notes: 본체
create table public.notes (
  id            uuid primary key default gen_random_uuid(),
  path          text unique not null,      -- '020_Projects/foo.md' (vault 호환)
  title         text not null,
  body_md       text not null default '',
  frontmatter   jsonb not null default '{}'::jsonb,
  status        text not null default 'growing',
  folder        text generated always as (split_part(path, '/', 1)) stored,
  search        tsvector generated always as (
                  to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(body_md,''))
                ) stored,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  user_id       uuid not null references auth.users(id) on delete cascade
);
create index on public.notes using gin (search);
create index on public.notes (folder, status);
create index on public.notes ((frontmatter->>'deadline'));

-- note_backlinks: 위키링크 그래프
create table public.note_backlinks (
  src_id  uuid references public.notes(id) on delete cascade,
  dst_id  uuid references public.notes(id) on delete cascade,
  primary key (src_id, dst_id)
);
create index on public.note_backlinks (dst_id);

-- RLS
alter table public.notes            enable row level security;
alter table public.note_backlinks   enable row level security;
create policy "own notes"     on public.notes            using (user_id = auth.uid());
create policy "own backlinks" on public.note_backlinks   using (
  exists (select 1 from public.notes n where n.id = src_id and n.user_id = auth.uid())
);

-- updated_at trigger + 위키링크 재계산 trigger (함수는 migration에서)
```

---

## 2. Sprint 1 — Backend + Phase A mirror (Day 1-5)

**한 줄 목표**: Obsidian이 SoT를 유지한 채 Supabase 미러가 자동으로 쌓이는 상태.

| Day | 작업 | 산출물 | Verify |
|---|---|---|---|
| 1.1 | Supabase migration 작성·apply | `supabase/migrations/20260419000002_notes_full.sql` | `list_tables` → notes/note_backlinks 확인 |
| 1.2 | R2 `minhanr-dev-notes` 버킷 생성 + public read | 버킷 URL 발급 | `wrangler r2 bucket list` |
| 1.3 | 서버 액션 스캐폴드 | `src/lib/actions/notes.ts` (create/update/list/get/delete) | 빈 프로젝트에서 createNote 실호출 OK |
| 1.4 | 초기 일괄 이관 (dry-run) | `scripts/vault-sync.mjs --dry-run` | 10개 샘플 노트 결과 검증 |
| 1.5 | 실이관 800+ rows + 백링크 재계산 | Supabase notes 테이블 full | vault vs Supabase path·title·status 일치 |
| 1.6 | **Phase A mirror worker** — vault `post-commit` hook + `chokidar` watcher | `scripts/vault-sync.mjs --watch` | vault에서 노트 저장 → 3초 내 Supabase 반영 |

**커밋 단위**:
- `chore(db): notes + backlinks schema + RLS`
- `feat(notes): server actions for CRUD`
- `chore(migrate): oikbas-vault → supabase one-shot importer + watcher`

**Phase A 수락기준**: Obsidian에서 노트 편집 → 저장 → minhanr-dev `/notes` 새로고침시 변경 반영. 역방향은 아직 없음(읽기 전용).

---

## 3. Sprint 2 — Editor (Day 5-8)

**한 줄 목표**: Obsidian 에디터 체감 90% 재현.

| Day | 작업 | 산출물 | 비고 |
|---|---|---|---|
| 2.1 | CodeMirror 6 편집기 컴포넌트 | `src/components/notes/editor.tsx` | markdown + vim 옵션 |
| 2.2 | 프론트매터 폼 (사이드 패널) | `src/components/notes/frontmatter-form.tsx` | status·tags·deadline 등 핵심 필드 |
| 2.3 | auto-save (1s debounce) + 낙관적 UI | `useAutoSave` 훅 | 네트워크 에러시 재시도·로컬 스냅샷 |
| 2.4 | 위키링크 자동완성 | `[[` 입력시 Fuse.js로 노트 검색 | 선택시 링크 삽입 |
| 2.5 | R2 업로드 (paste/drop) | `/api/r2/sign` → PUT → markdown `![](url)` 삽입 | 이미지 붙여넣기 UX |
| 2.6 | PWA 설정 | `next-pwa` + 오프라인 캐시 | 모바일/태블릿 홈 추가 |

**수락기준**: 마크다운 3000자 1분간 타이핑해도 lag 없음, 자동저장 실패 안 함.

---

## 4. Sprint 3 — Views (Day 9-12)

**한 줄 목표**: `/notes` 화면을 Obsidian File Explorer + Graph + Search 수준으로.

| Day | 작업 | 산출물 | 비고 |
|---|---|---|---|
| 3.1 | `/notes` 파일트리 + 폴더 뷰 | `src/app/(private)/notes/page.tsx` | 현재 vault-index 기반 → Supabase listNotes |
| 3.2 | `/notes/[...path]` 상세 + 인라인 편집 | `src/app/(private)/notes/[...path]/page.tsx` | 서버 → 클라이언트 에디터 마운트 |
| 3.3 | 백링크 패널 | `src/components/notes/backlinks-panel.tsx` | note_backlinks 조회 |
| 3.4 | `/search` FTS | `src/app/(private)/search/page.tsx` | tsvector 쿼리 + 하이라이트 |
| 3.5 | `/graph` 데이터 소스 교체 | vault-index → Supabase | 기존 그래프 UI 그대로 |
| 3.6 | 태그 페이지 `/tags/[tag]` | jsonb 인덱스 쿼리 | 기존 태그 클라우드 유지 |

**수락기준**: Obsidian 없이 `/notes`에서 노트 찾기·읽기·편집 끝까지 가능.

---

## 5. Sprint 4 — Phase B/C 전환 + Publish (Day 13-16)

**한 줄 목표**: SoT를 Supabase로 전환, Obsidian은 read-only 아카이브, 발행 파이프라인 직결.

| Day | 작업 | 산출물 |
|---|---|---|
| 4.1 | **Phase B 진입**: vault pre-commit hook으로 편집 차단 + README에 read-only 공지 | `vault/.git/hooks/pre-commit` + `vault/README.md` |
| 4.2 | Supabase → vault `.md` export cron (1일 1회, 이중 백업) | `scripts/supabase-to-vault-export.mjs` |
| 4.3 | Supabase trigger → Vercel revalidate webhook | `supabase/functions/notify-publish/` edge function |
| 4.4 | `/blog` ISR 소스 교체 (content/posts → notes where status=published) | `src/lib/blog.ts` |
| 4.5 | `src/content/posts/*.md` 동결 + 기존 4개 Supabase 이관 | migration 로그 |
| 4.6 | vault-index 의존 코드 제거 (대시보드 Knowledge/Projects 카드 재배선) | `src/components/dashboard/hub-cards.tsx` |
| 4.7 | oikbas-vault GHA `publish-to-blog.yml` 비활성 | 워크플로 disable |
| 4.8 | **Phase C 선언**: vault는 아카이브 · 문서 갱신 | `docs/content-model.md` + `README.md` |

**완료 정의**: 블로그 신규 글을 `/notes/new` → `status: published` 한 번으로 배포까지 도달. vault는 Obsidian 열어도 편집 불가(read-only).

---

## 6. 리스크 & 롤백

| 리스크 | 영향 | 완화 |
|---|---|---|
| Supabase FTS 한글 정확도 낮음 | 검색 품질 저하 | tsvector `simple` + 별도 trigram 인덱스 병행, 후속 Meilisearch 옵션 |
| CodeMirror 로딩 지연 | 편집 UX | `dynamic import` + 스켈레톤 |
| 800+ 일괄 이관시 RLS/유니크 충돌 | 마이그레이션 실패 | dry-run 먼저, 트랜잭션 단위 1000 rows, 실패 노트만 재시도 |
| 위키링크 깨짐 | 백링크 누락 | Sprint 1.5 후 `recompute_backlinks()` 수동 호출로 전체 재계산 |
| Vercel revalidate 실패 | 발행 누락 | trigger 실패시 cron(1h)로 fallback refresh |
| Phase A watcher race (vault 저장 중복 이벤트) | 동일 노트 2회 upsert | `chokidar` debounce 500ms + path+mtime 해시 dedup |
| Phase B 조기 전환으로 Obsidian 근육 손상 | 생산성 저하 | 에디터 수락 테스트(Sprint 3.2) 통과 전에는 B 미진입, vault 편집 유지 |

**롤백 전략**:
- Sprint 1 실패 → migration revert + `/notes`는 기존 vault-index 유지
- Sprint 2 실패 → 에디터만 비활성, 읽기 전용 뷰로 degrade
- Sprint 3 실패 → 스프린트별 PR 분리, 문제 있는 뷰만 revert
- Sprint 4 실패 → ISR 소스 교체 지연, Obsidian 파이프라인 유지

---

## 7. 의존성 · 비용

**추가 패키지**:
```
@codemirror/lang-markdown
@codemirror/state
@codemirror/view
@codemirror/commands
@uiw/react-codemirror       # 래퍼
fuse.js                     # 위키링크 자동완성
next-pwa                    # 오프라인 편집
```

**비용 (무료 티어 내)**:
- Supabase Free: 500MB DB + 1GB 스토리지 → 노트 800개 ≈ 10MB
- Cloudflare R2: 10GB storage + 에그리스 0
- Vercel Hobby: 현재 플랜 유지

월 **$0** (현 트래픽 기준).

---

## 8. 오늘 시작 (승인시 Day 1)

```
1. supabase/migrations/20260419000002_notes_full.sql 작성
2. mcp apply_migration → notes / note_backlinks / RLS / trigger
3. R2 bucket create: minhanr-dev-notes + dev-url enable
4. src/lib/actions/notes.ts 스캐폴드 (create·update·list·get·delete)
5. 빈 DB에 하나 insert → list → update → delete end-to-end 확인
6. commit: "chore(db): notes schema + server actions (sprint 1 day 1)"
7. Vercel READY 확인하고 보고
```

이 파일을 체크리스트로 사용. Sprint마다 완료 항목 `✓` 표시하며 진행.

---

## 9. 지식 구조 플로우차트

### 9.1 현재 (As-is, 2026-04-19)

```
INPUT: 타이핑 · 음성 · 논문 · 아이디어
  └─▶ Obsidian Desktop / Mobile · Telegram capture bot · paper-reader bot
         └─▶ oikbas-vault (PARA, 800 notes)  ◀── SoT
                └─▶ GitHub (private repo)
                      ├─▶ GHA blog_publisher → PR → minhanr-dev/src/content/posts/
                      └─▶ vault-index scan → minhanr-dev JSON cache
                            └─▶ minhanr-dev (Next.js / Vercel)
                                  ├─ Public: / · /work · /blog · /about · /studio
                                  └─ Private: /dashboard · /notes · /graph · /calendar
                                        ├─▶ Supabase (time_entries / categories / auth)
                                        └─▶ Cloudflare R2 (minhanr-dev-images)
```

### 9.2 Phase A — Mirror (Sprint 1-2)

```
INPUT 동일 (Obsidian 유지)
  └─▶ oikbas-vault  ◀── 여전히 SoT
        ├─▶ GitHub
        └─▶ [NEW] vault-sync.mjs (post-commit hook + chokidar watcher)
              └─▶ Supabase (notes + note_backlinks + FTS tsvector)
                    └─▶ minhanr-dev
                          ├─ /notes (Supabase로 read 소스 교체)
                          ├─ /search (FTS, NEW)
                          └─ /graph (note_backlinks 사용)
```

### 9.3 Phase C — 완료 (Sprint 4+)

```
INPUT: 데스크탑·음성·논문·모바일
  ├─▶ minhanr-dev /notes/new (CodeMirror 6)
  ├─▶ Telegram capture bot  (POST /api/notes)
  ├─▶ Telegram paper-reader (POST /api/notes)
  └─▶ minhanr-dev PWA (offline-first, sync on wifi)
        │
        └─▶ Supabase (SoT) ✍
              │
              ├─▶ [trigger] Edge Function notify-publish
              │     └─▶ Vercel revalidate webhook
              │           ├─▶ /blog/[slug]   (public ISR)
              │           └─▶ /notes · /graph (private)
              │
              ├─▶ [cron 1d] supabase-to-vault-export.mjs
              │     └─▶ oikbas-vault (Git 아카이브, read-only)
              │           └─▶ Obsidian 열면 편집 차단 (pre-commit hook)
              │
              └─▶ [paste/drop asset] → R2
                    ├─ minhanr-dev-images (공개 블로그)
                    └─ minhanr-dev-notes  (비공개 노트 첨부)
```

### 9.4 스냅샷 비교

| 항목 | 현재 | Phase A | Phase C |
|---|---|---|---|
| SoT | Obsidian vault | Obsidian vault | Supabase |
| 입력 surface | Obsidian + bots | Obsidian + bots | minhanr-dev + bots + PWA |
| 검색 | Obsidian 로컬 | Supabase FTS | Supabase FTS |
| 그래프 | vault-index JSON | note_backlinks DB | note_backlinks DB |
| 발행 | GHA → PR | GHA → PR | Supabase trigger |
| 이미지 | vault attachments | vault + R2 | R2 2-bucket |
| 모바일 | Obsidian Mobile | Obsidian Mobile | minhanr-dev PWA |
| Obsidian 편집 | ✍ | ✍ | 🔒 read-only |

