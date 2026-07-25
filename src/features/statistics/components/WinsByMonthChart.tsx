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
import { useChartData } from "../hooks/useStatistics";
import type { PeriodFilter } from "@/shared/types";

interface WinsByMonthChartProps {
  period: PeriodFilter;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-surface-border bg-surface p-3 shadow-lg">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="text-sm font-semibold text-emerald-600">
        Vitórias: {payload[0]?.value}
      </p>
    </div>
  );
}

export function WinsByMonthChart({ period }: WinsByMonthChartProps) {
  const { data, isLoading } = useChartData(period);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vitórias por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = (data?.winsPerPeriod ?? []).map((point) => ({
    name: point.label ?? point.date,
    value: point.value,
  }));

  return (
    <Card>
      <CardHeader className="px-3 py-2.5 sm:px-6 sm:py-4">
        <CardTitle className="text-[11px] font-bold sm:text-lg">Vitórias por Mês</CardTitle>
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
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={50}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill="#10b981" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
