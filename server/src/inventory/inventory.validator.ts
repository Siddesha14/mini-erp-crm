import { z } from "zod";

export const createStockMovementSchema = z.object({
  productId: z.coerce
    .number()
    .int()
    .positive("Product ID must be positive"),

  quantity: z.coerce
    .number()
    .int()
    .positive("Quantity must be greater than zero"),

  type: z.enum(["IN", "OUT"]),

  reason: z
    .string()
    .trim()
    .min(2, "Reason is required"),
});

export const stockMovementQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(10),

  productId: z.coerce.number().int().positive().optional(),

  type: z.enum(["IN", "OUT"]).optional(),
});

export type CreateStockMovementInput = z.infer<
  typeof createStockMovementSchema
>;