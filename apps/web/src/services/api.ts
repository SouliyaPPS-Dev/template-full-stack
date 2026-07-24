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

export async function api<T>(path: string, options?: RequestInit, _userType: UserType = "user"): Promise<T> {
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
