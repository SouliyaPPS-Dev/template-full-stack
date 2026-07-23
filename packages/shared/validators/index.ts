import { z } from "zod";

export const UserCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(2),
  phone: z.string().optional(),
});

export const UserLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const ProductCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  sku: z.string().optional(),
  category_id: z.string().uuid().optional(),
  selling_price: z.number().positive(),
  cost_price: z.number().min(0).default(0),
  stock: z.number().int().min(0).default(0),
  description: z.string().optional(),
});

export const OrderCreateSchema = z.object({
  user_id: z.string().uuid(),
  items: z.array(
    z.object({
      product_id: z.string().uuid(),
      quantity: z.number().int().positive(),
      unit_price: z.number().positive(),
    })
  ),
  shipping_address: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
});

export type UserCreate = z.infer<typeof UserCreateSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
export type ProductCreate = z.infer<typeof ProductCreateSchema>;
export type OrderCreate = z.infer<typeof OrderCreateSchema>;
