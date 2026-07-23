import { n as getApiBase } from "./_ssr/api-RoDK1aga.mjs";
import { m as createFileRoute, p as lazyRouteComponent } from "./_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_admin.admin.orders-DIo6gw0x.js
var $$splitComponentImporter = () => import("./_admin.admin.orders-CavibOJD.mjs");
async function loader() {
	try {
		const base = getApiBase();
		const res = await fetch(`${base}/orders`);
		if (!res.ok) return { orders: [] };
		return { orders: await res.json() };
	} catch {
		return { orders: [] };
	}
}
var Route = createFileRoute("/_admin/admin/orders")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	loader
});
//#endregion
export { Route as t };
