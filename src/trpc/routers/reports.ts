import { createTRPCRouter, privateProcedure, adminProcedure } from "../init";
import { prisma } from "@/lib/prisma";
import { deleteUploadThingImages } from "@/lib/utapi";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import {
    createReportSchema,
    getReportsSchema,
    getMyReportsSchema,
} from "@/lib/schema/report";
import { reasonLabel, buildContentSnapshot } from "@/lib/report";
import z from "zod";

export const reportsRouter = createTRPCRouter({
    getReports: adminProcedure
        .input(getReportsSchema)
        .query(async ({ input }) => {
            const { limit, offset, sortBy, sortOrder, search } = input;

            const where: Prisma.ReportWhereInput = { type: input.type };

            if (input.reasons && input.reasons.length > 0) {
                where.reason = {
                    in: input.reasons as Prisma.EnumREPORT_TYPEFilter["in"],
                };
            }

            if (input.statuses && input.statuses.length > 0) {
                where.status = {
                    in: input.statuses as Prisma.EnumREPORT_STATUSFilter["in"],
                };
            }

            if (search) {
                const searchConditions: Prisma.ReportWhereInput["OR"] = [
                    { details: { contains: search, mode: "insensitive" } },
                    {
                        user: {
                            name: { contains: search, mode: "insensitive" },
                        },
                    },
                    {
                        user: {
                            email: { contains: search, mode: "insensitive" },
                        },
                    },
                ];

                if (input.type === "USER") {
                    searchConditions.push(
                        {
                            reportedUser: {
                                name: {
                                    contains: search,
                                    mode: "insensitive",
                                },
                            },
                        },
                        {
                            reportedUser: {
                                email: {
                                    contains: search,
                                    mode: "insensitive",
                                },
                            },
                        }
                    );
                }

                where.OR = searchConditions;
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
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                username: true,
                            },
                        },
                        reportedUser: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                username: true,
                            },
                        },
                    },
                }),
                prisma.report.count({ where }),
            ]);
            return { reports, totalCount };
        }),

    createReport: privateProcedure
        .input(createReportSchema)
        .mutation(async ({ ctx, input }) => {
            const callerId = ctx.session.user.id;
            const { type, reportedId, reason, details } = input;

            if (type === "POST") {
                const post = await prisma.post.findUnique({
                    where: { id: reportedId },
                    select: { userId: true, title: true, isSold: true },
                });

                if (!post) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Post not found",
                    });
                }
                if (post.userId === callerId) {
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: "You cannot report your own post",
                    });
                }
                if (post.isSold) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "You cannot report a sold post",
                    });
                }

                const existing = await prisma.report.findFirst({
                    where: {
                        postId: reportedId,
                        userId: callerId,
                        type: "POST",
                    },
                });
                if (existing) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "You have already reported this post",
                    });
                }

                return prisma.report.create({
                    data: {
                        reason,
                        details,
                        type: "POST",
                        postId: reportedId,
                        userId: callerId,
                        contentSnapshot: buildContentSnapshot({
                            type: "POST",
                            title: post.title,
                        }),
                    },
                });
            }

            if (type === "REVIEW") {
                const rating = await prisma.rating.findUnique({
                    where: { id: reportedId },
                    select: {
                        userId: true,
                        raterId: true,
                        rating: true,
                        comment: true,
                    },
                });

                if (!rating) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Review not found",
                    });
                }
                if (rating.raterId === callerId) {
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: "You cannot report your own review",
                    });
                }

                const existing = await prisma.report.findFirst({
                    where: {
                        ratingId: reportedId,
                        userId: callerId,
                        type: "REVIEW",
                    },
                });
                if (existing) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "You have already reported this review",
                    });
                }

                return prisma.report.create({
                    data: {
                        reason,
                        details,
                        type: "REVIEW",
                        ratingId: reportedId,
                        userId: callerId,
                        contentSnapshot: buildContentSnapshot({
                            type: "REVIEW",
                            rating: rating.rating,
                            comment: rating.comment,
                        }),
                    },
                });
            }

            const reportedUser = await prisma.user.findUnique({
                where: { id: reportedId },
                select: { username: true },
            });

            if (!reportedUser) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                });
            }
            if (reportedId === callerId) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You cannot report yourself",
                });
            }

            const existingUser = await prisma.report.findFirst({
                where: {
                    reportedUserId: reportedId,
                    userId: callerId,
                    type: "USER",
                },
            });
            if (existingUser) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "You have already reported this user",
                });
            }

            return prisma.report.create({
                data: {
                    reason,
                    details,
                    type: "USER",
                    reportedUserId: reportedId,
                    userId: callerId,
                    contentSnapshot: buildContentSnapshot({
                        type: "USER",
                        username: reportedUser.username ?? "Unknown user",
                    }),
                },
            });
        }),

    deleteReport: adminProcedure
        .input(z.object({ id: z.uuid() }))
        .mutation(async ({ input }) => {
            const report = await prisma.report.findUnique({
                where: { id: input.id },
            });

            if (!report) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Signalement introuvable",
                });
            }

            await prisma.report.delete({ where: { id: input.id } });
            return { success: true };
        }),

    resolveReport: adminProcedure
        .input(z.object({ id: z.uuid() }))
        .mutation(async ({ input }) => {
            const report = await prisma.report.findUnique({
                where: { id: input.id },
            });

            if (!report) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Signalement introuvable",
                });
            }

            if (report.type === "POST" && report.postId) {
                const post = await prisma.post.findUnique({
                    where: { id: report.postId },
                    select: { images: true },
                });
                if (post && post.images.length > 0) {
                    await deleteUploadThingImages(post.images);
                }
                await prisma.post.delete({ where: { id: report.postId } });
            } else if (report.type === "REVIEW" && report.ratingId) {
                await prisma.rating.delete({ where: { id: report.ratingId } });
            }

            await prisma.report.update({
                where: { id: input.id },
                data: { status: "RESOLVED" },
            });

            return { success: true };
        }),

    rejectReport: adminProcedure
        .input(z.object({ id: z.uuid() }))
        .mutation(async ({ input }) => {
            const report = await prisma.report.findUnique({
                where: { id: input.id },
            });

            if (!report) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Signalement introuvable",
                });
            }

            await prisma.report.update({
                where: { id: input.id },
                data: { status: "REJECTED" },
            });

            return { success: true };
        }),

    getMyReports: privateProcedure
        .input(getMyReportsSchema)
        .query(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            const [reports, totalCount] = await Promise.all([
                prisma.report.findMany({
                    where: { userId },
                    skip: input.offset,
                    take: input.limit,
                    orderBy: { reportedAt: "desc" },
                    include: {
                        post: { select: { id: true, title: true } },
                        rating: {
                            select: {
                                id: true,
                                rating: true,
                                comment: true,
                                user: {
                                    select: { id: true, displayUsername: true },
                                },
                            },
                        },
                        reportedUser: {
                            select: { id: true, displayUsername: true },
                        },
                    },
                }),
                prisma.report.count({ where: { userId } }),
            ]);

            return {
                reports: reports.map((r) => ({
                    ...r,
                    reasonLabel: reasonLabel[r.reason],
                })),
                totalCount,
            };
        }),
});
