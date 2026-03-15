import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
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

export default function PieChartWidget({ widget, dateRange }: Props) {
  const { configJson } = widget;
  const field = configJson.chartField ?? "status";
  const showLegend = configJson.showLegend !== false;

  const { data = [], isLoading } = useQuery<ChartData[]>({
    queryKey: ["/api/analytics/chart", "pie", field, dateRange],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/chart?type=pie&field=${field}&date_range=${dateRange}`);
      return res.json();
    },
  });

  const chartData = data.map((d) => ({ name: d.label, value: d.value, color: d.color }));

  return (
    <div className="h-full p-5 flex flex-col">
      <h3 className="text-sm font-semibold text-[#111827] mb-3">{widget.widgetTitle}</h3>
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-[#F3F4F6] animate-pulse" />
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-[#6B7280] text-sm">No data</div>
      ) : (
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="40%"
                outerRadius="70%"
                dataKey="value"
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value}%`, ""]} />
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
