import AsyncStorage from "@react-native-async-storage/async-storage";
import { Config } from "../config";
import { AuthResponse, User } from "../types";

const API_BASE = Config.apiUrl;

const REFRESH_BEFORE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

export async function healthCheck(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export function getApiBase(): string {
  return API_BASE;
}

let _token: string | null = null;

type AuthExpiredListener = () => void;
const authExpiredListeners = new Set<AuthExpiredListener>();

export function onSessionExpired(listener: AuthExpiredListener): () => void {
  authExpiredListeners.add(listener);
  return () => {
    authExpiredListeners.delete(listener);
  };
}

function notifySessionExpired(): void {
  authExpiredListeners.forEach((fn) => fn());
}

function base64Decode(str: string): string {
  try {
    const b64url = str.replace(/-/g, "+").replace(/_/g, "/");
    const b64 = b64url + "=".repeat((4 - (b64url.length % 4)) % 4);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    let result = "";
    for (let i = 0; i < b64.length; i += 4) {
      const a = chars.indexOf(b64.charAt(i));
      const b = chars.indexOf(b64.charAt(i + 1));
      const c = chars.indexOf(b64.charAt(i + 2));
      const d = chars.indexOf(b64.charAt(i + 3));
      if (a < 0 || b < 0) return "";
      result += String.fromCharCode((a << 2) | (b >> 4));
      if (c !== 64) {
        result += String.fromCharCode(((b & 15) << 4) | (c >> 2));
        if (d !== 64) {
          result += String.fromCharCode(((c & 3) << 6) | d);
        }
      }
    }
    return result;
  } catch {
    return "";
  }
}

const TOKEN_KEY = "user_token";

async function getToken(): Promise<string | null> {
  if (_token) return _token;
  try {
    _token = await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    _token = null;
  }
  return _token;
}

async function clearStoredAuth(): Promise<void> {
  _token = null;
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, "user"]);
  } catch {}
}

let _refreshPromise: Promise<string | null> | null = null;

async function refreshToken(): Promise<string | null> {
  if (_refreshPromise) return _refreshPromise;
  _refreshPromise = (async () => {
    const token = await getToken();
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (data.access_token) {
        await saveToken(data.access_token);
        return data.access_token;
      }
      return null;
    } catch {
      return null;
    } finally {
      _refreshPromise = null;
    }
  })();
  return _refreshPromise;
}

async function saveToken(token: string): Promise<void> {
  _token = token;
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch {}
}

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const isAuthPath = path === "/auth/login" || path === "/auth/register";
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401 && !isAuthPath && token) {
    const newToken = await refreshToken();
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    }
  }

  if (res.status === 401) {
    if (!isAuthPath && token) {
      await clearStoredAuth();
      notifySessionExpired();
      throw new Error("Session expired. Please log in again.");
    }
    const err = await res.json().catch(() => ({ error: "Unauthorized" }));
    throw new Error(err.error || "Unauthorized");
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
  await saveToken(data.access_token);
  try {
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
  await saveToken(data.access_token);
  try {
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
  await clearStoredAuth();
}

export async function getStoredUser(): Promise<User | null> {
  try {
    const raw = await AsyncStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getToken();
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const payloadStr = base64Decode(parts[1]);
  if (!payloadStr) return false;
  try {
    const payload = JSON.parse(payloadStr);
    const expMs = payload.exp ? payload.exp * 1000 : 0;
    // Never force logout because of token expiry. If the token is expired or
    // close to expiring, silently refresh it to keep the session alive. The
    // session only ends when the user logs out manually (or the token becomes
    // truly invalid, which the API layer surfaces via /auth/refresh).
    if (expMs && Date.now() >= expMs - REFRESH_BEFORE_EXPIRY_MS) {
      try {
        await refreshToken();
      } catch {
        // best effort — api() will refresh again on the first 401
      }
    }
    return true;
  } catch {
    return false;
  }
}
