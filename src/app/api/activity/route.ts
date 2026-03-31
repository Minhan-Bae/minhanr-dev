import { NextResponse } from "next/server";
import { GITHUB_COMMITS_URL, COMMITS_PER_PAGE, CACHE_TTL_SHORT } from "@/lib/constants";

const AGENT_PREFIXES: Record<string, string> = {
  "alpha:": "Alpha",
  "beta:": "Beta",
  "gamma:": "Gamma",
  "auto: collect-all": "RT Slot 1",
  "auto: collect": "RT Slot 1",
  "auto: converge": "RT Slot 2",
  "auto: morning": "RT Slot 3",
};

function identifyAgent(msg: string): string {
  for (const [prefix, name] of Object.entries(AGENT_PREFIXES)) {
    if (msg.startsWith(prefix)) return name;
  }
  if (msg.startsWith("auto:")) return "RT Slot 1";
  return "Manual";
}

export async function GET() {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
    };
    const token = process.env.GITHUB_TOKEN;
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${GITHUB_COMMITS_URL}?per_page=${COMMITS_PER_PAGE}`, {
      headers,
      next: { revalidate: CACHE_TTL_SHORT },
    });

    if (!res.ok) {
      return NextResponse.json({ commits: [] });
    }

    const data = await res.json();

    const commits = data.slice(0, COMMITS_PER_PAGE).map(
      (c: {
        sha: string;
        html_url: string;
        commit: { message: string; author: { date: string } };
      }) => ({
        hash: c.sha.slice(0, 7),
        fullHash: c.sha,
        message: c.commit.message.split("\n")[0].slice(0, 80),
        agent: identifyAgent(c.commit.message),
        date: c.commit.author.date,
        url: c.html_url,
      })
    );

    return NextResponse.json({ commits });
  } catch {
    return NextResponse.json({ commits: [] });
  }
}
