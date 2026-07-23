export const API_VERSION = "v1";
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export const PAYMENT_STATUSES = [
  "unpaid",
  "paid",
  "partial",
  "refunded",
  "failed",
] as const;

export const QUOTATION_STATUSES = [
  "draft",
  "sent",
  "approved",
  "rejected",
  "expired",
] as const;

export const ROLES = ["user", "staff", "admin", "superadmin"] as const;

export const CURRENCY = "LAK";
export const TAX_PERCENT = 7;

export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user",
  CART: "cart",
} as const;
