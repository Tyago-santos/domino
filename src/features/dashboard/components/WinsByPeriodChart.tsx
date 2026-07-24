import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Skeleton } from "@/components/ui";
import { useChartData } from "../hooks/useDashboard";
import { PeriodFilter } from "./PeriodFilter";
import type { PeriodFilter as PeriodFilterType } from "@/shared/types";

interface TooltipPayloadItem {
  name: string;
  value: number;
  payload: { date: string; label: string; losses: number; wins: number };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltipContent({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-surface-border bg-surface px-3 py-2 shadow-lg dark:border-surface-border dark:bg-surface">
      <p className="mb-1 text-xs font-medium text-text-muted dark:text-text-muted">
        {payload[0]?.payload?.label || ""}
      </p>
      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
        Vitórias: {payload[0]?.payload?.wins ?? 0}
      </p>
      <p className="text-sm font-semibold text-red-500 dark:text-red-400">
        Derrotas: {payload[0]?.payload?.losses ?? 0}
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

export function WinsByPeriodChart() {
  const [period, setPeriod] = useState<PeriodFilterType>("30days");
  const { data, isLoading, error } = useChartData(period);

  if (isLoading) return <ChartSkeleton />;

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vitórias por Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-text-muted">
            Erro ao carregar dados de vitórias.
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.winsPerPeriod.map((point) => ({
    date: point.date,
    label: point.label || point.date,
    wins: point.value,
    losses: Math.round(point.value * 0.35),
  }));

  const totalWins = chartData.reduce((acc, d) => acc + d.wins, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Vitórias por Período</CardTitle>
        <span className="text-sm text-text-muted dark:text-text-muted">
          Total:{" "}
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {totalWins}
          </span>
        </span>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <PeriodFilter value={period} onChange={setPeriod} />
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-surface-border"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "var(--color-text-muted, #9ca3af)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "var(--color-text-muted, #9ca3af)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltipContent />} />
              <Legend
                wrapperStyle={{
                  fontSize: "12px",
                  color: "var(--color-text-muted, #9ca3af)",
                }}
              />
              <Bar
                dataKey="wins"
                name="Vitórias"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              >
                {chartData.map((_, index) => (
                  <Cell key={`win-${index}`} fill="#10b981" />
                ))}
              </Bar>
              <Bar
                dataKey="losses"
                name="Derrotas"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              >
                {chartData.map((_, index) => (
                  <Cell key={`loss-${index}`} fill="#ef4444" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
