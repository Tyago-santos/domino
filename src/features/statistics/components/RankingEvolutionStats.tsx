import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Skeleton } from "@/components/ui";
import { useRankingEvolution } from "../hooks/useStatistics";
import type { PeriodFilter } from "@/shared/types";

interface RankingEvolutionStatsProps {
  period: PeriodFilter;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-surface-border bg-surface p-3 shadow-lg">
      <p className="text-xs text-text-muted">{label ? formatDate(label) : ""}</p>
      <p className="text-sm font-semibold text-primary-600">
        Posição: {payload[0]?.value}º
      </p>
    </div>
  );
}

export function RankingEvolutionStats({ period: _period }: RankingEvolutionStatsProps) {
  const { data, isLoading } = useRankingEvolution();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolução do Ranking</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = (data ?? []).map((point) => ({
    date: point.date,
    value: point.value,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução do Ranking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 12, fill: "#64748b" }}
              />
              <YAxis
                reversed
                tick={{ fontSize: 12, fill: "#64748b" }}
                domain={[1, "auto"]}
                tickFormatter={(v: number) => `${v}º`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 5, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
                activeDot={{ r: 7, fill: "#059669", stroke: "#fff", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
