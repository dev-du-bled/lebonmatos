import { prisma } from "@/lib/prisma";
import z from "zod";
import { createTRPCRouter, privateProcedure } from "../init";

export const postRouter = createTRPCRouter({
  createPost: privateProcedure
    .input(
      z.object({
        componentId: z.string(),
        title: z.string().min(3).max(100),
        description: z.string().min(20).max(1500),
        price: z.number().min(0),
        images: z
          .array(
            z.string().refine(
              (val) => {
                const base64 = val.split(",")[1];
                return (
                  val.startsWith("data:image/") &&
                  z.base64().safeParse(base64).success
                );
              },
              {
                message: "Invalid image base64 encoding",
              }
            )
          )
          .max(6, { message: "You can upload up to 6 images" })
          .optional(),
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
