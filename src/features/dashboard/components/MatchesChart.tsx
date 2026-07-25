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
import { useChartData } from "../hooks/useDashboard";
import { PeriodFilter } from "./PeriodFilter";
import type { PeriodFilter as PeriodFilterType } from "@/shared/types";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { date: string; label: string } }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-surface-border bg-surface px-3 py-2 shadow-lg dark:border-surface-border dark:bg-surface">
      <p className="text-xs font-medium text-text-muted dark:text-text-muted">
        {payload[0]?.payload?.label || label}
      </p>
      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
        Partidas: {payload[0]?.value}
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

export function MatchesChart() {
  const [period, setPeriod] = useState<PeriodFilterType>("30days");
  const { data, isLoading, error } = useChartData(period);

  if (isLoading) return <ChartSkeleton />;

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Partidas Jogadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-text-muted">
            Erro ao carregar dados de partidas.
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.matchesPerPeriod.map((point) => ({
    date: point.date,
    label: point.label || point.date,
    partidas: point.value,
  }));

  const totalMatches = chartData.reduce((acc, d) => acc + d.partidas, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 py-2.5 sm:px-6 sm:py-4">
        <CardTitle className="text-[11px] font-bold sm:text-lg">Partidas Jogadas</CardTitle>
        <span className="text-[9px] text-text-muted dark:text-text-muted sm:text-sm">
          Total:{" "}
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {totalMatches}
          </span>
        </span>
      </CardHeader>
      <CardContent className="px-3 py-2.5 sm:px-6 sm:py-4">
        <div className="mb-3 sm:mb-4">
          <PeriodFilter value={period} onChange={setPeriod} />
        </div>
        <div className="h-[200px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-surface-border"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "var(--color-text-muted, #9ca3af)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--color-text-muted, #9ca3af)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  fontSize: "10px",
                  color: "var(--color-text-muted, #9ca3af)",
                }}
              />
              <Line
                type="monotone"
                dataKey="partidas"
                name="Partidas"
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
