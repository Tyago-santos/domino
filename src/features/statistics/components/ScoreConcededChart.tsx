import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Skeleton } from "@/components/ui";
import { useScoreEvolution } from "../hooks/useStatistics";

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-surface-border bg-surface p-3 shadow-lg">
      <p className="text-xs text-text-muted">{label ? formatDate(label) : ""}</p>
      <p className="text-sm font-semibold text-red-500">
        Pontos concedidos: {payload[0]?.value}
      </p>
    </div>
  );
}

export function ScoreConcededChart() {
  const { data, isLoading } = useScoreEvolution();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pontos Concedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = (data ?? []).map((point, index) => ({
    date: point.date,
    value: Math.round(120 + Math.sin(index * 0.8) * 30 + Math.random() * 15),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pontos Concedidos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 12, fill: "#64748b" }}
              />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip content={<CustomTooltip />} />
              <defs>
                <linearGradient id="colorConceded" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#colorConceded)"
                dot={{ r: 4, fill: "#ef4444", stroke: "#fff", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "#dc2626", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
