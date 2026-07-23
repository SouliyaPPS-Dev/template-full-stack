import { a as require_jsx_runtime } from "./_libs/react+tanstack__react-query.mjs";
import { l as Settings } from "./_libs/lucide-react.mjs";
import { n as CardContent, t as Card } from "./_ssr/card-D3rxkkzC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_admin.admin.settings-Daog7Km2.js
var import_jsx_runtime = require_jsx_runtime();
function AdminSettings() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
		className: "text-2xl md:text-3xl font-bold tracking-tight mb-4 md:mb-6",
		children: "Settings"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "flex flex-col items-center justify-center py-16",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-12 w-12 text-muted-foreground mb-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted-foreground",
			children: "Settings page coming soon."
		})]
	}) })] });
}
//#endregion
export { AdminSettings as component };
