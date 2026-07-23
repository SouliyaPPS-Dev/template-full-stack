import { t as api } from "./_ssr/api-RoDK1aga.mjs";
import { m as createFileRoute, p as lazyRouteComponent } from "./_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_admin.admin.index-DYxolt3T.js
var $$splitComponentImporter = () => import("./_admin.admin.index-DRIon6F5.mjs");
async function loader() {
	try {
		const [stats, orders] = await Promise.all([api("/dashboard/stats"), api("/orders")]);
		return {
			stats,
			orders
		};
	} catch {
		return {
			stats: null,
			orders: []
		};
	}
}
var Route = createFileRoute("/_admin/admin/")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	loader
});
//#endregion
export { Route as t };
