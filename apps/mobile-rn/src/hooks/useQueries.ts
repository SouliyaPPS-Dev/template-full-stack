import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, healthCheck, testAllEndpoints } from "../services/api";
import { Product, Category, Order, Setting, User } from "../types";

export function useHealthCheck() {
  return useQuery({
    queryKey: ["health"],
    queryFn: healthCheck,
    retry: 2,
    staleTime: 30_000,
  });
}

export function useTestEndpoints() {
  return useQuery({
    queryKey: ["test-endpoints"],
    queryFn: testAllEndpoints,
    retry: false,
    staleTime: Infinity,
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => api<Product[]>("/products"),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => api<Category[]>("/categories"),
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => api<Order[]>("/orders"),
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => api<Setting[]>("/settings"),
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => api<User>("/auth/me"),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { full_name?: string; phone?: string }) =>
      api<User>("/auth/me", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
