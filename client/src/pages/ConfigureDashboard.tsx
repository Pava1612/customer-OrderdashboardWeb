import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import toast from "react-hot-toast";
import { Calendar, Save, GripVertical, Settings, Trash2, LayoutDashboard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import WidgetLibrary from "@/components/dashboard/WidgetLibrary";
import WidgetConfigPanel from "@/components/dashboard/WidgetConfigPanel";
import DeleteConfirmModal from "@/components/orders/DeleteConfirmModal";
import type { Widget, WidgetType, WidgetConfig } from "@shared/schema";

const DATE_RANGE_OPTIONS = [
  { label: "All time", value: "alltime" },
  { label: "Today", value: "today" },
  { label: "Last 7 Days", value: "last7" },
  { label: "Last 30 Days", value: "last30" },
  { label: "Last 90 Days", value: "last90" },
];

interface LocalWidget {
  localId: string;
  serverId?: number;
  widgetType: WidgetType;
  widgetTitle: string;
  description: string;
  widthCols: number;
  heightRows: number;
  gridX: number;
  gridY: number;
  configJson: WidgetConfig;
}

let localIdCounter = 1;

function defaultConfig(type: WidgetType): WidgetConfig {
  if (type === "KPI") return { metric: "total_orders", aggregation: "count", dataFormat: "Number", decimalPrecision: 0 };
  if (type === "Table") return { columns: ["order_id", "product", "quantity", "total_amount"], sortBy: "asc", pagination: 5 };
  if (type === "Pie Chart") return { chartField: "status", showLegend: true };
  return { xAxisField: "status", yAxisField: "quantity", showLegend: true };
}

function defaultSize(type: WidgetType): { w: number; h: number } {
  if (type === "KPI") return { w: 3, h: 2 };
  if (type === "Table") return { w: 6, h: 4 };
  return { w: 5, h: 4 };
}

function DroppableCanvas({ children, isOver }: { children: React.ReactNode; isOver: boolean }) {
  const { setNodeRef } = useDroppable({ id: "canvas" });
  return (
    <div
      ref={setNodeRef}
      className={`flex-1 p-4 transition-colors rounded-xl ${isOver ? "bg-[rgba(16,185,129,0.05)] border-2 border-dashed border-[#10B981]" : ""}`}
    >
      {children}
    </div>
  );
}

export default function ConfigureDashboard() {
  const [, navigate] = useLocation();
  const [localWidgets, setLocalWidgets] = useState<LocalWidget[]>([]);
  const [configWidget, setConfigWidget] = useState<LocalWidget | null>(null);
  const [deleteWidget, setDeleteWidget] = useState<LocalWidget | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [dateRange, setDateRange] = useState("alltime");
  const [isOver, setIsOver] = useState(false);
  const [activeDragType, setActiveDragType] = useState<WidgetType | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { data: serverWidgets = [] } = useQuery<Widget[]>({
    queryKey: ["/api/widgets"],
  });

  useEffect(() => {
    if (localWidgets.length === 0 && serverWidgets.length > 0) {
      const mapped: LocalWidget[] = serverWidgets.map((w) => ({
        localId: `server-${w.id}`,
        serverId: w.id,
        widgetType: w.widgetType,
        widgetTitle: w.widgetTitle,
        description: w.description,
        widthCols: w.widthCols,
        heightRows: w.heightRows,
        gridX: w.gridX,
        gridY: w.gridY,
        configJson: w.configJson,
      }));
      setLocalWidgets(mapped);
    }
  }, [serverWidgets]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.widgetType) setActiveDragType(data.widgetType);
  };

  const handleDragOver = (event: any) => {
    setIsOver(event.over?.id === "canvas");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsOver(false);
    setActiveDragType(null);
    const { active, over } = event;
    if (!over || over.id !== "canvas") return;

    const data = active.data.current;
    if (data?.widgetType && !data?.placedWidgetId) {
      const type = data.widgetType as WidgetType;
      const size = defaultSize(type);
      const newWidget: LocalWidget = {
        localId: `local-${localIdCounter++}`,
        widgetType: type,
        widgetTitle: "Untitled",
        description: "",
        widthCols: size.w,
        heightRows: size.h,
        gridX: 0,
        gridY: localWidgets.length,
        configJson: defaultConfig(type),
      };
      setLocalWidgets((prev) => [...prev, newWidget]);
      setUnsavedChanges(true);
    }
  };

  const handleConfigure = (widget: LocalWidget) => {
    setConfigWidget(widget);
  };

  const handleConfigSave = (config: {
    widgetTitle: string;
    description: string;
    widthCols: number;
    heightRows: number;
    configJson: WidgetConfig;
  }) => {
    setLocalWidgets((prev) =>
      prev.map((w) =>
        w.localId === configWidget?.localId ? { ...w, ...config } : w
      )
    );
    setUnsavedChanges(true);
    setConfigWidget(null);
    toast.success("All set! Your new widget have been added successfully!");
  };

  const handleDeleteWidget = (widget: LocalWidget) => {
    setDeleteWidget(widget);
  };

  const confirmDelete = () => {
    if (!deleteWidget) return;
    setLocalWidgets((prev) => prev.filter((w) => w.localId !== deleteWidget.localId));
    setUnsavedChanges(true);
    toast.success("Done! Your widget has been removed");
    setDeleteWidget(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const existingIds = new Set(serverWidgets.map((w) => w.id));

      for (const w of localWidgets) {
        const body = {
          widgetTitle: w.widgetTitle,
          widgetType: w.widgetType,
          description: w.description,
          widthCols: w.widthCols,
          heightRows: w.heightRows,
          gridX: w.gridX,
          gridY: w.gridY,
          configJson: w.configJson,
        };
        if (w.serverId && existingIds.has(w.serverId)) {
          await fetch(`/api/widgets/${w.serverId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
        } else {
          await fetch("/api/widgets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
        }
      }

      const localServerIds = new Set(localWidgets.map((w) => w.serverId).filter(Boolean));
      for (const sw of serverWidgets) {
        if (!localServerIds.has(sw.id)) {
          await fetch(`/api/widgets/${sw.id}`, { method: "DELETE" });
        }
      }

      await queryClient.invalidateQueries({ queryKey: ["/api/widgets"] });
      toast.success("All set! Your changes have been saved successfully!");
      setUnsavedChanges(false);
      navigate("/orders");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (unsavedChanges) {
      setShowUnsavedModal(true);
    } else {
      navigate("/orders");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#F9FAFB] font-[Inter,sans-serif] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-[#E5E7EB] shrink-0">
        <div className="flex items-center gap-2">
          <LayoutDashboard size={18} className="text-[#10B981]" />
          <h1 className="text-base font-semibold text-[#111827]">Configure Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-[#6B7280]" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-[#E5E7EB] rounded-lg px-3 py-1.5 text-sm bg-white text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
            >
              {DATE_RANGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <button
            data-testid="button-cancel-configure"
            onClick={handleCancel}
            className="px-4 py-1.5 text-sm font-medium text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F3F4F6] transition-colors"
          >
            Cancel
          </button>
          <button
            data-testid="button-save-dashboard"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium bg-[#10B981] hover:bg-[#059669] text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Save size={14} />
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <div className="flex flex-1 overflow-hidden">
          <WidgetLibrary />

          <div className="flex-1 overflow-y-auto">
            <DroppableCanvas isOver={isOver}>
              {localWidgets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                  <div className="w-16 h-16 bg-[#F3F4F6] rounded-full flex items-center justify-center mb-4">
                    <LayoutDashboard size={28} className="text-[#9CA3AF]" />
                  </div>
                  <p className="text-[#374151] font-medium mb-1">Drag and drop your canvas</p>
                  <p className="text-sm text-[#6B7280] max-w-xs">
                    Drag widgets from the library on the left to start building your custom dashboard.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-12 gap-4 auto-rows-[180px]">
                  {localWidgets.map((widget) => (
                    <div
                      key={widget.localId}
                      data-testid={`placed-widget-${widget.localId}`}
                      className="bg-white rounded-xl border-2 border-[#E5E7EB] overflow-hidden flex flex-col hover:shadow-md transition-shadow group"
                      style={{ gridColumn: `span ${Math.min(widget.widthCols, 12)}` }}
                    >
                      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#E5E7EB] bg-[#F9FAFB] cursor-grab">
                        <div className="flex items-center gap-2">
                          <GripVertical size={14} className="text-[#9CA3AF]" />
                          <span className="text-sm font-medium text-[#111827] truncate">
                            {widget.widgetTitle || "Untitled"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            data-testid={`button-configure-${widget.localId}`}
                            onClick={() => handleConfigure(widget)}
                            className="p-1.5 rounded hover:bg-[#E5E7EB] transition-colors cursor-pointer"
                          >
                            <Settings size={14} className="text-[#6B7280]" />
                          </button>
                          <button
                            data-testid={`button-delete-widget-${widget.localId}`}
                            onClick={() => handleDeleteWidget(widget)}
                            className="p-1.5 rounded hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} className="text-[#EF4444]" />
                          </button>
                        </div>
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <span className="text-4xl font-bold text-[#E5E7EB]">0</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DroppableCanvas>
          </div>

          {configWidget && (
            <WidgetConfigPanel
              widget={{
                ...configWidget,
                id: configWidget.serverId ?? -1,
                widgetId: configWidget.localId,
              }}
              onClose={() => setConfigWidget(null)}
              onSave={handleConfigSave}
            />
          )}
        </div>

        <DragOverlay>
          {activeDragType && (
            <div className="bg-white rounded-xl border-2 border-[#10B981] shadow-lg px-5 py-3 text-sm font-medium text-[#10B981] pointer-events-none">
              {activeDragType}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {deleteWidget && (
        <DeleteConfirmModal
          title={`Are you sure you want to delete the ${deleteWidget.widgetTitle || "Untitled"} widget?`}
          onCancel={() => setDeleteWidget(null)}
          onConfirm={confirmDelete}
        />
      )}

      {showUnsavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-base font-semibold text-[#111827] mb-2">Unsaved changes</h2>
            <p className="text-sm text-[#6B7280] mb-6">Do you want to save your changes before navigating away?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowUnsavedModal(false); navigate("/orders"); }}
                className="px-4 py-2 text-sm font-medium text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F3F4F6]"
              >
                Discard
              </button>
              <button
                onClick={async () => { setShowUnsavedModal(false); await handleSave(); }}
                className="px-4 py-2 text-sm font-medium bg-[#10B981] hover:bg-[#059669] text-white rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
