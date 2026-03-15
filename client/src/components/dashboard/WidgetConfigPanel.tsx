import { useEffect, useState } from "react";
import { X, ChevronDown } from "lucide-react";
import type { Widget, WidgetType, WidgetConfig } from "@shared/schema";
import { COLUMN_OPTIONS, METRIC_OPTIONS } from "@shared/schema";

interface Props {
  widget: Widget | { widgetType: WidgetType; id?: number };
  onClose: () => void;
  onSave: (config: {
    widgetTitle: string;
    description: string;
    widthCols: number;
    heightRows: number;
    configJson: WidgetConfig;
  }) => void;
}

const AGGREGATION_OPTIONS = ["Sum", "Average", "Count"];
const FORMAT_OPTIONS = ["Number", "Currency"];
const SORT_OPTIONS = [{ label: "Ascending", value: "asc" }, { label: "Descending", value: "desc" }];
const PAGINATION_OPTIONS = [5, 10, 15];
const FILTER_ATTR_OPTIONS = ["product", "quantity", "status"];
const OPERATOR_OPTIONS = [
  { label: "=", value: "eq" },
  { label: "≠", value: "neq" },
  { label: ">", value: "gt" },
  { label: ">=", value: "gte" },
  { label: "<", value: "lt" },
  { label: "<=", value: "lte" },
  { label: "Contains", value: "contains" },
];

const CHART_DATA_OPTIONS = COLUMN_OPTIONS.filter((c) =>
  ["product", "quantity", "unit_price", "total_amount", "status", "created_by"].includes(c.value)
);

function defaultSize(type: WidgetType): { w: number; h: number } {
  if (type === "KPI") return { w: 2, h: 2 };
  if (type === "Table") return { w: 5, h: 5 };
  return { w: 4, h: 4 };
}

export default function WidgetConfigPanel({ widget, onClose, onSave }: Props) {
  const wt = widget.widgetType;
  const isWidget = "widgetTitle" in widget;
  const ds = defaultSize(wt);

  const [activeTab, setActiveTab] = useState<"data" | "styling">("data");
  const [title, setTitle] = useState(isWidget ? widget.widgetTitle : "Untitled");
  const [description, setDescription] = useState(isWidget ? widget.description : "");
  const [widthCols, setWidthCols] = useState(isWidget ? widget.widthCols : ds.w);
  const [heightRows, setHeightRows] = useState(isWidget ? widget.heightRows : ds.h);

  const existingConfig = isWidget ? widget.configJson : {};

  const [metric, setMetric] = useState(existingConfig.metric ?? "total_orders");
  const [aggregation, setAggregation] = useState(existingConfig.aggregation ?? "count");
  const [dataFormat, setDataFormat] = useState(existingConfig.dataFormat ?? "Number");
  const [decimalPrecision, setDecimalPrecision] = useState(existingConfig.decimalPrecision ?? 0);

  const [columns, setColumns] = useState<string[]>(existingConfig.columns ?? ["order_id", "product", "quantity", "total_amount"]);
  const [sortBy, setSortBy] = useState(existingConfig.sortBy ?? "asc");
  const [pagination, setPagination] = useState(existingConfig.pagination ?? 5);
  const [filterEnabled, setFilterEnabled] = useState(existingConfig.filterEnabled ?? false);
  const [filterAttr, setFilterAttr] = useState(existingConfig.filterAttr ?? "status");
  const [filterOp, setFilterOp] = useState(existingConfig.filterOp ?? "eq");
  const [filterVal, setFilterVal] = useState(existingConfig.filterVal ?? "");

  const [chartField, setChartField] = useState(existingConfig.chartField ?? "status");
  const [xAxisField, setXAxisField] = useState(existingConfig.xAxisField ?? "status");
  const [yAxisField, setYAxisField] = useState(existingConfig.yAxisField ?? "quantity");
  const [showLegend, setShowLegend] = useState(existingConfig.showLegend !== false);

  const [fontSize, setFontSize] = useState(existingConfig.fontSize ?? 14);
  const [headerBg, setHeaderBg] = useState(existingConfig.headerBg ?? "#D8D8D8");

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const toggleColumn = (col: string) => {
    setColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Please fill the field";
    if (wt === "KPI") {
      if (!metric) newErrors.metric = "Please fill the field";
      if (!aggregation) newErrors.aggregation = "Please fill the field";
    }
    if (wt === "Table" && columns.length === 0) {
      newErrors.columns = "Please select at least one column";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    let configJson: WidgetConfig = {};

    if (wt === "KPI") {
      configJson = { metric, aggregation, dataFormat, decimalPrecision };
    } else if (wt === "Table") {
      configJson = { columns, sortBy, pagination, filterEnabled, filterAttr, filterOp, filterVal, fontSize, headerBg };
    } else {
      configJson = { chartField, xAxisField, yAxisField, showLegend };
    }

    onSave({ widgetTitle: title, description, widthCols, heightRows, configJson });
  };

  const inputCls = (err?: string) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] ${err ? "border-[#EF4444]" : "border-[#E5E7EB]"}`;

  return (
    <div className="w-[320px] shrink-0 bg-white border-l border-[#E5E7EB] h-full overflow-y-auto flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
        <h2 className="text-sm font-semibold text-[#111827]">Configure Widget</h2>
        <button onClick={onClose} className="p-1.5 rounded hover:bg-[#F3F4F6]">
          <X size={16} className="text-[#6B7280]" />
        </button>
      </div>

      {wt === "Table" && (
        <div className="flex border-b border-[#E5E7EB]">
          {["data", "styling"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "data" | "styling")}
              className={`flex-1 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? "border-[#10B981] text-[#10B981]" : "border-transparent text-[#6B7280]"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {(activeTab === "data" || wt !== "Table") && (
          <>
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">Widget title <span className="text-[#EF4444]">*</span></label>
              <input
                data-testid="input-widget-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputCls(errors.title)}
              />
              {errors.title && <p className="text-[#EF4444] text-xs mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">Widget type</label>
              <input value={wt} readOnly className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm bg-[#F9FAFB] text-[#6B7280] cursor-not-allowed" />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">Description</label>
              <textarea
                data-testid="input-widget-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">Width (Cols) <span className="text-[#EF4444]">*</span></label>
                <input
                  data-testid="input-widget-width"
                  type="number"
                  min={1}
                  max={12}
                  value={widthCols}
                  onChange={(e) => setWidthCols(parseInt(e.target.value) || 1)}
                  className={inputCls()}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">Height (Rows) <span className="text-[#EF4444]">*</span></label>
                <input
                  data-testid="input-widget-height"
                  type="number"
                  min={1}
                  max={10}
                  value={heightRows}
                  onChange={(e) => setHeightRows(parseInt(e.target.value) || 1)}
                  className={inputCls()}
                />
              </div>
            </div>

            {wt === "KPI" && (
              <div className="space-y-3 pt-2 border-t border-[#E5E7EB]">
                <p className="text-xs font-semibold text-[#374151] uppercase tracking-wide">Data Setting</p>
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1">Select metric <span className="text-[#EF4444]">*</span></label>
                  <select data-testid="select-metric" value={metric} onChange={(e) => setMetric(e.target.value)} className={inputCls(errors.metric)}>
                    {METRIC_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  {errors.metric && <p className="text-[#EF4444] text-xs mt-1">{errors.metric}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1">Aggregation <span className="text-[#EF4444]">*</span></label>
                  <select data-testid="select-aggregation" value={aggregation} onChange={(e) => setAggregation(e.target.value)} className={inputCls()}>
                    {AGGREGATION_OPTIONS.map((o) => <option key={o} value={o.toLowerCase()}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1">Data format <span className="text-[#EF4444]">*</span></label>
                  <select data-testid="select-data-format" value={dataFormat} onChange={(e) => setDataFormat(e.target.value)} className={inputCls()}>
                    {FORMAT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1">Decimal precision <span className="text-[#EF4444]">*</span></label>
                  <input
                    data-testid="input-decimal-precision"
                    type="number"
                    min={0}
                    max={5}
                    value={decimalPrecision}
                    onChange={(e) => setDecimalPrecision(parseInt(e.target.value) ?? 0)}
                    className={inputCls()}
                  />
                </div>
              </div>
            )}

            {wt === "Table" && (
              <div className="space-y-3 pt-2 border-t border-[#E5E7EB]">
                <p className="text-xs font-semibold text-[#374151] uppercase tracking-wide">Data Setting</p>
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1">Choose columns <span className="text-[#EF4444]">*</span></label>
                  <div className="border border-[#E5E7EB] rounded-lg max-h-40 overflow-y-auto p-2 space-y-1">
                    {COLUMN_OPTIONS.map((col) => (
                      <label key={col.value} className="flex items-center gap-2 cursor-pointer hover:bg-[#F9FAFB] px-2 py-1 rounded">
                        <input
                          type="checkbox"
                          checked={columns.includes(col.value)}
                          onChange={() => toggleColumn(col.value)}
                          className="accent-[#10B981]"
                        />
                        <span className="text-sm text-[#374151]">{col.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.columns && <p className="text-[#EF4444] text-xs mt-1">{errors.columns}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1">Sort by</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={inputCls()}>
                    {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1">Pagination</label>
                  <select value={pagination} onChange={(e) => setPagination(parseInt(e.target.value))} className={inputCls()}>
                    {PAGINATION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="filter-toggle"
                    checked={filterEnabled}
                    onChange={(e) => setFilterEnabled(e.target.checked)}
                    className="accent-[#10B981]"
                  />
                  <label htmlFor="filter-toggle" className="text-sm text-[#374151] cursor-pointer">Apply filter</label>
                </div>
                {filterEnabled && (
                  <div className="space-y-2 pl-2 border-l-2 border-[#10B981]">
                    <select value={filterAttr} onChange={(e) => setFilterAttr(e.target.value)} className={inputCls()}>
                      {FILTER_ATTR_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <select value={filterOp} onChange={(e) => setFilterOp(e.target.value)} className={inputCls()}>
                      {OPERATOR_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <input
                      value={filterVal}
                      onChange={(e) => setFilterVal(e.target.value)}
                      placeholder="Value"
                      className={inputCls()}
                    />
                  </div>
                )}
              </div>
            )}

            {(wt === "Pie Chart") && (
              <div className="space-y-3 pt-2 border-t border-[#E5E7EB]">
                <p className="text-xs font-semibold text-[#374151] uppercase tracking-wide">Data Setting</p>
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1">Choose chart data <span className="text-[#EF4444]">*</span></label>
                  <select value={chartField} onChange={(e) => setChartField(e.target.value)} className={inputCls()}>
                    {CHART_DATA_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="show-legend"
                    checked={showLegend}
                    onChange={(e) => setShowLegend(e.target.checked)}
                    className="accent-[#10B981]"
                  />
                  <label htmlFor="show-legend" className="text-sm text-[#374151] cursor-pointer">Show legend</label>
                </div>
              </div>
            )}

            {(wt === "Bar Chart" || wt === "Line Chart" || wt === "Area Chart" || wt === "Scatter Plot") && (
              <div className="space-y-3 pt-2 border-t border-[#E5E7EB]">
                <p className="text-xs font-semibold text-[#374151] uppercase tracking-wide">Data Setting</p>
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1">X-axis field <span className="text-[#EF4444]">*</span></label>
                  <select value={xAxisField} onChange={(e) => setXAxisField(e.target.value)} className={inputCls()}>
                    {COLUMN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1">Y-axis field <span className="text-[#EF4444]">*</span></label>
                  <select value={yAxisField} onChange={(e) => setYAxisField(e.target.value)} className={inputCls()}>
                    {COLUMN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="show-legend-chart"
                    checked={showLegend}
                    onChange={(e) => setShowLegend(e.target.checked)}
                    className="accent-[#10B981]"
                  />
                  <label htmlFor="show-legend-chart" className="text-sm text-[#374151] cursor-pointer">Show legend</label>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "styling" && wt === "Table" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">Font size (px) <span className="text-[#EF4444]">*</span></label>
              <input
                type="number"
                min={12}
                max={20}
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value) || 14)}
                className={inputCls()}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">Header background</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={headerBg}
                  onChange={(e) => setHeaderBg(e.target.value)}
                  className="w-10 h-9 border border-[#E5E7EB] rounded cursor-pointer p-0.5"
                />
                <input
                  value={headerBg}
                  onChange={(e) => setHeaderBg(e.target.value)}
                  className={`flex-1 ${inputCls()}`}
                  maxLength={7}
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-[#374151] mb-2">Preview</p>
              <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
                <table className="w-full" style={{ fontSize: `${fontSize}px` }}>
                  <thead>
                    <tr style={{ backgroundColor: headerBg }}>
                      {["Column 1", "Column 2", "Column 3"].map((c) => (
                        <th key={c} className="px-3 py-2 text-left text-xs font-semibold text-[#6B7280]">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3].map((i) => (
                      <tr key={i} className="border-t border-[#F3F4F6]">
                        {["Value", "Data", "Item"].map((v, j) => (
                          <td key={j} className="px-3 py-2 text-[#111827]">{v} {i}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-5 py-4 border-t border-[#E5E7EB] flex gap-3">
        <button
          data-testid="button-cancel-widget"
          onClick={onClose}
          className="flex-1 px-4 py-2 text-sm font-medium text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F3F4F6] transition-colors"
        >
          Cancel
        </button>
        <button
          data-testid="button-save-widget"
          onClick={handleSave}
          className="flex-1 px-4 py-2 text-sm font-medium bg-[#10B981] hover:bg-[#059669] text-white rounded-lg transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
}
