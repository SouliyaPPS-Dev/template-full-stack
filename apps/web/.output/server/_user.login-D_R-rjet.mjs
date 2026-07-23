import { m as createFileRoute, p as lazyRouteComponent } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as stringType, t as objectType } from "./_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_user.login-D_R-rjet.js
var $$splitComponentImporter = () => import("./_user.login-C1l1siDQ.mjs");
var loginSearchSchema = objectType({ signup: stringType().optional() });
var Route = createFileRoute("/_user/login")({
	validateSearch: (search) => loginSearchSchema.parse(search),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
