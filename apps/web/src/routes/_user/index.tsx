import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sparkles,
  ArrowRight,
  User,
  ShieldCheck,
  Zap,
  Truck,
  Tags,
  ShoppingBag,
  Heart,
  Package,
} from "lucide-react";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/use-auth";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
}

interface Setting {
  key: string;
  value: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  selling_price: number;
  compare_price: number;
  stock: number;
  images: string[];
}

export const Route = createFileRoute("/_user/")({
  component: HomePage,
});

const categoryIcons = ["Tag", "ShoppingBag", "Box", "Layers", "Grid", "Store", "Heart", "Sparkles"];
const categoryEmoji = ["📦", "🛍️", "🎁", "📚", "👕", "🍎", "🧸", "🖥️"];

const features = [
  {
    icon: ShieldCheck,
    title: "Trusted & Secure",
    desc: "Secure authentication across web and mobile.",
  },
  {
    icon: Zap,
    title: "Fast by Design",
    desc: "High-performance APIs built with Go and Rust.",
  },
  {
    icon: Truck,
    title: "Any Screen",
    desc: "A responsive storefront that works everywhere.",
  },
];

function HomePage() {
  const user = useAuth();

  const { data: categories, isError: catError } = useQuery({
    queryKey: ["user-categories"],
    queryFn: () => api<Category[]>("/categories"),
    staleTime: 5 * 60 * 1000,
  });

  const { data: settings, isError: settingsError } = useQuery({
    queryKey: ["user-settings"],
    queryFn: () => api<Setting[]>("/settings"),
    staleTime: 5 * 60 * 1000,
  });

  const { data: products, isError: productsError } = useQuery({
    queryKey: ["user-products-featured"],
    queryFn: () => api<Product[]>("/products"),
    staleTime: 2 * 60 * 1000,
  });

  useEffect(() => {
    if (catError) toast.error("Failed to load categories");
  }, [catError]);
  useEffect(() => {
    if (settingsError) toast.error("Failed to load settings");
  }, [settingsError]);
  useEffect(() => {
    if (productsError) toast.error("Failed to load products");
  }, [productsError]);

  const storeName = settings?.find((s) => s.key === "store_name")?.value || "Template";
  const storeLogo = settings?.find((s) => s.key === "store_logo")?.value || "";
  const featured = products?.filter((p) => p.stock > 0).slice(0, 8) ?? [];

  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-4">
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent dark:from-primary/15 rounded-b-[2.5rem]" />
        <div className="text-center max-w-3xl mx-auto pt-10 md:pt-20 pb-6 md:pb-12 px-2">
          {storeLogo && (
            <img
              src={storeLogo}
              alt={storeName}
              className="mx-auto mb-5 h-20 w-20 rounded-2xl object-contain shadow-card animate-fade-up"
            />
          )}
          <Badge variant="secondary" className="mb-5 px-3 py-1 text-xs gap-1.5 animate-fade-up">
            <Sparkles className="h-3 w-3" />
            Full-stack commerce template
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold tracking-tight text-balance animate-fade-up [animation-delay:60ms]">
            Welcome to <span className="text-gradient" data-no-translate>{storeName}</span>
          </h1>
          <p className="mt-4 md:mt-5 text-base md:text-xl text-muted-foreground text-balance animate-fade-up [animation-delay:120ms]">
            A modern full-stack commerce platform — React, TanStack, Go, Rust &amp; PostgreSQL —
            tuned for every screen.
          </p>
          <div className="mt-7 md:mt-9 flex flex-col sm:flex-row gap-3 justify-center animate-fade-up [animation-delay:180ms]">
            <Button asChild size="lg" className="shadow-glow">
              <Link to="/products">
                <ShoppingBag className="h-5 w-5" />
                Browse Products
              </Link>
            </Button>
            {user ? (
              <Button asChild variant="outline" size="lg">
                <Link to="/profile">
                  <User className="h-5 w-5" />
                  My Profile
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline" size="lg">
                <Link to="/login">
                  <User className="h-5 w-5" />
                  Sign In
                </Link>
              </Button>
            )}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground animate-fade-up [animation-delay:240ms]">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Secure login</span>
            <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary" /> Instant sync</span>
            <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-primary" /> Multi-device</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="animate-fade-up">
          <div className="flex items-end justify-between mb-5 md:mb-7">
            <div>
              <h2 className="text-xl md:text-2xl font-display font-bold">Shop by Category</h2>
              <p className="text-sm text-muted-foreground mt-1">Find exactly what you need.</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="group">
              <Link to="/products">
                View all
                <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {categories.map((cat, i) => (
              <Link
                key={cat.id}
                to="/products"
                search={{ category: cat.slug }}
                className="group"
              >
                <Card className="h-full overflow-hidden hover:shadow-card-hover hover:border-primary/30 transition-all duration-300 group-hover:-translate-y-1">
                  <CardHeader className="items-center text-center py-6 md:py-8 px-4">
                    <div className="mb-3 flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 text-2xl md:text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      {categoryEmoji[i % categoryEmoji.length]}
                    </div>
                    <CardTitle className="text-xs md:text-sm font-semibold" data-no-translate>{cat.name}</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="animate-fade-up [animation-delay:80ms]">
        <div className="flex items-end justify-between mb-5 md:mb-7">
          <div>
            <h2 className="text-xl md:text-2xl font-display font-bold">Featured Products</h2>
            <p className="text-sm text-muted-foreground mt-1">Fresh picks from our catalog.</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="group">
            <Link to="/products">
              View all
              <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
        {featured.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {featured.map((product) => (
              <ProductCardView key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-card shadow-card overflow-hidden">
                <Skeleton className="aspect-square w-full rounded-none" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="animate-fade-up">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {features.map((f) => (
            <Card key={f.title} className="hover:shadow-card-hover transition-shadow">
              <CardHeader>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function ProductCardView({ product }: { product: Product }) {
  return (
    <Link to="/products" className="group">
      <Card className="overflow-hidden hover:shadow-card-hover hover:border-primary/30 transition-all duration-300 group-hover:-translate-y-1 h-full">
        <div className="relative aspect-square bg-muted overflow-hidden">
          {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            data-no-translate
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <Package className="h-10 w-10 md:h-12 md:w-12" />
              <span className="text-xs">No image</span>
            </div>
          )}
          {product.compare_price > product.selling_price && (
            <Badge variant="destructive" className="absolute top-2 left-2">
              <Tags className="h-3 w-3" />
              Sale
            </Badge>
          )}
        </div>
        <div className="p-3 md:p-4">
          <h3 className="line-clamp-1 text-sm md:text-base font-semibold" data-no-translate>{product.name}</h3>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="font-display font-bold text-primary">{formatMoney(product.selling_price)}</span>
            {product.compare_price > product.selling_price && (
              <span className="text-xs text-muted-foreground line-through">{formatMoney(product.compare_price)}</span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                product.stock > 0 ? "bg-emerald-500" : "bg-red-500"
              )}
            />
            <span className="text-xs text-muted-foreground">
              {product.stock > 0 ? "In stock" : "Out of stock"}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
