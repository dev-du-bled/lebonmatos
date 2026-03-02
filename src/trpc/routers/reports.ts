import z from "zod";
import { createTRPCRouter, privateProcedure } from "../init";
import { prisma } from "@/lib/prisma";
import { REPORT_CONTENT, REPORT_TYPE } from "@prisma/client";
import { TRPCError } from "@trpc/server";

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
        .query(async ({ ctx, input }) => {
            if (ctx.session.user.role !== "admin") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You do not have permission to view reports",
                });
            }

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

    createReport: privateProcedure
        .input(
            z.object({
                postId: z.cuid(),
                reason: z.enum(REPORT_TYPE),
                details: z.string().max(500).nullable(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const post = await prisma.post.findUnique({
                where: { id: input.postId },
            });

            if (!post) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Post not found",
                });
            }

            if (ctx.session.user.id === post?.userId) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You cannot report your own post",
                });
            }

            const existing = await prisma.report.findFirst({
                where: {
                    postId: input.postId,
                    userId: ctx.session.user.id,
                    type: "POST",
                },
            });

            if (existing) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "You have already reported this post",
                });
            }

            const report = await prisma.report.create({
                data: {
                    reason: input.reason,
                    details: input.details,
                    type: "POST",
                    postId: input.postId,
                    userId: ctx.session.user.id,
                },
            });

            return report;
        }),
});
