import { z } from "zod";

const challanItemSchema = z.object({
  productId: z.coerce
    .number()
    .int()
    .positive("Product ID must be positive"),

  quantity: z.coerce
    .number()
    .int()
    .positive("Quantity must be greater than zero"),
});

export const createChallanSchema = z.object({
  customerId: z.coerce
    .number()
    .int()
    .positive("Customer ID must be positive"),

  items: z
    .array(challanItemSchema)
    .min(1, "At least one product is required"),
});

export const updateChallanSchema = z.object({
  customerId: z.coerce
    .number()
    .int()
    .positive("Customer ID must be positive")
    .optional(),

  items: z
    .array(challanItemSchema)
    .min(1, "At least one product is required")
    .optional(),
});

export const challanQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(10),

  status: z
    .enum(["DRAFT", "CONFIRMED", "CANCELLED"])
    .optional(),

  customerId: z.coerce
    .number()
    .int()
    .positive()
    .optional(),
});

export type CreateChallanInput = z.infer<
  typeof createChallanSchema
>;

export type UpdateChallanInput = z.infer<
  typeof updateChallanSchema
>;