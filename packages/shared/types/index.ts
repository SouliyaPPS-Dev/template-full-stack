// Shared TypeScript types for the full-stack monorepo

export interface User {
  id: string;
  email: string;
  phone?: string;
  full_name: string;
  avatar_url?: string;
  role: "user" | "staff" | "admin" | "superadmin";
  email_verified: boolean;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  category_id?: string;
  name: string;
  slug: string;
  sku?: string;
  barcode?: string;
  description?: string;
  cost_price: number;
  selling_price: number;
  compare_price: number;
  stock: number;
  min_stock: number;
  unit: string;
  weight?: number;
  images: string[];
  features: Record<string, unknown>;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  parent_id?: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  payment_status: "unpaid" | "paid" | "partial" | "refunded" | "failed";
  payment_method?: string;
  subtotal: number;
  discount: number;
  tax_percent: number;
  tax_amount: number;
  shipping_fee: number;
  grand_total: number;
  currency: string;
  shipping_address?: Record<string, unknown>;
  billing_address?: Record<string, unknown>;
  notes?: string;
  paid_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface CartItem {
  id: string;
  user_id?: string;
  session_id?: string;
  product_id: string;
  quantity: number;
}

export interface Quotation {
  id: string;
  quotation_number: string;
  user_id?: string;
  ref_no?: string;
  date: string;
  expiry_date?: string;
  subtotal: number;
  discount: number;
  tax_percent: number;
  grand_total: number;
  status: "draft" | "sent" | "approved" | "rejected" | "expired";
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
