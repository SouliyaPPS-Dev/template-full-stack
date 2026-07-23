import { n as getApiBase } from "./_ssr/api-RoDK1aga.mjs";
import { m as createFileRoute, p as lazyRouteComponent } from "./_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_user.products-CW8U_4ZP.js
var $$splitComponentImporter = () => import("./_user.products-BzaQGheI.mjs");
async function loader() {
	const base = getApiBase();
	return { products: await fetch(`${base}/products`).then((r) => r.json()) };
}
var Route = createFileRoute("/_user/products")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	loader
});
//#endregion
export { Route as t };
