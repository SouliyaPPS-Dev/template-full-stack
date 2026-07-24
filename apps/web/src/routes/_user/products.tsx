import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { getApiBase } from "@/services/api";

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  selling_price: number;
  stock: number;
  images: string[];
  is_active: boolean;
}

async function loader() {
  const base = getApiBase();
  try {
    const res = await fetch(`${base}/products`);
    if (!res.ok) return { products: [] as Product[] };
    const text = await res.text();
    if (text.startsWith("<!")) return { products: [] as Product[] };
    return { products: JSON.parse(text) as Product[] };
  } catch {
    return { products: [] as Product[] };
  }
}

export const Route = createFileRoute("/_user/products")({
  component: ProductsPage,
  loader,
});

function ProductsPage() {
  const { products } = Route.useLoaderData();

  return (
    <div>
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Products</h2>
        <span className="text-xs md:text-sm text-muted-foreground">{products?.length ?? 0} items</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
        {products?.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-square bg-muted flex items-center justify-center">
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ShoppingCart className="h-10 w-10 md:h-12 md:w-12" />
                  <span className="text-xs">No image</span>
                </div>
              )}
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="line-clamp-1 text-sm md:text-base">{product.name}</CardTitle>
              <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-xl md:text-2xl font-bold">${product.selling_price.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="sm" disabled={product.stock === 0}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
