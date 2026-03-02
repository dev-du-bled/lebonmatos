import z from "zod";
import { createTRPCRouter, privateProcedure } from "../init";
import { prisma } from "@/lib/prisma";
import { REPORT_CONTENT, REPORT_TYPE, Prisma } from "@prisma/client";
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
                search: z.string().optional(),
                searchField: z
                    .enum([
                        "details",
                        "reporterEmail",
                        "reporterName",
                        "reportedUserName",
                        "reportedUserEmail",
                    ])
                    .optional(),
            })
        )
        .query(async ({ ctx, input }) => {
            if (ctx.session.user.role !== "admin") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You do not have permission to view reports",
                });
            }

            const { limit, offset, sortBy, sortOrder, search, searchField } =
                input;

            const where: Prisma.ReportWhereInput = { type: input.type };

            if (search && searchField) {
                if (searchField === "details") {
                    where.details = { contains: search, mode: "insensitive" };
                } else if (searchField === "reporterEmail") {
                    where.user = {
                        email: { contains: search, mode: "insensitive" },
                    };
                } else if (searchField === "reporterName") {
                    where.user = {
                        name: { contains: search, mode: "insensitive" },
                    };
                } else if (searchField === "reportedUserName") {
                    where.reportedUser = {
                        name: { contains: search, mode: "insensitive" },
                    };
                } else if (searchField === "reportedUserEmail") {
                    where.reportedUser = {
                        email: { contains: search, mode: "insensitive" },
                    };
                }
            }

            const [reports, totalCount] = await Promise.all([
                prisma.report.findMany({
                    where,
                    skip: offset,
                    take: limit,
                    orderBy: { [sortBy]: sortOrder },
                    include: {
                        post: { select: { id: true, title: true } },
                        rating: {
                            select: {
                                id: true,
                                rating: true,
                                comment: true,
                                rater: { select: { id: true, name: true } },
                                user: { select: { id: true, name: true } },
                            },
                        },
                        user: { select: { id: true, name: true, email: true } },
                        reportedUser: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                }),
                prisma.report.count({ where }),
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
