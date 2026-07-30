import { useState, useCallback } from "react";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL || "/api/v1";

export function useImageUpload(folder?: string) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File): Promise<string | null> => {
    setUploading(true);
    setError(null);

    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Upload failed");
      }

      const data = await res.json();
      return data.url || data.thumbnailUrl || null;
    } catch (err: any) {
      const msg = err.message || "Image upload failed";
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setUploading(false);
    }
  }, [folder]);

  const reset = useCallback(() => {
    setError(null);
    setUploading(false);
  }, []);

  return { upload, uploading, error, reset };
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem("auth_admin") || localStorage.getItem("auth_user");
    if (saved) return JSON.parse(saved).token;
  } catch {}
  return null;
}
