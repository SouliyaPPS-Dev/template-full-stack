import { r as __toESM } from "./_runtime.mjs";
import { a as isAuthenticated, i as getUser, l as updateProfile, r as getMe, s as logout } from "./_ssr/api-RoDK1aga.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime, i as useQueryClient, t as useMutation } from "./_libs/react+tanstack__react-query.mjs";
import { S as ArrowLeft, b as Calendar, c as Shield, m as Mail, r as User, u as Save } from "./_libs/lucide-react.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./_ssr/card-D3rxkkzC.mjs";
import { t as Button } from "./_ssr/button-B-LtGUZY.mjs";
import { n as Label, t as Input } from "./_ssr/label-D4SVKdBz.mjs";
import { t as Route } from "./_user.profile-CCUrQy4Y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_user.profile-BC-5DzmQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProfilePage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { user: serverUser } = Route.useLoaderData();
	const storedUser = serverUser || getUser();
	const [fullName, setFullName] = (0, import_react.useState)(storedUser?.full_name || "");
	const [phone, setPhone] = (0, import_react.useState)(storedUser?.phone || "");
	const [error, setError] = (0, import_react.useState)("");
	const [success, setSuccess] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!isAuthenticated()) {
			navigate({
				to: "/login",
				replace: true
			});
			return;
		}
		getMe().then((u) => {
			setFullName(u.full_name);
			setPhone(u.phone || "");
		}).catch(() => {
			logout();
			navigate({ to: "/login" });
		});
	}, [navigate]);
	const mutation = useMutation({
		mutationFn: () => updateProfile({
			full_name: fullName,
			phone
		}),
		onSuccess: () => {
			setSuccess("Profile updated successfully!");
			setError("");
			queryClient.invalidateQueries({ queryKey: ["profile"] });
			setTimeout(() => setSuccess(""), 3e3);
		},
		onError: (err) => {
			setError(err.message);
			setSuccess("");
		}
	});
	const handleSubmit = (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		mutation.mutate();
	};
	if (!storedUser) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-2xl mx-auto py-6 md:py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: () => navigate({ to: "/" }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4 mr-1" }), "Back"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 mb-6 md:mb-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-14 w-14 md:h-16 md:w-16 rounded-full bg-primary/10 flex items-center justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-7 w-7 md:h-8 md:w-8 text-primary" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl md:text-2xl font-bold",
					children: storedUser.full_name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: storedUser.email
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base md:text-lg",
					children: "Account Information"
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-4 w-4 text-muted-foreground shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Email"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm",
								children: storedUser.email
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-4 w-4 text-muted-foreground shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Role"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm capitalize",
								children: storedUser.role
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-4 w-4 text-muted-foreground shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Member Since"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm",
								children: new Date(storedUser.created_at).toLocaleDateString("en-US", {
									year: "numeric",
									month: "long",
									day: "numeric"
								})
							})] })]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base md:text-lg",
				children: "Edit Profile"
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSubmit,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "fullName",
							children: "Full Name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "fullName",
							value: fullName,
							onChange: (e) => setFullName(e.target.value),
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "phone",
							children: "Phone"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "phone",
							value: phone,
							onChange: (e) => setPhone(e.target.value),
							placeholder: "+856 20 000 000"
						})]
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-destructive",
						children: error
					}),
					success && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-green-600",
						children: success
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						disabled: mutation.isPending,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4 mr-2" }), mutation.isPending ? "Saving..." : "Save Changes"]
					})
				]
			}) })] })
		]
	});
}
//#endregion
export { ProfilePage as component };
