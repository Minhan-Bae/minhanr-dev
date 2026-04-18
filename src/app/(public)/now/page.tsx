import { redirect } from "next/navigation";

/**
 * /now has been retired. The live "what I'm focused on" signal came from
 * the vault index, which is no longer exposed on public surfaces. What's
 * current is expressed through the Selected Works on /.
 */
export default function NowRedirect(): never {
  redirect("/");
}

export const dynamic = "force-static";
