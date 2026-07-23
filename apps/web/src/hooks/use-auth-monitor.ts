import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

function isClient(): boolean {
  return typeof window !== "undefined";
}

function getToken(): string | null {
  if (!isClient()) return null;
  return localStorage.getItem("admin_token");
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export function useAuthMonitor(redirectTo: string = "/admin/login") {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isClient()) return;

    function check() {
      const token = getToken();
      if (!token || isTokenExpired(token)) {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        navigate({ to: redirectTo, replace: true });
      }
    }

    // Check immediately
    check();

    // Listen for localStorage changes (other tabs/windows)
    function onStorage(e: StorageEvent) {
      if (e.key === "admin_token") {
        check();
      }
    }
    window.addEventListener("storage", onStorage);

    // Periodic check every 30 seconds
    const interval = setInterval(check, 30000);

    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(interval);
    };
  }, [navigate, redirectTo]);
}
