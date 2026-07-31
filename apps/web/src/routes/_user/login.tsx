import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, register } from "@/services/api";
import { ArrowLeft, Eye, EyeOff, Store, ShieldCheck, Zap, Truck } from "lucide-react";
import { z } from "zod";

const loginSearchSchema = z.object({
  signup: z.string().optional(),
});

function isClient(): boolean {
  return typeof window !== "undefined";
}

export const Route = createFileRoute("/_user/login")({
  validateSearch: (search: Record<string, unknown>) =>
    loginSearchSchema.parse(search),
  beforeLoad: async () => {
    if (!isClient()) return;
    try {
      const { getMe, setUser } = await import("@/services/api");
      const user = await getMe();
      setUser(user, "user");
      throw redirect({ to: "/" });
    } catch (err: any) {
      if (err?.redirect) throw err;
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const { signup } = Route.useSearch();
  const [isSignUp, setIsSignUp] = useState(signup === "1");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: () => isSignUp ? register(email, password, fullName, phone) : login(email, password),
    onSuccess: () => {
      window.location.href = "/";
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate();
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-center max-w-5xl mx-auto py-6 md:py-12">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
          <Store className="h-6 w-6" />
        </div>
        <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-balance">
          One account. <span className="text-gradient">Every screen.</span>
        </h1>
        <p className="mt-4 text-muted-foreground leading-relaxed max-w-sm">
          Sign in once and access your profile, orders and cart across the web app and mobile app.
        </p>
        <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
          <li className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><ShieldCheck className="h-4 w-4" /></span>
            Secure authentication with JWT
          </li>
          <li className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><Zap className="h-4 w-4" /></span>
            Syncs across devices
          </li>
          <li className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><Truck className="h-4 w-4" /></span>
            Orders &amp; quotes in one place
          </li>
        </ul>
      </div>

      {/* Form */}
      <div className="w-full">
        <div className="mb-4">
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Home
            </Link>
          </Button>
        </div>
        <Card className="shadow-card-hover">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl md:text-2xl font-display">
              {isSignUp ? "Create Account" : "Welcome back"}
            </CardTitle>
            <CardDescription>
              {isSignUp
                ? "Join us — it takes less than a minute."
                : "Enter your details to sign in."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input
                      id="phone"
                      placeholder="+856 20 000 000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
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
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loginMutation.isPending}>
                {loginMutation.isPending
                  ? "Please wait..."
                  : isSignUp
                    ? "Create Account"
                    : "Sign In"}
              </Button>
            </form>

            <div className="mt-5 text-center text-sm text-muted-foreground">
              {isSignUp ? (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => { setIsSignUp(false); setError(""); }}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign In
                  </button>
                </p>
              ) : (
                <p>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => { setIsSignUp(true); setError(""); }}
                    className="text-primary hover:underline font-medium"
                  >
                    Create one
                  </button>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
