import { AGENTS } from "./agents";
import { VAULT_FILES } from "./vault-paths";

/* ── GitHub ── */
export const GITHUB_REPO = process.env.GITHUB_REPO || "Minhan-Bae/oikbas-vault";
export const GITHUB_API_BASE = `https://api.github.com/repos/${GITHUB_REPO}`;
export const GITHUB_COMMITS_URL = `${GITHUB_API_BASE}/commits`;
export const VAULT_INDEX_URL = `${GITHUB_API_BASE}/contents/${VAULT_FILES.vaultIndex}`;

/* ── Polling & Cache ── */
export const DASHBOARD_POLL_MS = 60_000;   // 60s
export const ADMIN_POLL_MS = 10_000;       // 10s
export const CACHE_TTL_SHORT = 120;        // 2min (activity)
export const CACHE_TTL_VAULT = 300;        // 5min (vault)

/* ── API Limits ── */
export const COMMITS_PER_PAGE = 10;
export const CRON_COMMITS_PER_PAGE = 5;
export const COMMIT_MSG_MAX_LEN = 200;

/* ── UI Limits ── */
export const TIMELINE_DISPLAY = 8;
export const ADMIN_LOG_DISPLAY = 20;
export const BLOG_API_LIMIT = 5;
export const BLOG_HIGHLIGHTS = 3;
export const LANDING_ACTIVITY = 7;

/* ── Cost ── */
export const MONTHLY_COST_USD = 220;

/* ── Agents ── */
export const AGENT_COUNT = AGENTS.length;

/* ── Error Thresholds (ms since last heartbeat → stale) ──
 * 2026-04-26: 6h/36h → 168h(1주)으로 일괄 조정.
 * 이유: RT는 cron이 아닌 Claude Code 세션에서 운영됨.
 * 운영 중단 시간은 false-positive가 아닌 의도적 상황이므로
 * 임계값을 높여 rt-heartbeat-monitor.yml과 일치시킴. */
export const ERROR_THRESHOLDS: Record<string, number> = {
  rt_slot1: 168 * 60 * 60 * 1000, // 168h (1주)
  rt_slot2: 168 * 60 * 60 * 1000, // 168h
  rt_slot3: 168 * 60 * 60 * 1000, // 168h
};
