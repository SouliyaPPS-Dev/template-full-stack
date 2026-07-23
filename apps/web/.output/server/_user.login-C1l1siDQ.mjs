import { r as __toESM } from "./_runtime.mjs";
import { a as isAuthenticated, c as register, o as login, r as getMe, s as logout } from "./_ssr/api-RoDK1aga.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as useNavigate, g as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "./_libs/react+tanstack__react-query.mjs";
import { S as ArrowLeft } from "./_libs/lucide-react.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./_ssr/card-D3rxkkzC.mjs";
import { t as Button } from "./_ssr/button-B-LtGUZY.mjs";
import { n as Label, t as Input } from "./_ssr/label-D4SVKdBz.mjs";
import { t as Route } from "./_user.login-D_R-rjet.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_user.login-C1l1siDQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LoginPage() {
	const navigate = useNavigate();
	const { signup } = Route.useSearch();
	const [isSignUp, setIsSignUp] = (0, import_react.useState)(false);
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [fullName, setFullName] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (signup === "1") setIsSignUp(true);
	}, [signup]);
	(0, import_react.useEffect)(() => {
		if (isAuthenticated()) getMe().then(() => navigate({ to: "/" })).catch(() => {
			logout();
		});
	}, [navigate]);
	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			if (isSignUp) await register(email, password, fullName, phone);
			else await login(email, password);
			navigate({ to: "/" });
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-md mx-auto py-8 md:py-12",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "ghost",
				size: "sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4 mr-1" }), "Back to Home"]
				})
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
			className: "text-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-xl md:text-2xl",
				children: isSignUp ? "Create Account" : "Sign In"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: handleSubmit,
			className: "space-y-4",
			children: [
				isSignUp && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "fullName",
						children: "Full Name"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "fullName",
						placeholder: "John Doe",
						value: fullName,
						onChange: (e) => setFullName(e.target.value),
						required: true
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "phone",
						children: "Phone (optional)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "phone",
						placeholder: "+856 20 000 000",
						value: phone,
						onChange: (e) => setPhone(e.target.value)
					})]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "email",
						children: "Email"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "email",
						type: "email",
						placeholder: "you@example.com",
						value: email,
						onChange: (e) => setEmail(e.target.value),
						required: true
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "password",
						children: "Password"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "password",
						type: "password",
						placeholder: "••••••••",
						value: password,
						onChange: (e) => setPassword(e.target.value),
						required: true
					})]
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-destructive",
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					className: "w-full",
					disabled: loading,
					children: loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 text-center text-sm text-muted-foreground",
			children: [
				isSignUp ? "Already have an account?" : "Don't have an account?",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => {
						setIsSignUp(!isSignUp);
						setError("");
					},
					className: "text-primary underline hover:no-underline",
					children: isSignUp ? "Sign In" : "Sign Up"
				})
			]
		})] })] })]
	});
}
//#endregion
export { LoginPage as component };
