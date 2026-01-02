import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { postCreateSchema } from "@/lib/schema/post";
import { createTRPCRouter, privateProcedure } from "../init";
import { utapi } from "@/lib/utapi";

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
});
