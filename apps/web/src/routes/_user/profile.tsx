import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Calendar, Shield, Save, ArrowLeft, Loader2, Upload, Camera } from "lucide-react";
import { updateProfile, getMe, getUser, setUser, type User as UserType } from "@/services/api";
import { useImageUpload } from "@/hooks/use-image-upload";

function isClient(): boolean {
  return typeof window !== "undefined";
}

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
  const [success, setSuccess] = useState("");
  const [mounted, setMounted] = useState(false);
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setPhone(user.phone || "");
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
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (user) {
      setAvatarUrl((user as any).avatar_url || "");
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: () => updateProfile({ full_name: fullName, phone, avatar_url: avatarUrl || undefined }),
    onSuccess: (updatedUser) => {
      toast.success("Profile updated successfully!");
      setError("");
      setSuccess("");
      queryClient.setQueryData(["profile"], updatedUser);
    },
    onError: (err: Error) => {
      toast.error(err.message);
      setError("");
      setSuccess("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    mutation.mutate();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) setAvatarUrl(url);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  if (redirecting) {
    return (
      <div className="max-w-2xl mx-auto py-6 md:py-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-6 md:py-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto py-6 md:py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-6 md:mb-8">
        <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <User className="h-7 w-7 md:h-8 md:w-8 text-primary" />
          )}
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold">{user.full_name}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {/* Account Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Role</p>
              <p className="text-sm capitalize">{user.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Member Since</p>
              <p className="text-sm">
                {mounted ? formattedDate : "\u00A0"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Avatar</Label>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Camera className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
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

            <Button type="submit" disabled={mutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
