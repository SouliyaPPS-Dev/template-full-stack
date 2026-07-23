import { t as api } from "./_ssr/api-RoDK1aga.mjs";
import { a as require_jsx_runtime, n as useQuery } from "./_libs/react+tanstack__react-query.mjs";
import { n as CardContent, t as Card } from "./_ssr/card-D3rxkkzC.mjs";
import { t as Route } from "./_admin.admin.orders-DIo6gw0x.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_admin.admin.orders-CavibOJD.js
var import_jsx_runtime = require_jsx_runtime();
function statusColor(status) {
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
function paymentColor(status) {
	switch (status) {
		case "paid": return "bg-green-100 text-green-700";
		case "unpaid": return "bg-yellow-100 text-yellow-700";
		case "refunded": return "bg-blue-100 text-blue-700";
		default: return "bg-gray-100 text-gray-700";
	}
}
function AdminOrders() {
	const { orders: serverOrders } = Route.useLoaderData();
	const { data: clientOrders, isLoading } = useQuery({
		queryKey: ["admin-orders"],
		queryFn: () => api("/orders")
	});
	const orders = clientOrders || serverOrders;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between mb-4 md:mb-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl md:text-3xl font-bold tracking-tight",
			children: "Orders"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "text-xs md:text-sm text-muted-foreground",
			children: [orders?.length ?? 0, " total"]
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
		className: "p-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b bg-muted/50",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-left p-3 font-medium",
							children: "Order #"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-left p-3 font-medium hidden sm:table-cell",
							children: "Date"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-right p-3 font-medium",
							children: "Total"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-center p-3 font-medium",
							children: "Status"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-center p-3 font-medium hidden sm:table-cell",
							children: "Payment"
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					colSpan: 5,
					className: "p-8 text-center text-muted-foreground",
					children: "Loading..."
				}) }) : orders && orders.length > 0 ? orders.map((order) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b last:border-0 hover:bg-muted/30",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-3 font-medium",
							children: order.order_number
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-3 text-muted-foreground hidden sm:table-cell",
							children: new Date(order.created_at).toLocaleDateString()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "p-3 text-right font-medium",
							children: ["$", order.grand_total.toFixed(2)]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-3 text-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColor(order.status)}`,
								children: order.status
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-3 text-center hidden sm:table-cell",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `inline-flex px-2 py-1 rounded-full text-xs font-medium ${paymentColor(order.payment_status)}`,
								children: order.payment_status
							})
						})
					]
				}, order.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					colSpan: 5,
					className: "p-8 text-center text-muted-foreground",
					children: "No orders yet."
				}) }) })]
			})
		})
	}) })] });
}
//#endregion
export { AdminOrders as component };
