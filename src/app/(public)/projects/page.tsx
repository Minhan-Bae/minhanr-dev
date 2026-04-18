import { redirect } from "next/navigation";

/**
 * /projects has moved to /work. The old page pulled a live vault index;
 * the new case-study surface reads from `src/content/work/` only. Redirect
 * preserves inbound links from /projects/* too (Next matches the prefix
 * of the rewrite on the /projects segment only — deeper paths 404 rather
 * than leak).
 */
export default function ProjectsRedirect(): never {
  redirect("/work");
}

export const dynamic = "force-static";
