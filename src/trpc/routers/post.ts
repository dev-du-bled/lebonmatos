import { prisma } from "@/lib/prisma";
import z from "zod";
import { createTRPCRouter, privateProcedure } from "../init";

export const postRouter = createTRPCRouter({
  createPost: privateProcedure
    .input(
      z.object({
        componentId: z.string(),
        title: z.string().min(3).max(50),
        description: z.string().min(20).max(1500),
        price: z.number().min(0),
        images: z
          .array(
            z
              .string()
              .refine((val) => val.startsWith("data:image/"), {
                message: "Images must be base64 data URLs",
              })
              .transform((val) => {
                return val.split(",")[1];
              })
              .pipe(z.base64())
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
