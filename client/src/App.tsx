import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "react-hot-toast";
import NotFound from "@/pages/not-found";
import OrdersPage from "@/pages/OrdersPage";
import ConfigureDashboard from "@/pages/ConfigureDashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/orders" />} />
      <Route path="/orders" component={OrdersPage} />
      <Route path="/dashboard/configure" component={ConfigureDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#10B981",
              color: "#fff",
              borderRadius: "8px",
              padding: "12px 20px",
              fontSize: "14px",
            },
            duration: 3000,
          }}
        />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
