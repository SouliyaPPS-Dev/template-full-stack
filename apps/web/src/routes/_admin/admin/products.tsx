import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package } from "lucide-react";
import { api } from "@/services/api";

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  selling_price: number;
  cost_price: number;
  stock: number;
  is_active: boolean;
  images: string[];
}

async function loader() {
  try {
    const products = await api<Product[]>("/products", undefined, "admin");
    return { products };
  } catch {
    return { products: [] as Product[] };
  }
}

export const Route = createFileRoute("/_admin/admin/products")({
  component: AdminProducts,
  loader,
});

function AdminProducts() {
  const { products: serverProducts } = Route.useLoaderData();
  const { data: clientProducts, isLoading, isError } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => api<Product[]>("/products", undefined, "admin"),
  });

  const products: Product[] = clientProducts || serverProducts;

  useEffect(() => {
    if (isError) {
      toast.error("Failed to load products");
    }
  }, [isError]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Products</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Add Product</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Product</th>
                  <th className="text-left p-3 font-medium hidden sm:table-cell">SKU</th>
                  <th className="text-right p-3 font-medium hidden md:table-cell">Cost</th>
                  <th className="text-right p-3 font-medium">Price</th>
                  <th className="text-right p-3 font-medium">Stock</th>
                  <th className="text-center p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">Loading...</td>
                  </tr>
                ) : products && products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-muted rounded flex items-center justify-center shrink-0">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt="" className="h-10 w-10 rounded object-cover" />
                            ) : (
                              <Package className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <span className="font-medium truncate">{product.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground hidden sm:table-cell">{product.sku}</td>
                      <td className="p-3 text-right hidden md:table-cell">${product.cost_price.toFixed(2)}</td>
                      <td className="p-3 text-right font-medium">${product.selling_price.toFixed(2)}</td>
                      <td className="p-3 text-right">
                        <span className={product.stock < 10 ? "text-orange-600 font-medium" : ""}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${product.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {product.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">No products yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
