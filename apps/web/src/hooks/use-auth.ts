import { useState, useEffect } from "react";
import { onAuthChange, getUser, type User } from "@/services/api";

export function useAuth(): User | null {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getUser());
    const unsub = onAuthChange((u) => setUser(u));
    return unsub;
  }, []);

  return user;
}
