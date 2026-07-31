import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Users, Pencil, Trash2, Eye, EyeOff, Upload } from "lucide-react";
import { api } from "@/services/api";
import { useImageUpload } from "@/hooks/use-image-upload";
import { initials, formatDate } from "@/lib/format";

interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  avatar_url?: string;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
}

interface UserForm {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  role: string;
  avatar_url: string;
}

const emptyForm: UserForm = { email: "", password: "", full_name: "", phone: "", role: "user", avatar_url: "" };

function roleBadgeVariant(role: string) {
  switch (role) {
    case "superadmin": return "destructive" as const;
    case "admin": return "default" as const;
    case "staff": return "secondary" as const;
    default: return "outline" as const;
  }
}

export const Route = createFileRoute("/_admin/admin/users")({
  component: AdminUsers,
});

function AdminUsers() {
  const queryClient = useQueryClient();
  const { upload: uploadImage, uploading: imageUploading } = useImageUpload();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { data: users, isLoading, isError } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api<User[]>("/users", undefined, "admin"),
  });

  useEffect(() => {
    if (isError) toast.error("Failed to load users");
  }, [isError]);

  const createMutation = useMutation({
    mutationFn: (data: UserForm) => api<User>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    }, "admin"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User created successfully");
      closeForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserForm> }) => api<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }, "admin"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User updated successfully");
      closeForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api<{ message: string }>(`/users/${id}`, {
      method: "DELETE",
    }, "admin"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User deleted successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function openCreate() {
    setEditingUser(null);
    setForm(emptyForm);
    setError("");
    setShowPassword(false);
    setShowForm(true);
  }

  function openEdit(user: User) {
    setEditingUser(user);
    setForm({
      email: user.email,
      password: "",
      full_name: user.full_name,
      phone: user.phone,
      role: user.role,
      avatar_url: user.avatar_url || "",
    });
    setError("");
    setShowPassword(false);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingUser(null);
    setForm(emptyForm);
    setError("");
    setShowPassword(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (editingUser) {
      const data: Partial<UserForm> = {
        full_name: form.full_name,
        phone: form.phone,
        role: form.role,
        avatar_url: form.avatar_url,
      };
      updateMutation.mutate({ id: editingUser.id, data });
    } else {
      if (!form.password) {
        setError("Password is required");
        return;
      }
      createMutation.mutate(form);
    }
  }

  function handleDelete(user: User) {
    if (confirm(`Delete user "${user.full_name}"?`)) {
      deleteMutation.mutate(user.id);
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage user accounts and roles.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Add User</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-5 w-16 rounded-full ml-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">User</th>
                    <th className="text-left p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Phone</th>
                    <th className="text-center p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</th>
                    <th className="text-center p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="text-left p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Joined</th>
                    <th className="text-center p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users && users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <Avatar size="sm">
                              <AvatarImage src={user.avatar_url} />
                              {!user.avatar_url && <AvatarFallback>{initials(user.full_name)}</AvatarFallback>}
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium truncate" data-no-translate>{user.full_name}</p>
                              <p className="text-xs text-muted-foreground truncate" data-no-translate>{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground hidden sm:table-cell" data-no-translate>{user.phone || "—"}</td>
                        <td className="p-3 text-center">
                          <Badge variant={roleBadgeVariant(user.role)} className="capitalize" data-no-translate>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant={statusBadgeVariant(user.is_active ? "active" : "inactive")}>
                            {user.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground hidden md:table-cell" data-no-translate>{formatDate(user.created_at)}</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(user)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(user)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-10 text-center">
                        <Users className="mx-auto h-8 w-8 text-muted-foreground/50" />
                        <p className="mt-2 text-sm text-muted-foreground">No users yet.</p>
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
        title={editingUser ? "Edit User" : "Add User"}
        description={editingUser ? "Update the user's profile below." : "Create a new user account."}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={!!editingUser}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Avatar</Label>
            <div className="flex items-center gap-3">
              <Avatar size="md">
                <AvatarImage src={form.avatar_url} />
                {!form.avatar_url && <AvatarFallback>{initials(form.full_name || "?")}</AvatarFallback>}
              </Avatar>
              <Button type="button" variant="outline" size="sm" onClick={() => avatarInputRef.current?.click()} disabled={imageUploading}>
                <Upload className="h-4 w-4 mr-2" />
                {imageUploading ? "Uploading..." : "Upload"}
              </Button>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const url = await uploadImage(file);
                if (url) setForm({ ...form, avatar_url: url });
                if (avatarInputRef.current) avatarInputRef.current.value = "";
              }} />
            </div>
          </div>

          {!editingUser && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:border-ring"
            >
              <option value="user">User</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingUser ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
