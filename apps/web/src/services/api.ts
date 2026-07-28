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
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

function isClient(): boolean {
  return typeof window !== "undefined";
}

// ── Auth state (in-memory, per-type) ──────────────────────────
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
// ───────────────────────────────────────────────────────────────

// ── Gradio Queue API caller (for HF Spaces production) ────────
let fnIndexCache: Record<string, number> = {};

async function getFnIndex(apiName: string): Promise<number> {
  if (fnIndexCache[apiName] !== undefined) return fnIndexCache[apiName];

  const res = await fetch(`${API_BASE}/gradio_api/info`);
  if (!res.ok) throw new Error("Failed to fetch Gradio API info");

  const info = await res.json();
  const endpoints = info.named_endpoints || {};

  for (const [name, endpoint] of Object.entries(endpoints)) {
    const cleanName = name.replace(/^\//, "");
    fnIndexCache[cleanName] = (endpoint as { parameters: unknown[] }).parameters.length;
  }

  // Map function names to their fn_index (order in dependencies)
  const depRes = await fetch(`${API_BASE}/`);
  const html = await depRes.text();
  const match = html.match(/"dependencies":\s*(\[[\s\S]*?\])/);
  if (match) {
    try {
      const deps = JSON.parse(match[1]);
      deps.forEach((dep: { api_name?: string }, idx: number) => {
        if (dep.api_name) {
          fnIndexCache[dep.api_name] = idx;
        }
      });
    } catch {}
  }

  return fnIndexCache[apiName] ?? 0;
}

async function gradioQueueCall(apiName: string, data: unknown[] = []): Promise<string> {
  const fnIndex = await getFnIndex(apiName);

  // Join queue
  const joinRes = await fetch(`${API_BASE}/gradio_api/queue/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data, fn_index: fnIndex }),
  });

  if (!joinRes.ok) {
    throw new Error(`Queue join failed: ${joinRes.status}`);
  }

  const { event_id } = await joinRes.json();

  // Poll for result
  const dataRes = await fetch(`${API_BASE}/gradio_api/queue/data?session_hash=${event_id}`);
  if (!dataRes.ok) {
    throw new Error(`Queue data failed: ${dataRes.status}`);
  }

  const reader = dataRes.body?.getReader();
  if (!reader) throw new Error("No reader");

  const decoder = new TextDecoder();
  let result = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

    for (const line of lines) {
      try {
        const event = JSON.parse(line.slice(6));
        if (event.msg === "process_completed") {
          result = event.output?.data?.[0] ?? "";
          return result;
        }
        if (event.msg === "queue_full") {
          throw new Error("Queue full");
        }
      } catch {}
    }
  }

  return result;
}

// ── Main API caller ────────────────────────────────────────────
export async function api<T>(path: string, options?: RequestInit, _userType: UserType = "user"): Promise<T> {
  // For HF Spaces production, use Gradio queue API
  if (IS_PRODUCTION) {
    return gradioProxy<T>(path, options, _userType);
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Auth-Type": _userType,
    ...((options?.headers as Record<string, string>) || {}),
  };

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

// ── Gradio proxy for HF Spaces ────────────────────────────────
async function gradioProxy<T>(path: string, options?: RequestInit, _userType: UserType = "user"): Promise<T> {
  const method = options?.method || "GET";
  const body = options?.body ? JSON.parse(options.body as string) : {};

  // Map REST endpoints to Gradio function names and data
  const routeMap: Record<string, () => Promise<unknown>> = {
    "/auth/login": () => gradioQueueCall("gr_login", [body.email, body.password]),
    "/admin/login": () => gradioQueueCall("gr_login", [body.email, body.password]),
    "/auth/register": () => gradioQueueCall("gr_register", [body.email, body.password, body.full_name, body.phone || ""]),
    "/auth/me": () => gradioQueueCall("gr_health", []),
    "/products": () => gradioQueueCall("gr_products", []),
    "/categories": () => Promise.resolve(JSON.stringify([])),
    "/orders": () => Promise.resolve(JSON.stringify([])),
    "/users": () => gradioQueueCall("gr_health", []),
    "/dashboard/stats": () => gradioQueueCall("gr_health", []),
    "/settings": () => Promise.resolve(JSON.stringify({ store_name: "API Template", currency: "USD", tax_percent: 0 })),
    "/health": () => gradioQueueCall("gr_health", []),
  };

  const handler = routeMap[path];
  if (handler) {
    const result = await handler();
    // Parse result string to JSON if needed
    if (typeof result === "string") {
      try {
        const parsed = JSON.parse(result);
        return parsed as T;
      } catch {
        return result as T;
      }
    }
    return result as T;
  }

  throw new Error(`Unknown endpoint: ${path}`);
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const data = await api<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (isClient()) {
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
  if (isClient()) {
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
  if (isClient()) {
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
    currentUser = updated;
    emitUserAuthChange(updated);
  }
  return updated;
}
