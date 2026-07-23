import { n as getApiBase } from "./_ssr/api-RoDK1aga.mjs";
import { m as createFileRoute, p as lazyRouteComponent } from "./_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_user.index-BXti30_E.js
var $$splitComponentImporter = () => import("./_user.index-D-M85dxz.mjs");
async function loader() {
	const base = getApiBase();
	const [categories, settings] = await Promise.all([fetch(`${base}/categories`).then((r) => r.json()), fetch(`${base}/settings`).then((r) => r.json())]);
	return {
		categories,
		settings
	};
}
var Route = createFileRoute("/_user/")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	loader
});
//#endregion
export { Route as t };
