import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Database, Download, Upload, Loader2, Store, ImagePlus, Trash2, Save } from "lucide-react";
import { backupDatabase, exportDatabase, importDatabase, getSettings, updateSettings } from "@/services/admin";

export const Route = createFileRoute("/_admin/admin/settings")({
  component: AdminSettings,
});

function fileToResizedDataUrl(file: File, maxSize = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        if (scale >= 1) {
          resolve(reader.result as string);
          return;
        }
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, w, h);
        const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
        resolve(canvas.toDataURL(mime, 0.85));
      };
      img.onerror = () => reject(new Error("Invalid image file"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}

function AdminSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, isError } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: getSettings,
  });

  const [backupLoading, setBackupLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [storeName, setStoreName] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState("");
  const [logoSaving, setLogoSaving] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isError) toast.error("Failed to load settings");
  }, [isError]);

  useEffect(() => {
    const s = settings?.find((x) => x.key === "store_name");
    if (s && typeof s.value === "string") setStoreName(s.value);
  }, [settings]);

  const currentLogo = (settings?.find((s) => s.key === "store_logo")?.value as string) || "";
  const logoShown = logoPreview || currentLogo;

  const refreshSettings = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    queryClient.invalidateQueries({ queryKey: ["user-settings"] });
  };

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

  const handleSaveName = async () => {
    setNameSaving(true);
    try {
      await updateSettings([{ key: "store_name", value: storeName.trim() }]);
      toast.success("Store name updated.");
      refreshSettings();
    } catch (err: any) {
      toast.error(err.message || "Failed to update store name.");
    } finally {
      setNameSaving(false);
    }
  };

  const handleLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await fileToResizedDataUrl(file);
      setLogoPreview(url);
    } catch (err: any) {
      toast.error(err.message || "Failed to read image.");
    } finally {
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const handleSaveLogo = async () => {
    if (!logoPreview) return;
    setLogoSaving(true);
    try {
      await updateSettings([{ key: "store_logo", value: logoPreview }]);
      toast.success("Store logo updated.");
      setLogoPreview("");
      refreshSettings();
    } catch (err: any) {
      toast.error(err.message || "Failed to update store logo.");
    } finally {
      setLogoSaving(false);
    }
  };

  const handleRemoveLogo = async () => {
    setLogoSaving(true);
    try {
      await updateSettings([{ key: "store_logo", value: "" }]);
      toast.success("Store logo removed.");
      setLogoPreview("");
      refreshSettings();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove store logo.");
    } finally {
      setLogoSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Store information, logo, and database tools.</p>
      </div>

      {/* Store Settings */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Store Name */}
        <Card className="shadow-card hover:shadow-card-hover transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Store Name</CardTitle>
                <CardDescription>Shown on the storefront hero and header</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="store-name">Store name</Label>
              <Input
                id="store-name"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="My Store"
                disabled={isLoading}
              />
            </div>
            <Button
              className="mt-4 w-full"
              onClick={handleSaveName}
              disabled={nameSaving || isLoading}
            >
              {nameSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Store Name
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Store Logo */}
        <Card className="shadow-card hover:shadow-card-hover transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <ImagePlus className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Store Logo</CardTitle>
                <CardDescription>Uploaded logo appears on the storefront</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                {logoShown ? (
                  <div className="flex items-center justify-center rounded-xl border bg-muted/40 p-4">
                    <img
                      src={logoShown}
                      alt="Store logo"
                      className="max-h-20 max-w-full object-contain rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed text-sm text-muted-foreground">
                    No logo uploaded yet
                  </div>
                )}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoFile}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={logoSaving}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {logoPreview ? "Change" : "Upload Logo"}
                  </Button>
                  {logoPreview && (
                    <Button
                      className="flex-1"
                      onClick={handleSaveLogo}
                      disabled={logoSaving}
                    >
                      {logoSaving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Save Logo
                    </Button>
                  )}
                  {!logoPreview && currentLogo && (
                    <Button
                      variant="ghost"
                      className="flex-1 text-destructive hover:text-destructive"
                      onClick={handleRemoveLogo}
                      disabled={logoSaving}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Database Tools */}
      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-3">Database</h2>
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
                Creates a full database backup. Downloads a .sql file you can use to restore the database later.
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
                Exports all table data as SQL statements. Lighter than full backup and can be imported into any database.
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
    </div>
  );
}
