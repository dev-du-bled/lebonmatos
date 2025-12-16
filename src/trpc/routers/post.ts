import { prisma } from "@/lib/prisma";
import { postCreateSchema } from "@/lib/schema/post";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../init";
import z from "zod";

export const postRouter = createTRPCRouter({
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
                        location: input.location,
                        componentId: input.componentId,
                        images: {
                            create:
                                input.images?.map((img) => ({
                                    image: img.data,
                                    alt: img.alt,
                                })) || [],
                        },
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

    // getLatestPosts: publicProcedure
    //     .input(
    //         z.object({
    //             max: z.number().default(10),
    //         })
    //     )
    //     .query(async ({ input }) => {
    //         return {
    //             posts: await prisma.post.findMany({
    //                 take: input.max,
    //                 include: {
    //                     user: true,
    //                 },
    //             }),
    //         };
    //     }),
});
