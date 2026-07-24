import { useState, useEffect } from "react";
import { onAuthChange, getUser, type User, type UserType } from "@/services/api";

export function useAuth(userType: UserType = "user"): User | null {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(getUser(userType));
    const unsub = onAuthChange(userType, (u: User | null) => setUser(u));
    return unsub;
  }, [userType]);

  return mounted ? user : null;
}
