import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(2, "Product name is required"),

  sku: z.string().trim().min(1, "SKU is required"),

  category: z.string().trim().min(1, "Category is required"),

  unitPrice: z.coerce
    .number()
    .nonnegative("Unit price cannot be negative"),

  currentStock: z.coerce
    .number()
    .int()
    .nonnegative("Stock cannot be negative")
    .default(0),

  minStock: z.coerce
    .number()
    .int()
    .nonnegative("Minimum stock cannot be negative")
    .default(0),

  warehouse: z.string().trim().min(1, "Warehouse is required"),
});

export const updateProductSchema = createProductSchema
  .omit({
    currentStock: true,
  })
  .partial();

export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(10),

  search: z.string().trim().optional(),

  category: z.string().trim().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export type UpdateProductInput = z.infer<typeof updateProductSchema>;