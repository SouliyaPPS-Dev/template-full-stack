import { Link, useLocation, Outlet, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, Store, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/services/api";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Products", path: "/admin/products", icon: Package },
  { label: "Orders", path: "/admin/orders", icon: ShoppingCart },
  { label: "Customers", path: "/admin/customers", icon: Users },
  { label: "Settings", path: "/admin/settings", icon: Settings },
];

function isActive(pathname: string, path: string) {
  if (path === "/admin") return pathname === "/admin";
  return pathname.startsWith(path);
}

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuth();

  function handleLogout() {
    logout();
    navigate({ to: "/admin/login", replace: true });
  }

  return (
    <div className="flex min-h-screen bg-muted">
      <aside className="w-64 bg-primary text-primary-foreground flex-col hidden md:flex">
        <div className="p-4 border-b border-primary-foreground/20">
          <h1 className="flex items-center gap-2 text-xl font-bold">
            <Store className="h-6 w-6" />
            Admin Panel
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive(location.pathname, item.path)
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "hover:bg-primary-foreground/10 text-primary-foreground/70 hover:text-primary-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-primary-foreground/20 space-y-3">
          {user && (
            <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
              <div className="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center shrink-0">
                <User className="h-4 w-4" />
              </div>
              <div className="truncate">
                <p className="font-medium truncate">{user.full_name}</p>
                <p className="text-xs text-primary-foreground/50 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-primary-foreground/50 hover:text-primary-foreground transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}
