const API_BASE = import.meta.env.VITE_API_URL || "/api/v1";

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

function tokenKey(type: UserType): string {
  return type === "admin" ? "admin_token" : "user_token";
}

function userKey(type: UserType): string {
  return type === "admin" ? "admin_user" : "user";
}

// ── Auth event system ──────────────────────────────────────────
type AuthListener = (user: User | null) => void;
const listeners = new Set<AuthListener>();

export function onAuthChange(listener: AuthListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitAuthChange(user: User | null) {
  listeners.forEach((fn) => fn(user));
}
// ───────────────────────────────────────────────────────────────

export async function api<T>(path: string, options?: RequestInit, userType: UserType = "user"): Promise<T> {
  const token = isClient() ? localStorage.getItem(tokenKey(userType)) : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    if (isClient()) {
      localStorage.removeItem(tokenKey(userType));
      localStorage.removeItem(userKey(userType));
      emitAuthChange(null);
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

export async function login(email: string, password: string): Promise<AuthResponse> {
  const data = await api<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (isClient()) {
    localStorage.setItem(tokenKey("user"), data.access_token);
    localStorage.setItem(userKey("user"), JSON.stringify(data.user));
    emitAuthChange(data.user);
  }
  return data;
}

export async function adminLogin(email: string, password: string): Promise<AuthResponse> {
  const data = await api<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (isClient()) {
    localStorage.setItem(tokenKey("admin"), data.access_token);
    localStorage.setItem(userKey("admin"), JSON.stringify(data.user));
    emitAuthChange(data.user);
  }
  return data;
}

export async function register(email: string, password: string, fullName: string, phone?: string): Promise<AuthResponse> {
  const data = await api<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, full_name: fullName, phone }),
  });
  if (isClient()) {
    localStorage.setItem(tokenKey("user"), data.access_token);
    localStorage.setItem(userKey("user"), JSON.stringify(data.user));
    emitAuthChange(data.user);
  }
  return data;
}

export async function getMe(userType: UserType = "user"): Promise<User> {
  return api<User>("/auth/me", undefined, userType);
}

export function logout(userType: UserType = "user") {
  if (isClient()) {
    localStorage.removeItem(tokenKey(userType));
    localStorage.removeItem(userKey(userType));
    emitAuthChange(null);
  }
}

export function adminLogout() {
  logout("admin");
}

export function getUser(userType: UserType = "user"): User | null {
  if (!isClient()) return null;
  const user = localStorage.getItem(userKey(userType));
  return user ? JSON.parse(user) : null;
}

function checkTokenValid(tokenKey_: string, userKey_: string): boolean {
  if (!isClient()) return false;
  const token = localStorage.getItem(tokenKey_);
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      localStorage.removeItem(tokenKey_);
      localStorage.removeItem(userKey_);
      return false;
    }
  } catch {
    localStorage.removeItem(tokenKey_);
    localStorage.removeItem(userKey_);
    return false;
  }
  return true;
}

export function isAuthenticated(userType: UserType = "user"): boolean {
  return checkTokenValid(tokenKey(userType), userKey(userType));
}

export function adminIsAuthenticated(): boolean {
  return checkTokenValid(tokenKey("admin"), userKey("admin"));
}

export async function updateProfile(data: { full_name?: string; phone?: string; avatar_url?: string }): Promise<User> {
  const updated = await api<User>("/auth/me", {
    method: "PUT",
    body: JSON.stringify(data),
  }, "user");
  if (isClient()) {
    localStorage.setItem(userKey("user"), JSON.stringify(updated));
    emitAuthChange(updated);
  }
  return updated;
}
