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

const HOURS_DATA = [
  { name: "6h", value: 2 },
  { name: "7h", value: 5 },
  { name: "8h", value: 8 },
  { name: "9h", value: 12 },
  { name: "10h", value: 18 },
  { name: "11h", value: 15 },
  { name: "12h", value: 6 },
  { name: "13h", value: 4 },
  { name: "14h", value: 14 },
  { name: "15h", value: 22 },
  { name: "16h", value: 20 },
  { name: "17h", value: 16 },
  { name: "18h", value: 25 },
  { name: "19h", value: 28 },
  { name: "20h", value: 30 },
  { name: "21h", value: 22 },
  { name: "22h", value: 12 },
  { name: "23h", value: 5 },
];

const maxValue = Math.max(...HOURS_DATA.map((h) => h.value));

function getBarColor(value: number): string {
  const ratio = value / maxValue;
  if (ratio >= 0.8) return "#059669";
  if (ratio >= 0.6) return "#10b981";
  if (ratio >= 0.4) return "#34d399";
  if (ratio >= 0.2) return "#6ee7b7";
  return "#a7f3d0";
}

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

export function ActiveHoursChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Horários Mais Ativos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={HOURS_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#64748b" }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={50}
              />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={30}>
                {HOURS_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
