import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search, Package, Tags, ArrowUpDown, ChevronDown } from "lucide-react";
import { api } from "@/services/api";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import { z } from "zod";

const productSearchSchema = z.object({
  category: z.string().optional(),
});

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category_id: string;
  selling_price: number;
  compare_price: number;
  stock: number;
  images: string[];
  is_active: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

type SortKey = "featured" | "name" | "price-asc" | "price-desc";

export const Route = createFileRoute("/_user/products")({
  validateSearch: (search: Record<string, unknown>) => productSearchSchema.parse(search),
  component: ProductsPage,
});

function ProductsPage() {
  const { category } = Route.useSearch();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const [showFilters, setShowFilters] = useState(false);

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ["user-products"],
    queryFn: () => api<Product[]>("/products"),
    staleTime: 2 * 60 * 1000,
  });

  const { data: categories } = useQuery({
    queryKey: ["user-categories"],
    queryFn: () => api<Category[]>("/categories"),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (isError) toast.error("Failed to load products");
  }, [isError]);

  const activeCategory = categories?.find((c) => c.slug === category);

  const filtered = useMemo(() => {
    let list = products ?? [];
    if (activeCategory) {
      list = list.filter((p) => p.category_id === activeCategory.id);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q)
      );
    }
    switch (sort) {
      case "name":
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "price-asc":
        list = [...list].sort((a, b) => a.selling_price - b.selling_price);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.selling_price - a.selling_price);
        break;
      default:
        list = [...list].sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0));
    }
    return list;
  }, [products, search, sort, activeCategory]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card shadow-card overflow-hidden">
            <Skeleton className="aspect-square w-full rounded-none" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col gap-4 mb-6 md:mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">
              {activeCategory ? <span data-no-translate>{activeCategory.name}</span> : "Products"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {filtered.length} item{filtered.length !== 1 ? "s" : ""}
              {activeCategory && (
                <>
                  {" "}in <span className="font-medium text-foreground" data-no-translate>{activeCategory.name}</span>
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-48 sm:w-64 pl-9"
              />
            </div>
            <Button variant="outline" size="icon" className="sm:hidden" onClick={() => setShowFilters((v) => !v)}>
              <Tags className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Category chips */}
        <div className={cn("flex flex-wrap items-center gap-2", !showFilters && "hidden sm:flex")}>
          <CategoryChip active={!activeCategory} label="All" />
          {categories?.map((c) => (
            <CategoryChip
              key={c.id}
              active={activeCategory?.id === c.id}
              label={c.name}
              slug={c.slug}
              noTranslate
            />
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <label htmlFor="sort" className="text-sm text-muted-foreground">Sort by</label>
          <div className="relative">
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-9 appearance-none rounded-lg border border-input bg-card pl-3 pr-8 text-sm font-medium shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25"
            >
              <option value="featured">Featured</option>
              <option value="name">Name</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {filtered.map((product) => (
            <ProductCardView key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Package className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="mt-4 font-medium">No products found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or filter.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-5">
            <Link to="/products">Clear filters</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

function CategoryChip({
  active,
  label,
  slug,
  noTranslate,
}: {
  active: boolean;
  label: string;
  slug?: string;
  noTranslate?: boolean;
}) {
  const content = noTranslate ? <span data-no-translate>{label}</span> : label;
  if (slug) {
    return (
      <Link
        to="/products"
        search={{ category: slug }}
        className={cn(
          "inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
          active
            ? "border-primary bg-primary text-primary-foreground shadow-glow"
            : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
        )}
      >
        {content}
      </Link>
    );
  }
  return (
    <Link
      to="/products"
      className={cn(
        "inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-glow"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
      )}
    >
      {content}
    </Link>
  );
}

function ProductCardView({ product }: { product: Product }) {
  const onSale = product.compare_price > product.selling_price;
  const lowStock = product.stock > 0 && product.stock <= 5;
  return (
    <div className="group flex flex-col rounded-xl border bg-card shadow-card overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:border-primary/30 hover:-translate-y-1">
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
        {onSale && (
          <Badge variant="destructive" className="absolute top-2 left-2">
            <Tags className="h-3 w-3" />
            Sale
          </Badge>
        )}
        {lowStock && (
          <Badge variant="warning" className="absolute top-2 right-2">Low stock</Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3 md:p-4">
        <h3 className="line-clamp-1 text-sm md:text-base font-semibold" data-no-translate>{product.name}</h3>
        <p className="mt-0.5 text-[11px] text-muted-foreground">SKU: <span data-no-translate>{product.sku}</span></p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display font-bold text-primary">{formatMoney(product.selling_price)}</span>
          {onSale && (
            <span className="text-xs text-muted-foreground line-through">{formatMoney(product.compare_price)}</span>
          )}
        </div>
        <div className="mt-auto pt-3">
          <div className="flex items-center gap-1.5">
            <span className={cn("h-1.5 w-1.5 rounded-full", product.stock > 0 ? "bg-emerald-500" : "bg-red-500")} />
            <span className="text-xs text-muted-foreground">
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>
          <Button
            className="mt-3 w-full"
            size="sm"
            disabled={product.stock === 0}
            onClick={() => toast.info("Cart coming soon — add via mobile app")}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
