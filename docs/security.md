# Security — minhanr.dev

This file documents the security boundaries, secrets, and authentication
patterns used by minhanr-dev. Production values live in Vercel; local
values live in `.env.local` (template: `.env.local.example`).

The codebase has two distinct authentication systems:

- **API auth** — protects internal HTTP routes (`src/lib/api-auth.ts`)
- **Supabase auth** — protects pages and user-scoped data (`src/proxy.ts`,
  `src/lib/supabase-middleware.ts`)

Plus three external integrations that each have their own secret:

- **GitHub vault** — read-only fetch of vault index and notes
- **GitHub webhook** — HMAC-signed delivery from vault repo
- **Cron secret** — bearer token for scheduled job invocation

---

## 1. Page auth (Tier 0/1/2/3 model)

Pages are partitioned by sensitivity, enforced in two places:

| Tier | Audience | Examples | Enforcement |
|---|---|---|---|
| 0 | Public, indexable | `/`, `/blog`, `/colophon` | None (always accessible) |
| 1 | Public, no-index | `/papers`, `/projects` | `robots: { index: false }` only |
| 2 | Public, but path-filtered | vault note browser | `isTier2Path()` whitelist in `src/lib/vault-tiers.ts` |
| 3 | Authenticated user only | `/dashboard`, `/finance`, `/notes/*`, `/calendar`, etc. | Supabase session in middleware |

The middleware lives at `src/proxy.ts` (Next.js 16 renamed `middleware.ts` →
`proxy.ts`). It calls `src/lib/supabase-middleware.ts` which checks the
session cookie and either allows the request, redirects to `/login`, or
returns 404 (for paths that should not leak existence).

**Defense in depth**: Even when middleware allows the request, individual
private pages re-check `auth.getUser()` to handle the (theoretical) case
of middleware bypass. See `src/app/(private)/notes/[...path]/page.tsx`
for an example.

---

## 2. API auth — `src/lib/api-auth.ts`

API routes do NOT inherit page middleware. Each route must call its own
auth helper. Phase F-Critical (commit `c9d76e1`) added these helpers and
applied them to 18 routes.

### `requireUser()`

Returns the authenticated Supabase user, or a 401 `Response`. Use for
routes that mutate user-scoped data (tasks, quicknotes, schedules):

```typescript
export async function POST(req: Request) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  // ... user.id is now available
}
```

### `requireCronSecret(req)`

Returns `null` if the request includes the correct
`Authorization: Bearer ${CRON_SECRET}` header, or a `Response` with the
appropriate status code:

- **401** — header missing or wrong
- **503** — `CRON_SECRET` env var not set on the server (intentional —
  fail closed when the secret hasn't been configured)

Use for routes invoked by external cron services
(`/api/cron/check-heartbeat`).

### Public routes

Two routes are intentionally unauthenticated:

- `/api/activity` — recent vault commits, used by home page
- `/api/blog` — blog post list, used by RSS / external aggregators

Both surface only data that is already public elsewhere. The exception
is documented in the route file's top comment.

### Webhook signature

`/api/webhook/github` uses HMAC-SHA256 verification with
`GITHUB_WEBHOOK_SECRET` (matching the secret configured on the GitHub
webhook). It does not use `requireUser()` or `requireCronSecret()`
because GitHub doesn't carry a Supabase session.

---

## 3. Vault token

`GITHUB_TOKEN` is used by:

- `src/lib/vault-index.ts` — fetch `090_System/vault_index.json` from
  the private vault repo
- `src/lib/vault-note.ts` — fetch individual note bodies on demand
- `src/app/api/activity/route.ts` — fetch recent commits
- `src/app/api/cron/check-heartbeat/route.ts` — read agent state

### Required scope

The token must have **read access to `GITHUB_REPO`** (default
`Minhan-Bae/oikbas-vault`).

- **Fine-grained PAT**: add the repo to "Selected repositories" → grant
  "Contents: Read-only" (and "Metadata: Read-only", which is automatic).
- **Classic PAT**: grant the `repo` scope. (Broader than needed but
  works.)

### Vault 404 diagnostic

If `vault_index fetch failed: 404` shows up in your dev server logs,
the token is **almost always the cause** — not a missing file or wrong
URL. GitHub returns 404 (not 401/403) for private repo content when the
caller's token lacks permission, to avoid leaking existence.

To diagnose:

```bash
set -a; source .env.local; set +a
curl -s -o /dev/null -w "HTTP %{http_code}\n" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "User-Agent: minhanr-dev" \
  "https://api.github.com/repos/${GITHUB_REPO}"
# 200 → OK
# 404 → token lacks repo permission (NOT a missing repo)
```

If 404 with a valid token: the easiest fix is to **copy the production
token from Vercel** (Settings → Environment Variables → `GITHUB_TOKEN`
Production) into local `.env.local`. The production token is known to
work, so you skip the PAT scope-debugging dance entirely.

Alternative fixes:

1. Edit the existing fine-grained PAT to add `oikbas-vault` to its
   repository allowlist.
2. Generate a new classic PAT with `repo` scope.

After updating the token, restart `npm run dev`.

### Graceful degrade — Phase G-defense

All public and private pages that depend on the vault index wrap their
fetches in `try/catch` and render `<VaultUnreachablePublic />` or
`<VaultUnreachablePrivate />` (`src/components/vault-unreachable.tsx`)
when the round-trip fails. This means:

- Public visitors never see a 500 error from a vault outage
- The user (private pages) sees a destructive Card with the actual
  error message for fast debugging
- Production stays robust against rate limits, GitHub outages, and
  token expiry

---

## 4. Webhook secret

`GITHUB_WEBHOOK_SECRET` is the shared secret between this server and
the GitHub webhook configuration on the vault repo. It signs every
delivery payload with HMAC-SHA256, and `/api/webhook/github` verifies
the signature before acting.

### Setup

1. Generate a strong secret:
   ```bash
   openssl rand -hex 32
   ```
2. Add `GITHUB_WEBHOOK_SECRET=<value>` to Vercel production env.
3. In the vault repo: Settings → Webhooks → edit the webhook → Secret →
   paste the same value.
4. The route rejects any delivery whose signature doesn't match.

---

## 5. Cron secret

`CRON_SECRET` protects `/api/cron/*` routes from being invoked by
unauthenticated callers. The route checks the
`Authorization: Bearer <secret>` header on every request.

### Setup

1. Generate a strong secret:
   ```bash
   openssl rand -hex 32
   ```
2. Add `CRON_SECRET=<value>` to Vercel production env.
3. Configure your cron service (Vercel Cron, EasyCron, cron-job.org,
   etc.) to send the header on each invocation:
   ```
   Authorization: Bearer <value>
   ```
4. **Without this var set**, `/api/cron/*` routes return **503**. This
   is intentional fail-closed behavior — the cron infrastructure is
   inert until the secret is in place.

### Verification

```bash
# Should return 401 (missing header)
curl -i https://minhanr.dev/api/cron/check-heartbeat

# Should return 200 (or whatever the route does on success)
curl -i -H "Authorization: Bearer $CRON_SECRET" \
  https://minhanr.dev/api/cron/check-heartbeat
```

---

## 6. Supabase RLS (Row Level Security)

**Status**: not yet audited. Phase F-Critical (commit `c9d76e1`) added
the API auth layer (defense layer 1). Supabase RLS is the second
defense layer — it ensures that even with the anon key, a request can
only see/modify rows belonging to the authenticated user.

### Why RLS matters even with API auth in place

The API auth check (`requireUser()`) protects every server route in
`/api/*`, but the anon Supabase key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
is **shipped to the client** by design. Anyone reading the page source
can see it. Without RLS, that key could be used outside the API
routes — directly against Supabase REST/Realtime endpoints — to
read or modify any row in any table.

**Both layers are required**: API auth catches the in-app path; RLS
catches everything else.

### RLS audit checklist (manual, ~30 min)

This is a Supabase dashboard task; the codebase cannot do it for you.
Run through it once after deploying any new user-scoped table.

1. Open Supabase dashboard → **Database** → **Tables**.
2. For each user-scoped table — current candidates from the codebase:
   - `tasks`
   - `schedules`
   - `quicknotes`
   - `claude_usage`
   - `axis_metrics`
   - `agent_heartbeats`
   - any new table introduced by future phases
3. Click the table → **RLS** tab → confirm **Enable Row Level Security**
   is **ON**.
4. For each policy (`SELECT`, `INSERT`, `UPDATE`, `DELETE`), verify
   the expression restricts rows to the current user. Typical pattern:
   ```sql
   (auth.uid() = user_id)
   ```
   Or, for a join-scoped table:
   ```sql
   (auth.uid() = (SELECT user_id FROM parent WHERE id = parent_id))
   ```
5. Tables that intentionally have **no** user scoping (shared lookup
   tables, public read-only data) are exceptions — document them in a
   small `docs/rls-exceptions.md` if/when they exist, with the
   reasoning per table.

### Verification — direct Supabase test

After enabling RLS, verify it actually rejects unauthenticated reads:

```bash
# Should return 401 / empty result
curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/tasks?select=*" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}"
```

If this returns rows without an `Authorization: Bearer <jwt>` header,
RLS is not active on the `tasks` table.

### Future automation

A `scripts/verify-rls.ts` script that lists all tables via the
management API and asserts `rls_enabled = true` would catch silent
drift. Tracked as a follow-up; not blocking.

---

## 7. Quick reference — what to do when X

| Symptom | Likely cause | Fix |
|---|---|---|
| `vault_index fetch failed: 404` in dev | local PAT lacks `oikbas-vault` access | Copy Vercel production `GITHUB_TOKEN` into `.env.local` |
| `/api/cron/*` returns 503 | `CRON_SECRET` env var not set | Generate with `openssl rand -hex 32`, add to Vercel + cron service |
| `/api/cron/*` returns 401 | request missing/wrong `Authorization: Bearer` header | Check the cron service's header config |
| `/api/webhook/github` returns 401 | HMAC signature mismatch | Verify `GITHUB_WEBHOOK_SECRET` matches the GitHub webhook config |
| Page returns 500 instead of placeholder when vault unreachable | the page hasn't been guarded yet | Wrap `getCachedVaultIndex()` in try/catch + return `<VaultUnreachable* />` |
