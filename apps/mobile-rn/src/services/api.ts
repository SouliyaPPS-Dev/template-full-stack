import AsyncStorage from "@react-native-async-storage/async-storage";
import { Config } from "../config";
import { AuthResponse, User } from "../types";

const API_BASE = Config.apiUrl;

export async function healthCheck(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export function getApiBase(): string {
  return API_BASE;
}

let _token: string | null = null;

function base64Decode(str: string): string {
  try {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    let result = "";
    let i = 0;
    str = str.replace(/[^A-Za-z0-9+/=]/g, "");
    while (i < str.length) {
      const a = chars.indexOf(str.charAt(i++));
      const b = chars.indexOf(str.charAt(i++));
      const c = chars.indexOf(str.charAt(i++));
      const d = chars.indexOf(str.charAt(i++));
      result += String.fromCharCode(
        ((a << 2) | (b >> 4)) & 255,
        ((b & 15) << 4) | (c >> 2),
        c === 64 ? 0 : ((c & 3) << 6) | d
      );
    }
    return result;
  } catch {
    return "";
  }
}

async function getToken(): Promise<string | null> {
  if (_token) return _token;
  try {
    _token = await AsyncStorage.getItem("user_token");
  } catch {
    _token = null;
  }
  return _token;
}

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    _token = null;
    try {
      await AsyncStorage.removeItem("user_token");
      await AsyncStorage.removeItem("user");
    } catch {}
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
  _token = data.access_token;
  try {
    await AsyncStorage.setItem("user_token", data.access_token);
    await AsyncStorage.setItem("user", JSON.stringify(data.user));
  } catch {}
  return data;
}

export async function register(
  email: string,
  password: string,
  fullName: string,
  phone?: string
): Promise<AuthResponse> {
  const data = await api<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, full_name: fullName, phone }),
  });
  _token = data.access_token;
  try {
    await AsyncStorage.setItem("user_token", data.access_token);
    await AsyncStorage.setItem("user", JSON.stringify(data.user));
  } catch {}
  return data;
}

export async function getMe(): Promise<User> {
  return api<User>("/auth/me");
}

export async function updateProfile(data: {
  full_name?: string;
  phone?: string;
}): Promise<User> {
  const updated = await api<User>("/auth/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
  try {
    await AsyncStorage.setItem("user", JSON.stringify(updated));
  } catch {}
  return updated;
}

export async function logout(): Promise<void> {
  _token = null;
  try {
    await AsyncStorage.removeItem("user_token");
    await AsyncStorage.removeItem("user");
  } catch {}
}

export async function getStoredUser(): Promise<User | null> {
  try {
    const raw = await AsyncStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function testAllEndpoints(): Promise<Record<string, { ok: boolean; status?: number; error?: string }>> {
  const results: Record<string, any> = {};

  const test = async (label: string, fn: () => Promise<any>) => {
    try {
      const res = await fn();
      results[label] = { ok: true, data: res };
    } catch (err: any) {
      results[label] = { ok: false, error: err.message };
    }
  };

  await test("GET /health", () => fetch(`${API_BASE}/health`).then(r => r.ok ? r.json() : Promise.reject(new Error(`${r.status}`))));
  await test("GET /products", () => api<any[]>("/products"));
  await test("GET /categories", () => api<any[]>("/categories"));
  await test("GET /settings", () => api<any[]>("/settings"));
  await test("POST /auth/login (wrong pw)", () =>
    api("/auth/login", { method: "POST", body: JSON.stringify({ email: "x@x.com", password: "wrong" }) }).catch(e => e));

  const token = await getToken();
  if (token) {
    await test("GET /auth/me", () => api<any>("/auth/me"));
    await test("GET /orders", () => api<any[]>("/orders"));
  }

  return results;
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const token = await getToken();
    if (!token) return false;
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const payloadStr = base64Decode(parts[1]);
    if (!payloadStr) return false;
    const payload = JSON.parse(payloadStr);
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      await logout();
      return false;
    }
    return true;
  } catch {
    try {
      await logout();
    } catch {}
    return false;
  }
}
