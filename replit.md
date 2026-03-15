# Customer Orders Dashboard

A full-stack web application for managing customer orders and visualizing analytics via a configurable dashboard.

## Architecture

- **Backend**: Node.js + Express (TypeScript)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Storage**: In-memory (MemStorage) with seeded sample data
- **Charts**: Recharts
- **Drag & Drop**: @dnd-kit/core
- **Toast Notifications**: react-hot-toast
- **Routing**: Wouter

## Pages

### `/orders` — Customer Orders
- **Table tab**: Full CRUD for orders with search, create/edit/delete modals
- **Dashboard tab**: Configurable widget grid showing live analytics

### `/dashboard/configure` — Configure Dashboard
- Drag-and-drop widget builder with a left-side Widget Library panel
- Supports KPI, Table, Bar/Line/Area/Pie/Scatter chart widgets
- Per-widget configuration panel (right panel) with data + styling settings
- Save persists widget config; Cancel with unsaved changes prompts guard modal

## Data Model

- **customers**: id, customerId (CUST-XXXX), name, email, phone, address fields
- **orders**: id, orderId (ORD-XXXX), FK to customer, product, price, quantity, status, createdBy
- **widgets**: id, widgetId, type, title, size, position, configJson

## API Endpoints

- `GET/POST /api/orders` — list/create orders
- `PUT/DELETE /api/orders/:id` — update/delete orders
- `GET/POST /api/widgets` — list/create widgets
- `PUT/DELETE /api/widgets/:id` — update/delete widgets
- `GET /api/analytics/kpi` — KPI values
- `GET /api/analytics/chart` — chart data (pie, bar, line, area, scatter)
- `GET /api/analytics/table` — paginated/filtered table data

## Design Tokens

- Primary: #10B981 (teal-green), Hover: #059669
- Danger: #EF4444
- Background: #F9FAFB, Card: #FFFFFF, Border: #E5E7EB
- Font: Inter

## Key Files

- `shared/schema.ts` — TypeScript types for all models
- `server/storage.ts` — In-memory storage with seed data + analytics
- `server/routes.ts` — All API routes
- `client/src/App.tsx` — Route configuration
- `client/src/pages/OrdersPage.tsx` — Orders table + dashboard
- `client/src/pages/ConfigureDashboard.tsx` — Dashboard builder
- `client/src/components/orders/` — Order modals
- `client/src/components/dashboard/` — Widget library + config panel
- `client/src/components/widgets/` — Individual widget renderers
