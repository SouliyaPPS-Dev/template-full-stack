//#region node_modules/.nitro/vite/services/ssr/assets/api-RoDK1aga.js
var API_BASE = "http://localhost:8080/api/v1";
function getApiBase() {
	return API_BASE;
}
function isClient() {
	return typeof window !== "undefined";
}
async function api(path, options) {
	const token = isClient() ? localStorage.getItem("token") : null;
	const headers = {
		"Content-Type": "application/json",
		...options?.headers || {}
	};
	if (token) headers["Authorization"] = `Bearer ${token}`;
	const res = await fetch(`${API_BASE}${path}`, {
		...options,
		headers
	});
	if (res.status === 401) {
		if (isClient()) {
			localStorage.removeItem("token");
			localStorage.removeItem("user");
		}
		throw new Error("Unauthorized");
	}
	if (!res.ok) {
		const err = await res.json().catch(() => ({ error: "Request failed" }));
		throw new Error(err.error || `API error: ${res.status}`);
	}
	return res.json();
}
async function login(email, password) {
	const data = await api("/auth/login", {
		method: "POST",
		body: JSON.stringify({
			email,
			password
		})
	});
	if (isClient()) {
		localStorage.setItem("token", data.access_token);
		localStorage.setItem("user", JSON.stringify(data.user));
	}
	return data;
}
async function register(email, password, fullName, phone) {
	const data = await api("/auth/register", {
		method: "POST",
		body: JSON.stringify({
			email,
			password,
			full_name: fullName,
			phone
		})
	});
	if (isClient()) {
		localStorage.setItem("token", data.access_token);
		localStorage.setItem("user", JSON.stringify(data.user));
	}
	return data;
}
async function getMe() {
	return api("/auth/me");
}
function logout() {
	if (isClient()) {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
	}
}
function getUser() {
	if (!isClient()) return null;
	const user = localStorage.getItem("user");
	return user ? JSON.parse(user) : null;
}
function isAuthenticated() {
	if (!isClient()) return false;
	const token = localStorage.getItem("token");
	if (!token) return false;
	try {
		const payload = JSON.parse(atob(token.split(".")[1]));
		if (payload.exp && Date.now() >= payload.exp * 1e3) {
			localStorage.removeItem("token");
			localStorage.removeItem("user");
			return false;
		}
	} catch {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		return false;
	}
	return true;
}
async function updateProfile(data) {
	const updated = await api("/auth/me", {
		method: "PUT",
		body: JSON.stringify(data)
	});
	if (isClient()) localStorage.setItem("user", JSON.stringify(updated));
	return updated;
}
//#endregion
export { isAuthenticated as a, register as c, getUser as i, updateProfile as l, getApiBase as n, login as o, getMe as r, logout as s, api as t };
