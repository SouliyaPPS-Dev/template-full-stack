import { createFileRoute, redirect, Outlet, useLocation } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin-layout";
import { adminIsAuthenticated, getUser } from "@/services/api";
import { useAuthMonitor } from "@/hooks/use-auth-monitor";

function isClient(): boolean {
  return typeof window !== "undefined";
}

function AdminShell() {
  const location = useLocation();
  useAuthMonitor("/admin/login");

  if (location.pathname === "/admin/login") {
    return <Outlet />;
  }
  return <AdminLayout />;
}

export const Route = createFileRoute("/_admin")({
  beforeLoad: ({ location }) => {
    if (!isClient()) return;
    if (location.pathname === "/admin/login") return;

    if (!adminIsAuthenticated()) {
      throw redirect({ to: "/admin/login" });
    }

    const user = getUser("admin");
    if (user && user.role !== "admin" && user.role !== "superadmin" && user.role !== "staff") {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: AdminShell,
});
