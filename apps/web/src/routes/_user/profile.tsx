import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Mail, Shield, Calendar, Save, ArrowLeft, Loader2, Upload } from "lucide-react";
import { updateProfile, getMe, setUser, type User as UserType } from "@/services/api";
import { useImageUpload } from "@/hooks/use-image-upload";
import { initials } from "@/lib/format";

export const Route = createFileRoute("/_user/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const queryClient = useQueryClient();
  const [redirecting, setRedirecting] = useState(false);

  const { data: user, isLoading, isError } = useQuery<UserType | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      const u = await getMe();
      if (!u) throw new Error("not authenticated");
      setUser(u, "user");
      return u;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: false,
  });

  useEffect(() => {
    if ((isError || (!isLoading && !user)) && !redirecting) {
      toast.error("Session expired. Please login again.");
      setRedirecting(true);
      window.location.href = "/login";
    }
  }, [isError, isLoading, user, redirecting]);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [mounted, setMounted] = useState(false);
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setPhone(user.phone || "");
      setAvatarUrl((user as any).avatar_url || "");
    }
  }, [user]);

  useEffect(() => {
    setMounted(true);
    if (user?.created_at) {
      setFormattedDate(
        new Date(user.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    }
  }, [user?.created_at]);

  const { upload: uploadImage, uploading: imageUploading } = useImageUpload();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: () => updateProfile({ full_name: fullName, phone, avatar_url: avatarUrl || undefined }),
    onSuccess: (updatedUser) => {
      toast.success("Profile updated successfully!");
      setError("");
      queryClient.setQueryData(["profile"], updatedUser);
    },
    onError: (err: Error) => {
      toast.error(err.message);
      setError("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    mutation.mutate();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) setAvatarUrl(url);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  if (redirecting || isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-6 md:py-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto py-6 md:py-8 space-y-6 animate-fade-up">
      <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </Button>

      {/* Profile header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-violet-600 p-6 md:p-8 text-primary-foreground shadow-card">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="flex items-center gap-4">
          <Avatar size="lg" className="ring-2 ring-white/40">
            <AvatarImage src={avatarUrl} />
            {!avatarUrl && <AvatarFallback className="bg-white/20 text-white">{initials(user.full_name)}</AvatarFallback>}
          </Avatar>
          <div className="min-w-0">
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight truncate" data-no-translate>{user.full_name}</h1>
            <p className="text-sm text-primary-foreground/80 truncate" data-no-translate>{user.email}</p>
            <Badge variant={statusBadgeVariant(user.role)} className="mt-2 capitalize border-transparent bg-white/20 text-white" data-no-translate>
              {user.role}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Account Info */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base md:text-lg font-display">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Mail className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm truncate" data-no-translate>{user.email}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Shield className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground">Role</p>
                <p className="text-sm capitalize" data-no-translate>{user.role}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Calendar className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground">Member Since</p>
                <p className="text-sm" data-no-translate>{mounted ? formattedDate : "\u00A0"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base md:text-lg font-display">Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Avatar</Label>
                <div className="flex items-center gap-3">
                  <Avatar size="md">
                    <AvatarImage src={avatarUrl} />
                    {!avatarUrl && <AvatarFallback>{initials(fullName || "?")}</AvatarFallback>}
                  </Avatar>
                  <Button type="button" variant="outline" size="sm" onClick={() => avatarInputRef.current?.click()} disabled={imageUploading}>
                    <Upload className="h-4 w-4 mr-2" />
                    {imageUploading ? "Uploading..." : "Upload Photo"}
                  </Button>
                  <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+856 20 000 000"
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" disabled={mutation.isPending} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                {mutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
