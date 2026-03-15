import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { Settings, Trash2, GripVertical } from "lucide-react";
import type { WidgetType } from "@shared/schema";

interface PlacedWidget {
  id: string;
  widgetType: WidgetType;
  widgetTitle: string;
  widthCols: number;
  heightRows: number;
  gridX: number;
  gridY: number;
}

interface Props {
  widget: PlacedWidget;
  onConfigure: () => void;
  onDelete: () => void;
}

export default function WidgetCard({ widget, onConfigure, onDelete }: Props) {
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: `placed-${widget.id}`,
    data: { placedWidgetId: widget.id, widgetType: widget.widgetType },
  });

  return (
    <div
      ref={setDragRef}
      data-testid={`widget-card-${widget.id}`}
      className={`bg-white rounded-xl border-2 border-[#E5E7EB] overflow-hidden flex flex-col h-full transition-shadow ${isDragging ? "opacity-50 shadow-lg" : "hover:shadow-md"}`}
      style={{ gridColumn: `span ${Math.min(widget.widthCols, 12)}`, cursor: "grab" }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB] bg-[#F9FAFB]" {...listeners} {...attributes}>
        <div className="flex items-center gap-2">
          <GripVertical size={14} className="text-[#9CA3AF]" />
          <span className="text-sm font-medium text-[#111827] truncate">{widget.widgetTitle || "Untitled"}</span>
        </div>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            data-testid={`button-configure-${widget.id}`}
            onClick={onConfigure}
            className="p-1.5 rounded hover:bg-[#E5E7EB] transition-colors cursor-pointer"
          >
            <Settings size={14} className="text-[#6B7280]" />
          </button>
          <button
            data-testid={`button-delete-widget-${widget.id}`}
            onClick={onDelete}
            className="p-1.5 rounded hover:bg-[#FEF2F2] transition-colors cursor-pointer"
          >
            <Trash2 size={14} className="text-[#EF4444]" />
          </button>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center text-[#9CA3AF] text-sm p-4">
        <span className="text-3xl font-bold text-[#E5E7EB]">0</span>
      </div>
    </div>
  );
}

interface DroppableCellProps {
  id: string;
  isOver: boolean;
}

export function DroppableCell({ id, isOver }: DroppableCellProps) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`w-full h-full min-h-[160px] rounded-xl border-2 border-dashed transition-colors ${isOver ? "border-[#10B981] bg-[rgba(16,185,129,0.05)]" : "border-[#E5E7EB]"}`}
    />
  );
}
