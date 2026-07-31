import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart } from "lucide-react";
import { api } from "@/services/api";
import { formatMoney, formatDate } from "@/lib/format";

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  grand_total: number;
  created_at: string;
}

export const Route = createFileRoute("/_admin/admin/orders")({
  component: AdminOrders,
});

function AdminOrders() {
  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => api<Order[]>("/orders", undefined, "admin"),
  });

  useEffect(() => {
    if (isError) toast.error("Failed to load orders");
  }, [isError]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track order and payment statuses.
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {orders?.length ?? 0} total
        </span>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order #</th>
                    <th className="text-left p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Date</th>
                    <th className="text-right p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</th>
                    <th className="text-center p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="text-center p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {orders && orders.length > 0 ? (
                    orders.map((order) => (
                      <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-display font-semibold">{order.order_number}</td>
                        <td className="p-3 text-muted-foreground hidden sm:table-cell">{formatDate(order.created_at)}</td>
                        <td className="p-3 text-right font-display font-bold">{formatMoney(order.grand_total)}</td>
                        <td className="p-3 text-center">
                          <Badge variant={statusBadgeVariant(order.status)} className="capitalize">
                            {order.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-center hidden sm:table-cell">
                          <Badge variant={statusBadgeVariant(order.payment_status)} className="capitalize">
                            {order.payment_status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-10 text-center">
                        <ShoppingCart className="mx-auto h-8 w-8 text-muted-foreground/50" />
                        <p className="mt-2 text-sm text-muted-foreground">No orders yet.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
