import { prisma } from "@/lib/prisma";
import { postCreateSchema } from "@/lib/schema/post";
import { createTRPCRouter, privateProcedure } from "../init";

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
});
