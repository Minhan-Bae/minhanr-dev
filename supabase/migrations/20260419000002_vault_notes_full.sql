-- ─────────────────────────────────────────────────────────────────
-- Vault notes full schema — body + FTS + backlinks
-- ─────────────────────────────────────────────────────────────────
-- Promotes `vault-supabase.ts`의 dead scaffold를 실 테이블로 실체화.
-- oikbas-vault의 supabase_sync 패키지가 참조하던 테이블 이름과 동일하게
-- 유지해 기존 mirror job을 그대로 활성화할 수 있게 한다.
--
-- 스코프:
--   1. vault_notes        — 노트 본체 (메타 + body_md + FTS)
--   2. vault_tags         — tag N:M
--   3. vault_note_backlinks — 위키링크 그래프 (path 기반)
--
-- 왜 body_md를 메인 테이블에 두나:
--   800 notes × 평균 4KB ≈ 3MB — Supabase Free 500MB 대비 무시 가능.
--   toast storage로 알아서 대형 본문 외부화되므로 list 쿼리 성능 영향
--   없음 (select는 필요한 컬럼만 넘겨줄 것).
--
-- 왜 FTS를 generated column으로 두나:
--   업데이트시 자동 재계산. body_md 변경시 tsvector 동기화 보장.
--   language='simple' — 한글+영문 혼용이라 stemmer 없는 게 정확도 높음.
--   후속으로 pg_trgm(부분 일치) 추가 여지 남김.
--
-- RLS 모델:
--   Minhan 단독 사용이므로 per-user 분할 대신 role 기반 단순화:
--   • select: authenticated (전체 read)
--   • insert/update/delete: service_role 전용 (sync job + server actions)
--   server actions는 createSupabaseServer로 getUser 검증 후 admin 클라이언트로
--   쓰기 — 권한 경계는 server action 레이어에서 담당, DB는 단일 owner 가정.

-- ── vault_notes ───────────────────────────────────────────────────

create table public.vault_notes (
  id                bigint generated always as identity primary key,

  -- 파일 경로 ('020_Projects/foo.md'). Obsidian vault와 1:1 매핑.
  path              text not null unique,
  slug              text,

  -- 프론트매터 추출 핵심 필드 (검색/리스트 최적화용 denormalize)
  title             text,
  summary           text,
  excerpt           text,            -- 본문 첫 240자
  created           text,            -- YYYY-MM-DD 문자열 (frontmatter 원본)
  deadline          text,

  -- 본문 (신규 — 기존 vault-supabase.ts schema에는 없던 필드)
  body_md           text not null default '',

  -- v3 lifecycle 축 (vault-supabase.ts의 deriveLegacyStatus와 매핑)
  maturity          text,            -- seed | growing | mature | evergreen
  workflow          text,            -- planning | active | paused | completed
  publish           text,            -- draft | ready | published
  lifecycle_state   text not null default 'active',  -- active | archived
  type              text,            -- daily | template | note | ...
  category          text,
  priority          text,            -- P0 | P1 | P2
  source_type       text,            -- paper | article | book | ...
  confidence        text,

  -- 전체 프론트매터 원본 — denormalized 필드 외 나머지 보존
  frontmatter_raw   jsonb not null default '{}'::jsonb,

  -- 동기화 메타
  vault_commit      text,            -- 마지막 sync commit hash (vault→DB)
  edit_source       text not null default 'vault'
    check (edit_source in ('vault', 'studio')),
  last_edited_at    timestamptz not null default now(),

  -- FTS — title + summary + body 결합
  search            tsvector generated always as (
                      to_tsvector(
                        'simple',
                        coalesce(title,'')   || ' ' ||
                        coalesce(summary,'') || ' ' ||
                        coalesce(body_md,'')
                      )
                    ) stored,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index vault_notes_search_idx       on public.vault_notes using gin (search);
create index vault_notes_path_prefix_idx  on public.vault_notes (path text_pattern_ops);
create index vault_notes_maturity_idx     on public.vault_notes (maturity);
create index vault_notes_workflow_idx     on public.vault_notes (workflow);
create index vault_notes_publish_idx      on public.vault_notes (publish);
create index vault_notes_lifecycle_idx    on public.vault_notes (lifecycle_state);
create index vault_notes_deadline_idx     on public.vault_notes (deadline);
create index vault_notes_created_idx      on public.vault_notes (created);

alter table public.vault_notes enable row level security;

create policy "vault_notes_read_authenticated"
  on public.vault_notes for select
  to authenticated
  using (true);

-- service_role은 RLS 우회 — 별도 policy 불필요.
-- anon는 전혀 접근 불가 (public readable이어도 authenticated 제한).

-- ── vault_tags ────────────────────────────────────────────────────

create table public.vault_tags (
  note_id   bigint not null references public.vault_notes(id) on delete cascade,
  tag       text   not null,
  primary key (note_id, tag)
);

create index vault_tags_tag_idx on public.vault_tags (tag);

alter table public.vault_tags enable row level security;

create policy "vault_tags_read_authenticated"
  on public.vault_tags for select
  to authenticated
  using (true);

-- ── vault_note_backlinks ─────────────────────────────────────────
-- path 기반이 wikilink 모델과 자연스러움. 노트가 아직 DB에 없어도
-- (orphan target) 레코드 생성 가능하도록 id FK 대신 path 저장.

create table public.vault_note_backlinks (
  src_path   text not null,
  dst_path   text not null,
  anchor     text,             -- [[note#heading]]의 heading, optional
  display    text,             -- [[note|display]]의 display, optional
  primary key (src_path, dst_path, coalesce(anchor, ''))
);

create index vault_note_backlinks_dst_idx on public.vault_note_backlinks (dst_path);
create index vault_note_backlinks_src_idx on public.vault_note_backlinks (src_path);

alter table public.vault_note_backlinks enable row level security;

create policy "vault_note_backlinks_read_authenticated"
  on public.vault_note_backlinks for select
  to authenticated
  using (true);

-- ── updated_at trigger ────────────────────────────────────────────
-- time_tracking 마이그레이션에서 이미 set_updated_at 함수가 만들어짐 —
-- 재사용. 단 소유자가 없으면 실패하므로 or replace로 안전하게.

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger vault_notes_updated_at
  before update on public.vault_notes
  for each row execute function public.set_updated_at();

-- ── helper: backlink recompute ───────────────────────────────────
-- body_md에서 [[...]] 위키링크를 뽑아 backlinks 테이블을 재구축.
-- 한 노트 단위 호출 (sync/edit 후 트리거), 전체 재계산은 reset_all_backlinks()로.

create or replace function public.recompute_note_backlinks(p_src_path text)
returns void language plpgsql as $$
declare
  body text;
  link text;
  target text;
  anchor text;
  display text;
begin
  select body_md into body
    from public.vault_notes
   where path = p_src_path;

  if body is null then
    return;
  end if;

  delete from public.vault_note_backlinks
   where src_path = p_src_path;

  -- 정규식으로 [[target]], [[target|display]], [[target#anchor]], [[target#anchor|display]] 추출
  for link in
    select (regexp_matches(body, '\[\[([^\[\]]+?)\]\]', 'g'))[1]
  loop
    -- target#anchor|display 파싱
    display := null;
    anchor  := null;
    target  := link;
    if target like '%|%' then
      display := split_part(target, '|', 2);
      target  := split_part(target, '|', 1);
    end if;
    if target like '%#%' then
      anchor := split_part(target, '#', 2);
      target := split_part(target, '#', 1);
    end if;
    target := trim(target);
    if target = '' then
      continue;
    end if;
    -- '.md' 누락시 자동 부착 불가 (폴더 매핑 모름) — 원본 유지, 조회측이 prefix 매칭
    insert into public.vault_note_backlinks(src_path, dst_path, anchor, display)
    values (p_src_path, target, anchor, display)
    on conflict do nothing;
  end loop;
end;
$$;

create or replace function public.reset_all_note_backlinks()
returns void language plpgsql as $$
declare
  r record;
begin
  truncate public.vault_note_backlinks;
  for r in select path from public.vault_notes loop
    perform public.recompute_note_backlinks(r.path);
  end loop;
end;
$$;

-- ── trigger: body 변경 시 backlinks 자동 재계산 ──────────────────
-- 수동 호출 대신 DB 레벨에서 일관성 보장. bulk import시에는
-- reset_all_note_backlinks() 한 번이 더 효율적이므로 sync 스크립트는
-- 트리거를 disable 후 일괄 작업 → 마지막에 한 번만 recompute.

create or replace function public.vault_notes_backlink_sync()
returns trigger language plpgsql as $$
begin
  if tg_op = 'DELETE' then
    delete from public.vault_note_backlinks where src_path = old.path;
    return old;
  end if;
  if tg_op = 'INSERT' or new.body_md is distinct from old.body_md or new.path is distinct from old.path then
    if tg_op = 'UPDATE' and new.path is distinct from old.path then
      delete from public.vault_note_backlinks where src_path = old.path;
    end if;
    perform public.recompute_note_backlinks(new.path);
  end if;
  return new;
end;
$$;

create trigger vault_notes_backlink_sync_trg
  after insert or update or delete on public.vault_notes
  for each row execute function public.vault_notes_backlink_sync();
