import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Download, Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { backupDatabase, exportDatabase, importDatabase } from "@/services/admin";

export const Route = createFileRoute("/_admin/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const [backupLoading, setBackupLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showStatus = (type: "success" | "error", message: string) => {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), 5000);
  };

  const handleBackup = async () => {
    setBackupLoading(true);
    try {
      await backupDatabase();
      showStatus("success", "Database backup downloaded successfully.");
    } catch (err: any) {
      showStatus("error", err.message || "Backup failed.");
    } finally {
      setBackupLoading(false);
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      await exportDatabase();
      showStatus("success", "Data export downloaded successfully.");
    } catch (err: any) {
      showStatus("error", err.message || "Export failed.");
    } finally {
      setExportLoading(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    try {
      const result = await importDatabase(file);
      showStatus(
        "success",
        `Import completed. ${result.executed} statements executed, ${result.failed} failed.`
      );
    } catch (err: any) {
      showStatus("error", err.message || "Import failed.");
    } finally {
      setImportLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 md:mb-6">Settings</h1>

      {status && (
        <div
          className={`mb-6 flex items-center gap-2 rounded-lg border p-4 ${
            status.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle className="h-5 w-5 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0" />
          )}
          <p className="text-sm">{status.message}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {/* Backup Database */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Database className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base">Backup Database</CardTitle>
                <CardDescription>Download SQL dump</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Creates a full PostgreSQL backup using pg_dump. Downloads a .sql file you can use to restore the database later.
            </p>
            <Button
              className="w-full"
              onClick={handleBackup}
              disabled={backupLoading}
            >
              {backupLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Backing up...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Backup Now
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Export Data */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Download className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-base">Export Data</CardTitle>
                <CardDescription>Download SQL data export</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Exports all table data as INSERT statements in a .sql file. Lighter than full backup and can be imported into any PostgreSQL database.
            </p>
            <Button
              className="w-full"
              variant="outline"
              onClick={handleExport}
              disabled={exportLoading}
            >
              {exportLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export Now
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Import Data */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <Upload className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-base">Import Data</CardTitle>
                <CardDescription>Upload SQL file</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Upload a .sql file to execute against the database. Use with caution — this modifies data directly.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".sql"
              className="hidden"
              onChange={handleImport}
            />
            <Button
              className="w-full"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={importLoading}
            >
              {importLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import File
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
