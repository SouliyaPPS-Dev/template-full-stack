import { g as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "./_libs/react+tanstack__react-query.mjs";
import { s as ShoppingCart } from "./_libs/lucide-react.mjs";
import { n as CardContent, t as Card } from "./_ssr/card-D3rxkkzC.mjs";
import { t as Button } from "./_ssr/button-B-LtGUZY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_user.cart-CJrzv0mU.js
var import_jsx_runtime = require_jsx_runtime();
function CartPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		className: "text-2xl md:text-3xl font-bold tracking-tight mb-6 md:mb-8",
		children: "Shopping Cart"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "flex flex-col items-center justify-center py-12 md:py-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "h-12 w-12 md:h-16 md:w-16 text-muted-foreground mb-4" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground text-base md:text-lg mb-4",
				children: "Your cart is empty"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/products",
					children: "Continue Shopping"
				})
			})
		]
	}) })] });
}
//#endregion
export { CartPage as component };
