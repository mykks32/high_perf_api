import { z } from "zod";

export const ingestSingleSchema = z.object({
    source: z.string().min(1, "Source is required"),
    value: z.number(),
    payload: z.any().optional(),
});

export const ingestBatchSchema = z.array(
    z.object({
        source: z.string().min(1, "Source is required"),
        value: z.number(),
        payload: z.any().optional(),
    })
).min(1, "Batch must contain at least one record");

export const getHistorySchema = z.object({
    limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 100))
        .refine((val) => val > 0, { message: "Limit must be greater than 0" }),
});