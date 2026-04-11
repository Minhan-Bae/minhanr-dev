/**
 * VaultUnreachable — graceful degrade UI for pages that depend on the
 * GitHub vault index (`getCachedVaultIndex`).
 *
 * Two variants for two audiences:
 *
 * - **Public** (`VaultUnreachablePublic`) — anonymous visitors on
 *   /papers, /projects, etc. Shows the page h1 and a prose placeholder
 *   line. Tenet 1 ("Live from the vault"): when a real number cannot
 *   be obtained, label the placeholder explicitly rather than committing
 *   a lie. NEVER expose technical error details to anonymous visitors.
 *
 * - **Private** (`VaultUnreachablePrivate`) — authenticated user
 *   tooling (/dashboard, /trends, /tags, etc.). Shows a destructive
 *   Card with the actual error message so the user can debug. Used by
 *   the (private) route group only.
 *
 * Both kept in the same file because they share an invariant: when the
 * vault round-trip fails, surface a placeholder instead of throwing —
 * that's a single design decision with two presentations.
 */

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PublicProps {
  /** Page label rendered as h1 (e.g. "Papers", "Projects"). */
  label: string;
}

export function VaultUnreachablePublic({ label }: PublicProps) {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{label}</h1>
      <p className="text-sm text-muted-foreground">
        vault index unreachable — placeholder until token / data flow restored.
      </p>
    </div>
  );
}

interface PrivateProps {
  /** Optional caught error to surface in the dev card. */
  error?: unknown;
}

export function VaultUnreachablePrivate({ error }: PrivateProps) {
  const message =
    error instanceof Error ? error.message : error !== undefined ? String(error) : null;

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="text-destructive text-sm">Vault index 로드 실패</CardTitle>
        {message && <CardDescription>{message}</CardDescription>}
      </CardHeader>
    </Card>
  );
}
