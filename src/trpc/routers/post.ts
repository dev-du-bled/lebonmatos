import { z } from "zod";
import { postCreateSchema } from "@/lib/schema/post";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../init";
import { deleteUploadThingImages } from "@/lib/utapi";
import { ComponentType } from "@prisma/client";
import { Components } from "@/utils/components";
import { CityData } from "@/utils/location";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/prisma";

// return wich component to fetch based on the component type
const getComponentIncludes = (componentType: ComponentType) => ({
    Cpu: componentType === ComponentType.CPU,
    Gpu: componentType === ComponentType.GPU,
    Ram: componentType === ComponentType.RAM,
    Motherboard: componentType === ComponentType.MOTHERBOARD,
    Hdd: componentType === ComponentType.HDD,
    Ssd: componentType === ComponentType.SSD,
    Psu: componentType === ComponentType.POWER_SUPPLY,
    Case: componentType === ComponentType.CASE,
    CaseFan: componentType === ComponentType.CASE_FAN,
    CpuCooler: componentType === ComponentType.CPU_COOLER,
    WirelessNetworkCard: componentType === ComponentType.WIRELESS_NETWORK_CARD,
    SoundCard: componentType === ComponentType.SOUND_CARD,
});

const getComponentDetails = (
    componentType: ComponentType,
    component: Record<string, unknown>
): Components => {
    const map: Record<ComponentType, string> = {
        CPU: "Cpu",
        GPU: "Gpu",
        RAM: "Ram",
        MOTHERBOARD: "Motherboard",
        HDD: "Hdd",
        SSD: "Ssd",
        POWER_SUPPLY: "Psu",
        CASE: "Case",
        CASE_FAN: "CaseFan",
        CPU_COOLER: "CpuCooler",
        WIRELESS_NETWORK_CARD: "WirelessNetworkCard",
        SOUND_CARD: "SoundCard",
    };
    return component[map[componentType]] as Components;
};

export const postRouter = createTRPCRouter({
    getUserListings: privateProcedure.query(async ({ ctx }) => {
        const posts = await prisma.post.findMany({
            where: { userId: ctx.session.user.id },
            orderBy: { id: "desc" },
            include: {
                component: true,
            },
        });

        return posts.map((post) => ({
            id: post.id,
            title: post.title,
            description: post.description,
            price: post.price,
            component: {
                id: post.component.id,
                name: post.component.name,
                type: post.component.type,
            },
            thumbnail: post.images[0]
                ? { id: "", image: post.images[0], alt: null }
                : null,
        }));
    }),

    getUserFavorites: privateProcedure.query(async ({ ctx }) => {
        const favorites = await prisma.favorite.findMany({
            where: { userId: ctx.session.user.id },
            include: {
                post: {
                    include: {
                        component: true,
                    },
                },
            },
            orderBy: { id: "desc" },
        });

        return favorites.map((fav) => ({
            id: fav.post.id,
            title: fav.post.title,
            description: fav.post.description,
            price: fav.post.price,
            component: {
                id: fav.post.component.id,
                name: fav.post.component.name,
                type: fav.post.component.type,
            },
            thumbnail: fav.post.images[0]
                ? { image: fav.post.images[0], alt: null }
                : null,
        }));
    }),

    deletePost: privateProcedure
        .input(z.object({ id: z.cuid() }))
        .mutation(async ({ ctx, input }) => {
            const post = await prisma.post.findUnique({
                where: { id: input.id },
            });

            if (!post) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Post not found",
                });
            }

            if (post.userId !== ctx.session.user.id) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "You are not authorized to delete this post",
                });
            }

            await deleteUploadThingImages(post.images);

            await prisma.post.delete({
                where: { id: input.id },
                include: { location: true },
            });

            return { success: true };
        }),

    createPost: privateProcedure
        .input(postCreateSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                const post = await prisma.post.create({
                    data: {
                        title: input.title,
                        description: input.description,
                        price: input.price,
                        componentId: input.componentId,
                        images: input.images || [],
                        userId: ctx.session.user.id,
                        location: {
                            create: {
                                name: input.location.name,
                                displayName: input.location.displayName,
                                city: input.location.city,
                                state: input.location.state,
                                region: input.location.region,
                                country: input.location.country,
                                countryCode: input.location.countryCode,
                                lat: input.location.lat,
                                lon: input.location.lon,
                                coordinates: input.location.coordinates,
                            },
                        },
                    },
                });

                return {
                    postId: post.id,
                };
            } catch (error) {
                console.error("Error creating post:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to create post",
                });
            }
        }),

    editPost: privateProcedure
        .input(postCreateSchema.extend({ id: z.cuid() }))
        .mutation(async ({ ctx, input }) => {
            const post = await prisma.post.findUnique({
                where: { id: input.id },
            });

            if (!post) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Post not found",
                });
            }

            if (post.userId !== ctx.session.user.id) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "You are not authorized to edit this post",
                });
            }

            try {
                await prisma.post.update({
                    where: { id: input.id },
                    data: {
                        title: input.title,
                        description: input.description,
                        price: input.price,
                        componentId: input.componentId,
                        images: input.images || [],
                        location: {
                            update: {
                                name: input.location.name,
                                displayName: input.location.displayName,
                                city: input.location.city,
                                state: input.location.state,
                                region: input.location.region,
                                country: input.location.country,
                                countryCode: input.location.countryCode,
                                lat: input.location.lat,
                                lon: input.location.lon,
                                coordinates: input.location.coordinates,
                            },
                        },
                    },
                });

                return {
                    postId: post.id,
                };
            } catch {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to update post",
                });
            }
        }),

    favoritePost: privateProcedure
        .input(z.object({ postId: z.cuid() }))
        .mutation(async ({ ctx, input }) => {
            const post = await prisma.post.findUnique({
                where: { id: input.postId },
                select: { userId: true },
            });

            if (!post) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Post not found",
                });
            }

            if (post.userId === ctx.session.user.id) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "You cant favorite your own post",
                });
            }

            const favorite = await prisma.favorite.findUnique({
                where: {
                    postId_userId: {
                        postId: input.postId,
                        userId: ctx.session.user.id,
                    },
                },
            });

            if (favorite) {
                await prisma.favorite.delete({
                    where: {
                        postId_userId: {
                            postId: input.postId,
                            userId: ctx.session.user.id,
                        },
                    },
                });

                return { favorited: false };
            } else {
                await prisma.favorite.create({
                    data: {
                        postId: input.postId,
                        userId: ctx.session.user.id,
                    },
                });

                return { favorited: true };
            }
        }),

    getPost: publicProcedure
        .input(
            z.object({
                postId: z.cuid(),
                sellerData: z.boolean().default(true),
            })
        )
        .query(async ({ ctx, input }) => {
            const post = await prisma.post.findUnique({
                where: { id: input.postId },
                include: {
                    user: true,
                    component: true,
                    location: true,
                    Favorites: ctx.session?.user
                        ? {
                              where: {
                                  userId: ctx.session.user.id,
                              },
                          }
                        : false,
                },
            });

            if (!post || post.user.banned)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Post not found",
                });

            const component = await prisma.component.findUnique({
                where: { id: post.componentId },
                include: {
                    ...getComponentIncludes(
                        post.component.type as ComponentType
                    ),
                },
            });

            if (!component) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Component not found",
                });
            }

            if (!post.location) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Post location not found",
                });
            }

            let rating = null;
            if (input.sellerData && post.userId) {
                rating = await prisma.rating.aggregate({
                    where: {
                        userId: post.userId,
                    },
                    _avg: {
                        rating: true,
                    },
                    _count: {
                        rating: true,
                    },
                });
            }

            return {
                id: post.id,
                title: post.title,
                description: post.description,
                price: post.price,
                ...(ctx.session?.user && {
                    isFavorited: post.Favorites.length > 0,
                }),
                location: {
                    name: post.location.name,
                    displayName: post.location.displayName,
                    city: post.location.city,
                    state: post.location.state,
                    region: post.location.region,
                    country: post.location.country,
                    countryCode: post.location.countryCode,
                    lat: post.location.lat,
                    lon: post.location.lon,
                    coordinates: post.location.coordinates,
                } satisfies CityData,
                images: post.images,
                component: {
                    id: component.id,
                    name: component.name,
                    color: component.color,
                    type: component.type,
                    price: component.estimatedPrice,
                    data: getComponentDetails(post.component.type, component),
                },
                ...(input.sellerData && {
                    seller: {
                        id: post.user.id,
                        username: post.user.username,
                        rating: rating
                            ? {
                                  avg: rating._avg.rating
                                      ? Number(rating._avg.rating.toFixed(2))
                                      : 0,
                                  count: rating._count.rating || 0,
                              }
                            : null,
                    },
                }),
            };
        }),

    getSimilarPosts: publicProcedure
        .input(
            z.object({
                id: z.cuid(),
                type: z.enum(ComponentType),
            })
        )
        .query(async ({ input }) => {
            const posts = await prisma.post.findMany({
                where: {
                    component: {
                        type: input.type,
                    },
                    NOT: {
                        id: input.id,
                    },
                },
            });

            const shufflePosts = posts.sort(() => Math.random() - 0.5);
            const randomPosts = shufflePosts.slice(0, 20);

            return randomPosts.map((post) => ({
                id: post.id,
                title: post.title,
                price: post.price,
                images: post.images,
            }));
        }),

    getHomePage: publicProcedure.query(async () => {
        const userSelect = {
            select: {
                id: true,
                username: true,
                displayUsername: true,
                image: true,
            },
        } as const;

        const posts = await prisma.post.findMany({
            take: 10,
            include: {
                user: userSelect,
                location: true,
            },
            where: {
                images: {
                    isEmpty: false,
                },
            },
        });

        const cases = await prisma.post.findMany({
            take: 10,
            include: {
                user: userSelect,
                location: true,
                component: {
                    select: {
                        type: true,
                    },
                },
            },
            where: {
                component: {
                    type: "CASE",
                },
            },
        });

        const cpus = await prisma.post.findMany({
            take: 10,
            include: {
                user: userSelect,
                location: true,
                component: {
                    select: {
                        type: true,
                    },
                },
            },
            where: {
                component: {
                    type: "CPU",
                },
            },
        });

        const gpus = await prisma.post.findMany({
            take: 10,
            include: {
                user: userSelect,
                location: true,
                component: {
                    select: {
                        type: true,
                    },
                },
            },
            where: {
                component: {
                    type: "GPU",
                },
            },
        });

        return {
            posts,
            cases,
            cpus,
            gpus,
        };
    }),
});
