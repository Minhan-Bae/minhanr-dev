import { WeeklyCalendar } from "@/components/weekly-calendar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Calendar | OIKBAS",
  robots: { index: false, follow: false },
};

export default function CalendarPage() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="text-muted-foreground text-sm">Daily Note 기반 타임블록 캘린더 — 클릭하여 추가</p>
      </div>
      <WeeklyCalendar />
    </div>
  );
}
