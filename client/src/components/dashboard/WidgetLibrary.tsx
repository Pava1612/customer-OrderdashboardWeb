import { useDraggable } from "@dnd-kit/core";
import { BarChart2, LineChart, PieChart, TrendingUp, Table2, Activity, ScatterChart, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { WidgetType } from "@shared/schema";

interface LibraryItem {
  type: WidgetType;
  label: string;
  icon: React.ReactNode;
}

const CHARTS: LibraryItem[] = [
  { type: "Bar Chart", label: "Bar Chart", icon: <BarChart2 size={16} /> },
  { type: "Line Chart", label: "Line Chart", icon: <LineChart size={16} /> },
  { type: "Pie Chart", label: "Pie Chart", icon: <PieChart size={16} /> },
  { type: "Area Chart", label: "Area Chart", icon: <Activity size={16} /> },
  { type: "Scatter Plot", label: "Scatter Plot", icon: <ScatterChart size={16} /> },
];

const TABLES: LibraryItem[] = [
  { type: "Table", label: "Table", icon: <Table2 size={16} /> },
];

const KPIS: LibraryItem[] = [
  { type: "KPI", label: "KPI Value", icon: <TrendingUp size={16} /> },
];

function DraggableItem({ item }: { item: LibraryItem }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library-${item.type}`,
    data: { widgetType: item.type },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[#E5E7EB] bg-white text-sm text-[#374151] cursor-grab hover:bg-[#F0FDF4] hover:border-[#10B981] transition-colors select-none ${isDragging ? "opacity-50" : ""}`}
    >
      <span className="text-[#6B7280]">{item.icon}</span>
      {item.label}
    </div>
  );
}

function Section({ title, items, defaultOpen = true }: { title: string; items: LibraryItem[]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-1 py-2 text-xs font-semibold text-[#374151] uppercase tracking-wide hover:text-[#111827]"
      >
        {title}
        <ChevronDown size={14} className={`transition-transform ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && (
        <div className="space-y-2 mb-4">
          {items.map((item) => (
            <DraggableItem key={item.type} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function WidgetLibrary() {
  return (
    <div className="w-[280px] shrink-0 bg-white border-r border-[#E5E7EB] h-full overflow-y-auto">
      <div className="px-4 py-4 border-b border-[#E5E7EB]">
        <h2 className="text-sm font-semibold text-[#111827]">Widget Library</h2>
        <p className="text-xs text-[#6B7280] mt-0.5">Drag widgets onto the canvas</p>
      </div>
      <div className="px-4 py-4 space-y-1">
        <Section title="Charts" items={CHARTS} />
        <Section title="Tables" items={TABLES} />
        <Section title="KPIs" items={KPIS} />
      </div>
    </div>
  );
}
