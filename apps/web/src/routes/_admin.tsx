import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin-layout";
import { getMe, setUser } from "@/services/api";
import { Loader2 } from "lucide-react";

function isClient(): boolean {
  return typeof window !== "undefined";
}

function AdminShell() {
  const location = useLocation();

  if (location.pathname === "/admin/login") {
    return <Outlet />;
  }

  return <AdminAuthGate />;
}

function AdminAuthGate() {
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["admin-auth"],
    queryFn: async () => {
      const u = await getMe("admin");
      if (!u || (u.role !== "admin" && u.role !== "superadmin" && u.role !== "staff")) {
        throw new Error("not admin");
      }
      setUser(u, "admin");
      return u;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (isError) {
      window.location.href = "/admin/login";
    }
  }, [isError]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !user) {
    return null;
  }

  return <AdminLayout />;
}

export const Route = createFileRoute("/_admin")({
  beforeLoad: () => {
    if (!isClient()) return;
  },
  component: AdminShell,
});
