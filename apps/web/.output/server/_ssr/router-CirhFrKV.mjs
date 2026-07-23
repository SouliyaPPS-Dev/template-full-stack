import { r as __toESM } from "../_runtime.mjs";
import { a as isAuthenticated, i as getUser } from "./api-RoDK1aga.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { c as HeadContent, d as createRouter, h as createRootRoute, k as redirect, m as createFileRoute, p as lazyRouteComponent, s as Scripts } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime, r as QueryClientProvider } from "../_libs/react+tanstack__react-query.mjs";
import { t as Route$7 } from "../_admin.admin.index-DYxolt3T.mjs";
import { t as Route$8 } from "../_admin.admin.orders-DIo6gw0x.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as Route$9 } from "../_admin.admin.products-2KF9q7tO.mjs";
import { t as Route$10 } from "../_user.index-BXti30_E.mjs";
import { t as Route$11 } from "../_user.login-D_R-rjet.mjs";
import { t as Route$12 } from "../_user.products-CW8U_4ZP.mjs";
import { t as Route$13 } from "../_user.profile-CCUrQy4Y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-CirhFrKV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Route$6 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1.0, viewport-fit=cover"
			},
			{
				name: "theme-color",
				content: "#171717"
			},
			{
				name: "description",
				content: "MyStore - Full-stack e-commerce platform"
			},
			{
				name: "mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "apple-mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "apple-mobile-web-app-status-bar-style",
				content: "black-translucent"
			},
			{
				name: "apple-mobile-web-app-title",
				content: "MyStore"
			},
			{ title: "MyStore" }
		],
		links: [{
			rel: "icon",
			type: "image/svg+xml",
			href: "/icon.svg"
		}, {
			rel: "apple-touch-icon",
			href: "/icon.svg"
		}]
	}),
	shellComponent: RootDocument
});
function RootDocument({ children }) {
	const [queryClient] = (0, import_react.useState)(() => new QueryClient());
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "min-h-screen bg-background text-foreground antialiased",
			suppressHydrationWarning: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
				client: queryClient,
				children
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})]
		})]
	});
}
var $$splitComponentImporter$5 = () => import("../_admin-BmpCdhAw.mjs");
function isClient() {
	return typeof window !== "undefined";
}
var Route$5 = createFileRoute("/_admin")({
	beforeLoad: ({ location }) => {
		if (!isClient()) return;
		if (location.pathname === "/admin/login") return;
		if (!isAuthenticated()) throw redirect({ to: "/admin/login" });
		const user = getUser();
		if (user && user.role !== "admin" && user.role !== "superadmin" && user.role !== "staff") throw redirect({ to: "/admin/login" });
	},
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("../_user-DUhNTjtU.mjs");
var Route$4 = createFileRoute("/_user")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("../_user.cart-CJrzv0mU.mjs");
var Route$3 = createFileRoute("/_user/cart")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("../_admin.admin.customers-CfXsOJtW.mjs");
var Route$2 = createFileRoute("/_admin/admin/customers")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("../_admin.admin.login-DSakIl_w.mjs");
var Route$1 = createFileRoute("/_admin/admin/login")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("../_admin.admin.settings-Daog7Km2.mjs");
var Route = createFileRoute("/_admin/admin/settings")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var AdminRoute = Route$5.update({
	id: "/_admin",
	getParentRoute: () => Route$6
});
var UserRoute = Route$4.update({
	id: "/_user",
	getParentRoute: () => Route$6
});
var UserIndexRoute = Route$10.update({
	id: "/",
	path: "/",
	getParentRoute: () => UserRoute
});
var UserCartRoute = Route$3.update({
	id: "/cart",
	path: "/cart",
	getParentRoute: () => UserRoute
});
var UserLoginRoute = Route$11.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => UserRoute
});
var UserProductsRoute = Route$12.update({
	id: "/products",
	path: "/products",
	getParentRoute: () => UserRoute
});
var UserProfileRoute = Route$13.update({
	id: "/profile",
	path: "/profile",
	getParentRoute: () => UserRoute
});
var AdminAdminIndexRoute = Route$7.update({
	id: "/admin/",
	path: "/admin/",
	getParentRoute: () => AdminRoute
});
var AdminRouteChildren = {
	AdminAdminCustomersRoute: Route$2.update({
		id: "/admin/customers",
		path: "/admin/customers",
		getParentRoute: () => AdminRoute
	}),
	AdminAdminLoginRoute: Route$1.update({
		id: "/admin/login",
		path: "/admin/login",
		getParentRoute: () => AdminRoute
	}),
	AdminAdminOrdersRoute: Route$8.update({
		id: "/admin/orders",
		path: "/admin/orders",
		getParentRoute: () => AdminRoute
	}),
	AdminAdminProductsRoute: Route$9.update({
		id: "/admin/products",
		path: "/admin/products",
		getParentRoute: () => AdminRoute
	}),
	AdminAdminSettingsRoute: Route.update({
		id: "/admin/settings",
		path: "/admin/settings",
		getParentRoute: () => AdminRoute
	}),
	AdminAdminIndexRoute
};
var AdminRouteWithChildren = AdminRoute._addFileChildren(AdminRouteChildren);
var UserRouteChildren = {
	UserCartRoute,
	UserLoginRoute,
	UserProductsRoute,
	UserProfileRoute,
	UserIndexRoute
};
var rootRouteChildren = {
	AdminRoute: AdminRouteWithChildren,
	UserRoute: UserRoute._addFileChildren(UserRouteChildren)
};
var routeTree = Route$6._addFileChildren(rootRouteChildren)._addFileTypes();
function NotFound() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen flex items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-4xl font-bold mb-2",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "/",
					className: "text-primary underline mt-4 inline-block",
					children: "Go home"
				})
			]
		})
	});
}
function getRouter() {
	return createRouter({
		routeTree,
		defaultPreload: "intent",
		scrollRestoration: true,
		defaultNotFoundComponent: NotFound
	});
}
//#endregion
export { getRouter };
