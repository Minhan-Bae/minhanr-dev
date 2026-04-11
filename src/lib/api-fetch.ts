/**
 * apiFetch — client-side fetch wrapper with consistent 401 handling.
 *
 * Phase F-2 (client 401 handling): the `(private)` route group has its
 * page-level Supabase session check, but client components that call
 * `/api/*` after the page mounts can still hit a 401 if the session
 * expired in the background. Before this wrapper, each component had
 * its own ad-hoc try/catch around `fetch` and silently swallowed the
 * 401 (or showed a confusing toast like "Save failed").
 *
 * The wrapper centralizes:
 *   - 401 → hard redirect to /login?from=<current path> (default)
 *   - 4xx/5xx → throw `ApiFetchError` with status + parsed body
 *   - network failure → throw `ApiFetchError` with status 0
 *   - 2xx → resolve with parsed JSON (or null if no body)
 *
 * Callers that legitimately want to handle 401 themselves (rare) can
 * pass `redirectOn401: false`.
 *
 * Use only from client components / browser context. SSR has
 * `requireUser()` for the same purpose (`src/lib/api-auth.ts`).
 */

export class ApiFetchError extends Error {
  readonly status: number;
  readonly data: unknown;

  constructor(status: number, data: unknown, message?: string) {
    super(message ?? `HTTP ${status}`);
    this.name = "ApiFetchError";
    this.status = status;
    this.data = data;
  }
}

export interface ApiFetchOptions extends RequestInit {
  /**
   * When the response is 401 and the call is running in the browser,
   * navigate to `/login?from=<current path>`. Default `true`.
   * Set to `false` to throw `ApiFetchError(401)` instead — useful for
   * background polls that should fail silently.
   */
  redirectOn401?: boolean;
}

/**
 * Fetch a JSON endpoint and return its parsed body.
 *
 * Throws `ApiFetchError` on any non-2xx response. The error carries the
 * HTTP status and parsed body so callers can branch on it:
 *
 * ```ts
 * try {
 *   const data = await apiFetch<TaskResponse>("/api/tasks", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ title }),
 *   });
 * } catch (e) {
 *   if (e instanceof ApiFetchError && e.status === 409) {
 *     // duplicate — handle locally
 *   } else {
 *     toast.error(e instanceof Error ? e.message : "Save failed");
 *   }
 * }
 * ```
 */
export async function apiFetch<T = unknown>(
  url: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { redirectOn401 = true, ...init } = options;

  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (e) {
    throw new ApiFetchError(
      0,
      null,
      e instanceof Error ? e.message : "Network error"
    );
  }

  if (res.status === 401) {
    if (redirectOn401 && typeof window !== "undefined") {
      const from = encodeURIComponent(
        window.location.pathname + window.location.search
      );
      // Hard nav so the new page picks up the (now-cleared) auth cookie.
      window.location.href = `/login?from=${from}`;
      // Throw to halt the calling code; the navigation will replace
      // the current document before any catch handler runs.
      throw new ApiFetchError(401, null, "Session expired — redirecting to login");
    }
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      // non-JSON 401 — leave body as null
    }
    throw new ApiFetchError(401, body, "Unauthorized");
  }

  // Try to parse JSON regardless of ok-ness — the server's error body
  // is usually JSON and useful to surface.
  let data: unknown = null;
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    throw new ApiFetchError(res.status, data, `HTTP ${res.status}`);
  }

  return data as T;
}
