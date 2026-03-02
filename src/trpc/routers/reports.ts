import z from "zod";
import { createTRPCRouter, privateProcedure } from "../init";
import { prisma } from "@/lib/prisma";
import { REPORT_CONTENT } from "@prisma/client";

export const reportsRouter = createTRPCRouter({
    getReports: privateProcedure
        .input(
            z.object({
                type: z.enum(REPORT_CONTENT).default("POST"),
                limit: z.number().min(1).max(100).default(10),
                offset: z.number().min(0).default(0),
                sortBy: z
                    .enum(["reportedAt", "reason", "type"])
                    .default("reportedAt"),
                sortOrder: z.enum(["asc", "desc"]).default("desc"),
            })
        )
        .query(async ({ input }) => {
            const { limit, offset, sortBy, sortOrder } = input;
            const [reports, totalCount] = await Promise.all([
                prisma.report.findMany({
                    where: { type: input.type },
                    skip: offset,
                    take: limit,
                    orderBy: { [sortBy]: sortOrder },
                    include: {
                        post: { select: { id: true, title: true } },
                        user: { select: { id: true, name: true, email: true } },
                    },
                }),
                prisma.report.count({ where: { type: input.type } }),
            ]);
            return { reports, totalCount };
        }),
});
