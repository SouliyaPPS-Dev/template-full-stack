const API_BASE = import.meta.env.VITE_API_URL || "/api/v1";
const IS_PRODUCTION = import.meta.env.MODE === "production" || API_BASE.includes("hf.space");

function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem("auth_admin");
    if (saved) return JSON.parse(saved).token;
  } catch {}
  return null;
}

export async function backupDatabase(): Promise<void> {
  if (IS_PRODUCTION) {
    throw new Error("Backup is only available in development mode. Use 'hf bucket' CLI to manage production data.");
  }
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/admin/backup`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let err: { error?: string } = {};
    if (text) try { err = JSON.parse(text); } catch {}
    throw new Error(err.error || `Backup failed: ${res.status}`);
  }

  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") || "";
  const filenameMatch = disposition.match(/filename="?(.+?)"?$/);
  const filename = filenameMatch?.[1] || `backup_${new Date().toISOString().slice(0, 10)}.sql`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export interface ExportData {
  tables: Record<string, unknown[]>;
  exported_at: string;
}

export async function exportDatabase(): Promise<void> {
  if (IS_PRODUCTION) {
    throw new Error("Export is only available in development mode. Use 'hf bucket' CLI to manage production data.");
  }
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/admin/export`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let err: { error?: string } = {};
    if (text) try { err = JSON.parse(text); } catch {}
    throw new Error(err.error || `Export failed: ${res.status}`);
  }

  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") || "";
  const filenameMatch = disposition.match(/filename="?(.+?)"?$/);
  const filename = filenameMatch?.[1] || `export_${new Date().toISOString().slice(0, 10)}.sql`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export interface ImportResult {
  message: string;
  executed: number;
  failed: number;
}

export async function importDatabase(file: File): Promise<ImportResult> {
  if (IS_PRODUCTION) {
    throw new Error("Import is only available in development mode. Use 'hf bucket' CLI to manage production data.");
  }
  const token = getAdminToken();
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/admin/import`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let err: { error?: string } = {};
    if (text) try { err = JSON.parse(text); } catch {}
    throw new Error(err.error || `Import failed: ${res.status}`);
  }

  return res.json();
}
