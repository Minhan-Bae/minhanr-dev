import { redirect } from "next/navigation";

/**
 * /command was a near-duplicate of /dashboard (agent org chart,
 * activity timeline, vault stats). Merged during the overnight
 * refactor. Redirect preserves any stale links.
 */
export default function CommandRedirect() {
  redirect("/dashboard");
}
