import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";
import Tasks from "@/pages/tasks";
import Attendance from "@/pages/attendance";
import Invoices from "@/pages/invoices";
import Templates from "@/pages/templates";
import Leave from "@/pages/leave";
import DataEntry from "@/pages/data-entry";
import ConsortiumSetup from "@/pages/consortium-setup";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Layout from "@/components/layout/layout";
import { queryClient } from "./lib/queryClient";

function Router() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) return <div>Loading...</div>;

  const handleLoginSuccess = (backendUser: any, token: string) => {
    const normalizedUser = {
      id: backendUser.id,
      firstName: backendUser.first_name,
      lastName: backendUser.last_name,
      staffId: backendUser.staff_id,
      email: backendUser.email,
      role: backendUser.role,
      department: backendUser.department,
      position: backendUser.position,
      phoneNumber: backendUser.phone_number,
      isActive: backendUser.is_active,
      createdAt: backendUser.created_at,
      updatedAt: backendUser.updated_at,
    };
    login(normalizedUser, token); // <-- pass token
    setLocation("/");
  };

  if (!isAuthenticated) return <Login onLoginSuccess={handleLoginSuccess} />;

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/projects" component={Projects} />
        <Route path="/tasks" component={Tasks} />
        <Route path="/attendance" component={Attendance} />
        <Route path="/invoices" component={Invoices} />
        <Route path="/templates" component={Templates} />
        <Route path="/leave" component={Leave} />
        <Route path="/data-entry" component={DataEntry} />
        <Route path="/consortium-setup" component={ConsortiumSetup} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
