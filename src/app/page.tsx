import { AGENTS, AXIS_LABELS, type Axis } from "@/lib/agents";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function StatusLed({ status }: { status: string }) {
  const color =
    status === "active"
      ? "bg-green-400"
      : status === "error"
        ? "bg-red-400"
        : "bg-neutral-600";
  return (
    <span className="relative flex h-2.5 w-2.5">
      {status === "active" && (
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full ${color} opacity-75`}
        />
      )}
      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${color}`} />
    </span>
  );
}

function AgentCard({
  agent,
}: {
  agent: (typeof AGENTS)[number];
}) {
  return (
    <Card className={`${agent.bgColor} ${agent.borderColor} border`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className={`text-sm font-semibold ${agent.color}`}>
            {agent.label}
          </CardTitle>
          <StatusLed status="idle" />
        </div>
        <CardDescription className="text-xs text-neutral-500">
          {agent.role} &middot; Layer {agent.layer}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-neutral-400">{agent.description}</p>
        <Badge variant="outline" className="mt-2 text-[10px]">
          {AXIS_LABELS[agent.axis as Axis]}
        </Badge>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-16">
      {/* Hero */}
      <section className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          OIKBAS <span className="text-blue-400">Command Center</span>
        </h1>
        <p className="text-neutral-400 max-w-2xl mx-auto">
          AI 에이전트 6대를 오케스트레이션하는 개인 지식 시스템.
          <br className="hidden sm:inline" />
          수집 &rarr; 수렴 &rarr; 확산, 3축 자율 운용 체계.
        </p>
      </section>

      {/* Agent Team */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Agent Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AGENTS.map((agent) => (
            <AgentCard key={agent.name} agent={agent} />
          ))}
        </div>
      </section>

      {/* Live Activity (placeholder) */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Recent Activity</h2>
        <Card className="border-neutral-800">
          <CardContent className="py-8 text-center text-neutral-500 text-sm">
            GitHub Webhook 연결 후 실시간 활동이 표시됩니다.
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
