import { z } from 'zod';

export const getOrdersSchema = z.object({
    page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1))
        .refine((val) => val > 0, { message: 'Page must be greater than 0' }),
    limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10))
        .refine((val) => val > 0 && val <= 1000, { message: 'Limit must be between 1 and 100' }),
});

export const getOrderByIdSchema = z.object({
    id: z.string().uuid("Invalid order ID format"),
});

export const searchOrdersSchema = z.object({
    q: z.string().min(1, "Search query cannot be empty"),
    page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1))
        .refine((val) => val > 0, { message: 'Page must be greater than 0' }),
    limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10))
        .refine((val) => val > 0 && val <= 1000, { message: 'Limit must be between 1 and 100' }),
});

export const createOrderSchema = z.object({
    userId: z.string().min(1),
    productName: z.string().min(1),
    description: z.string().optional(),
    totalAmount: z.number().positive(),
    status: z.enum(["pending", "completed", "cancelled"]).default("pending")
});

export const createOrdersSchema = z.array(createOrderSchema);


export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateOrdersInput = z.infer<typeof createOrdersSchema>;
export type GetOrdersInput = z.infer<typeof getOrdersSchema>;
