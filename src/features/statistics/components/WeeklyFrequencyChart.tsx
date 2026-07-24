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

const WEEKLY_DATA = [
  { name: "Seg", value: 12 },
  { name: "Ter", value: 8 },
  { name: "Qua", value: 15 },
  { name: "Qui", value: 10 },
  { name: "Sex", value: 18 },
  { name: "Sáb", value: 25 },
  { name: "Dom", value: 20 },
];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-surface-border bg-surface p-3 shadow-lg">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="text-sm font-semibold text-primary-600">
        Partidas: {payload[0]?.value}
      </p>
    </div>
  );
}

export function WeeklyFrequencyChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Frequência Semanal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={WEEKLY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#64748b" }}
              />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={50}>
                {WEEKLY_DATA.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.value >= 20 ? "#10b981" : entry.value >= 12 ? "#34d399" : "#6ee7b7"}
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
