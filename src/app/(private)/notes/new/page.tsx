import type { Metadata } from "next";
import { NewNoteForm } from "@/components/new-note-form";

export const metadata: Metadata = {
  title: "새 노트 | minhanr.dev",
  robots: { index: false, follow: false },
};

export default function NewNotePage() {
  return <NewNoteForm />;
}
