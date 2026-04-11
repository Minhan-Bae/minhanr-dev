import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";

const postsDirectory = path.join(process.cwd(), "src/content/posts");

export interface BlogPost {
  title: string;
  date: string;
  slug: string;
  tags: string[];
  categories: string[];
  summary: string;
  content: string;
  cover?: {
    image?: string;
    alt?: string;
  };
  author?: string;
  draft?: boolean;
}

export interface BlogPostMeta {
  title: string;
  date: string;
  slug: string;
  tags: string[];
  categories: string[];
  summary: string;
  author?: string;
}

// ── Module-scope cache ──
// Lifetime: Vercel serverless instance reuse window (~minutes to hours).
// Same-instance subsequent calls hit cache, avoiding 116 file reads each time.
let _allPostsCache: BlogPostMeta[] | null = null;
let _slugToFileName: Map<string, string> | null = null;

function buildIndex(): { posts: BlogPostMeta[]; slugMap: Map<string, string> } {
  if (!fs.existsSync(postsDirectory)) {
    return { posts: [], slugMap: new Map() };
  }

  const fileNames = fs.readdirSync(postsDirectory).filter((f) => f.endsWith(".md"));
  const slugMap = new Map<string, string>();

  const posts = fileNames
    .map((fileName) => {
      const filePath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(filePath, "utf8");
      const { data } = matter(fileContents);

      if (data.draft === true) {
        return null;
      }

      const slug = data.slug || fileName.replace(/\.md$/, "");
      slugMap.set(slug, fileName);

      const meta: BlogPostMeta = {
        title: data.title || slug,
        date: data.date ? new Date(data.date).toISOString().split("T")[0] : "",
        slug,
        tags: Array.isArray(data.tags) ? data.tags : [],
        categories: Array.isArray(data.categories) ? data.categories : [],
        summary: data.summary || "",
      };
      if (data.author) meta.author = data.author;
      return meta;
    })
    .filter((p): p is BlogPostMeta => p !== null);

  posts.sort((a, b) => (a.date > b.date ? -1 : 1));

  return { posts, slugMap };
}

function ensureIndex(): void {
  if (_allPostsCache && _slugToFileName) return;
  const { posts, slugMap } = buildIndex();
  _allPostsCache = posts;
  _slugToFileName = slugMap;
}

export function getAllPosts(): BlogPostMeta[] {
  ensureIndex();
  return _allPostsCache ?? [];
}

export function getAllSlugs(): string[] {
  ensureIndex();
  return _slugToFileName ? Array.from(_slugToFileName.keys()) : [];
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  ensureIndex();
  const fileName = _slugToFileName?.get(slug);
  if (!fileName) return null;

  const filePath = path.join(postsDirectory, fileName);
  if (!fs.existsSync(filePath)) return null;

  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeHighlight, { detect: true })
    .use(rehypeStringify)
    .process(content);
  const contentHtml = processedContent.toString();

  return {
    title: data.title || slug,
    date: data.date ? new Date(data.date).toISOString().split("T")[0] : "",
    slug,
    tags: Array.isArray(data.tags) ? data.tags : [],
    categories: Array.isArray(data.categories) ? data.categories : [],
    summary: data.summary || "",
    content: contentHtml,
    cover: data.cover || undefined,
    author: data.author || undefined,
    draft: data.draft || false,
  };
}

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export function extractHeadings(html: string): TocHeading[] {
  const regex = /<h([23])\s+id="([^"]+)"[^>]*>(.*?)<\/h[23]>/gi;
  const headings: TocHeading[] = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    headings.push({
      id: match[2],
      text: match[3].replace(/<[^>]*>/g, ""),
      level: parseInt(match[1]) as 2 | 3,
    });
  }
  return headings;
}
