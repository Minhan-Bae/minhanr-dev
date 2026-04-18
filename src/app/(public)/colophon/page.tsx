import { redirect } from "next/navigation";

/**
 * /colophon is superseded by /about. The new About page is editorial and
 * omits the system-codename references (OIKBAS, TrinityX) the colophon
 * used to surface, per brand-tenets v2 §4 (privacy first).
 */
export default function ColophonRedirect(): never {
  redirect("/about");
}

export const dynamic = "force-static";
