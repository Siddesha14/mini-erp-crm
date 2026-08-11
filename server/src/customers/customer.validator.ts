import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().trim().min(2, "Customer name is required"),
  mobile: z.string().trim().min(10, "Valid mobile number is required"),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  businessName: z.string().trim().optional(),
  gstNumber: z.string().trim().optional(),
  customerType: z.enum(["RETAIL", "WHOLESALE", "DISTRIBUTOR"]),
  address: z.string().trim().min(3, "Address is required"),
  status: z.enum(["LEAD", "ACTIVE", "INACTIVE"]).default("LEAD"),
  followUpDate: z.coerce.date().optional(),
  notes: z.string().trim().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const followUpSchema = z.object({
  note: z.string().trim().min(1, "Follow-up note is required"),
  followUpDate: z.coerce.date(),
});

export const customerQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  status: z.enum(["LEAD", "ACTIVE", "INACTIVE"]).optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type FollowUpInput = z.infer<typeof followUpSchema>;