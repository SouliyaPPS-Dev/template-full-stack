globalThis.__nitro_main__ = import.meta.url;
import { a as toEventHandler, c as NodeResponse, i as defineLazyEventHandler, l as serve, n as HTTPError, r as defineHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import "./_libs/hookable.mjs";
import { i as withoutTrailingSlash, n as joinURL, r as withLeadingSlash, t as decodePath } from "./_libs/ufo.mjs";
import { promises } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/icon.svg": {
		"type": "image/svg+xml",
		"etag": "\"11b-14zQ/0iwycNPZIfV+8dRN7d/W1M\"",
		"mtime": "2026-07-24T05:28:37.414Z",
		"size": 283,
		"path": "../public/icon.svg"
	},
	"/registerSW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"86-uD38uo0sV8qINzJL85XzR0gDOlA\"",
		"mtime": "2026-07-24T05:28:35.586Z",
		"size": 134,
		"path": "../public/registerSW.js"
	},
	"/manifest.webmanifest": {
		"type": "application/manifest+json",
		"etag": "\"141-/11fBjFFZgQKPEwH4zFB9QEESqY\"",
		"mtime": "2026-07-24T05:28:35.586Z",
		"size": 321,
		"path": "../public/manifest.webmanifest"
	},
	"/assets/Match-XxwXqy4O.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"be02-jhcFHxfgE9fbcNQX7/2pN3rwBvw\"",
		"mtime": "2026-07-24T05:28:35.583Z",
		"size": 48642,
		"path": "../public/assets/Match-XxwXqy4O.js"
	},
	"/assets/_user-mploncDD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"107b-ncCA5m4ZEtz2E46dkiodaiYjPEg\"",
		"mtime": "2026-07-24T05:28:35.583Z",
		"size": 4219,
		"path": "../public/assets/_user-mploncDD.js"
	},
	"/assets/_admin-DtOu3-Po.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ee4-p3CSrFmNf4lnFGu6j7qbkNkxw6Y\"",
		"mtime": "2026-07-24T05:28:35.583Z",
		"size": 3812,
		"path": "../public/assets/_admin-DtOu3-Po.js"
	},
	"/assets/_user-uNStg6rl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f5b-qfDZ+yBrMfg5PTRvvhX3VlevMLs\"",
		"mtime": "2026-07-24T05:28:35.583Z",
		"size": 3931,
		"path": "../public/assets/_user-uNStg6rl.js"
	},
	"/assets/arrow-left-BZeH2dtQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a5-/M0xF9cE6bC9dMueHYeP7gQwXPg\"",
		"mtime": "2026-07-24T05:28:35.583Z",
		"size": 165,
		"path": "../public/assets/arrow-left-BZeH2dtQ.js"
	},
	"/assets/card-giOIuG2c.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"423-+LRVyzqGcVcTpqaLLc+E2QrZ6MU\"",
		"mtime": "2026-07-24T05:28:35.583Z",
		"size": 1059,
		"path": "../public/assets/card-giOIuG2c.js"
	},
	"/assets/button-BTIdltl1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f8b-xXd1LEIEkDFAcAvB4YV1coJwVbI\"",
		"mtime": "2026-07-24T05:28:35.583Z",
		"size": 3979,
		"path": "../public/assets/button-BTIdltl1.js"
	},
	"/assets/cart-CYSzsup8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"32d-qMnL6/298hk8bb3bAbQErZGk9Ug\"",
		"mtime": "2026-07-24T05:28:35.583Z",
		"size": 813,
		"path": "../public/assets/cart-CYSzsup8.js"
	},
	"/assets/createLucideIcon-BWnTuVxT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"569-dhGeYYTNLH3YPaPTeY+Z2UkhqfM\"",
		"mtime": "2026-07-24T05:28:35.583Z",
		"size": 1385,
		"path": "../public/assets/createLucideIcon-BWnTuVxT.js"
	},
	"/assets/admin-C29TVR0Q.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b8e-Qj1kEvpWRx/7JU1st5/DJEYD07g\"",
		"mtime": "2026-07-24T05:28:35.583Z",
		"size": 2958,
		"path": "../public/assets/admin-C29TVR0Q.js"
	},
	"/assets/customers-De5b1Bw5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"23a-70OuqpitdZ3PWoCJGQN/wQdvkEM\"",
		"mtime": "2026-07-24T05:28:35.584Z",
		"size": 570,
		"path": "../public/assets/customers-De5b1Bw5.js"
	},
	"/assets/index-B4Dx3IMi.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"6c99-l7fSkFfE80mAF9t4Ftp0gczSs4g\"",
		"mtime": "2026-07-24T05:28:35.586Z",
		"size": 27801,
		"path": "../public/assets/index-B4Dx3IMi.css"
	},
	"/assets/index-DcuHQkEE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ef45-N6X4/vrFug0X2+2LL1+4/3+0axU\"",
		"mtime": "2026-07-24T05:28:35.582Z",
		"size": 323397,
		"path": "../public/assets/index-DcuHQkEE.js"
	},
	"/assets/label-DUmVx8dt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"342-Br/EDkE92G4fjqQHisy8yHcjEuU\"",
		"mtime": "2026-07-24T05:28:35.584Z",
		"size": 834,
		"path": "../public/assets/label-DUmVx8dt.js"
	},
	"/assets/link-BY6b89qW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"68b1-iengqCgqFFOnlNcGYC3IgjC8mnA\"",
		"mtime": "2026-07-24T05:28:35.584Z",
		"size": 26801,
		"path": "../public/assets/link-BY6b89qW.js"
	},
	"/assets/log-out-CTOwkYTb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e6-FPerk3DF3Cmg6NUOrPuajhgAZYc\"",
		"mtime": "2026-07-24T05:28:35.584Z",
		"size": 230,
		"path": "../public/assets/log-out-CTOwkYTb.js"
	},
	"/assets/login-Cirp-6eb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a56-J7+6V1XGbFbe9YW+tBFzU4yCiFY\"",
		"mtime": "2026-07-24T05:28:35.584Z",
		"size": 2646,
		"path": "../public/assets/login-Cirp-6eb.js"
	},
	"/assets/login-Dg98CJqu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"670-kokTKcYg3QwqTgTGOQjoTarVtH8\"",
		"mtime": "2026-07-24T05:28:35.584Z",
		"size": 1648,
		"path": "../public/assets/login-Dg98CJqu.js"
	},
	"/assets/package-Cl31P8Fk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"174-AR83sUHoIgyBfJU5VMQ1dDzOOOQ\"",
		"mtime": "2026-07-24T05:28:35.584Z",
		"size": 372,
		"path": "../public/assets/package-Cl31P8Fk.js"
	},
	"/assets/orders-DiQqTIQJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"be3-S2BySIrDzgBoIRRz7tdSns0FRSU\"",
		"mtime": "2026-07-24T05:28:35.584Z",
		"size": 3043,
		"path": "../public/assets/orders-DiQqTIQJ.js"
	},
	"/assets/plus-CG7_CWpY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"99-Q6aDp2WoQ0shdkUcOCQy/iW70Tc\"",
		"mtime": "2026-07-24T05:28:35.584Z",
		"size": 153,
		"path": "../public/assets/plus-CG7_CWpY.js"
	},
	"/assets/jsx-runtime-BKllkxft.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"20d8-OsELDERtTmr6S+CCOADMMZjtZ2o\"",
		"mtime": "2026-07-24T05:28:35.584Z",
		"size": 8408,
		"path": "../public/assets/jsx-runtime-BKllkxft.js"
	},
	"/assets/products-DZ_vdC6k.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"75f-ThcaMgx6DjoZy+UDPO4ZE6cjQT4\"",
		"mtime": "2026-07-24T05:28:35.584Z",
		"size": 1887,
		"path": "../public/assets/products-DZ_vdC6k.js"
	},
	"/assets/settings-C9UfEZ2P.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1e7-mOjvbRJ0TMNyxkV55Ll/sVWMS80\"",
		"mtime": "2026-07-24T05:28:35.585Z",
		"size": 487,
		"path": "../public/assets/settings-C9UfEZ2P.js"
	},
	"/assets/profile-D4XFSOy5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1224-o7E7sHUkrZffT3Ioid0VTbzPS7A\"",
		"mtime": "2026-07-24T05:28:35.585Z",
		"size": 4644,
		"path": "../public/assets/profile-D4XFSOy5.js"
	},
	"/assets/settings-DaOTxI6o.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"245-qt2fNeI6J8bFYf4OXLHT+TOxgpM\"",
		"mtime": "2026-07-24T05:28:35.585Z",
		"size": 581,
		"path": "../public/assets/settings-DaOTxI6o.js"
	},
	"/assets/products-Dubt6Je8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c84-CJj4ipPTOrRwea18//EZDw+TmWM\"",
		"mtime": "2026-07-24T05:28:35.584Z",
		"size": 3204,
		"path": "../public/assets/products-Dubt6Je8.js"
	},
	"/assets/shopping-cart-C05hGHmU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"124-kLLiYoEnKBbjXY0dG3p/5x3826U\"",
		"mtime": "2026-07-24T05:28:35.585Z",
		"size": 292,
		"path": "../public/assets/shopping-cart-C05hGHmU.js"
	},
	"/assets/store-BgFOx5c-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1f2-2pcuIFxgiytggQmWpTfp95hXadY\"",
		"mtime": "2026-07-24T05:28:35.585Z",
		"size": 498,
		"path": "../public/assets/store-BgFOx5c-.js"
	},
	"/assets/use-auth-Bx4-9DAW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ce-jWNUzimhFgikrlE3ODzAHkU7agA\"",
		"mtime": "2026-07-24T05:28:35.585Z",
		"size": 462,
		"path": "../public/assets/use-auth-Bx4-9DAW.js"
	},
	"/assets/useNavigate-DEBQ5RCC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"32f-ahhuHuyIy0+gOWxO9FA1ero5HxM\"",
		"mtime": "2026-07-24T05:28:35.585Z",
		"size": 815,
		"path": "../public/assets/useNavigate-DEBQ5RCC.js"
	},
	"/assets/useQuery-DPGsKRkp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"225b-8Kg4P49XrecDOoV2WlhfUuAIQLg\"",
		"mtime": "2026-07-24T05:28:35.585Z",
		"size": 8795,
		"path": "../public/assets/useQuery-DPGsKRkp.js"
	},
	"/assets/users-DiMx7Q3p.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"132-bmhfmL0U/86CpjTR28+d9d0WoQk\"",
		"mtime": "2026-07-24T05:28:35.585Z",
		"size": 306,
		"path": "../public/assets/users-DiMx7Q3p.js"
	},
	"/assets/users-DzWSVo_G.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"22ea-l9bV+egJGEnZ7hohS6Yodygni20\"",
		"mtime": "2026-07-24T05:28:35.585Z",
		"size": 8938,
		"path": "../public/assets/users-DzWSVo_G.js"
	},
	"/assets/x-JpXJmSYR.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9a-4HV19Yej/AZAb8v5s/+iew5Ekd0\"",
		"mtime": "2026-07-24T05:28:35.586Z",
		"size": 154,
		"path": "../public/assets/x-JpXJmSYR.js"
	},
	"/assets/useMutation-CWS1fnGv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8ca-lqkaWuU1cKoDh+vkdou1wDNzB3o\"",
		"mtime": "2026-07-24T05:28:35.585Z",
		"size": 2250,
		"path": "../public/assets/useMutation-CWS1fnGv.js"
	},
	"/assets/utils-B6KiDbIe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6a7d-iNkBSvaSyIjvZOzWoTvEa49qwcI\"",
		"mtime": "2026-07-24T05:28:35.586Z",
		"size": 27261,
		"path": "../public/assets/utils-B6KiDbIe.js"
	}
};
//#endregion
//#region #nitro/virtual/public-assets-node
function readAsset(id) {
	const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
	return promises.readFile(resolve(serverDir, public_assets_data_default[id].path));
}
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
function getAsset(id) {
	return public_assets_data_default[id];
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/static.mjs
var METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
var EncodingMap = {
	gzip: ".gz",
	br: ".br",
	zstd: ".zst"
};
var static_default = defineHandler((event) => {
	if (event.req.method && !METHODS.has(event.req.method)) return;
	let id = decodePath(withLeadingSlash(withoutTrailingSlash(event.url.pathname)));
	let asset;
	const encodings = [...(event.req.headers.get("accept-encoding") || "").split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(), ""];
	for (const encoding of encodings) for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
		const _asset = getAsset(_id);
		if (_asset) {
			asset = _asset;
			id = _id;
			break;
		}
	}
	if (!asset) {
		if (isPublicAssetURL(id)) {
			event.res.headers.delete("Cache-Control");
			throw new HTTPError({ status: 404 });
		}
		return;
	}
	if (encodings.length > 1) event.res.headers.append("Vary", "Accept-Encoding");
	if (event.req.headers.get("if-none-match") === asset.etag) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	const ifModifiedSinceH = event.req.headers.get("if-modified-since");
	const mtimeDate = new Date(asset.mtime);
	if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	if (asset.type) event.res.headers.set("Content-Type", asset.type);
	if (asset.etag && !event.res.headers.has("ETag")) event.res.headers.set("ETag", asset.etag);
	if (asset.mtime && !event.res.headers.has("Last-Modified")) event.res.headers.set("Last-Modified", mtimeDate.toUTCString());
	if (asset.encoding && !event.res.headers.has("Content-Encoding")) event.res.headers.set("Content-Encoding", asset.encoding);
	if (asset.size > 0 && !event.res.headers.has("Content-Length")) event.res.headers.set("Content-Length", asset.size.toString());
	return readAsset(id);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_xyIIfL = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_xyIIfL
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
var globalMiddleware = [toEventHandler(static_default)].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function createNitroApp() {
	const hooks = void 0;
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~middleware"].push(...globalMiddleware);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		{
			const routeRules = getRouteRules(method, pathname);
			event.context.routeRules = routeRules?.routeRules;
			if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		}
		middleware.push(...h3App["~middleware"]);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	for (const rule of Object.values(routeRules)) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/hooks.mjs
function _captureError(error, type) {
	console.error(`[${type}]`, error);
	useNitroApp().captureError?.(error, { tags: [type] });
}
function trapUnhandledErrors() {
	process.on("unhandledRejection", (error) => _captureError(error, "unhandledRejection"));
	process.on("uncaughtException", (error) => _captureError(error, "uncaughtException"));
}
//#endregion
//#region node_modules/nitro/dist/presets/node/runtime/node-server.mjs
var _parsedPort = Number.parseInt(process.env.NITRO_PORT ?? process.env.PORT ?? "");
var port = Number.isNaN(_parsedPort) ? 3e3 : _parsedPort;
var host = process.env.NITRO_HOST || process.env.HOST;
var cert = process.env.NITRO_SSL_CERT;
var key = process.env.NITRO_SSL_KEY;
var nitroApp = useNitroApp();
serve({
	port,
	hostname: host,
	tls: cert && key ? {
		cert,
		key
	} : void 0,
	fetch: nitroApp.fetch
});
trapUnhandledErrors();
var node_server_default = {};
//#endregion
export { node_server_default as default };
