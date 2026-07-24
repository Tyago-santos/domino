import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Skeleton } from "@/components/ui";
import { useRankingEvolution } from "../hooks/useDashboard";
import { PeriodFilter } from "./PeriodFilter";
import type { PeriodFilter as PeriodFilterType } from "@/shared/types";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { date: string } }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-surface-border bg-surface px-3 py-2 shadow-lg dark:border-surface-border dark:bg-surface">
      <p className="text-xs font-medium text-text-muted dark:text-text-muted">
        {label}
      </p>
      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
        Posição: #{payload[0]?.value}
      </p>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-[300px] w-full rounded-lg" />
    </div>
  );
}

export function RankingEvolutionChart() {
  const [period, setPeriod] = useState<PeriodFilterType>("30days");
  const { data, isLoading, error } = useRankingEvolution(period);

  if (isLoading) return <ChartSkeleton />;

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolução do Ranking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-text-muted">
            Erro ao carregar dados do ranking.
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((point) => ({
    date: new Date(point.date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    }),
    ranking: point.value,
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Evolução do Ranking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <PeriodFilter value={period} onChange={setPeriod} />
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-surface-border"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "var(--color-text-muted, #9ca3af)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                reversed
                tick={{ fontSize: 12, fill: "var(--color-text-muted, #9ca3af)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `#${value}`}
                domain={[1, "auto"]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  fontSize: "12px",
                  color: "var(--color-text-muted, #9ca3af)",
                }}
              />
              <Line
                type="monotone"
                dataKey="ranking"
                name="Posição"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                activeDot={{ fill: "#10b981", strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
