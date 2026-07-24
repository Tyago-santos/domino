import { useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent, Button, Skeleton } from "@/components/ui";
import { useDoublesChartData } from "../hooks/useDoubles";
import type { PeriodFilter } from "@/shared/types";

const periodLabels: Record<string, string> = {
  today: "Hoje",
  "7days": "7 Dias",
  "30days": "30 Dias",
  "90days": "90 Dias",
  year: "1 Ano",
};

function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-[300px] w-full rounded-lg" />
    </div>
  );
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function WinsTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-surface-border bg-surface px-3 py-2 shadow-lg dark:border-surface-border dark:bg-surface">
      <p className="text-xs font-medium text-text-muted dark:text-text-muted">{label}</p>
      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
        Vitórias: {payload[0]!.value}
      </p>
    </div>
  );
}

function ScoreTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-surface-border bg-surface px-3 py-2 shadow-lg dark:border-surface-border dark:bg-surface">
      <p className="text-xs font-medium text-text-muted dark:text-text-muted">{label}</p>
      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
        Pontuação: {payload[0]!.value.toLocaleString("pt-BR")}
      </p>
    </div>
  );
}

export function DoublesCharts() {
  const [period, setPeriod] = useState<PeriodFilter>("30days");
  const { data, isLoading, error } = useDoublesChartData(period);

  const periods: PeriodFilter[] = ["7days", "30days", "90days", "year"];

  if (isLoading) return <ChartSkeleton />;

  if (error || !data) {
    return (
      <div className="rounded-lg border border-dashed border-surface-border p-8 text-center text-text-muted">
        Erro ao carregar dados dos gráficos.
      </div>
    );
  }

  const winsData = data.winsEvolution.map((point) => ({
    date: new Date(point.date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    }),
    vitorias: point.value,
  }));

  const scoreData = data.scoreEvolution.map((point) => ({
    date: new Date(point.date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    }),
    pontuacao: point.value,
  }));

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">Evolução de Vitórias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            {periods.map((p) => (
              <Button
                key={p}
                variant={period === p ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod(p)}
              >
                {periodLabels[p]}
              </Button>
            ))}
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={winsData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-surface-border" vertical={false} />
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
                <Tooltip content={<WinsTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: "12px", color: "var(--color-text-muted, #9ca3af)" }}
                />
                <Line
                  type="monotone"
                  dataKey="vitorias"
                  name="Vitórias"
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">Evolução da Pontuação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            {periods.map((p) => (
              <Button
                key={p}
                variant={period === p ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod(p)}
              >
                {periodLabels[p]}
              </Button>
            ))}
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scoreData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="doublesScoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-surface-border" vertical={false} />
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
                <Tooltip content={<ScoreTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: "12px", color: "var(--color-text-muted, #9ca3af)" }}
                />
                <Area
                  type="monotone"
                  dataKey="pontuacao"
                  name="Pontuação"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#doublesScoreGradient)"
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                  activeDot={{ fill: "#10b981", strokeWidth: 2, r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
