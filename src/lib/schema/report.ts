import { z } from "zod";
import { REPORT_CONTENT, REPORT_TYPE, REPORT_STATUS } from "@prisma/client";

const reportBaseSchema = z.object({
    reason: z.enum(Object.values(REPORT_TYPE)),
    details: z
        .string()
        .min(10, {
            message: "Les détails doivent comporter au moins 10 caractères.",
        })
        .max(500, {
            message: "Les détails ne peuvent dépasser 500 caractères.",
        })
        .nullable(),
});

const detailsRequiredForOther = (data: {
    reason: string;
    details: string | null;
}) =>
    data.reason !== "OTHER" ||
    (data.details !== null && data.details.trim().length > 0);

const detailsRequiredMsg = {
    message: 'Les détails sont obligatoires pour le type "Autre"',
    path: ["details"],
};

export const createReportSchema = reportBaseSchema
    .extend({
        type: z.enum(["POST", "USER", "REVIEW"]),
        reportedId: z.uuid(),
    })
    .refine(detailsRequiredForOther, detailsRequiredMsg);

export type CreateReportInput = z.infer<typeof createReportSchema>;

export const getReportsSchema = z.object({
    type: z.enum(Object.values(REPORT_CONTENT)).default("POST"),
    limit: z.number().min(1).max(100).default(10),
    offset: z.number().min(0).default(0),
    sortBy: z.enum(["reportedAt", "reason", "status"]).default("reportedAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    search: z.string().optional(),
    reasons: z.array(z.enum(REPORT_TYPE)).optional(),
    statuses: z.array(z.enum(REPORT_STATUS)).optional(),
});

export type GetReportsInput = z.infer<typeof getReportsSchema>;

export const getMyReportsSchema = z.object({
    limit: z.number().min(1).max(50).default(20),
    offset: z.number().min(0).default(0),
});

export type GetMyReportsInput = z.infer<typeof getMyReportsSchema>;
