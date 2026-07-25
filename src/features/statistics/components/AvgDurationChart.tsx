import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Skeleton } from "@/components/ui";
import { usePlayerStats } from "../hooks/useStatistics";

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-surface-border bg-surface p-3 shadow-lg">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="text-sm font-semibold text-primary-600">
        Duração média: {payload[0]?.value} min
      </p>
    </div>
  );
}

const MONTHS_DATA = [
  { name: "Jan", value: 35 },
  { name: "Fev", value: 33 },
  { name: "Mar", value: 31 },
  { name: "Abr", value: 34 },
  { name: "Mai", value: 30 },
  { name: "Jun", value: 32 },
  { name: "Jul", value: 28 },
];

export function AvgDurationChart() {
  const { data, isLoading } = usePlayerStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Duração Média por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const durationVariation = data?.avgMatchDuration ?? 32;

  const chartData = MONTHS_DATA.map((m) => ({
    name: m.name,
    value: m.value + Math.round((durationVariation - 32) * 0.5),
  }));

  return (
    <Card>
      <CardHeader className="px-3 py-2.5 sm:px-6 sm:py-4">
        <CardTitle className="text-[11px] font-bold sm:text-lg">Duração Média por Mês</CardTitle>
      </CardHeader>
      <CardContent className="px-3 py-2.5 sm:px-6 sm:py-4">
        <div className="h-[200px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#64748b" }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#64748b" }}
                tickFormatter={(v: number) => `${v}m`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={50}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.value > 33 ? "#f59e0b" : "#10b981"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
