import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Download, Upload, Loader2 } from "lucide-react";
import { backupDatabase, exportDatabase, importDatabase } from "@/services/admin";

export const Route = createFileRoute("/_admin/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const [backupLoading, setBackupLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackup = async () => {
    setBackupLoading(true);
    try {
      await backupDatabase();
      toast.success("Database backup downloaded successfully.");
    } catch (err: any) {
      toast.error(err.message || "Backup failed.");
    } finally {
      setBackupLoading(false);
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      await exportDatabase();
      toast.success("Data export downloaded successfully.");
    } catch (err: any) {
      toast.error(err.message || "Export failed.");
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
      toast.success(`Import completed. ${result.executed} executed, ${result.failed} failed.`);
    } catch (err: any) {
      toast.error(err.message || "Import failed.");
    } finally {
      setImportLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Database backup, export, and import tools.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Backup Database */}
        <Card className="shadow-card hover:shadow-card-hover transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Database className="h-5 w-5" />
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
              variant="outline"
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
        <Card className="shadow-card hover:shadow-card-hover transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Download className="h-5 w-5" />
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
        <Card className="shadow-card hover:shadow-card-hover transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Upload className="h-5 w-5" />
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
