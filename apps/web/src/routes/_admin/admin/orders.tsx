import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { api, getApiBase } from "@/services/api";

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  grand_total: number;
  created_at: string;
}

function statusColor(status: string) {
  switch (status) {
    case "pending": return "bg-yellow-100 text-yellow-700";
    case "confirmed": return "bg-blue-100 text-blue-700";
    case "processing": return "bg-indigo-100 text-indigo-700";
    case "shipped": return "bg-purple-100 text-purple-700";
    case "delivered": return "bg-green-100 text-green-700";
    case "cancelled": return "bg-red-100 text-red-700";
    default: return "bg-gray-100 text-gray-700";
  }
}

function paymentColor(status: string) {
  switch (status) {
    case "paid": return "bg-green-100 text-green-700";
    case "unpaid": return "bg-yellow-100 text-yellow-700";
    case "refunded": return "bg-blue-100 text-blue-700";
    default: return "bg-gray-100 text-gray-700";
  }
}

async function loader() {
  try {
    const base = getApiBase();
    const res = await fetch(`${base}/orders`);
    if (!res.ok) return { orders: [] as Order[] };
    const orders = await res.json();
    return { orders };
  } catch {
    return { orders: [] as Order[] };
  }
}

export const Route = createFileRoute("/_admin/admin/orders")({
  component: AdminOrders,
  loader,
});

function AdminOrders() {
  const { orders: serverOrders } = Route.useLoaderData();
  const { data: clientOrders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => api<Order[]>("/orders"),
  });

  const orders: Order[] = clientOrders || serverOrders;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Orders</h1>
        <span className="text-xs md:text-sm text-muted-foreground">{orders?.length ?? 0} total</span>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Order #</th>
                  <th className="text-left p-3 font-medium hidden sm:table-cell">Date</th>
                  <th className="text-right p-3 font-medium">Total</th>
                  <th className="text-center p-3 font-medium">Status</th>
                  <th className="text-center p-3 font-medium hidden sm:table-cell">Payment</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">Loading...</td>
                  </tr>
                ) : orders && orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-3 font-medium">{order.order_number}</td>
                      <td className="p-3 text-muted-foreground hidden sm:table-cell">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="p-3 text-right font-medium">${order.grand_total.toFixed(2)}</td>
                      <td className="p-3 text-center">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3 text-center hidden sm:table-cell">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${paymentColor(order.payment_status)}`}>
                          {order.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">No orders yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
