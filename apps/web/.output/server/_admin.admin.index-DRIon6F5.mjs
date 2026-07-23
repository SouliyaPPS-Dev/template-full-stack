import { a as require_jsx_runtime } from "./_libs/react+tanstack__react-query.mjs";
import { f as Package, n as Users, s as ShoppingCart, v as DollarSign, y as CircleAlert } from "./_libs/lucide-react.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./_ssr/card-D3rxkkzC.mjs";
import { t as Route } from "./_admin.admin.index-DYxolt3T.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_admin.admin.index-DRIon6F5.js
var import_jsx_runtime = require_jsx_runtime();
function AdminDashboard() {
	const { stats, orders } = Route.useLoaderData();
	const statCards = [
		{
			label: "Total Revenue",
			value: `$${(stats?.total_revenue || 0).toLocaleString()}`,
			icon: DollarSign
		},
		{
			label: "Orders",
			value: String(stats?.total_orders || 0),
			icon: ShoppingCart
		},
		{
			label: "Products",
			value: String(stats?.total_products || 0),
			icon: Package
		},
		{
			label: "Users",
			value: String(stats?.total_users || 0),
			icon: Users
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl md:text-3xl font-bold tracking-tight mb-4 md:mb-6",
			children: "Dashboard"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8",
			children: statCards.map((stat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "flex flex-row items-center justify-between pb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-xs md:text-sm font-medium text-muted-foreground",
					children: stat.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(stat.icon, { className: "h-4 w-4 text-muted-foreground" })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xl md:text-2xl font-bold",
				children: stat.value
			}) })] }, stat.label))
		}),
		stats && stats.pending_orders > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "mb-6 border-orange-200 bg-orange-50",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "flex flex-row items-center gap-2 pb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4 text-orange-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "text-sm font-medium text-orange-600",
					children: [
						stats.pending_orders,
						" pending order",
						stats.pending_orders !== 1 ? "s" : "",
						" require attention"
					]
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Recent Orders" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: orders && orders.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3",
			children: orders.slice(0, 10).map((order) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between border-b pb-3 last:border-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium text-sm",
					children: order.order_number
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: new Date(order.created_at).toLocaleDateString()
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-right",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-medium text-sm",
						children: ["$", order.grand_total.toFixed(2)]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `text-xs ${order.status === "pending" ? "text-orange-600" : order.status === "delivered" ? "text-green-600" : "text-muted-foreground"}`,
						children: order.status
					})]
				})]
			}, order.id))
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted-foreground text-center py-4",
			children: "No orders yet."
		}) })] })
	] });
}
//#endregion
export { AdminDashboard as component };
