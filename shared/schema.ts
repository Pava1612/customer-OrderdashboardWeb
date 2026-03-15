export interface Customer {
  id: number;
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  createdAt: string;
}

export type OrderStatus = "Pending" | "In progress" | "Completed";

export interface Order {
  id: number;
  orderId: string;
  customerId: number;
  product: string;
  unitPrice: number;
  quantity: number;
  totalAmount: number;
  status: OrderStatus;
  createdBy: string;
  orderDate: string;
  customer?: Customer;
}

export type WidgetType =
  | "KPI"
  | "Table"
  | "Bar Chart"
  | "Line Chart"
  | "Pie Chart"
  | "Area Chart"
  | "Scatter Plot";

export interface WidgetConfig {
  metric?: string;
  aggregation?: string;
  dataFormat?: string;
  decimalPrecision?: number;
  columns?: string[];
  sortBy?: string;
  pagination?: number;
  filterEnabled?: boolean;
  filterAttr?: string;
  filterOp?: string;
  filterVal?: string;
  chartField?: string;
  xAxisField?: string;
  yAxisField?: string;
  showLegend?: boolean;
  fontSize?: number;
  headerBg?: string;
}

export interface Widget {
  id: number;
  widgetId: string;
  widgetTitle: string;
  widgetType: WidgetType;
  description: string;
  widthCols: number;
  heightRows: number;
  gridX: number;
  gridY: number;
  configJson: WidgetConfig;
  createdAt: string;
}

export interface InsertOrder {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  product: string;
  unitPrice: number;
  quantity: number;
  totalAmount: number;
  status: OrderStatus;
  createdBy: string;
}

export interface InsertWidget {
  widgetTitle: string;
  widgetType: WidgetType;
  description?: string;
  widthCols: number;
  heightRows: number;
  gridX: number;
  gridY: number;
  configJson: WidgetConfig;
}

export const PRODUCTS: Record<string, number> = {
  "Fiber Internet 300 Mbps": 49.99,
  "5G Unlimited Mobile Plan": 39.99,
  "Fiber Internet 1 Gbps": 89.99,
  "Business Internet 500 Mbps": 129.99,
  "VoIP Corporate Package": 79.99,
};

export const STATUS_OPTIONS: OrderStatus[] = [
  "Pending",
  "In progress",
  "Completed",
];

export const COLUMN_OPTIONS = [
  { label: "Customer ID", value: "customer_id" },
  { label: "Customer name", value: "customer_name" },
  { label: "Email id", value: "email" },
  { label: "Address", value: "address" },
  { label: "Order date", value: "order_date" },
  { label: "Product", value: "product" },
  { label: "Created by", value: "created_by" },
  { label: "Status", value: "status" },
  { label: "Total amount", value: "total_amount" },
  { label: "Unit price", value: "unit_price" },
  { label: "Quantity", value: "quantity" },
];

export const METRIC_OPTIONS = [
  { label: "Total orders", value: "total_orders" },
  { label: "Total revenue", value: "total_revenue" },
  { label: "Total customers", value: "total_customers" },
  { label: "Total quantity sold", value: "total_sold_quantity" },
  { label: "Unit price", value: "unit_price" },
  { label: "Quantity", value: "quantity" },
  { label: "Total amount", value: "total_amount" },
];
