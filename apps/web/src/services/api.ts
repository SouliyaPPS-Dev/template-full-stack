const API_BASE = import.meta.env.VITE_API_URL || "/api/v1";
const IS_PRODUCTION = import.meta.env.MODE === "production" || API_BASE.includes("hf.space");

export function getApiBase(): string {
  return API_BASE;
}

export type UserType = "user" | "admin";

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  is_active: boolean;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

function isClient(): boolean {
  return typeof window !== "undefined";
}

// ── Auth state (in-memory + localStorage persistence for production) ──
let currentUser: User | null = null;
let currentAdmin: User | null = null;

type AuthListener = (user: User | null) => void;
const userListeners = new Set<AuthListener>();
const adminListeners = new Set<AuthListener>();

function onUserAuthChange(listener: AuthListener): () => void {
  userListeners.add(listener);
  return () => userListeners.delete(listener);
}

function onAdminAuthChange(listener: AuthListener): () => void {
  adminListeners.add(listener);
  return () => adminListeners.delete(listener);
}

export function onAuthChange(userType: UserType, listener: AuthListener): () => void {
  return userType === "admin"
    ? onAdminAuthChange(listener)
    : onUserAuthChange(listener);
}

function emitUserAuthChange(user: User | null) {
  userListeners.forEach((fn) => fn(user));
}

function emitAdminAuthChange(user: User | null) {
  adminListeners.forEach((fn) => fn(user));
}

function emitAuthChange(userType: UserType, user: User | null) {
  if (userType === "admin") {
    emitAdminAuthChange(user);
  } else {
    emitUserAuthChange(user);
  }
}

// ── localStorage auth persistence (for production mode) ──
function getStorageKey(userType: UserType): string {
  return `auth_${userType}`;
}

function saveAuthToStorage(token: string, user: User, userType: UserType) {
  if (!isClient()) return;
  localStorage.setItem(getStorageKey(userType), JSON.stringify({ token, user }));
}

function clearAuthFromStorage(userType: UserType) {
  if (!isClient()) return;
  localStorage.removeItem(getStorageKey(userType));
}

function loadAuthFromStorage(userType: UserType): { token: string; user: User } | null {
  if (!isClient()) return null;
  try {
    const raw = localStorage.getItem(getStorageKey(userType));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Restore auth state from localStorage on init
if (isClient()) {
  const saved = loadAuthFromStorage("admin");
  if (saved) currentAdmin = saved.user;
  const savedUser = loadAuthFromStorage("user");
  if (savedUser) currentUser = savedUser.user;
}

// ── Token refresh (auto-renew on 401) ──
let _refreshPromise: Promise<string | null> | null = null;

async function _doRefresh(userType: UserType): Promise<string | null> {
  if (_refreshPromise) return _refreshPromise;
  _refreshPromise = (async () => {
    try {
      const saved = loadAuthFromStorage(userType);
      if (!saved?.token) return null;
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${saved.token}` },
      });
      if (!res.ok) { clearAuthFromStorage(userType); return null; }
      const data = await res.json();
      if (data.access_token) {
        saveAuthToStorage(data.access_token, saved.user, userType);
        return data.access_token;
      }
      return null;
    } catch { return null; }
    finally { _refreshPromise = null; }
  })();
  return _refreshPromise;
}

// ── Gradio 5.x API caller (for HF Spaces production) ──
async function gradioPredict<T>(apiName: string, data: unknown[] = []): Promise<T> {
  const res = await fetch(`${API_BASE}/_call/${apiName}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gradio call failed: ${res.status}${text ? ` - ${text}` : ""}`);
  }

  const { event_id } = await res.json();

  // Poll for result via SSE
  const dataRes = await fetch(`${API_BASE}/_call/${apiName}/${event_id}`);
  if (!dataRes.ok) {
    throw new Error(`Gradio data fetch failed: ${dataRes.status}`);
  }

  const reader = dataRes.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    for (const line of buffer.split("\n")) {
      if (line.startsWith("data: ")) {
        try {
          const event = JSON.parse(line.slice(6));
          if (Array.isArray(event) && typeof event[0] === "string") {
            return JSON.parse(event[0]) as T;
          }
        } catch {
          // continue waiting for complete event
        }
      }
    }
  }

  // Try parsing remaining buffer
  for (const line of buffer.split("\n")) {
    if (line.startsWith("data: ")) {
      const event = JSON.parse(line.slice(6));
      if (Array.isArray(event) && typeof event[0] === "string") {
        return JSON.parse(event[0]) as T;
      }
      return event as T;
    }
  }

  throw new Error("No result from Gradio API");
}

// ── Main API caller ──
export async function api<T>(path: string, options?: RequestInit, _userType: UserType = "user"): Promise<T> {
  if (IS_PRODUCTION) {
    return gradioApiCaller<T>(path, options, _userType);
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Auth-Type": _userType,
    ...((options?.headers as Record<string, string>) || {}),
  };

  const saved = isClient() ? loadAuthFromStorage(_userType) : null;
  if (saved?.token) headers["Authorization"] = `Bearer ${saved.token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let msg = `API error: ${res.status}`;
    if (text && !text.startsWith("<!")) {
      try {
        const err = JSON.parse(text);
        msg = err.detail || err.error || err.message || msg;
      } catch {}
    }
    if (res.status === 401 && path !== "/auth/refresh") {
      const newToken = await _doRefresh(_userType);
      if (newToken) {
        headers["Authorization"] = `Bearer ${newToken}`;
        const retryRes = await fetch(`${API_BASE}${path}`, { ...options, headers });
        if (retryRes.ok) {
          const retryText = await retryRes.text();
          if (!retryText.startsWith("<!")) return JSON.parse(retryText) as T;
        }
      }
      clearAuthFromStorage(_userType);
      if (_userType === "admin") { currentAdmin = null; emitAdminAuthChange(null); }
      else { currentUser = null; emitUserAuthChange(null); }
    }
    throw new Error(msg);
  }

  const text = await res.text();
  if (text.startsWith("<!")) {
    throw new Error("API unavailable");
  }
  return JSON.parse(text) as T;
}

// ── Direct REST API proxy for HF Spaces (no Gradio protocol) ──
async function gradioApiCaller<T>(path: string, options?: RequestInit, _userType: UserType = "user"): Promise<T> {
  const method = options?.method || "GET";

  // Logout: clear auth state only for the calling user type
  if ((path === "/auth/logout" || path === "/admin/logout") && method === "POST") {
    clearAuthFromStorage(_userType);
    if (_userType === "admin") { currentAdmin = null; emitAdminAuthChange(null); }
    else { currentUser = null; emitUserAuthChange(null); }
    return { message: "Logged out" } as T;
  }

  // /auth/me GET: return from localStorage
  if (path === "/auth/me" && method === "GET") {
    const saved = loadAuthFromStorage(_userType);
    return (saved?.user || null) as T;
  }

  // For all endpoints: call the REST API directly
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };
  const saved = isClient() ? loadAuthFromStorage(_userType) : null;
  if (saved?.token) headers["Authorization"] = `Bearer ${saved.token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // Handle login response: save token + user to localStorage
  if ((path === "/auth/login" || path === "/admin/login") && method === "POST" && res.ok) {
    const authRes = await res.json() as AuthResponse;
    if (authRes.access_token && authRes.user) {
      saveAuthToStorage(authRes.access_token, authRes.user, _userType);
      if (_userType === "admin") { currentAdmin = authRes.user; emitAdminAuthChange(authRes.user); }
      else { currentUser = authRes.user; emitUserAuthChange(authRes.user); }
    }
    return authRes as T;
  }

  // Handle register response: save token + user to localStorage
  if (path === "/auth/register" && method === "POST" && res.ok) {
    const authRes = await res.json() as AuthResponse;
    if (authRes.access_token && authRes.user) {
      saveAuthToStorage(authRes.access_token, authRes.user, "user");
      currentUser = authRes.user;
      emitUserAuthChange(authRes.user);
    }
    return authRes as T;
  }

  // Handle /auth/me PUT response: update localStorage with fresh API data
  if (path === "/auth/me" && method === "PUT" && res.ok) {
    const updated = await res.json() as User;
    const saved = loadAuthFromStorage(_userType);
    if (saved) {
      saveAuthToStorage(saved.token, updated, _userType);
      if (_userType === "admin") { currentAdmin = updated; emitAdminAuthChange(updated); }
      else { currentUser = updated; emitUserAuthChange(updated); }
    }
    return updated as T;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let msg = `API error: ${res.status}`;
    if (text && !text.startsWith("<!")) {
      try {
        const err = JSON.parse(text);
        msg = err.detail || err.error || err.message || msg;
      } catch {}
    }
    if (res.status === 401 && path !== "/auth/refresh") {
      const newToken = await _doRefresh(_userType);
      if (newToken) {
        headers["Authorization"] = `Bearer ${newToken}`;
        const retryRes = await fetch(`${API_BASE}${path}`, { ...options, headers });
        if (retryRes.ok) return retryRes.json() as Promise<T>;
      }
      clearAuthFromStorage(_userType);
      if (_userType === "admin") { currentAdmin = null; emitAdminAuthChange(null); }
      else { currentUser = null; emitUserAuthChange(null); }
    }
    throw new Error(msg);
  }

  return res.json() as Promise<T>;
}

// ── Auth API functions ──
export async function login(email: string, password: string): Promise<AuthResponse> {
  const data = await api<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (isClient() && data.access_token) {
    saveAuthToStorage(data.access_token, data.user, "user");
    currentUser = data.user;
    emitUserAuthChange(data.user);
  }
  return data;
}

export async function adminLogin(email: string, password: string): Promise<AuthResponse> {
  const data = await api<AuthResponse>("/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (isClient() && data.access_token) {
    saveAuthToStorage(data.access_token, data.user, "admin");
    currentAdmin = data.user;
    emitAdminAuthChange(data.user);
  }
  return data;
}

export async function register(email: string, password: string, fullName: string, phone?: string): Promise<AuthResponse> {
  const data = await api<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, full_name: fullName, phone }),
  });
  if (isClient() && data.access_token) {
    saveAuthToStorage(data.access_token, data.user, "user");
    currentUser = data.user;
    emitUserAuthChange(data.user);
  }
  return data;
}

export async function getMe(userType: UserType = "user"): Promise<User> {
  return api<User>("/auth/me", undefined, userType);
}

export async function logout(userType: UserType = "user") {
  try {
    await api(`/${userType === "admin" ? "admin" : "auth"}/logout`, { method: "POST" }, userType);
  } catch {}
  if (isClient()) {
    clearAuthFromStorage(userType);
    if (userType === "admin") {
      currentAdmin = null;
      emitAdminAuthChange(null);
    } else {
      currentUser = null;
      emitUserAuthChange(null);
    }
  }
}

export function adminLogout() {
  return logout("admin");
}

export function getUser(userType: UserType = "user"): User | null {
  if (!isClient()) return null;
  if (IS_PRODUCTION) {
    const saved = loadAuthFromStorage(userType);
    return saved?.user || null;
  }
  return userType === "admin" ? currentAdmin : currentUser;
}

export function setUser(user: User | null, userType: UserType = "user") {
  if (userType === "admin") {
    currentAdmin = user;
  } else {
    currentUser = user;
  }
}

export function isAuthenticated(_userType: UserType = "user"): boolean {
  if (!isClient()) return false;
  if (IS_PRODUCTION) {
    return !!loadAuthFromStorage(_userType);
  }
  return _userType === "admin" ? currentAdmin !== null : currentUser !== null;
}

export function adminIsAuthenticated(): boolean {
  return isAuthenticated("admin");
}

export async function updateProfile(data: { full_name?: string; phone?: string; avatar_url?: string }): Promise<User> {
  const updated = await api<User>("/auth/me", {
    method: "PUT",
    body: JSON.stringify(data),
  }, "user");
  if (isClient()) {
    const saved = loadAuthFromStorage("user");
    if (saved) saveAuthToStorage(saved.token, updated, "user");
    currentUser = updated;
    emitUserAuthChange(updated);
  }
  return updated;
}
