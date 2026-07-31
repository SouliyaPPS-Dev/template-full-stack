import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog } from "@/components/ui/dialog";
import { Plus, Package, Pencil, Trash2, Upload, Image as ImageIcon, Search } from "lucide-react";
import { api } from "@/services/api";
import { useImageUpload } from "@/hooks/use-image-upload";
import { formatMoney } from "@/lib/format";

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

interface ProductForm {
  name: string;
  slug: string;
  sku: string;
  selling_price: number;
  cost_price: number;
  stock: number;
  is_active: boolean;
  images: string[];
}

const emptyForm: ProductForm = {
  name: "", slug: "", sku: "",
  selling_price: 0, cost_price: 0,
  stock: 0, is_active: true, images: [],
};

export const Route = createFileRoute("/_admin/admin/products")({
  component: AdminProducts,
});

function AdminProducts() {
  const queryClient = useQueryClient();
  const { data: products, isLoading, isError } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => api<Product[]>("/products", undefined, "admin"),
  });

  useEffect(() => {
    if (isError) toast.error("Failed to load products");
  }, [isError]);

  const { upload, uploading } = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const createMutation = useMutation({
    mutationFn: (data: ProductForm) => api<Product>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    }, "admin"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product created successfully");
      closeForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductForm> }) => api<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }, "admin"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product updated successfully");
      closeForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api<{ message: string }>(`/products/${id}`, {
      method: "DELETE",
    }, "admin"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product deleted successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function slugify(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function openCreate() {
    setEditingProduct(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      selling_price: product.selling_price,
      cost_price: product.cost_price,
      stock: product.stock,
      is_active: product.is_active,
      images: product.images || [],
    });
    setError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingProduct(null);
    setForm(emptyForm);
    setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: form });
    } else {
      if (!form.name) { setError("Name is required"); return; }
      if (!form.slug) { setError("Slug is required"); return; }
      createMutation.mutate(form);
    }
  }

  function handleDelete(product: Product) {
    if (confirm(`Delete product "${product.name}"?`)) {
      deleteMutation.mutate(product.id);
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const filtered = products?.filter((p) =>
    !query ||
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    (p.sku || "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your product catalog.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Add Product</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="pl-9"
        />
      </div>

      <Card className="shadow-card">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-24 ml-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</th>
                    <th className="text-left p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">SKU</th>
                    <th className="text-right p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Cost</th>
                    <th className="text-right p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price</th>
                    <th className="text-right p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stock</th>
                    <th className="text-center p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="text-center p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-20">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered && filtered.length > 0 ? (
                    filtered.map((product) => (
                      <tr key={product.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                              {product.images?.[0] ? (
                                <img src={product.images[0]} alt="" className="h-10 w-10 object-cover" />
                              ) : (
                                <Package className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <span className="font-medium truncate" data-no-translate>{product.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground hidden sm:table-cell" data-no-translate>{product.sku || "—"}</td>
                        <td className="p-3 text-right text-muted-foreground hidden md:table-cell">{formatMoney(product.cost_price)}</td>
                        <td className="p-3 text-right font-display font-bold">{formatMoney(product.selling_price)}</td>
                        <td className="p-3 text-right">
                          <span className={product.stock < 10 ? "font-medium text-warning" : ""}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant={statusBadgeVariant(product.is_active ? "active" : "inactive")}>
                            {product.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(product)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(product)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-10 text-center">
                        <Package className="mx-auto h-8 w-8 text-muted-foreground/50" />
                        <p className="mt-2 text-sm text-muted-foreground">{query ? "No products match your search." : "No products yet."}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={showForm}
        onClose={closeForm}
        title={editingProduct ? "Edit Product" : "Add Product"}
        description={editingProduct ? "Update the product details below." : "Fill in the details to create a new product."}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm({ ...form, name, slug: editingProduct ? form.slug : slugify(name) });
              }}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              disabled={!!editingProduct}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Images</Label>
            <div className="flex flex-wrap gap-2">
              {form.images.map((url, i) => (
                <div key={i} className="relative group h-16 w-16 rounded-lg overflow-hidden border">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })}
                  >
                    <Trash2 className="h-4 w-4 text-white" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="h-16 w-16 rounded-lg border-2 border-dashed flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <Upload className="h-5 w-5 animate-pulse" /> : <ImageIcon className="h-5 w-5" />}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const url = await upload(file);
                if (url) setForm({ ...form, images: [...form.images, url] });
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="selling_price">Selling Price (₭)</Label>
              <Input
                id="selling_price"
                type="number"
                step="0.01"
                min="0"
                value={form.selling_price}
                onChange={(e) => setForm({ ...form, selling_price: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost_price">Cost Price (₭)</Label>
              <Input
                id="cost_price"
                type="number"
                step="0.01"
                min="0"
                value={form.cost_price}
                onChange={(e) => setForm({ ...form, cost_price: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2 flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="h-4 w-4 rounded accent-primary"
                />
                <span className="text-sm font-medium">Active</span>
              </label>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingProduct ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
