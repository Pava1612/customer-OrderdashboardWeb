import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Widget } from "@shared/schema";
import { COLUMN_OPTIONS } from "@shared/schema";

interface Props {
  widget: Widget;
  dateRange: string;
}

interface TableData {
  rows: Record<string, unknown>[];
  total: number;
}

const getColumnLabel = (value: string) =>
  COLUMN_OPTIONS.find((c) => c.value === value)?.label ?? value;

export default function TableWidget({ widget, dateRange }: Props) {
  const { configJson } = widget;
  const columns = configJson.columns ?? ["order_id", "product", "quantity", "total_amount"];
  const sort = configJson.sortBy ?? "asc";
  const limit = configJson.pagination ?? 5;
  const fontSize = configJson.fontSize ?? 14;
  const headerBg = configJson.headerBg ?? "#F3F4F6";
  const [page, setPage] = useState(1);

  const filterAttr = configJson.filterEnabled ? configJson.filterAttr : undefined;
  const filterOp = configJson.filterEnabled ? configJson.filterOp : undefined;
  const filterVal = configJson.filterEnabled ? configJson.filterVal : undefined;

  const queryString = new URLSearchParams({
    columns: columns.join(","),
    sort,
    page: String(page),
    limit: String(limit),
    ...(filterAttr ? { filter_attr: filterAttr } : {}),
    ...(filterOp ? { filter_op: filterOp } : {}),
    ...(filterVal ? { filter_val: filterVal } : {}),
  }).toString();

  const { data, isLoading } = useQuery<TableData>({
    queryKey: ["/api/analytics/table", columns.join(","), sort, page, limit, filterAttr, filterOp, filterVal],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/table?${queryString}`);
      return res.json();
    },
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  const formatCell = (val: unknown): string => {
    if (val === null || val === undefined) return "-";
    if (typeof val === "number") {
      if (Number.isInteger(val)) return String(val);
      return `$${val.toFixed(2)}`;
    }
    if (typeof val === "string" && val.includes("T") && val.includes("Z")) {
      return new Date(val).toLocaleDateString();
    }
    return String(val);
  };

  return (
    <div className="h-full flex flex-col p-4">
      <h3 className="text-sm font-semibold text-[#111827] mb-3">{widget.widgetTitle}</h3>
      {isLoading ? (
        <div className="flex-1 bg-[#F3F4F6] rounded animate-pulse" />
      ) : (
        <>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left" style={{ fontSize: `${fontSize}px` }}>
              <thead>
                <tr style={{ backgroundColor: headerBg }}>
                  {columns.map((col) => (
                    <th key={col} className="px-3 py-2 text-xs font-semibold text-[#6B7280] border-b border-[#E5E7EB] whitespace-nowrap">
                      {getColumnLabel(col)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data?.rows ?? []).map((row, i) => (
                  <tr key={i} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB]">
                    {columns.map((col) => (
                      <td key={col} className="px-3 py-2 text-[#111827] whitespace-nowrap">
                        {formatCell(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
              <span className="text-xs text-[#6B7280]">Page {page} of {totalPages}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1 rounded hover:bg-[#F3F4F6] disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1 rounded hover:bg-[#F3F4F6] disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
