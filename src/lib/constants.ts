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

/* ── Error Thresholds (ms) ── */
export const ERROR_THRESHOLDS: Record<string, number> = {
  rt_slot1: 6 * 60 * 60 * 1000,   // 6h
  rt_slot2: 36 * 60 * 60 * 1000,  // 36h
  rt_slot3: 36 * 60 * 60 * 1000,  // 36h
};
