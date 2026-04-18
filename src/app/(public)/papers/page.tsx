import { redirect } from "next/navigation";

/**
 * /papers is retired. Research-tagged posts live in the main writing
 * feed. Redirect preserves inbound links.
 */
export default function PapersPage(): never {
  redirect("/blog");
}

export const dynamic = "force-static";
