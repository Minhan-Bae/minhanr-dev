import { redirect } from "next/navigation";

/**
 * Legacy route — /calendar and /calendar/blocks were merged during the
 * overnight refactor (Phase A, 2026-04-19). Any bookmarks / links land
 * on the unified grid at /calendar. This file can be removed once the
 * commit history stops carrying the old path.
 */
export default function BlocksRedirect() {
  redirect("/calendar");
}
