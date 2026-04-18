-- ─────────────────────────────────────────────────────────────────
-- Time tracking schema — 30-min timebox planner for /calendar/blocks
-- ─────────────────────────────────────────────────────────────────
-- Two tables, both user-scoped with strict RLS. Entries are pinned to
-- 30-minute slot boundaries (00 or 30) so the weekly grid renders as
-- a deterministic 7×48 matrix. Sunday-start, Asia/Seoul display TZ.
--
-- Categories carry their display color (OKLCH-derived hex) — the UI
-- picks a darker "main" tone and a lighter "buffer" tone from the
-- same hue at render time, so only one colour per category is stored.

-- ── Categories ────────────────────────────────────────────────────

create table public.time_categories (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  label          text not null,
  color_hex      text not null
    check (color_hex ~ '^#[0-9A-Fa-f]{6}$'),
  display_order  int  not null default 0,
  is_default     boolean not null default false,
  created_at     timestamptz not null default now(),
  unique (user_id, label)
);

create index time_categories_user_order_idx
  on public.time_categories (user_id, display_order);

alter table public.time_categories enable row level security;

create policy "time_categories_select_own"
  on public.time_categories for select
  using (auth.uid() = user_id);

create policy "time_categories_modify_own"
  on public.time_categories for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Entries ───────────────────────────────────────────────────────

create table public.time_entries (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,

  -- 30-minute boundary (00 or 30). timestamptz stored UTC; UI
  -- renders against Asia/Seoul.
  slot_start        timestamptz not null,

  duration_minutes  smallint not null default 30
    check (duration_minutes > 0 and duration_minutes % 30 = 0),

  category_id       uuid references public.time_categories(id) on delete set null,

  intensity         text not null default 'main'
    check (intensity in ('main','buffer')),

  note              text,

  source            text not null default 'manual'
    check (source in ('manual','import')),

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  -- Enforce 30-min boundary alignment on slot_start.
  constraint time_entries_slot_aligned
    check (extract(minute from slot_start)::int in (0, 30)
       and extract(second from slot_start) = 0)
);

create index time_entries_user_slot_idx
  on public.time_entries (user_id, slot_start);

alter table public.time_entries enable row level security;

create policy "time_entries_select_own"
  on public.time_entries for select
  using (auth.uid() = user_id);

create policy "time_entries_modify_own"
  on public.time_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── updated_at trigger ────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger time_entries_updated_at
  before update on public.time_entries
  for each row execute function public.set_updated_at();

-- ── Category seed helper ──────────────────────────────────────────
-- Seeds the six default categories for a given user. Called once per
-- user, either from the signup trigger or manually.
--   업무 — 노란색       · 수면 — 회색
--   취미 — 초록색       · 주말/공휴일 — 하늘색
--   부업/자기계발 — 연회색 · 가족/불가피 — 보라색

create or replace function public.seed_default_time_categories(p_user_id uuid)
returns void language plpgsql as $$
begin
  insert into public.time_categories (user_id, label, color_hex, display_order, is_default)
  values
    (p_user_id, '업무',          '#D9B84A', 1, true),
    (p_user_id, '수면',          '#6D7684', 2, true),
    (p_user_id, '취미',          '#5CB089', 3, true),
    (p_user_id, '주말/공휴일',   '#86B8CF', 4, true),
    (p_user_id, '부업/자기계발', '#B1B6C0', 5, true),
    (p_user_id, '가족/불가피',   '#A378C9', 6, true)
  on conflict (user_id, label) do nothing;
end;
$$;
