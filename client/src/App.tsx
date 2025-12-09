import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import { DashboardLayout } from "@/pages/dashboard/layout";
import DashboardHome from "@/pages/dashboard/index";
import DashboardRoutes from "@/pages/dashboard/routes";
import DashboardUnits from "@/pages/dashboard/units";
import DashboardUsers from "@/pages/dashboard/users";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard">
        <DashboardLayout>
          <DashboardHome />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/routes">
        <DashboardLayout>
          <DashboardRoutes />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/units">
        <DashboardLayout>
          <DashboardUnits />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/users">
        <DashboardLayout>
          <DashboardUsers />
        </DashboardLayout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
