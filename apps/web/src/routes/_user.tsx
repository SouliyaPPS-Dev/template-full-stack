import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Store, ShoppingCart, LogIn, UserPlus, User, LogOut, Menu, X } from "lucide-react";
import { logout as apiLogout } from "@/services/api";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_user")({
  component: UserLayout,
});

function UserLayout() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useAuth();

  const handleLogout = useCallback(() => {
    apiLogout();
    setMenuOpen(false);
    navigate({ to: "/" });
  }, [navigate]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg" onClick={closeMenu}>
            <Store className="h-6 w-6" />
            Template
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/products">Products</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/cart">
                <ShoppingCart className="h-4 w-4 mr-1" />
                Cart
              </Link>
            </Button>
            {user ? (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/profile">
                    <User className="h-4 w-4 mr-1" />
                    {user.full_name}
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link to="/login">
                    <LogIn className="h-4 w-4 mr-1" />
                    Sign In
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/login" search={{ signup: "1" }}>
                    <UserPlus className="h-4 w-4 mr-1" />
                    Register
                  </Link>
                </Button>
              </>
            )}
          </nav>

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="container mx-auto px-4 py-3 flex flex-col gap-2">
              <Button asChild variant="ghost" size="sm" className="justify-start" onClick={closeMenu}>
                <Link to="/products">Products</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="justify-start" onClick={closeMenu}>
                <Link to="/cart">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Cart
                </Link>
              </Button>
              <hr className="my-1" />
              {user ? (
                <>
                  <Button asChild variant="ghost" size="sm" className="justify-start" onClick={closeMenu}>
                    <Link to="/profile">
                      <User className="h-4 w-4 mr-2" />
                      {user.full_name}
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start text-destructive" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" size="sm" onClick={closeMenu}>
                    <Link to="/login">
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </Link>
                  </Button>
                  <Button asChild size="sm" onClick={closeMenu}>
                    <Link to="/login" search={{ signup: "1" }}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Register
                    </Link>
                  </Button>
                </>
              )}
            </nav>
          </div>
        )}
      </header>
      <main className="container mx-auto px-4 py-6 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}
