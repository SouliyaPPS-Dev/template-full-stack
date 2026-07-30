import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Package, Pencil, Trash2, X, Upload, Image as ImageIcon } from "lucide-react";
import { api } from "@/services/api";
import { useImageUpload } from "@/hooks/use-image-upload";

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

  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Products</h1>
        <Button onClick={openCreate}>
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
                  <th className="text-center p-3 font-medium w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">Loading...</td>
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
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">No products yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeForm}>
          <div className="bg-background rounded-xl shadow-lg w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editingProduct ? "Edit Product" : "Add Product"}</h2>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={closeForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>

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
                    <div key={i} className="relative group h-16 w-16 rounded-md overflow-hidden border">
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
                    className="h-16 w-16 rounded-md border-2 border-dashed flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
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
                  <Label htmlFor="selling_price">Selling Price</Label>
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
                  <Label htmlFor="cost_price">Cost Price</Label>
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
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm font-medium">Active</span>
                  </label>
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : editingProduct ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
