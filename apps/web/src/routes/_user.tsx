import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import {
  Store,
  ShoppingCart,
  LogIn,
  UserPlus,
  LogOut,
  Menu,
  Package,
  UserRound,
  ChevronRight,
} from "lucide-react";
import { InstallButton } from "@/components/install-button";
import { logout as apiLogout, getMe, setUser, api } from "@/services/api";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";
import { applyStoreLogo } from "@/lib/store-logo";

export const Route = createFileRoute("/_user")({
  component: UserLayout,
});

const navItems = [
  { label: "Products", to: "/products" as const, icon: Package },
  { label: "Cart", to: "/cart" as const, icon: ShoppingCart },
];

interface StoreSetting {
  key: string;
  value: string;
}

function Brand({ onClick, logoUrl, storeName }: { onClick?: () => void; logoUrl?: string; storeName?: string }) {
  return (
    <Link to="/" onClick={onClick} className="flex items-center gap-2.5 group">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={storeName || "Store"}
          className="h-9 w-9 rounded-xl object-contain transition-transform group-hover:scale-105"
        />
      ) : (
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-glow transition-transform group-hover:scale-105">
          <Store className="h-5 w-5" />
        </span>
      )}
      <span className="font-display text-lg font-bold tracking-tight" data-no-translate>
        {storeName || "Template"}
      </span>
    </Link>
  );
}

function UserLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: user, isError } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const u = await getMe("user");
      setUser(u, "user");
      return u;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const { data: settings } = useQuery({
    queryKey: ["user-settings"],
    queryFn: () => api<StoreSetting[]>("/settings"),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
    retry: false,
  });

  const storeName = settings?.find((s) => s.key === "store_name")?.value || "Template";
  const storeLogo = settings?.find((s) => s.key === "store_logo")?.value || "";

  useEffect(() => {
    applyStoreLogo(storeLogo);
  }, [storeLogo]);

  useEffect(() => {
    if (isError) toast.error("Session expired. Please login again.");
  }, [isError]);

  const handleLogout = useCallback(() => {
    apiLogout("user");
    setMenuOpen(false);
    navigate({ to: "/" });
  }, [navigate]);

  const closeMenu = () => setMenuOpen(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto h-16 px-4 flex items-center justify-between gap-3">
          <Brand logoUrl={storeLogo} storeName={storeName} />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.label}
                asChild
                variant="ghost"
                size="sm"
                className={cn(
                  "relative",
                  isActive(item.to) && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                )}
              >
                <Link to={item.to}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            ))}
            <div className="mx-1 h-5 w-px bg-border" />
            <LanguageSwitcher />
            <ThemeToggle />
            <InstallButton />
          </nav>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Button asChild variant="ghost" size="sm" className="gap-2">
                  <Link to="/profile" className="pl-1.5">
                    <Avatar size="sm" className="h-6 w-6">
                      <AvatarFallback className="text-[10px]">{initials(user.full_name)}</AvatarFallback>
                    </Avatar>
                    <span data-no-translate>{user.full_name}</span>
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login">
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/login" search={{ signup: "1" }}>
                    <UserPlus className="h-4 w-4" />
                    Register
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-1 md:hidden">
            <LanguageSwitcher />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <Sheet open={menuOpen} onClose={closeMenu} title="Menu" side="left">
        <nav className="flex flex-col gap-1">
          <Brand onClick={closeMenu} logoUrl={storeLogo} storeName={storeName} />
          <Separator className="my-2" />
          {navItems.map((item) => (
            <Button
              key={item.label}
              asChild
              variant="ghost"
              className={cn(
                "justify-between",
                isActive(item.to) && "bg-primary/10 text-primary"
              )}
              onClick={closeMenu}
            >
              <Link to={item.to}>
                <span className="flex items-center gap-2.5">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </Button>
          ))}
          <Separator className="my-2" />
          {user ? (
            <>
              <Button
                asChild
                variant="ghost"
                className={cn("justify-between", isActive("/profile") && "bg-primary/10 text-primary")}
                onClick={closeMenu}
              >
                <Link to="/profile">
                  <span className="flex items-center gap-2.5">
                    <UserRound className="h-4 w-4" />
                    <span data-no-translate>{user.full_name}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start text-destructive" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="outline" onClick={closeMenu}>
                <Link to="/login">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
              </Button>
              <Button asChild onClick={closeMenu}>
                <Link to="/login" search={{ signup: "1" }}>
                  <UserPlus className="h-4 w-4" />
                  Register
                </Link>
              </Button>
            </>
          )}
          <div className="mt-4 flex items-center justify-between">
            <LanguageSwitcher />
            <InstallButton className="w-full ml-3" />
          </div>
        </nav>
      </Sheet>

      <main className="flex-1 container mx-auto px-4 py-6 md:py-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/40">
        <div className="container mx-auto px-4 py-10 md:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <Brand logoUrl={storeLogo} storeName={storeName} />
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                A full-stack commerce template built with React, TanStack, Go, Rust, Python and PostgreSQL.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold mb-3">Shop</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/products" className="hover:text-primary transition-colors">All Products</Link></li>
                <li><Link to="/cart" className="hover:text-primary transition-colors">Cart</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold mb-3">Account</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {user ? (
                  <>
                    <li><Link to="/profile" className="hover:text-primary transition-colors">My Profile</Link></li>
                    <li>
                      <button onClick={handleLogout} className="hover:text-primary transition-colors">
                        Logout
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li><Link to="/login" className="hover:text-primary transition-colors">Sign In</Link></li>
                    <li><Link to="/login" search={{ signup: "1" }} className="hover:text-primary transition-colors">Register</Link></li>
                  </>
                )}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold mb-3">Status</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>API: available</li>
                <li>Database: PostgreSQL</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Template. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <span>Web · API · Mobile — one codebase, every screen.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
