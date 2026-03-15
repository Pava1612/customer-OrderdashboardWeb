import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import toast from "react-hot-toast";
import { MoreVertical, Search, Plus, LayoutDashboard, Table2, Calendar } from "lucide-react";
import type { Order } from "@shared/schema";
import CreateOrderModal from "@/components/orders/CreateOrderModal";
import DeleteConfirmModal from "@/components/orders/DeleteConfirmModal";
import KPIWidget from "@/components/widgets/KPIWidget";
import PieChartWidget from "@/components/widgets/PieChartWidget";
import BarChartWidget from "@/components/widgets/BarChartWidget";
import LineChartWidget from "@/components/widgets/LineChartWidget";
import AreaChartWidget from "@/components/widgets/AreaChartWidget";
import ScatterPlotWidget from "@/components/widgets/ScatterPlotWidget";
import TableWidget from "@/components/widgets/TableWidget";
import type { Widget } from "@shared/schema";

const DATE_RANGE_OPTIONS = [
  { label: "All time", value: "alltime" },
  { label: "Today", value: "today" },
  { label: "Last 7 Days", value: "last7" },
  { label: "Last 30 Days", value: "last30" },
  { label: "Last 90 Days", value: "last90" },
];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-700",
    "In progress": "bg-blue-100 text-blue-700",
    Completed: "bg-green-100 text-green-600",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

function renderWidget(widget: Widget, dateRange: string) {
  const props = { widget, dateRange };
  switch (widget.widgetType) {
    case "KPI": return <KPIWidget {...props} />;
    case "Pie Chart": return <PieChartWidget {...props} />;
    case "Bar Chart": return <BarChartWidget {...props} />;
    case "Line Chart": return <LineChartWidget {...props} />;
    case "Area Chart": return <AreaChartWidget {...props} />;
    case "Scatter Plot": return <ScatterPlotWidget {...props} />;
    case "Table": return <TableWidget {...props} />;
    default: return null;
  }
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<"table" | "dashboard">("table");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [deleteOrder, setDeleteOrder] = useState<Order | null>(null);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState("alltime");

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: widgets = [] } = useQuery<Widget[]>({
    queryKey: ["/api/widgets"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast.success("Done! Your Item has been removed");
      setDeleteOrder(null);
    },
  });

  const filteredOrders = orders.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.orderId.toLowerCase().includes(q) ||
      o.product.toLowerCase().includes(q) ||
      o.status.toLowerCase().includes(q) ||
      o.createdBy.toLowerCase().includes(q) ||
      (o.customer?.firstName + " " + o.customer?.lastName).toLowerCase().includes(q) ||
      (o.customer?.email ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-[Inter,sans-serif]">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#111827]">Customer Orders</h1>
          <p className="text-[#6B7280] text-sm mt-1">View and manage customer orders and details</p>
        </div>

        <div className="flex gap-1 mb-6 border-b border-[#E5E7EB]">
          <button
            data-testid="tab-dashboard"
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "dashboard" ? "border-[#10B981] text-[#10B981]" : "border-transparent text-[#6B7280] hover:text-[#111827]"}`}
          >
            <LayoutDashboard size={16} />
            Dashboard
          </button>
          <button
            data-testid="tab-table"
            onClick={() => setActiveTab("table")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "table" ? "border-[#10B981] text-[#10B981]" : "border-transparent text-[#6B7280] hover:text-[#111827]"}`}
          >
            <Table2 size={16} />
            Table
          </button>
        </div>

        {activeTab === "table" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                <input
                  data-testid="input-search"
                  type="text"
                  placeholder="Search orders..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#10B981] w-64"
                />
              </div>
              <button
                data-testid="button-create-order"
                onClick={() => { setEditOrder(null); setShowCreate(true); }}
                className="flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus size={16} />
                Create order
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20 text-[#6B7280]">Loading...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-[#E5E7EB]">
                <div className="w-16 h-16 bg-[#F3F4F6] rounded-full flex items-center justify-center mb-4">
                  <Table2 size={32} className="text-[#9CA3AF]" />
                </div>
                <h3 className="text-lg font-semibold text-[#111827] mb-2">No Orders Yet</h3>
                <p className="text-[#6B7280] text-sm mb-6 text-center max-w-xs">
                  Click Create Order and enter your order information
                </p>
                <button
                  data-testid="button-create-order-empty"
                  onClick={() => { setEditOrder(null); setShowCreate(true); }}
                  className="flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus size={16} />
                  Create order
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[1200px]">
                    <thead>
                      <tr className="bg-[#F3F4F6] border-b border-[#E5E7EB]">
                        {["S.no", "Customer ID", "Customer name", "Email id", "Phone number", "Address", "Order ID", "Order date", "Product", "Quantity", "Unit price", "Total amount", "Status", "Created by", "Actions"].map((col) => (
                          <th key={col} className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {filteredOrders.map((order, idx) => (
                        <tr key={order.id} data-testid={`row-order-${order.id}`} className="hover:bg-[#F9FAFB] transition-colors">
                          <td className="px-4 py-3 text-[#6B7280]">{idx + 1}</td>
                          <td className="px-4 py-3 text-[#111827] whitespace-nowrap">{order.customer?.customerId}</td>
                          <td className="px-4 py-3 text-[#111827] whitespace-nowrap">{order.customer?.firstName} {order.customer?.lastName}</td>
                          <td className="px-4 py-3 text-[#111827]">{order.customer?.email}</td>
                          <td className="px-4 py-3 text-[#111827] whitespace-nowrap">{order.customer?.phone}</td>
                          <td className="px-4 py-3 text-[#111827] max-w-[160px] truncate">{order.customer?.street}, {order.customer?.city}, {order.customer?.state}</td>
                          <td className="px-4 py-3 text-[#111827] whitespace-nowrap font-medium">{order.orderId}</td>
                          <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">{new Date(order.orderDate).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-[#111827] max-w-[180px] truncate">{order.product}</td>
                          <td className="px-4 py-3 text-[#111827] text-center">{order.quantity}</td>
                          <td className="px-4 py-3 text-[#111827]">${order.unitPrice.toFixed(2)}</td>
                          <td className="px-4 py-3 text-[#111827] font-medium">${order.totalAmount.toFixed(2)}</td>
                          <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                          <td className="px-4 py-3 text-[#111827]">{order.createdBy}</td>
                          <td className="px-4 py-3 relative">
                            <button
                              data-testid={`button-menu-${order.id}`}
                              onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === order.id ? null : order.id); }}
                              className="p-1.5 rounded hover:bg-[#F3F4F6] transition-colors"
                            >
                              <MoreVertical size={16} className="text-[#6B7280]" />
                            </button>
                            {openMenu === order.id && (
                              <div
                                className="absolute right-8 top-2 bg-white border border-[#E5E7EB] rounded-lg shadow-lg z-10 min-w-[100px]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  data-testid={`button-edit-${order.id}`}
                                  onClick={() => { setEditOrder(order); setShowCreate(true); setOpenMenu(null); }}
                                  className="w-full text-left px-4 py-2 text-sm text-[#111827] hover:bg-[#F3F4F6] transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  data-testid={`button-delete-${order.id}`}
                                  onClick={() => { setDeleteOrder(order); setOpenMenu(null); }}
                                  className="w-full text-left px-4 py-2 text-sm text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "dashboard" && (
          <div>
            {widgets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center max-w-md">
                  <div className="w-16 h-16 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-4">
                    <LayoutDashboard size={32} className="text-[#9CA3AF]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#111827] mb-2">Dashboard Not Configured</h3>
                  <p className="text-[#6B7280] text-sm mb-6">Configure your dashboard to start viewing analytics</p>
                  <Link href="/dashboard/configure">
                    <button
                      data-testid="button-configure-dashboard"
                      className="bg-[#10B981] hover:bg-[#059669] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      Configure dashboard
                    </button>
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Link href="/dashboard/configure">
                      <button
                        data-testid="button-edit-dashboard"
                        className="border border-[#E5E7EB] bg-white hover:bg-[#F3F4F6] text-[#111827] px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Edit Dashboard
                      </button>
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-[#6B7280]" />
                    <select
                      data-testid="select-date-range"
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm bg-white text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                    >
                      {DATE_RANGE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-4 auto-rows-[minmax(180px,auto)]">
                  {widgets.map((widget) => (
                    <div
                      key={widget.id}
                      data-testid={`widget-card-${widget.id}`}
                      className={`col-span-${Math.min(widget.widthCols, 12)} row-span-${widget.heightRows} bg-white rounded-xl border border-[#E5E7EB] overflow-hidden`}
                      style={{ gridColumn: `span ${Math.min(widget.widthCols, 12)}` }}
                    >
                      {renderWidget(widget, dateRange)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateOrderModal
          order={editOrder}
          onClose={() => { setShowCreate(false); setEditOrder(null); }}
          onSuccess={(msg) => { toast.success(msg); queryClient.invalidateQueries({ queryKey: ["/api/orders"] }); }}
        />
      )}

      {deleteOrder && (
        <DeleteConfirmModal
          title={`Are you sure you want to delete the ${deleteOrder.orderId}?`}
          onCancel={() => setDeleteOrder(null)}
          onConfirm={() => deleteMutation.mutate(deleteOrder.id)}
          isLoading={deleteMutation.isPending}
        />
      )}

      {openMenu !== null && (
        <div className="fixed inset-0 z-0" onClick={() => setOpenMenu(null)} />
      )}
    </div>
  );
}
