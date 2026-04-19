# Phase A Mirror — Obsidian vault → Supabase

스프린트 1 기준 Phase A 운영 방법. vault가 여전히 SoT이고 Supabase는
미러 — studio 에디터 완성(Sprint 2) 전까지 Obsidian에서 편집하더라도
검색·그래프·대시보드가 최신 상태를 반영하도록 한다.

## npm scripts

```
npm run vault:sync           # oikbas-vault 로컬 경로 → Supabase 일괄 동기
npm run vault:sync:dry       # 파싱 플랜만 출력 (DB 안 씀)
npm run vault:sync:sample    # 앞의 20개만 dry-run
```

환경 변수 (`.env.local`에서 자동 로드):

```
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_KEY
VAULT_LOCAL_PATH              # 기본 ../oikbas-vault
```

## 실행 흐름

1. 로컬 vault 경로를 재귀 스캔 — 숫자 prefix 폴더(`000_*` ~ `090_*`) + 루트 레벨 `000_Dashboard.md`만.
2. gray-matter로 frontmatter 파싱. malformed YAML은 lenient fallback (본문만 보존, 빈 프론트매터).
3. `vault_notes` upsert (onConflict=path) — 500개 배치.
4. `vault_tags` 전량 재동기 (delete → insert, path→id 매핑 기반).
5. `reset_all_note_backlinks()` RPC로 `vault_note_backlinks` 전체 재계산.

1700+ 노트 기준 실행 시간 ≈ 20–40초.

## Git post-commit hook (선택)

vault에서 commit할 때마다 자동 mirror를 원한다면 `oikbas-vault/.git/hooks/post-commit`에 다음 스크립트를 설치:

```bash
#!/usr/bin/env bash
# Auto-sync vault → Supabase after local commit.
# Fails silently — vault commit 자체는 hook 결과와 무관하게 성공 처리.
MINHANR_DEV="$HOME/Documents/workspace/minhanr-dev"
if [ -d "$MINHANR_DEV" ]; then
  (cd "$MINHANR_DEV" && npm run vault:sync --silent > /tmp/vault-sync.log 2>&1) &
fi
exit 0
```

실행 권한 부여:

```
chmod +x oikbas-vault/.git/hooks/post-commit
```

효과:
- 백그라운드로 동작 → commit UX 영향 없음
- 실패해도 vault commit은 성공 (SoT 안전성 우선)
- 로그는 `/tmp/vault-sync.log`에서 확인

## Studio 편집 (write-through)

`src/lib/actions/notes.ts`의 `saveNoteContentAction`·`createNoteAction`은
GitHub Contents API로 vault에 커밋한 뒤 **즉시** Supabase `vault_notes`에
write-through. `edit_source: 'studio'`로 마킹돼 vault commit 대비 구분 가능.

vault commit이 먼저 찍히고 Supabase가 바로 뒤따르므로 로컬 post-commit
hook이 돌지 않아도 studio 편집은 자동 미러.

## Obsidian Mobile / 타 머신

- iPad / iPhone에서 편집한 후 동기 시점: 데스크탑에서 다음 pull + `npm run vault:sync`
- 또는 Sprint 4에서 GHA `scheduled` workflow로 cron 자동화 예정

## Sprint 4 이후

Phase B 진입 시 vault는 read-only → studio가 SoT. `vault-sync.mjs`는
역방향 `supabase-to-vault-export.mjs`로 대체되고 1일 1회 cron으로 실행.

## Vercel revalidation 자동화 (Sprint 4)

vault-sync 완료 후 minhanr-dev의 ISR 캐시를 즉시 무효화하려면
`.env.local` + Vercel env에 다음 값 설정:

```
REVALIDATE_URL=https://minhanr.dev/api/revalidate
REVALIDATE_SECRET=<random 32+ char string>
```

스크립트가 두 값 모두 읽으면 sync 마지막 단계에 POST로 호출 →
`/`, `/notes`, `/search`, `/graph`, `/dashboard`, `/blog`가 동시에
재검증된다. 값이 없으면 조용히 skip (UX 영향 없음).

## 트러블슈팅

| 증상 | 원인 | 조치 |
|---|---|---|
| `414 URI Too Large` | path in() 너무 많음 | 전체 id 조회로 변경 (이미 적용) |
| `JSON object requested, multiple rows` | path 중복 | vault의 같은 경로 중복 파일 찾기 (거의 없음) |
| `parse error in frontmatter` | 중복 키/alias/separator | fallback으로 진행 — 본문은 저장됨. vault 파일 YAML 고치면 다음 sync에서 정상 반영 |
| 1729 ≠ 예상 800 | 050_Archive 포함 | 의도된 동작, 인덱스는 전량 |
