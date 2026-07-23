import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Store, Tag, ArrowRight, User } from "lucide-react";
import { isAuthenticated, getApiBase } from "@/services/api";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Setting {
  key: string;
  value: string;
}

async function loader() {
  const base = getApiBase();
  const [categories, settings] = await Promise.all([
    fetch(`${base}/categories`).then((r) => r.json()) as Promise<Category[]>,
    fetch(`${base}/settings`).then((r) => r.json()) as Promise<Setting[]>,
  ]);
  return { categories, settings };
}

export const Route = createFileRoute("/_user/")({
  component: HomePage,
  loader,
});

function HomePage() {
  const { categories, settings } = Route.useLoaderData();

  const storeName = settings?.find((s) => s.key === "store_name")?.value || "MyStore";
  const loggedIn = isAuthenticated();

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
          {loggedIn ? (
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
