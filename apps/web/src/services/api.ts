const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

export function getApiBase(): string {
  return API_BASE;
}

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

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const token = isClient() ? localStorage.getItem("token") : null;
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
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      emitAuthChange(null);
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `API error: ${res.status}`);
  }

  return res.json();
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const data = await api<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (isClient()) {
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
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
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    emitAuthChange(data.user);
  }
  return data;
}

export async function getMe(): Promise<User> {
  return api<User>("/auth/me");
}

export function logout() {
  if (isClient()) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    emitAuthChange(null);
  }
}

export function getUser(): User | null {
  if (!isClient()) return null;
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export function isAuthenticated(): boolean {
  if (!isClient()) return false;
  const token = localStorage.getItem("token");
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp && Date.now() >= payload.exp * 1000) {
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

export async function updateProfile(data: { full_name?: string; phone?: string; avatar_url?: string }): Promise<User> {
  const updated = await api<User>("/auth/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (isClient()) {
    localStorage.setItem("user", JSON.stringify(updated));
    emitAuthChange(updated);
  }
  return updated;
}
