import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
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

export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory).filter((f) => f.endsWith(".md"));

  const posts = fileNames
    .map((fileName) => {
      const filePath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(filePath, "utf8");
      const { data } = matter(fileContents);

      if (data.draft === true) {
        return null;
      }

      const slug = data.slug || fileName.replace(/\.md$/, "");

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

  return posts;
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!fs.existsSync(postsDirectory)) {
    return null;
  }

  const fileNames = fs.readdirSync(postsDirectory).filter((f) => f.endsWith(".md"));

  for (const fileName of fileNames) {
    const filePath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContents);

    const postSlug = data.slug || fileName.replace(/\.md$/, "");

    if (postSlug === slug) {
      const processedContent = await unified()
        .use(remarkParse)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeHighlight, { detect: true })
        .use(rehypeStringify, { allowDangerousHtml: true })
        .process(content);
      const contentHtml = processedContent.toString();

      return {
        title: data.title || slug,
        date: data.date ? new Date(data.date).toISOString().split("T")[0] : "",
        slug: postSlug,
        tags: Array.isArray(data.tags) ? data.tags : [],
        categories: Array.isArray(data.categories) ? data.categories : [],
        summary: data.summary || "",
        content: contentHtml,
        cover: data.cover || undefined,
        author: data.author || undefined,
        draft: data.draft || false,
      };
    }
  }

  return null;
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory).filter((f) => f.endsWith(".md"));

  return fileNames.map((fileName) => {
    const filePath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data } = matter(fileContents);
    return data.slug || fileName.replace(/\.md$/, "");
  });
}
