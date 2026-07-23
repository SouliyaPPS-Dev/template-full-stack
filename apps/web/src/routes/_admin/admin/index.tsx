import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Package, Users, AlertCircle } from "lucide-react";
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

async function loader() {
  try {
    const [stats, orders] = await Promise.all([
      api<DashboardStats>("/dashboard/stats", undefined, "admin"),
      api<Order[]>("/orders", undefined, "admin"),
    ]);
    return { stats, orders };
  } catch {
    return { stats: null as DashboardStats | null, orders: [] as Order[] };
  }
}

export const Route = createFileRoute("/_admin/admin/")({
  component: AdminDashboard,
  loader,
});

function AdminDashboard() {
  const { stats, orders } = Route.useLoaderData();

  const statCards = [
    { label: "Total Revenue", value: `$${(stats?.total_revenue || 0).toLocaleString()}`, icon: DollarSign },
    { label: "Orders", value: String(stats?.total_orders || 0), icon: ShoppingCart },
    { label: "Products", value: String(stats?.total_products || 0), icon: Package },
    { label: "Users", value: String(stats?.total_users || 0), icon: Users },
  ];

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
              {orders.slice(0, 10).map((order) => (
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
