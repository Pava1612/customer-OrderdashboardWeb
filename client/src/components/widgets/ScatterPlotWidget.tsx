import { useQuery } from "@tanstack/react-query";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
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

export default function ScatterPlotWidget({ widget, dateRange }: Props) {
  const { configJson } = widget;
  const field = configJson.xAxisField ?? configJson.chartField ?? "status";
  const showLegend = configJson.showLegend !== false;

  const { data = [], isLoading } = useQuery<ChartData[]>({
    queryKey: ["/api/analytics/chart", "scatter", field, dateRange],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/chart?type=scatter&field=${field}&date_range=${dateRange}`);
      return res.json();
    },
  });

  const chartData = data.map((d, i) => ({ x: i + 1, y: d.value, name: d.label }));

  return (
    <div className="h-full p-5 flex flex-col">
      <h3 className="text-sm font-semibold text-[#111827] mb-3">{widget.widgetTitle}</h3>
      {isLoading ? (
        <div className="flex-1 bg-[#F3F4F6] rounded animate-pulse" />
      ) : (
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="x" type="number" tick={{ fontSize: 12, fill: "#6B7280" }} />
              <YAxis dataKey="y" tick={{ fontSize: 12, fill: "#6B7280" }} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              {showLegend && <Legend />}
              <Scatter data={chartData} fill="#10B981" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
