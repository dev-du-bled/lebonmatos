import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { postCreateSchema } from "@/lib/schema/post";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../init";
import { utapi } from "@/lib/utapi";
import { ComponentType } from "@prisma/client";

export const postRouter = createTRPCRouter({
    getUserListings: privateProcedure.query(async ({ ctx }) => {
        const posts = await prisma.post.findMany({
            where: { userId: ctx.session!.user.id },
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

    deletePost: privateProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const post = await prisma.post.findUnique({
                where: { id: input.id },
            });

            if (!post) {
                throw new Error("Post not found");
            }

            if (post.userId !== ctx.session!.user.id) {
                throw new Error("Unauthorized");
            }

            if (post.images.length > 0) {
                const keys = post.images.map((img) => {
                    const url = new URL(img);
                    const pathname = url.pathname.split("/").pop();
                    return pathname?.split("?")[0] ?? img;
                });
                await utapi.deleteFiles(keys);
            }

            await prisma.post.delete({
                where: { id: input.id },
            });

            return { success: true };
        }),

    createPost: privateProcedure
        .input(postCreateSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                const post = await prisma.post.create({
                    data: {
                        userId: ctx.session!.user.id,
                        title: input.title,
                        description: input.description,
                        price: input.price,
                        componentId: input.componentId,
                        images: input.images || [],
                    },
                });

                return {
                    postId: post.id,
                };
            } catch (error) {
                // TODO: better error handling
                throw new Error(
                    error instanceof Error ? error.message : "Unknown error"
                );
            }
        }),

    getPost: publicProcedure
        .input(
            z.object({
                postId: z.cuid(),
            })
        )
        .query(async ({ input }) => {
            const post = await prisma.post.findUnique({
                where: { id: input.postId },
                include: {
                    user: true,
                    component: true,
                },
            });

            const component = await prisma.component.findUnique({
                where: { id: post?.componentId },
                include: {
                    Cpu: post?.component.type === ComponentType.CPU,
                    Gpu: post?.component.type === ComponentType.GPU,
                    Ram: post?.component.type === ComponentType.RAM,
                    Motherboard:
                        post?.component.type === ComponentType.MOTHERBOARD,
                    Hdd: post?.component.type === ComponentType.HDD,
                    Ssd: post?.component.type === ComponentType.SSD,
                    Psu: post?.component.type === ComponentType.POWER_SUPPLY,
                    Case: post?.component.type === ComponentType.CASE,
                    CaseFan: post?.component.type === ComponentType.CASE_FAN,
                    CpuCooler:
                        post?.component.type === ComponentType.CPU_COOLER,
                    WirelessNetworkCard:
                        post?.component.type ===
                        ComponentType.WIRELESS_NETWORK_CARD,
                },
            });

            const rating = await prisma.rating.aggregate({
                where: {
                    userId: post?.userId,
                },
                _avg: {
                    rating: true,
                },
                _count: {
                    rating: true,
                },
            });

            if (!post || !component) {
                throw new Error("Post not found");
            }

            return {
                id: post.id,
                title: post.title,
                description: post.description,
                price: post.price,
                images: post.images,
                component: {
                    type: post.component.type,
                    details:
                        post.component.type === ComponentType.CPU
                            ? component?.Cpu
                            : post.component.type === ComponentType.GPU
                              ? component?.Gpu
                              : post.component.type === ComponentType.RAM
                                ? component?.Ram
                                : post.component.type ===
                                    ComponentType.MOTHERBOARD
                                  ? component?.Motherboard
                                  : post.component.type === ComponentType.HDD
                                    ? component?.Hdd
                                    : post.component.type === ComponentType.SSD
                                      ? component?.Ssd
                                      : post.component.type ===
                                          ComponentType.POWER_SUPPLY
                                        ? component?.Psu
                                        : post.component.type ===
                                            ComponentType.CASE
                                          ? component?.Case
                                          : post.component.type ===
                                              ComponentType.CASE_FAN
                                            ? component?.CaseFan
                                            : post.component.type ===
                                                ComponentType.CPU_COOLER
                                              ? component?.CpuCooler
                                              : post.component.type ===
                                                  ComponentType.WIRELESS_NETWORK_CARD
                                                ? component?.WirelessNetworkCard
                                                : undefined,
                },
                seller: {
                    id: post.user.id,
                    name: post.user.name,
                    rating: {
                        avg: rating._avg.rating || 0,
                        count: rating._count.rating || 0,
                    },
                },
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
});
