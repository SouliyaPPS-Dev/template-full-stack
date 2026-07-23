import { r as __toESM } from "./_runtime.mjs";
import { s as logout } from "./_ssr/api-RoDK1aga.mjs";
import { t as cn } from "./_ssr/utils-C_uf36nf.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as useNavigate, f as Outlet, g as Link, l as useLocation } from "./_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "./_libs/react+tanstack__react-query.mjs";
import { _ as LayoutDashboard, f as Package, h as LogOut, l as Settings, n as Users, o as Store, s as ShoppingCart } from "./_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_admin-BmpCdhAw.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var navItems = [
	{
		label: "Dashboard",
		path: "/admin",
		icon: LayoutDashboard
	},
	{
		label: "Products",
		path: "/admin/products",
		icon: Package
	},
	{
		label: "Orders",
		path: "/admin/orders",
		icon: ShoppingCart
	},
	{
		label: "Customers",
		path: "/admin/customers",
		icon: Users
	},
	{
		label: "Settings",
		path: "/admin/settings",
		icon: Settings
	}
];
function isActive(pathname, path) {
	if (path === "/admin") return pathname === "/admin";
	return pathname.startsWith(path);
}
function AdminLayout() {
	const location = useLocation();
	const navigate = useNavigate();
	function handleLogout() {
		logout();
		navigate({
			to: "/admin/login",
			replace: true
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen bg-muted",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "w-64 bg-primary text-primary-foreground flex-col hidden md:flex",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-4 border-b border-primary-foreground/20",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "flex items-center gap-2 text-xl font-bold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, { className: "h-6 w-6" }), "Admin Panel"]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "flex-1 p-4 space-y-1",
					children: navItems.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: item.path,
						className: cn("flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors", isActive(location.pathname, item.path) ? "bg-primary-foreground/20 text-primary-foreground" : "hover:bg-primary-foreground/10 text-primary-foreground/70 hover:text-primary-foreground"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "h-4 w-4" }), item.label]
					}, item.path))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-4 border-t border-primary-foreground/20",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: handleLogout,
						className: "flex items-center gap-2 text-sm text-primary-foreground/50 hover:text-primary-foreground transition-colors w-full",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4" }), "Logout"]
					})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "flex-1 p-4 md:p-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
		})]
	});
}
function isClient() {
	return typeof window !== "undefined";
}
function getToken() {
	if (!isClient()) return null;
	return localStorage.getItem("token");
}
function isTokenExpired(token) {
	try {
		const payload = JSON.parse(atob(token.split(".")[1]));
		if (!payload.exp) return false;
		return Date.now() >= payload.exp * 1e3;
	} catch {
		return true;
	}
}
function useAuthMonitor(redirectTo = "/admin/login") {
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		if (!isClient()) return;
		function check() {
			const token = getToken();
			if (!token || isTokenExpired(token)) {
				localStorage.removeItem("token");
				localStorage.removeItem("user");
				navigate({
					to: redirectTo,
					replace: true
				});
			}
		}
		check();
		function onStorage(e) {
			if (e.key === "token") check();
		}
		window.addEventListener("storage", onStorage);
		const interval = setInterval(check, 3e4);
		return () => {
			window.removeEventListener("storage", onStorage);
			clearInterval(interval);
		};
	}, [navigate, redirectTo]);
}
function AdminShell() {
	const location = useLocation();
	useAuthMonitor("/admin/login");
	if (location.pathname === "/admin/login") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminLayout, {});
}
//#endregion
export { AdminShell as component };
