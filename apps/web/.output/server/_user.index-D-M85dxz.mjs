import { a as isAuthenticated } from "./_ssr/api-RoDK1aga.mjs";
import { g as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "./_libs/react+tanstack__react-query.mjs";
import { a as Tag, o as Store, r as User, s as ShoppingCart, x as ArrowRight } from "./_libs/lucide-react.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./_ssr/card-D3rxkkzC.mjs";
import { t as Button } from "./_ssr/button-B-LtGUZY.mjs";
import { t as Route } from "./_user.index-BXti30_E.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_user.index-D-M85dxz.js
var import_jsx_runtime = require_jsx_runtime();
function HomePage() {
	const { categories, settings } = Route.useLoaderData();
	const storeName = settings?.find((s) => s.key === "store_name")?.value || "MyStore";
	const loggedIn = isAuthenticated();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-12 md:gap-16 py-4 md:py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "text-center max-w-3xl mx-auto",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 md:mb-4",
						children: ["Welcome to ", storeName]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-base sm:text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 px-2",
						children: "Full-stack e-commerce platform built with React, Go API, and PostgreSQL."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col sm:flex-row gap-3 justify-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "lg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/products",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, { className: "mr-2 h-5 w-5" }), "Browse Products"]
							})
						}), loggedIn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							size: "lg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/profile",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "mr-2 h-5 w-5" }), "My Profile"]
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							size: "lg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/login",
								children: "Sign In"
							})
						})]
					})
				]
			}),
			categories && categories.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between mb-4 md:mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl md:text-2xl font-bold",
					children: "Categories"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "ghost",
					size: "sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/products",
						children: ["View all ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-1 h-4 w-4" })]
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4",
				children: categories.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "hover:shadow-md transition-shadow cursor-pointer",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
						className: "items-center text-center py-4 md:py-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "h-6 w-6 md:h-8 md:w-8 mb-2 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-xs md:text-sm",
							children: cat.name
						})]
					})
				}, cat.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, { className: "h-7 w-7 md:h-8 md:w-8 mb-2 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-sm",
						children: "Wide Selection"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Browse through our curated collection of products across multiple categories."
					}) })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "h-7 w-7 md:h-8 md:w-8 mb-2 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-sm",
						children: "Easy Shopping"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Add items to your cart, review your order, and checkout in seconds."
					}) })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "sm:col-span-2 md:col-span-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "h-7 w-7 md:h-8 md:w-8 mb-2 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-sm",
							children: "Best Prices"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Competitive pricing with regular promotions and discounts."
						}) })]
					})
				]
			}) })
		]
	});
}
//#endregion
export { HomePage as component };
