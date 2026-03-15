import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/orders", async (req: Request, res: Response) => {
    const dateRange = (req.query.date_range as string) ?? "alltime";
    const orders = await storage.getOrders(dateRange);
    res.json(orders);
  });

  app.post("/api/orders", async (req: Request, res: Response) => {
    const data = req.body;
    const order = await storage.createOrder(data);
    res.status(201).json(order);
  });

  app.put("/api/orders/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const order = await storage.updateOrder(id, req.body);
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    res.json(order);
  });

  app.delete("/api/orders/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteOrder(id);
    if (!deleted) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    res.json({ success: true });
  });

  app.get("/api/widgets", async (_req: Request, res: Response) => {
    const widgets = await storage.getWidgets();
    res.json(widgets);
  });

  app.post("/api/widgets", async (req: Request, res: Response) => {
    const widget = await storage.createWidget(req.body);
    res.status(201).json(widget);
  });

  app.put("/api/widgets/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const widget = await storage.updateWidget(id, req.body);
    if (!widget) {
      res.status(404).json({ message: "Widget not found" });
      return;
    }
    res.json(widget);
  });

  app.delete("/api/widgets/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteWidget(id);
    if (!deleted) {
      res.status(404).json({ message: "Widget not found" });
      return;
    }
    res.json({ success: true });
  });

  app.get("/api/analytics/kpi", async (req: Request, res: Response) => {
    const metric = (req.query.metric as string) ?? "total_orders";
    const aggregation = (req.query.aggregation as string) ?? "count";
    const dateRange = (req.query.date_range as string) ?? "alltime";
    const result = await storage.getAnalyticsKpi(metric, aggregation, dateRange);
    res.json(result);
  });

  app.get("/api/analytics/chart", async (req: Request, res: Response) => {
    const type = (req.query.type as string) ?? "pie";
    const field = (req.query.field as string) ?? "status";
    const dateRange = (req.query.date_range as string) ?? "alltime";
    const result = await storage.getAnalyticsChart(type, field, dateRange);
    res.json(result);
  });

  app.get("/api/analytics/table", async (req: Request, res: Response) => {
    const columnsParam = (req.query.columns as string) ?? "order_id,product,quantity,total_amount";
    const columns = columnsParam.split(",");
    const sort = (req.query.sort as string) ?? "asc";
    const page = parseInt((req.query.page as string) ?? "1");
    const limit = parseInt((req.query.limit as string) ?? "5");
    const filterAttr = req.query.filter_attr as string | undefined;
    const filterOp = req.query.filter_op as string | undefined;
    const filterVal = req.query.filter_val as string | undefined;
    const result = await storage.getAnalyticsTable(columns, sort, page, limit, filterAttr, filterOp, filterVal);
    res.json(result);
  });

  return httpServer;
}
