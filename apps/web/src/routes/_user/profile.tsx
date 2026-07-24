import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Calendar, Shield, Save, ArrowLeft, Loader2 } from "lucide-react";
import { updateProfile, isAuthenticated, getMe, getUser, type User as UserType } from "@/services/api";

function isClient(): boolean {
  return typeof window !== "undefined";
}

function getStoredUser(): UserType | null {
  if (!isClient()) return null;
  return getUser("user");
}

async function loader() {
  if (!isClient()) return { user: null as UserType | null };
  try {
    const user = await getMe();
    return { user };
  } catch {
    return { user: getStoredUser() };
  }
}

export const Route = createFileRoute("/_user/profile")({
  beforeLoad: () => {
    if (!isClient()) return;
    if (!isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
  component: ProfilePage,
  loader,
});

function ProfilePage() {
  const queryClient = useQueryClient();
  const { user: initialUser } = Route.useLoaderData();

  const { data: user, isLoading } = useQuery<UserType | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      try {
        return await getMe();
      } catch {
        return getStoredUser();
      }
    },
    initialData: initialUser ?? getStoredUser(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const storedUser = user;

  const [fullName, setFullName] = useState(storedUser?.full_name || "");
  const [phone, setPhone] = useState(storedUser?.phone || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mounted, setMounted] = useState(false);
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    setMounted(true);
    if (storedUser?.created_at) {
      setFormattedDate(
        new Date(storedUser.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    }
  }, [storedUser?.created_at]);

  const mutation = useMutation({
    mutationFn: () => updateProfile({ full_name: fullName, phone }),
    onSuccess: (updatedUser) => {
      setSuccess("Profile updated successfully!");
      setError("");
      queryClient.setQueryData(["profile"], updatedUser);
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err: Error) => {
      setError(err.message);
      setSuccess("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    mutation.mutate();
  };

  if (isLoading || !storedUser) {
    return (
      <div className="max-w-2xl mx-auto py-6 md:py-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
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
        <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-7 w-7 md:h-8 md:w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold">{storedUser.full_name}</h1>
          <p className="text-sm text-muted-foreground">{storedUser.email}</p>
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
              <p className="text-sm">{storedUser.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Role</p>
              <p className="text-sm capitalize">{storedUser.role}</p>
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
            {success && <p className="text-sm text-green-600">{success}</p>}

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
