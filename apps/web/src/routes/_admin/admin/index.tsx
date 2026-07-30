import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Package, Users, AlertCircle, Loader2 } from "lucide-react";
import { api } from "@/services/api";

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

  const orders = recentOrders?.slice(0, 10);

  const statCards = [
    { label: "Total Revenue", value: `$${(stats?.total_revenue || 0).toLocaleString()}`, icon: DollarSign },
    { label: "Orders", value: String(stats?.total_orders || 0), icon: ShoppingCart },
    { label: "Products", value: String(stats?.total_products || 0), icon: Package },
    { label: "Users", value: String(stats?.total_users || 0), icon: Users },
  ];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 md:mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats && stats.pending_orders > 0 && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <CardTitle className="text-sm font-medium text-orange-600">
              {stats.pending_orders} pending order{stats.pending_orders !== 1 ? "s" : ""} require attention
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders && orders.length > 0 ? (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{order.order_number}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">${order.grand_total.toFixed(2)}</p>
                    <p className={`text-xs ${order.status === "pending" ? "text-orange-600" : order.status === "delivered" ? "text-green-600" : "text-muted-foreground"}`}>
                      {order.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No orders yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
