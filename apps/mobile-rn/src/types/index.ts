export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  cost_price: number;
  selling_price: number;
  compare_price: number;
  stock: number;
  unit: string;
  images: string[];
  is_featured: boolean;
  is_active: boolean;
}

export interface Category {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  is_active: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  grand_total: number;
  created_at: string;
}

export interface Setting {
  id: number;
  setting_key: string;
  setting_value: string;
  description: string;
}
