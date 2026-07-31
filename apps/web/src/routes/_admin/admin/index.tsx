import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  Wallet,
  ShoppingCart,
  Package,
  Users,
  AlertCircle,
  Loader2,
  ArrowRight,
  TrendingUp,
  Boxes,
  UserRound,
} from "lucide-react";
import { api } from "@/services/api";
import { formatMoney, formatDate } from "@/lib/format";

interface DashboardStats {
  total_products: number;
  total_orders: number;
  total_users: number;
  total_categories: number;
  total_revenue: number;
  pending_orders: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  grand_total: number;
  created_at: string;
}

export const Route = createFileRoute("/_admin/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: stats, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: () => api<DashboardStats>("/dashboard/stats", undefined, "admin"),
    staleTime: 60 * 1000,
  });

  const { data: recentOrders, isError: ordersError } = useQuery({
    queryKey: ["admin-dashboard-orders"],
    queryFn: () => api<Order[]>("/orders", undefined, "admin"),
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (statsError) toast.error("Failed to load dashboard stats");
  }, [statsError]);

  useEffect(() => {
    if (ordersError) toast.error("Failed to load recent orders");
  }, [ordersError]);

  const orders = recentOrders?.slice(0, 8);

  const statCards = [
    {
      label: "Total Revenue",
      value: formatMoney(stats?.total_revenue),
      icon: Wallet,
      tint: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Orders",
      value: String(stats?.total_orders || 0),
      icon: ShoppingCart,
      tint: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Products",
      value: String(stats?.total_products || 0),
      icon: Package,
      tint: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      label: "Users",
      value: String(stats?.total_users || 0),
      icon: Users,
      tint: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    },
  ];

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Store overview and recent activity.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/products">
            <Boxes className="h-4 w-4" />
            Manage products
          </Link>
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="overflow-hidden hover:shadow-card-hover transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs md:text-sm font-medium text-muted-foreground">{stat.label}</p>
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.tint}`}>
                  <stat.icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 font-display text-xl md:text-2xl font-bold tracking-tight truncate">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats && stats.pending_orders > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p className="font-medium">
            {stats.pending_orders} pending order{stats.pending_orders !== 1 ? "s" : ""} require attention
          </p>
          <Button asChild variant="ghost" size="sm" className="ml-auto text-amber-800 hover:text-amber-900 dark:text-amber-400">
            <Link to="/admin/orders">
              Review
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}

      {/* Recent orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base md:text-lg">Recent Orders</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Latest {orders?.length ?? 0} orders</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="group">
            <Link to="/admin/orders">
              View all
              <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          {orders && orders.length > 0 ? (
            <div className="divide-y">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{order.order_number}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-display text-sm font-bold">{formatMoney(order.grand_total)}</span>
                    <Badge variant={statusBadgeVariant(order.status)} className="hidden sm:inline-flex">
                      {order.status}
                    </Badge>
                    <Badge variant={statusBadgeVariant(order.payment_status)}>{order.payment_status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">No orders yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <QuickLink to="/admin/products" icon={Package} label="Products" desc="Manage catalog" />
        <QuickLink to="/admin/users" icon={UserRound} label="Users" desc="Manage accounts" />
        <QuickLink to="/admin/settings" icon={Loader2} label="Settings" desc="Backup & export" />
      </div>
    </div>
  );
}

function QuickLink({
  to,
  icon: Icon,
  label,
  desc,
}: {
  to: string;
  icon: typeof Package;
  label: string;
  desc: string;
}) {
  return (
    <Link to={to} className="group">
      <Card className="hover:shadow-card-hover hover:border-primary/30 transition-all duration-300 group-hover:-translate-y-0.5">
        <CardContent className="flex items-center gap-3 p-4 md:p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold">{label}</p>
            <p className="truncate text-xs text-muted-foreground">{desc}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
