import { a as require_jsx_runtime } from "./_libs/react+tanstack__react-query.mjs";
import { s as ShoppingCart } from "./_libs/lucide-react.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardFooter, t as Card } from "./_ssr/card-D3rxkkzC.mjs";
import { t as Button } from "./_ssr/button-B-LtGUZY.mjs";
import { t as Route } from "./_user.products-CW8U_4ZP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_user.products-BzaQGheI.js
var import_jsx_runtime = require_jsx_runtime();
function ProductsPage() {
	const { products } = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between mb-6 md:mb-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-2xl md:text-3xl font-bold tracking-tight",
			children: "Products"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "text-xs md:text-sm text-muted-foreground",
			children: [products?.length ?? 0, " items"]
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6",
		children: products?.map((product) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "overflow-hidden hover:shadow-md transition-shadow",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "aspect-square bg-muted flex items-center justify-center",
					children: product.images?.[0] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: product.images[0],
						alt: product.name,
						className: "w-full h-full object-cover"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center gap-2 text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "h-10 w-10 md:h-12 md:w-12" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs",
							children: "No image"
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "pb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "line-clamp-1 text-sm md:text-base",
						children: product.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: ["SKU: ", product.sku]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "pb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xl md:text-2xl font-bold",
						children: ["$", product.selling_price.toFixed(2)]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground mt-1",
						children: product.stock > 0 ? `${product.stock} in stock` : "Out of stock"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "w-full",
					size: "sm",
					disabled: product.stock === 0,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "mr-2 h-4 w-4" }), "Add to Cart"]
				}) })
			]
		}, product.id))
	})] });
}
//#endregion
export { ProductsPage as component };
