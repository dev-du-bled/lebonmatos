import { prisma } from "@/lib/prisma";
import { createTRPCRouter, privateProcedure } from "../init";
import z from "zod";

export const userRouter = createTRPCRouter({
  meId: privateProcedure.query(({ ctx }) => {
    return ctx.session!.user.id;
  }),

  createPost: privateProcedure
    .input(
      z.object({
        componentId: z.string(),
        title: z.string().min(3).max(50),
        description: z.string().min(20).max(1500),
        price: z.number().min(0),
        images: z.array(z.string()).max(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const post = await prisma.post.create({
          data: {
            userId: ctx.session!.user.id,
            title: input.title,
            description: input.description,
            price: input.price,
            componentId: input.componentId,
            images: input.images,
          },
        });

        return {
          postId: post.id,
        };
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }),
});
