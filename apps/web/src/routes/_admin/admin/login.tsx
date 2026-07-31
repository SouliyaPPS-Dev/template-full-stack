import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminLogin } from "@/services/api";
import { ThemeToggle } from "@/components/theme-toggle";
import { Store, Eye, EyeOff, ShieldCheck } from "lucide-react";

function isClient(): boolean {
  return typeof window !== "undefined";
}

export const Route = createFileRoute("/_admin/admin/login")({
  beforeLoad: async () => {
    if (!isClient()) return;
    try {
      const { getMe, setUser } = await import("@/services/api");
      const user = await getMe("admin");
      setUser(user, "admin");
      if (user.role === "admin" || user.role === "superadmin" || user.role === "staff") {
        throw redirect({ to: "/admin" });
      }
    } catch (err: any) {
      if (err?.redirect) throw err;
    }
  },
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: () => adminLogin(email, password),
    onSuccess: (data) => {
      if (data.user.role !== "admin" && data.user.role !== "superadmin" && data.user.role !== "staff") {
        toast.error("Access denied. Admin only.");
        return;
      }
      toast.success(`Welcome, ${data.user.full_name}`);
      window.location.href = "/admin";
    },
    onError: (err: Error) => {
      toast.error(err.message || "Login failed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background px-4 py-10">
      <div className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="grid w-full max-w-4xl gap-10 lg:grid-cols-2 items-center animate-fade-up">
        <div className="hidden lg:block">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
            <Store className="h-6 w-6" />
          </div>
          <h1 className="mt-6 font-display text-4xl font-bold tracking-tight">
            Manage your store <span className="text-gradient">from anywhere.</span>
          </h1>
          <p className="mt-3 text-muted-foreground">
            Sign in to manage products, orders, and customers from a single control panel.
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary">
            <ShieldCheck className="h-4 w-4" />
            Role-based access for admins and staff
          </div>
        </div>

        <Card className="w-full shadow-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow lg:hidden">
              <Store className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl md:text-2xl font-display">Admin Panel</CardTitle>
            <p className="text-sm text-muted-foreground">Sign in to continue</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@template.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
