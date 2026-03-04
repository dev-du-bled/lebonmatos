import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
    profileUpdateSchema,
    publicProfileUpdateSchema,
    personalInfoUpdateSchema,
} from "@/lib/schema/user";
import { utapi } from "@/lib/utapi";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../init";

const privateProfileSelect = {
    id: true,
    name: true,
    email: true,
    username: true,
    displayUsername: true,
    bio: true,
    phoneNumber: true,
    createdAt: true,
    image: true,
} satisfies Prisma.UserSelect;

const publicProfileSelect = {
    id: true,
    username: true,
    displayUsername: true,
    bio: true,
    createdAt: true,
    image: true,
} satisfies Prisma.UserSelect;

type PrivateProfileRecord = Prisma.UserGetPayload<{
    select: typeof privateProfileSelect;
}>;
type PublicProfileRecord = Prisma.UserGetPayload<{
    select: typeof publicProfileSelect;
}>;

function mapPrivateProfileResult(
    user: PrivateProfileRecord,
    rating: { average: number | null; count: number }
) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        displayUsername: user.displayUsername,
        bio: user.bio,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt.toISOString(),
        image: user.image,
        rating,
    };
}

function mapPublicProfileResult(
    user: PublicProfileRecord,
    rating: { average: number | null; count: number }
) {
    return {
        id: user.id,
        username: user.username,
        displayUsername: user.displayUsername,
        bio: user.bio,
        createdAt: user.createdAt.toISOString(),
        image: user.image,
        rating,
    };
}

async function getRating(userId: string) {
    const aggregates = await prisma.rating.aggregate({
        where: { userId },
        _avg: { rating: true },
        _count: { rating: true },
    });
    return {
        average: aggregates._avg.rating ? Number(aggregates._avg.rating) : null,
        count: aggregates._count.rating,
    };
}

async function buildProfilePayload(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: privateProfileSelect,
    });

    if (!user) {
        throw new TRPCError({
            code: "NOT_FOUND",
            message: "Utilisateur introuvable",
        });
    }

    return mapPrivateProfileResult(user, await getRating(userId));
}

async function buildPublicProfilePayload(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: publicProfileSelect,
    });

    if (!user) {
        throw new TRPCError({
            code: "NOT_FOUND",
            message: "Utilisateur introuvable",
        });
    }

    return mapPublicProfileResult(user, await getRating(userId));
}

async function deleteUserImage(image: string) {
    const imageKey = image.split("/").pop();
    if (imageKey) {
        await utapi.deleteFiles(imageKey);
    }
}

export const userRouter = createTRPCRouter({
    meId: privateProcedure.query(({ ctx }) => {
        return ctx.session!.user.id;
    }),
    getProfile: privateProcedure.query(async ({ ctx }) => {
        return buildProfilePayload(ctx.session!.user.id);
    }),
    getReviewStats: publicProcedure
        .input(z.object({ userId: z.uuid() }))
        .query(async ({ input }) => {
            const result = await prisma.rating.aggregate({
                where: { userId: input.userId },
                _avg: { rating: true },
                _count: { rating: true },
            });
            return {
                average: result._avg.rating
                    ? Number(result._avg.rating.toFixed(2))
                    : 0,
                count: result._count.rating,
            };
        }),

    getReceivedReviews: publicProcedure
        .input(
            z.object({
                userId: z.uuid(),
                limit: z.number().int().min(1).max(50).default(10),
                cursor: z.uuid().optional(), // id of the last review on the previous page
            })
        )
        .query(async ({ input }) => {
            const { userId, limit, cursor } = input;

            // Fetch one extra row to know whether a next page exists.
            const rows = await prisma.rating.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                take: limit + 1,
                ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
                include: {
                    rater: {
                        select: {
                            id: true,
                            username: true,
                            displayUsername: true,
                            image: true,
                        },
                    },
                },
            });

            const hasNextPage = rows.length > limit;
            const reviews = rows.slice(0, limit);
            const nextCursor = hasNextPage
                ? reviews[reviews.length - 1].id
                : undefined;

            return {
                reviews: reviews.map((r: (typeof reviews)[number]) => ({
                    id: r.id,
                    rating: r.rating,
                    comment: r.comment,
                    createdAt: r.createdAt.toISOString(),
                    rater: r.rater,
                })),
                nextCursor,
            };
        }),

    getGivenReviews: privateProcedure.query(async ({ ctx }) => {
        const raterId = ctx.session!.user.id;
        const reviews = await prisma.rating.findMany({
            where: { raterId },
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        displayUsername: true,
                        image: true,
                    },
                },
            },
        });
        return reviews.map((r: (typeof reviews)[number]) => ({
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt.toISOString(),
            recipient: r.user,
        }));
    }),

    addReview: privateProcedure
        .input(
            z.object({
                userId: z.uuid(),
                rating: z.number().int().min(1).max(5),
                comment: z.string().max(500).optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const raterId = ctx.session!.user.id;

            if (raterId === input.userId) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Vous ne pouvez pas vous noter vous-même.",
                });
            }

            const target = await prisma.user.findUnique({
                where: { id: input.userId },
                select: { id: true },
            });

            if (!target) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Utilisateur introuvable.",
                });
            }

            const purchase = await prisma.post.findFirst({
                where: {
                    userId: input.userId,
                    boughtById: raterId,
                    isSold: true,
                },
                select: { id: true },
            });

            if (!purchase) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message:
                        "Vous devez avoir acheté un article de cet utilisateur pour laisser un avis.",
                });
            }

            try {
                await prisma.rating.create({
                    data: {
                        userId: input.userId,
                        raterId,
                        rating: input.rating,
                        comment: input.comment ?? null,
                    },
                });
            } catch (error) {
                if (
                    error instanceof Prisma.PrismaClientKnownRequestError &&
                    error.code === "P2002"
                ) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message:
                            "Vous avez déjà laissé un avis pour cet utilisateur.",
                    });
                }
                throw error;
            }

            return { success: true };
        }),

    getPublicProfile: publicProcedure
        .input(z.object({ userId: z.uuid() }))
        .query(async ({ input }) => {
            return buildPublicProfilePayload(input.userId);
        }),
    updateProfile: privateProcedure
        .input(profileUpdateSchema)
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session!.user.id;
            const existing = await prisma.user.findUnique({
                where: { id: userId },
                select: { image: true },
            });
            if (!existing) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Utilisateur introuvable",
                });
            }
            const { avatar, removeAvatar, ...profileData } = input;

            try {
                let newImage = existing.image;

                if (removeAvatar) {
                    if (existing.image) {
                        await deleteUserImage(existing.image);
                    }
                    newImage = null;
                } else if (avatar) {
                    if (existing.image) {
                        await deleteUserImage(existing.image);
                    }
                    newImage = avatar;
                }

                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        name: profileData.name,
                        username: profileData.username,
                        bio: profileData.bio,
                        phoneNumber: profileData.phoneNumber,
                        image: newImage,
                    },
                });
            } catch (error) {
                if (
                    error instanceof Prisma.PrismaClientKnownRequestError &&
                    error.code === "P2002"
                ) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "Ce nom d'utilisateur est déjà utilisé.",
                    });
                }
                throw error instanceof Error ? error : new Error(String(error));
            }
            return buildProfilePayload(userId);
        }),
    updatePublicProfile: privateProcedure
        .input(publicProfileUpdateSchema)
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session!.user.id;
            const existing = await prisma.user.findUnique({
                where: { id: userId },
                select: { image: true },
            });
            if (!existing) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Utilisateur introuvable",
                });
            }

            const { avatar, removeAvatar, username, bio } = input;

            try {
                let newImage = existing.image;

                if (removeAvatar) {
                    if (existing.image) {
                        await deleteUserImage(existing.image);
                    }
                    newImage = null;
                } else if (avatar) {
                    if (existing.image) {
                        await deleteUserImage(existing.image);
                    }
                    newImage = avatar;
                }

                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        username,
                        bio,
                        image: newImage,
                    },
                });
            } catch (error) {
                if (
                    error instanceof Prisma.PrismaClientKnownRequestError &&
                    error.code === "P2002"
                ) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "Ce nom d'utilisateur est déjà utilisé.",
                    });
                }
                throw error instanceof Error ? error : new Error(String(error));
            }
            return buildProfilePayload(userId);
        }),
    updatePersonalInfo: privateProcedure
        .input(personalInfoUpdateSchema)
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session!.user.id;

            if (input.email) {
                const existingUser = await prisma.user.findUnique({
                    where: { email: input.email },
                });
                if (existingUser && existingUser.id !== userId) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "Cet email est déjà utilisé.",
                    });
                }
            }

            await prisma.user.update({
                where: { id: userId },
                data: {
                    name: input.name,
                    email: input.email,
                    phoneNumber: input.phoneNumber,
                },
            });

            return buildProfilePayload(userId);
        }),
});
