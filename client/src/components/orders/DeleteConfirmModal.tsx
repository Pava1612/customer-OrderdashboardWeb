import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function DeleteConfirmModal({ title, onCancel, onConfirm, isLoading }: Props) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 bg-[#FEF2F2] rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-[#EF4444]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#111827] mb-1">Confirm Delete</h2>
            <p className="text-sm text-[#6B7280]">{title}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          <button
            data-testid="button-cancel-delete"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F3F4F6] transition-colors"
          >
            Cancel
          </button>
          <button
            data-testid="button-confirm-delete"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium bg-[#EF4444] hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
