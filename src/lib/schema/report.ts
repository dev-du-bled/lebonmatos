import { z } from "zod";
import { REPORT_CONTENT, REPORT_TYPE, REPORT_STATUS } from "@prisma/client";

const reportBaseSchema = z.object({
    reason: z.enum(Object.values(REPORT_TYPE)),
    details: z
        .string()
        .max(500, {
            message: "Les détails ne peuvent dépasser 500 caractères.",
        })
        .nullable(),
});

export const createReportSchema = reportBaseSchema
    .extend({
        type: z.enum(["POST", "USER", "REVIEW"]),
        reportedId: z.uuid(),
    })
    .superRefine((data, ctx) => {
        const trimmed = data.details?.trim() ?? "";
        if (data.reason === "OTHER") {
            if (trimmed.length === 0) {
                ctx.addIssue({
                    code: "custom",
                    message:
                        'Les détails sont obligatoires pour le type "Autre"',
                    path: ["details"],
                });
            } else if (trimmed.length < 10) {
                ctx.addIssue({
                    origin: "custom",
                    code: "too_small",
                    minimum: 10,
                    type: "string",
                    inclusive: true,
                    message:
                        "Les détails doivent comporter au moins 10 caractères.",
                    path: ["details"],
                });
            }
        } else if (trimmed.length > 0 && trimmed.length < 10) {
            ctx.addIssue({
                origin: "custom",
                code: "too_small",
                minimum: 10,
                type: "string",
                inclusive: true,
                message:
                    "Les détails doivent comporter au moins 10 caractères.",
                path: ["details"],
            });
        }
    });

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
