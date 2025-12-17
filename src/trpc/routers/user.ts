import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { profileUpdateSchema } from "@/lib/schema/user";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../init";

const profileSelect = {
    id: true,
    name: true,
    email: true,
    username: true,
    displayUsername: true,
    phoneNumber: true,
    createdAt: true,
    image: true,
    profileImage: {
        select: {
            id: true,
            image: true,
            alt: true,
        },
    },
} satisfies Prisma.UserSelect;

type ProfileRecord = Prisma.UserGetPayload<{ select: typeof profileSelect }>;

function mapProfileResult(
    user: ProfileRecord,
    rating: { average: number | null; count: number }
) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        displayUsername: user.displayUsername,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt.toISOString(),
        image: user.image,
        profileImage: user.profileImage
            ? {
                  id: user.profileImage.id,
                  image: user.profileImage.image,
                  alt: user.profileImage.alt ?? null,
              }
            : null,
        rating,
    };
}

async function buildProfilePayload(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: profileSelect,
    });

    if (!user) {
        throw new TRPCError({
            code: "NOT_FOUND",
            message: "Utilisateur introuvable",
        });
    }

    const aggregates = await prisma.rating.aggregate({
        where: { userId },
        _avg: { rating: true },
        _count: { rating: true },
    });

    return mapProfileResult(user, {
        average: aggregates._avg.rating ? Number(aggregates._avg.rating) : null,
        count: aggregates._count.rating,
    });
}

export const userRouter = createTRPCRouter({
    meId: privateProcedure.query(({ ctx }) => {
        return ctx.session!.user.id;
    }),
    getProfile: publicProcedure
        .input(
            z
                .object({
                    userId: z.string().optional(),
                })
                .optional()
        )
        .query(({ ctx, input }) => {
            const userId = input?.userId ?? ctx.session?.user.id;

            if (!userId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message:
                        "Vous devez être connecté ou spécifier un ID utilisateur.",
                });
            }

            return buildProfilePayload(userId);
        }),
    updateProfile: privateProcedure
        .input(profileUpdateSchema)
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session!.user.id;

            const existing = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    image: true,
                },
            });

            if (!existing) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Utilisateur introuvable",
                });
            }

            const { avatar, removeAvatar, ...profileData } = input;

            try {
                await prisma.$transaction(async (tx) => {
                    let image = existing.image;

                    if (removeAvatar && image) {
                        await tx.image.delete({
                            where: { id: image },
                        });
                        image = null;
                    }

                    if (avatar) {
                        if (image) {
                            await tx.image.update({
                                where: { id: image },
                                data: {
                                    image: avatar.data,
                                    alt: avatar.alt,
                                },
                            });
                        } else {
                            const created = await tx.image.create({
                                data: {
                                    image: avatar.data,
                                    alt: avatar.alt,
                                    ownerId: userId,
                                },
                            });
                            image = created.id;
                        }
                    }

                    await tx.user.update({
                        where: { id: userId },
                        data: {
                            name: profileData.name,
                            username: profileData.username,
                            phoneNumber: profileData.phoneNumber,
                            image: avatar
                                ? avatar.data
                                : removeAvatar
                                  ? null
                                  : undefined,
                        },
                    });
                });
            } catch (error) {
                if (
                    error instanceof Prisma.PrismaClientKnownRequestError &&
                    error.code === "P2002" // Returned by Prisma when a unique constraint is violated
                ) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "Ce nom d'utilisateur est déjà utilisé.",
                    });
                }

                throw error;
            }

            return buildProfilePayload(userId);
        }),
});
