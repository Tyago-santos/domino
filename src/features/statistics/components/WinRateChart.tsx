import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Skeleton } from "@/components/ui";
import { usePlayerStats } from "../hooks/useStatistics";

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-surface-border bg-surface p-3 shadow-lg">
      <p className="text-xs text-text-muted">{payload[0]?.name}</p>
      <p className="text-sm font-semibold" style={{ color: payload[0]?.name === "Vitórias" ? "#10b981" : "#ef4444" }}>
        {payload[0]?.value} partidas
      </p>
    </div>
  );
}

function CustomLegend({ payload }: { payload?: Array<{ value: string; color: string }> }) {
  if (!payload) return null;
  return (
    <div className="flex justify-center gap-6 mt-2">
      {payload.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-sm text-text-muted">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function WinRateChart() {
  const { data, isLoading } = usePlayerStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Taxa de Vitórias</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    { name: "Vitórias", value: data?.wins ?? 0 },
    { name: "Derrotas", value: data?.losses ?? 0 },
  ];

  const COLORS = ["#10b981", "#ef4444"];
  const winRate = data?.winRate ? (data.winRate * 100).toFixed(1) : "0";

  return (
    <Card>
      <CardHeader className="px-3 py-2.5 sm:px-6 sm:py-4">
        <CardTitle className="text-[11px] font-bold sm:text-lg">Taxa de Vitórias</CardTitle>
      </CardHeader>
      <CardContent className="px-3 py-2.5 sm:px-6 sm:py-4">
        <div className="h-[200px] relative sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: "10%" }}>
            <div className="text-center">
              <p className="text-xl font-bold text-primary-600 sm:text-3xl">{winRate}%</p>
              <p className="text-[9px] text-text-muted sm:text-xs">de aproveitamento</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
