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

// ── Gradio 5.x API caller (for HF Spaces production) ──
async function gradioPredict<T>(apiName: string, data: unknown[] = []): Promise<T> {
  const res = await fetch(`${API_BASE}/gradio_api/call/${apiName}`, {
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
  const dataRes = await fetch(`${API_BASE}/gradio_api/call/${apiName}/${event_id}`);
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

  const token = isClient() ? localStorage.getItem(`token_${_userType}`) : null;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 401) {
    if (_userType === "admin") {
      currentAdmin = null;
      emitAdminAuthChange(null);
    } else {
      currentUser = null;
      emitUserAuthChange(null);
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let err: { error?: string } = {};
    if (text && !text.startsWith("<!")) {
      try { err = JSON.parse(text); } catch {}
    }
    throw new Error(err.error || `API error: ${res.status}`);
  }

  const text = await res.text();
  if (text.startsWith("<!")) {
    throw new Error("API unavailable");
  }
  return JSON.parse(text) as T;
}

// ── Gradio proxy for HF Spaces ──
async function gradioApiCaller<T>(path: string, options?: RequestInit, _userType: UserType = "user"): Promise<T> {
  const method = options?.method || "GET";
  const body = options?.body ? JSON.parse(options.body as string) : {};

  // Handle logout: clear auth state
  if ((path === "/auth/logout" || path === "/admin/logout") && method === "POST") {
    if (path === "/admin/logout") {
      clearAuthFromStorage("admin");
      currentAdmin = null;
      emitAdminAuthChange(null);
    } else {
      clearAuthFromStorage("user");
      currentUser = null;
      emitUserAuthChange(null);
    }
    return { message: "Logged out" } as T;
  }

  // Handle /auth/me: return cached user or null in production
  if (path === "/auth/me" && method === "GET") {
    const saved = loadAuthFromStorage(_userType);
    if (saved?.user) {
      return saved.user as T;
    }
    return null as T;
  }

  // Handle /auth/me update
  if (path === "/auth/me" && method === "PUT") {
    const saved = loadAuthFromStorage(_userType);
    if (saved) {
      const updated: User = { ...saved.user, ...body };
      saveAuthToStorage(saved.token, updated, _userType);
      if (_userType === "admin") {
        currentAdmin = updated;
        emitAdminAuthChange(updated);
      } else {
        currentUser = updated;
        emitUserAuthChange(updated);
      }
      return updated as T;
    }
    throw new Error("Unauthorized");
  }

  // Map REST endpoints to Gradio function names
  const routeMap: Record<string, (data: unknown[]) => Promise<T>> = {
    "/health": () => gradioPredict<T>("gr_health", []),
    "/auth/login": () => gradioPredict<T>("gr_login", [body.email, body.password]),
    "/admin/login": () => gradioPredict<T>("gr_login", [body.email, body.password]),
    "/auth/register": () => gradioPredict<T>("gr_register", [body.email, body.password, body.full_name, body.phone || ""]),
    "/products": () => gradioPredict<T>("gr_products", []),
  };

  const trimmedPath = path.replace(/\/+$/, "");
  const handler = routeMap[trimmedPath];

  if (handler) {
    const result = await handler([]);

    // Handle login responses: save token + user to localStorage
    if ((trimmedPath === "/auth/login" || trimmedPath === "/admin/login") && method === "POST") {
      const authRes = result as unknown as AuthResponse;
      if (authRes.access_token && authRes.user) {
        saveAuthToStorage(authRes.access_token, authRes.user, _userType);
        if (_userType === "admin") {
          currentAdmin = authRes.user;
          emitAdminAuthChange(authRes.user);
        } else {
          currentUser = authRes.user;
          emitUserAuthChange(authRes.user);
        }
      }
    }

    // Handle register responses
    if (trimmedPath === "/auth/register" && method === "POST") {
      const authRes = result as unknown as AuthResponse;
      if (authRes.access_token && authRes.user) {
        saveAuthToStorage(authRes.access_token, authRes.user, "user");
        currentUser = authRes.user;
        emitUserAuthChange(authRes.user);
      }
    }

    return result;
  }

  // For unregistered endpoints in production, return fallback
  if (trimmedPath.startsWith("/categories")) {
    return [] as T;
  }
  if (trimmedPath.startsWith("/orders")) {
    if (method === "POST") {
      return { id: "prod-only", order_number: "PROD-ORD", grand_total: 0, status: "pending", created_at: new Date().toISOString() } as T;
    }
    return [] as T;
  }
  if (trimmedPath.startsWith("/users")) {
    if (method === "POST" || method === "PUT") {
      const saved = loadAuthFromStorage("admin");
      const newUser: User = { ...body, id: crypto.randomUUID?.() || Date.now().toString(), is_active: true, created_at: new Date().toISOString() };
      return newUser as T;
    }
    // Return current admin user as sole user
    const saved = loadAuthFromStorage("admin");
    if (saved?.user) {
      if (trimmedPath === `/users/${saved.user.id}`) return saved.user as T;
      return [saved.user] as T;
    }
    return [] as T;
  }
  if (trimmedPath.startsWith("/dashboard/stats")) {
    try {
      return await gradioPredict<T>("gr_health", []) as T;
    } catch {
      return { total_products: 0, total_orders: 0, total_users: 1, total_categories: 0, total_revenue: 0, pending_orders: 0 } as T;
    }
  }
  if (trimmedPath.startsWith("/settings")) {
    return [
      { key: "store_name", value: "API Template" },
      { key: "store_phone", value: "" },
      { key: "currency", value: "LAK" },
      { key: "tax_percent", value: "7" },
      { key: "store_logo", value: "" },
    ] as T;
  }
  if (trimmedPath.startsWith("/cart")) {
    return [] as T;
  }
  if (trimmedPath.startsWith("/quotations")) {
    if (method === "POST") {
      return { id: "prod-only", quotation_number: "PROD-QT", grand_total: 0, status: "draft", created_at: new Date().toISOString() } as T;
    }
    return [] as T;
  }

  throw new Error(`Unknown endpoint: ${path}`);
}

// ── Auth API functions ──
export async function login(email: string, password: string): Promise<AuthResponse> {
  const data = await api<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (!IS_PRODUCTION && isClient()) {
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
  if (!IS_PRODUCTION && isClient()) {
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
  if (!IS_PRODUCTION && isClient()) {
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
    await api(`/${userType === "admin" ? "admin" : "auth"}/logout`, { method: "POST" });
  } catch {}
  if (isClient()) {
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
  if (!IS_PRODUCTION && isClient()) {
    currentUser = updated;
    emitUserAuthChange(updated);
  }
  return updated;
}
