import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Command | minhanr.dev",
  robots: { index: false, follow: false },
};

export default function CommandLayout({ children }: { children: React.ReactNode }) {
  return children;
}
