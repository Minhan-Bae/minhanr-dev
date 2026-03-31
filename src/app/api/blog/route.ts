import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/blog";

export async function GET() {
  try {
    const allPosts = getAllPosts();

    const posts = allPosts.slice(0, 5).map((post) => ({
      title: post.title,
      slug: post.slug,
      date: post.date,
      url: `/blog/${post.slug}`,
    }));

    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ posts: [] });
  }
}
