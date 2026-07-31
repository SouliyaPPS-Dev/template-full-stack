import { Link, useLocation, Outlet, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Store,
  LogOut,
  Menu,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutGrid,
} from "lucide-react";
import { InstallButton } from "@/components/install-button";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { adminLogout } from "@/services/api";
import { useAuth } from "@/hooks/use-auth";
import { initials } from "@/lib/format";

const navItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Products", path: "/admin/products", icon: Package },
  { label: "Orders", path: "/admin/orders", icon: ShoppingCart },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Settings", path: "/admin/settings", icon: Settings },
];

function isActive(pathname: string, path: string) {
  if (path === "/admin") return pathname === "/admin";
  return pathname.startsWith(path);
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-glow">
        <Store className="h-5 w-5" />
      </span>
      {!compact && (
        <div className="leading-tight">
          <p className="font-display font-bold tracking-tight">Admin Panel</p>
          <p className="text-[11px] text-muted-foreground">Template</p>
        </div>
      )}
    </div>
  );
}

function NavList({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-1 p-3">
      {navItems.map((item) => {
        const active = isActive(pathname, item.path);
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              active
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <item.icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110", active && "text-primary")} />
            {item.label}
            {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuth("admin");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  function handleLogout() {
    adminLogout();
    navigate({ to: "/admin/login", replace: true });
  }

  const currentLabel = navItems.find((i) => isActive(location.pathname, i.path))?.label ?? "Dashboard";

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen flex-col bg-card border-r transition-all duration-300 lg:flex",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className={cn("flex h-16 items-center border-b px-4", collapsed && "justify-center px-2")}>
          <Brand compact={collapsed} />
        </div>
        <div className={cn("flex flex-col flex-1 overflow-hidden", collapsed && "items-center")}>
          <NavList pathname={location.pathname} />
          <div className="border-t p-3 space-y-2">
            {collapsed ? (
              <Button variant="ghost" size="icon" className="w-full" onClick={() => setCollapsed(false)} title="Expand">
                <PanelLeftOpen className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <InstallButton admin className="w-full" />
                {user && (
                  <div className="flex items-center gap-2.5 rounded-lg bg-muted/60 p-2">
                    <Avatar size="sm">
                      <AvatarFallback>{initials(user.full_name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold">{user.full_name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                )}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
                <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={() => setCollapsed(true)}>
                  <PanelLeftClose className="h-4 w-4" />
                  Collapse
                </Button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b bg-card/80 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 text-sm">
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground hidden sm:inline">Admin</span>
            <span className="text-muted-foreground hidden sm:inline">/</span>
            <span className="font-medium">{currentLabel}</span>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Link
              to="/"
              className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              View store
            </Link>
            <InstallButton admin className="hidden sm:inline-flex" />
            <ThemeToggle />
            {user && (
              <div className="hidden md:flex items-center gap-2.5 pl-2 ml-1 border-l">
                <Avatar size="sm">
                  <AvatarFallback>{initials(user.full_name)}</AvatarFallback>
                </Avatar>
                <div className="leading-tight">
                  <p className="text-xs font-semibold">{user.full_name}</p>
                  <p className="text-[11px] text-muted-foreground capitalize">{user.role}</p>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onClose={() => setMobileOpen(false)} title="Admin Panel" side="left">
        <div className="flex flex-col gap-1">
          <Brand />
          <Separator className="my-3" />
          <NavList pathname={location.pathname} onNavigate={() => setMobileOpen(false)} />
          <Separator className="my-3" />
          <InstallButton admin className="w-full" />
          {user && (
            <div className="flex items-center gap-2.5 rounded-lg bg-muted/60 p-2">
              <Avatar size="sm">
                <AvatarFallback>{initials(user.full_name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">{user.full_name}</p>
                <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            className="justify-start text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
