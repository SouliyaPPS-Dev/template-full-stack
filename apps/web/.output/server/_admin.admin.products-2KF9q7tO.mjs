import { n as getApiBase } from "./_ssr/api-RoDK1aga.mjs";
import { m as createFileRoute, p as lazyRouteComponent } from "./_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_admin.admin.products-2KF9q7tO.js
var $$splitComponentImporter = () => import("./_admin.admin.products-CisLjBH3.mjs");
async function loader() {
	try {
		const base = getApiBase();
		const res = await fetch(`${base}/products`);
		if (!res.ok) return { products: [] };
		return { products: await res.json() };
	} catch {
		return { products: [] };
	}
}
var Route = createFileRoute("/_admin/admin/products")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	loader
});
//#endregion
export { Route as t };
