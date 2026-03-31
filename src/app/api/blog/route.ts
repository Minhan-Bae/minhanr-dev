import { NextResponse } from "next/server";

const BLOG_REPO_API =
  "https://api.github.com/repos/Minhan-Bae/oikbas-blog/contents/content/posts";

interface GitHubFile {
  name: string;
  path: string;
  type: string;
  download_url: string;
}

export async function GET() {
  try {
    const token = process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "minhanr-dev",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(BLOG_REPO_API, { headers, next: { revalidate: 3600 } });
    if (!res.ok) {
      return NextResponse.json({ posts: [] });
    }

    const files: GitHubFile[] = await res.json();

    // Filter markdown directories (Hugo post folders) or .md files
    const postDirs = files
      .filter((f) => f.type === "dir")
      .sort((a, b) => b.name.localeCompare(a.name))
      .slice(0, 5);

    const posts = postDirs.map((dir) => {
      // Extract date and title from folder name (e.g., "2026-03-28-diffusionrenderer")
      const match = dir.name.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
      const date = match ? match[1] : "";
      const slug = match ? match[2] : dir.name;
      const title = slug
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

      return {
        title,
        slug: dir.name,
        date,
        url: `https://blog.minhanr.dev/posts/${dir.name}/`,
      };
    });

    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ posts: [] });
  }
}
