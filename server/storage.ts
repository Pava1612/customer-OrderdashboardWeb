import {
  type Order,
  type Customer,
  type Widget,
  type InsertOrder,
  type InsertWidget,
  type OrderStatus,
} from "@shared/schema";

export interface IStorage {
  getOrders(dateRange?: string): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(data: InsertOrder): Promise<Order>;
  updateOrder(id: number, data: Partial<InsertOrder>): Promise<Order | undefined>;
  deleteOrder(id: number): Promise<boolean>;

  getWidgets(): Promise<Widget[]>;
  getWidget(id: number): Promise<Widget | undefined>;
  createWidget(data: InsertWidget): Promise<Widget>;
  updateWidget(id: number, data: Partial<InsertWidget & { gridX: number; gridY: number }>): Promise<Widget | undefined>;
  deleteWidget(id: number): Promise<boolean>;

  getAnalyticsKpi(metric: string, aggregation: string, dateRange: string): Promise<{ value: number }>;
  getAnalyticsChart(type: string, field: string, dateRange: string): Promise<Array<{ label: string; value: number; color: string }>>;
  getAnalyticsTable(columns: string[], sort: string, page: number, limit: number, filterAttr?: string, filterOp?: string, filterVal?: string): Promise<{ rows: Record<string, unknown>[]; total: number }>;
}

const CHART_COLORS = [
  "#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6",
  "#EC4899", "#14B8A6", "#F97316", "#6366F1", "#84CC16",
];

function filterByDateRange(dateStr: string, dateRange: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  switch (dateRange) {
    case "today": {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return date >= start;
    }
    case "last7": {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      return date >= start;
    }
    case "last30": {
      const start = new Date(now);
      start.setDate(start.getDate() - 30);
      return date >= start;
    }
    case "last90": {
      const start = new Date(now);
      start.setDate(start.getDate() - 90);
      return date >= start;
    }
    default:
      return true;
  }
}

export class MemStorage implements IStorage {
  private customers: Map<number, Customer> = new Map();
  private orders: Map<number, Order> = new Map();
  private widgets: Map<number, Widget> = new Map();
  private orderCounter = 1;
  private customerCounter = 1;
  private widgetCounter = 1;

  constructor() {
    this.seed();
  }

  private seed() {
    const seedData = [
      {
        firstName: "Alice", lastName: "Johnson", email: "alice@example.com",
        phone: "+1-555-0101", street: "123 Main St", city: "New York",
        state: "NY", postalCode: "10001", country: "USA",
        product: "Fiber Internet 1 Gbps", unitPrice: 89.99, quantity: 1,
        status: "Completed" as OrderStatus, createdBy: "Admin",
      },
      {
        firstName: "Bob", lastName: "Smith", email: "bob@example.com",
        phone: "+1-555-0102", street: "456 Oak Ave", city: "Los Angeles",
        state: "CA", postalCode: "90001", country: "USA",
        product: "5G Unlimited Mobile Plan", unitPrice: 39.99, quantity: 2,
        status: "In progress" as OrderStatus, createdBy: "Admin",
      },
      {
        firstName: "Carol", lastName: "Williams", email: "carol@example.com",
        phone: "+1-555-0103", street: "789 Pine Rd", city: "Chicago",
        state: "IL", postalCode: "60601", country: "USA",
        product: "Business Internet 500 Mbps", unitPrice: 129.99, quantity: 1,
        status: "Pending" as OrderStatus, createdBy: "Sales",
      },
      {
        firstName: "David", lastName: "Brown", email: "david@example.com",
        phone: "+1-555-0104", street: "321 Elm St", city: "Houston",
        state: "TX", postalCode: "77001", country: "USA",
        product: "VoIP Corporate Package", unitPrice: 79.99, quantity: 3,
        status: "Completed" as OrderStatus, createdBy: "Sales",
      },
      {
        firstName: "Eva", lastName: "Davis", email: "eva@example.com",
        phone: "+1-555-0105", street: "654 Maple Dr", city: "Phoenix",
        state: "AZ", postalCode: "85001", country: "USA",
        product: "Fiber Internet 300 Mbps", unitPrice: 49.99, quantity: 2,
        status: "Pending" as OrderStatus, createdBy: "Admin",
      },
    ];

    const pastDates = [
      "2025-12-01T10:00:00Z",
      "2025-12-15T14:30:00Z",
      "2026-01-10T09:00:00Z",
      "2026-02-20T11:00:00Z",
      "2026-03-05T15:00:00Z",
    ];

    seedData.forEach((d, i) => {
      const custId = this.customerCounter++;
      const customer: Customer = {
        id: custId,
        customerId: `CUST-${String(custId).padStart(4, "0")}`,
        firstName: d.firstName,
        lastName: d.lastName,
        email: d.email,
        phone: d.phone,
        street: d.street,
        city: d.city,
        state: d.state,
        postalCode: d.postalCode,
        country: d.country,
        createdAt: pastDates[i],
      };
      this.customers.set(custId, customer);

      const ordId = this.orderCounter++;
      const total = Math.round(d.unitPrice * d.quantity * 100) / 100;
      const order: Order = {
        id: ordId,
        orderId: `ORD-${String(ordId).padStart(4, "0")}`,
        customerId: custId,
        product: d.product,
        unitPrice: d.unitPrice,
        quantity: d.quantity,
        totalAmount: total,
        status: d.status,
        createdBy: d.createdBy,
        orderDate: pastDates[i],
        customer,
      };
      this.orders.set(ordId, order);
    });
  }

  async getOrders(dateRange?: string): Promise<Order[]> {
    let orders = Array.from(this.orders.values());
    if (dateRange && dateRange !== "alltime") {
      orders = orders.filter((o) => filterByDateRange(o.orderDate, dateRange));
    }
    return orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(data: InsertOrder): Promise<Order> {
    const custId = this.customerCounter++;
    const customer: Customer = {
      id: custId,
      customerId: `CUST-${String(custId).padStart(4, "0")}`,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      street: data.street,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      country: data.country,
      createdAt: new Date().toISOString(),
    };
    this.customers.set(custId, customer);

    const ordId = this.orderCounter++;
    const order: Order = {
      id: ordId,
      orderId: `ORD-${String(ordId).padStart(4, "0")}`,
      customerId: custId,
      product: data.product,
      unitPrice: data.unitPrice,
      quantity: data.quantity,
      totalAmount: data.totalAmount,
      status: data.status,
      createdBy: data.createdBy,
      orderDate: new Date().toISOString(),
      customer,
    };
    this.orders.set(ordId, order);
    return order;
  }

  async updateOrder(id: number, data: Partial<InsertOrder>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    const customer = order.customer;
    if (customer && data.firstName !== undefined) {
      const updatedCustomer: Customer = {
        ...customer,
        firstName: data.firstName ?? customer.firstName,
        lastName: data.lastName ?? customer.lastName,
        email: data.email ?? customer.email,
        phone: data.phone ?? customer.phone,
        street: data.street ?? customer.street,
        city: data.city ?? customer.city,
        state: data.state ?? customer.state,
        postalCode: data.postalCode ?? customer.postalCode,
        country: data.country ?? customer.country,
      };
      this.customers.set(customer.id, updatedCustomer);
      const total = Math.round((data.unitPrice ?? order.unitPrice) * (data.quantity ?? order.quantity) * 100) / 100;
      const updated: Order = {
        ...order,
        product: data.product ?? order.product,
        unitPrice: data.unitPrice ?? order.unitPrice,
        quantity: data.quantity ?? order.quantity,
        totalAmount: total,
        status: data.status ?? order.status,
        createdBy: data.createdBy ?? order.createdBy,
        customer: updatedCustomer,
      };
      this.orders.set(id, updated);
      return updated;
    }
    const total = Math.round((data.unitPrice ?? order.unitPrice) * (data.quantity ?? order.quantity) * 100) / 100;
    const updated: Order = {
      ...order,
      product: data.product ?? order.product,
      unitPrice: data.unitPrice ?? order.unitPrice,
      quantity: data.quantity ?? order.quantity,
      totalAmount: total,
      status: data.status ?? order.status,
      createdBy: data.createdBy ?? order.createdBy,
    };
    this.orders.set(id, updated);
    return updated;
  }

  async deleteOrder(id: number): Promise<boolean> {
    return this.orders.delete(id);
  }

  async getWidgets(): Promise<Widget[]> {
    return Array.from(this.widgets.values());
  }

  async getWidget(id: number): Promise<Widget | undefined> {
    return this.widgets.get(id);
  }

  async createWidget(data: InsertWidget): Promise<Widget> {
    const id = this.widgetCounter++;
    const widget: Widget = {
      id,
      widgetId: `widget-${id}`,
      widgetTitle: data.widgetTitle,
      widgetType: data.widgetType,
      description: data.description ?? "",
      widthCols: data.widthCols,
      heightRows: data.heightRows,
      gridX: data.gridX,
      gridY: data.gridY,
      configJson: data.configJson,
      createdAt: new Date().toISOString(),
    };
    this.widgets.set(id, widget);
    return widget;
  }

  async updateWidget(id: number, data: Partial<InsertWidget & { gridX: number; gridY: number }>): Promise<Widget | undefined> {
    const widget = this.widgets.get(id);
    if (!widget) return undefined;
    const updated: Widget = { ...widget, ...data };
    this.widgets.set(id, updated);
    return updated;
  }

  async deleteWidget(id: number): Promise<boolean> {
    return this.widgets.delete(id);
  }

  async getAnalyticsKpi(metric: string, aggregation: string, dateRange: string): Promise<{ value: number }> {
    const orders = await this.getOrders(dateRange);
    let value = 0;
    switch (metric) {
      case "total_orders":
        value = aggregation === "count" ? orders.length : orders.length;
        break;
      case "total_revenue":
        if (aggregation === "sum") value = orders.reduce((s, o) => s + o.totalAmount, 0);
        else if (aggregation === "average") value = orders.length ? orders.reduce((s, o) => s + o.totalAmount, 0) / orders.length : 0;
        else value = orders.length;
        break;
      case "total_customers":
        value = new Set(orders.map((o) => o.customerId)).size;
        break;
      case "total_sold_quantity":
        if (aggregation === "sum") value = orders.reduce((s, o) => s + o.quantity, 0);
        else if (aggregation === "average") value = orders.length ? orders.reduce((s, o) => s + o.quantity, 0) / orders.length : 0;
        else value = orders.length;
        break;
      case "unit_price":
        if (aggregation === "sum") value = orders.reduce((s, o) => s + o.unitPrice, 0);
        else if (aggregation === "average") value = orders.length ? orders.reduce((s, o) => s + o.unitPrice, 0) / orders.length : 0;
        else value = orders.length;
        break;
      case "quantity":
        if (aggregation === "sum") value = orders.reduce((s, o) => s + o.quantity, 0);
        else if (aggregation === "average") value = orders.length ? orders.reduce((s, o) => s + o.quantity, 0) / orders.length : 0;
        else value = orders.length;
        break;
      case "total_amount":
        if (aggregation === "sum") value = orders.reduce((s, o) => s + o.totalAmount, 0);
        else if (aggregation === "average") value = orders.length ? orders.reduce((s, o) => s + o.totalAmount, 0) / orders.length : 0;
        else value = orders.length;
        break;
      default:
        value = orders.length;
    }
    return { value };
  }

  async getAnalyticsChart(type: string, field: string, dateRange: string): Promise<Array<{ label: string; value: number; color: string }>> {
    const orders = await this.getOrders(dateRange);
    const grouped: Record<string, number> = {};

    orders.forEach((o) => {
      let key = "";
      switch (field) {
        case "status": key = o.status; break;
        case "product": key = o.product; break;
        case "created_by": key = o.createdBy; break;
        case "quantity": key = String(o.quantity); break;
        case "unit_price": key = String(o.unitPrice); break;
        case "total_amount": key = String(Math.round(o.totalAmount)); break;
        default: key = o.status;
      }
      grouped[key] = (grouped[key] || 0) + 1;
    });

    const labels = Object.keys(grouped);
    const total = Object.values(grouped).reduce((s, v) => s + v, 0);

    return labels.map((label, i) => ({
      label,
      value: total > 0 ? Math.round((grouped[label] / total) * 100) : 0,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }

  async getAnalyticsTable(
    columns: string[],
    sort: string,
    page: number,
    limit: number,
    filterAttr?: string,
    filterOp?: string,
    filterVal?: string,
  ): Promise<{ rows: Record<string, unknown>[]; total: number }> {
    let orders = await this.getOrders("alltime");

    if (filterAttr && filterOp && filterVal) {
      orders = orders.filter((o) => {
        let cellVal: string = "";
        switch (filterAttr) {
          case "status": cellVal = o.status; break;
          case "product": cellVal = o.product; break;
          case "quantity": cellVal = String(o.quantity); break;
          default: cellVal = "";
        }
        switch (filterOp) {
          case "eq": return cellVal === filterVal;
          case "neq": return cellVal !== filterVal;
          case "gt": return Number(cellVal) > Number(filterVal);
          case "gte": return Number(cellVal) >= Number(filterVal);
          case "lt": return Number(cellVal) < Number(filterVal);
          case "lte": return Number(cellVal) <= Number(filterVal);
          case "contains": return cellVal.toLowerCase().includes(filterVal.toLowerCase());
          default: return true;
        }
      });
    }

    if (sort === "desc") {
      orders = orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    } else {
      orders = orders.sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime());
    }

    const total = orders.length;
    const paged = orders.slice((page - 1) * limit, page * limit);

    const rows = paged.map((o) => {
      const row: Record<string, unknown> = {};
      columns.forEach((col) => {
        switch (col) {
          case "customer_id": row[col] = o.customer?.customerId ?? ""; break;
          case "customer_name": row[col] = o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : ""; break;
          case "email": row[col] = o.customer?.email ?? ""; break;
          case "address": row[col] = o.customer ? `${o.customer.street}, ${o.customer.city}` : ""; break;
          case "order_date": row[col] = o.orderDate; break;
          case "product": row[col] = o.product; break;
          case "created_by": row[col] = o.createdBy; break;
          case "status": row[col] = o.status; break;
          case "total_amount": row[col] = o.totalAmount; break;
          case "unit_price": row[col] = o.unitPrice; break;
          case "quantity": row[col] = o.quantity; break;
          default: row[col] = "";
        }
      });
      return row;
    });

    return { rows, total };
  }
}

export const storage = new MemStorage();
