import { redirect } from "next/navigation";

/**
 * /papers is retired. Research-tagged posts live under /writing. Redirect
 * preserves inbound links.
 */
export default function PapersPage(): never {
  redirect("/writing?category=research");
}

export const dynamic = "force-static";
