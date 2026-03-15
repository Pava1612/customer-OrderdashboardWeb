import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { Widget } from "@shared/schema";

interface Props {
  widget: Widget;
  dateRange: string;
}

interface ChartData {
  label: string;
  value: number;
  color: string;
}

export default function BarChartWidget({ widget, dateRange }: Props) {
  const { configJson } = widget;
  const field = configJson.xAxisField ?? configJson.chartField ?? "status";
  const showLegend = configJson.showLegend !== false;

  const { data = [], isLoading } = useQuery<ChartData[]>({
    queryKey: ["/api/analytics/chart", "bar", field, dateRange],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/chart?type=bar&field=${field}&date_range=${dateRange}`);
      return res.json();
    },
  });

  const chartData = data.map((d) => ({ name: d.label, value: d.value }));

  return (
    <div className="h-full p-5 flex flex-col">
      <h3 className="text-sm font-semibold text-[#111827] mb-3">{widget.widgetTitle}</h3>
      {isLoading ? (
        <div className="flex-1 bg-[#F3F4F6] rounded animate-pulse" />
      ) : (
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6B7280" }} />
              <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} />
              <Tooltip />
              {showLegend && <Legend />}
              <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
