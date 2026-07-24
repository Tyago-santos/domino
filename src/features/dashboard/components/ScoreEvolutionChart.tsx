import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Skeleton } from "@/components/ui";
import { useScoreEvolution } from "../hooks/useDashboard";
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
        Pontuação: {payload[0]?.value.toLocaleString("pt-BR")}
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

export function ScoreEvolutionChart() {
  const [period, setPeriod] = useState<PeriodFilterType>("30days");
  const { data, isLoading, error } = useScoreEvolution(period);

  if (isLoading) return <ChartSkeleton />;

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolução da Pontuação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-text-muted">
            Erro ao carregar dados de pontuação.
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
    pontuacao: point.value,
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Evolução da Pontuação</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <PeriodFilter value={period} onChange={setPeriod} />
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
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
                tick={{ fontSize: 12, fill: "var(--color-text-muted, #9ca3af)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  fontSize: "12px",
                  color: "var(--color-text-muted, #9ca3af)",
                }}
              />
              <Area
                type="monotone"
                dataKey="pontuacao"
                name="Pontuação"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#scoreGradient)"
                dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                activeDot={{ fill: "#10b981", strokeWidth: 2, r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
