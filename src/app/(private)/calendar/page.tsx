import { WeeklyCalendar } from "@/components/weekly-calendar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Calendar | minhanr.dev",
  robots: { index: false, follow: false },
};

export default function CalendarPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground text-sm">Daily Note 기반 타임블록 캘린더 — 클릭하여 추가</p>
      </div>
      <WeeklyCalendar />
    </div>
  );
}
