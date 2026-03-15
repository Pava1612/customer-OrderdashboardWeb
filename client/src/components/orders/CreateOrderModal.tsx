import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Order, InsertOrder, OrderStatus } from "@shared/schema";
import { PRODUCTS, STATUS_OPTIONS } from "@shared/schema";

interface Props {
  order: Order | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

const PRODUCT_LIST = Object.keys(PRODUCTS);

const emptyForm = (): InsertOrder => ({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  product: "",
  unitPrice: 0,
  quantity: 1,
  totalAmount: 0,
  status: "Pending",
  createdBy: "",
});

type Errors = Partial<Record<keyof InsertOrder, string>>;

export default function CreateOrderModal({ order, onClose, onSuccess }: Props) {
  const [form, setForm] = useState<InsertOrder>(emptyForm());
  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (order) {
      setForm({
        firstName: order.customer?.firstName ?? "",
        lastName: order.customer?.lastName ?? "",
        email: order.customer?.email ?? "",
        phone: order.customer?.phone ?? "",
        street: order.customer?.street ?? "",
        city: order.customer?.city ?? "",
        state: order.customer?.state ?? "",
        postalCode: order.customer?.postalCode ?? "",
        country: order.customer?.country ?? "",
        product: order.product,
        unitPrice: order.unitPrice,
        quantity: order.quantity,
        totalAmount: order.totalAmount,
        status: order.status,
        createdBy: order.createdBy,
      });
    } else {
      setForm(emptyForm());
    }
    setErrors({});
  }, [order]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleProductChange = (product: string) => {
    const unitPrice = PRODUCTS[product] ?? 0;
    setForm((f) => ({ ...f, product, unitPrice, totalAmount: unitPrice * f.quantity }));
  };

  const handleQtyChange = (qty: number) => {
    setForm((f) => ({ ...f, quantity: qty, totalAmount: f.unitPrice * qty }));
  };

  const handleUnitPriceChange = (price: number) => {
    setForm((f) => ({ ...f, unitPrice: price, totalAmount: price * f.quantity }));
  };

  const validate = (): boolean => {
    const required: Array<keyof InsertOrder> = [
      "firstName", "lastName", "email", "phone", "street", "city",
      "state", "postalCode", "country", "product", "status", "createdBy",
    ];
    const newErrors: Errors = {};
    required.forEach((field) => {
      if (!form[field]) newErrors[field] = "Please fill the field";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const url = order ? `/api/orders/${order.id}` : "/api/orders";
      const method = order ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      const msg = order
        ? "All set! Your changes have been saved successfully!"
        : `Nice work! Your new order ${data.orderId} is now in the list!`;
      onSuccess(msg);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const field = (
    label: string,
    key: keyof InsertOrder,
    props: React.InputHTMLAttributes<HTMLInputElement> = {}
  ) => (
    <div>
      <label className="block text-xs font-medium text-[#374151] mb-1">
        {label} {props.required !== false && <span className="text-[#EF4444]">*</span>}
      </label>
      <input
        data-testid={`input-${key}`}
        value={String(form[key])}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] ${errors[key] ? "border-[#EF4444]" : "border-[#E5E7EB]"}`}
        {...props}
      />
      {errors[key] && <p className="text-[#EF4444] text-xs mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="text-lg font-semibold text-[#111827]">{order ? "Edit order" : "Create order"}</h2>
          <button data-testid="button-close-modal" onClick={onClose} className="p-1.5 rounded hover:bg-[#F3F4F6]">
            <X size={18} className="text-[#6B7280]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-[#111827] mb-4">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              {field("First name", "firstName")}
              {field("Last name", "lastName")}
              {field("Email id", "email", { type: "email" })}
              {field("Phone number", "phone")}
              <div className="col-span-2">{field("Street Address", "street")}</div>
              {field("City", "city")}
              {field("State/Province", "state")}
              {field("Postal code", "postalCode")}
              {field("Country", "country")}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#111827] mb-4">Order Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-[#374151] mb-1">
                  Choose product <span className="text-[#EF4444]">*</span>
                </label>
                <select
                  data-testid="select-product"
                  value={form.product}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] ${errors.product ? "border-[#EF4444]" : "border-[#E5E7EB]"}`}
                >
                  <option value="">Select a product</option>
                  {PRODUCT_LIST.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                {errors.product && <p className="text-[#EF4444] text-xs mt-1">{errors.product}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">
                  Unit price <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  data-testid="input-unitPrice"
                  type="number"
                  step="0.01"
                  value={form.unitPrice}
                  onChange={(e) => handleUnitPriceChange(parseFloat(e.target.value) || 0)}
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">Quantity</label>
                <input
                  data-testid="input-quantity"
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) => handleQtyChange(parseInt(e.target.value) || 1)}
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">
                  Total amount <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  data-testid="input-totalAmount"
                  type="number"
                  value={form.totalAmount.toFixed(2)}
                  readOnly
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm bg-[#F9FAFB] text-[#6B7280] cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">
                  Status <span className="text-[#EF4444]">*</span>
                </label>
                <select
                  data-testid="select-status"
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as OrderStatus }))}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] ${errors.status ? "border-[#EF4444]" : "border-[#E5E7EB]"}`}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.status && <p className="text-[#EF4444] text-xs mt-1">{errors.status}</p>}
              </div>

              <div className="col-span-2">{field("Created by", "createdBy")}</div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E5E7EB]">
            <button
              data-testid="button-cancel"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F3F4F6] transition-colors"
            >
              Cancel
            </button>
            <button
              data-testid="button-submit"
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 text-sm font-medium bg-[#10B981] hover:bg-[#059669] text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? "Saving..." : order ? "Save" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
