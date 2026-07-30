import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Store, Tag, ArrowRight, User, Loader2 } from "lucide-react";
import { api, getApiBase } from "@/services/api";
import { useAuth } from "@/hooks/use-auth";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Setting {
  key: string;
  value: string;
}

const IS_PRODUCTION = import.meta.env.MODE === "production" || (typeof window !== "undefined" && window.location.hostname !== "localhost");

async function loader() {
  if (IS_PRODUCTION) {
    try {
      const [categories, settings] = await Promise.all([
        api<Category[]>("/categories"),
        api<Setting[]>("/settings"),
      ]);
      return { categories: categories || [], settings: settings || [] };
    } catch {
      return { categories: [], settings: [] };
    }
  }
  const base = getApiBase();

  async function fetchJson<T>(url: string, fallback: T): Promise<T> {
    try {
      const res = await fetch(url);
      if (!res.ok) return fallback;
      const text = await res.text();
      if (text.startsWith("<!")) return fallback;
      return JSON.parse(text) as T;
    } catch {
      return fallback;
    }
  }

  const [categories, settings] = await Promise.all([
    fetchJson<Category[]>(`${base}/categories`, []),
    fetchJson<Setting[]>(`${base}/settings`, []),
  ]);
  return { categories, settings };
}

export const Route = createFileRoute("/_user/")({
  component: HomePage,
  pendingComponent: () => (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  ),
  loader,
});

function HomePage() {
  const { categories, settings } = Route.useLoaderData();
  const user = useAuth();

  useEffect(() => {
    if (!categories?.length && !settings?.length && IS_PRODUCTION) {
      toast.error("Failed to load homepage data");
    }
  }, [categories, settings]);

  const storeName = settings?.find((s) => s.key === "store_name")?.value || "Template";

  return (
    <div className="flex flex-col gap-12 md:gap-16 py-4 md:py-8">
      {/* Hero */}
      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 md:mb-4">
          Welcome to {storeName}
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 px-2">
          Full-stack e-commerce platform built with React, Go API, and PostgreSQL.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg">
            <Link to="/products">
              <Store className="mr-2 h-5 w-5" />
              Browse Products
            </Link>
          </Button>
          {user ? (
            <Button asChild variant="outline" size="lg">
              <Link to="/profile">
                <User className="mr-2 h-5 w-5" />
                My Profile
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" size="lg">
              <Link to="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold">Categories</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/products">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {categories.map((cat) => (
              <Card key={cat.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="items-center text-center py-4 md:py-6">
                  <Tag className="h-6 w-6 md:h-8 md:w-8 mb-2 text-primary" />
                  <CardTitle className="text-xs md:text-sm">{cat.name}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <Store className="h-7 w-7 md:h-8 md:w-8 mb-2 text-primary" />
              <CardTitle className="text-sm">Wide Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Browse through our curated collection of products across multiple categories.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <ShoppingCart className="h-7 w-7 md:h-8 md:w-8 mb-2 text-primary" />
              <CardTitle className="text-sm">Easy Shopping</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Add items to your cart, review your order, and checkout in seconds.</p>
            </CardContent>
          </Card>
          <Card className="sm:col-span-2 md:col-span-1">
            <CardHeader>
              <Tag className="h-7 w-7 md:h-8 md:w-8 mb-2 text-primary" />
              <CardTitle className="text-sm">Best Prices</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Competitive pricing with regular promotions and discounts.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
