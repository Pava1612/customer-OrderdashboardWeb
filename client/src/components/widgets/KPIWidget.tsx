import { useQuery } from "@tanstack/react-query";
import type { Widget } from "@shared/schema";
import { TrendingUp } from "lucide-react";

interface Props {
  widget: Widget;
  dateRange: string;
}

export default function KPIWidget({ widget, dateRange }: Props) {
  const { configJson } = widget;
  const metric = configJson.metric ?? "total_orders";
  const aggregation = configJson.aggregation ?? "count";
  const dataFormat = configJson.dataFormat ?? "Number";
  const precision = configJson.decimalPrecision ?? 0;

  const { data, isLoading } = useQuery<{ value: number }>({
    queryKey: ["/api/analytics/kpi", metric, aggregation, dateRange],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/kpi?metric=${metric}&aggregation=${aggregation}&date_range=${dateRange}`);
      return res.json();
    },
  });

  const formatValue = (v: number) => {
    if (dataFormat === "Currency") {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: precision, maximumFractionDigits: precision }).format(v);
    }
    return v.toFixed(precision);
  };

  return (
    <div className="h-full p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#111827] truncate">{widget.widgetTitle}</h3>
        <div className="w-8 h-8 bg-[#D1FAE5] rounded-full flex items-center justify-center">
          <TrendingUp size={16} className="text-[#10B981]" />
        </div>
      </div>
      {widget.description && (
        <p className="text-xs text-[#6B7280] mb-3">{widget.description}</p>
      )}
      <div className="flex-1 flex items-center">
        {isLoading ? (
          <div className="h-10 w-24 bg-[#F3F4F6] rounded animate-pulse" />
        ) : (
          <p className="text-3xl font-bold text-[#111827]">
            {data ? formatValue(data.value) : "0"}
          </p>
        )}
      </div>
    </div>
  );
}
