import { n as getApiBase } from "./_ssr/api-RoDK1aga.mjs";
import { m as createFileRoute, p as lazyRouteComponent } from "./_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_user.profile-CCUrQy4Y.js
var $$splitComponentImporter = () => import("./_user.profile-BC-5DzmQ.mjs");
async function loader() {
	try {
		const base = getApiBase();
		const res = await fetch(`${base}/auth/me`);
		if (!res.ok) return { user: null };
		return { user: await res.json() };
	} catch {
		return { user: null };
	}
}
var Route = createFileRoute("/_user/profile")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	loader
});
//#endregion
export { Route as t };
