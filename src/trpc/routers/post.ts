import { prisma } from "@/lib/prisma";
import z from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../init";
import { ComponentType } from "@prisma/client";

export const postRouter = createTRPCRouter({
  createPost: privateProcedure
    .input(
      z.object({
        componentId: z.cuid(),
        title: z.string().min(3).max(100),
        description: z.string().min(20).max(1500),
        price: z.number().min(0),
        images: z
          .array(
            z.object({
              data: z.string().refine(
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
              ),
              alt: z.string({ error: "Image alt must be a string" }),
            })
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
          images: true,
        },
      });

      const component = await prisma.component.findUnique({
        where: { id: post?.componentId },
        include: {
          Cpu: post?.component.type === ComponentType.CPU,
          Gpu: post?.component.type === ComponentType.GPU,
          Ram: post?.component.type === ComponentType.RAM,
          Motherboard: post?.component.type === ComponentType.MOTHERBOARD,
          Hdd: post?.component.type === ComponentType.HDD,
          Ssd: post?.component.type === ComponentType.SSD,
          Psu: post?.component.type === ComponentType.POWER_SUPPLY,
          Case: post?.component.type === ComponentType.CASE,
          CaseFan: post?.component.type === ComponentType.CASE_FAN,
          CpuCooler: post?.component.type === ComponentType.CPU_COOLER,
          WirelessNetworkCard:
            post?.component.type === ComponentType.WIRELESS_NETWORK_CARD,
        },
      });

      const rating = await prisma.rating.aggregate({
        where: {
          userId: post?.userId,
        },
        _avg: {
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
              : post.component.type === ComponentType.MOTHERBOARD
              ? component?.Motherboard
              : post.component.type === ComponentType.HDD
              ? component?.Hdd
              : post.component.type === ComponentType.SSD
              ? component?.Ssd
              : post.component.type === ComponentType.POWER_SUPPLY
              ? component?.Psu
              : post.component.type === ComponentType.CASE
              ? component?.Case
              : post.component.type === ComponentType.CASE_FAN
              ? component?.CaseFan
              : post.component.type === ComponentType.CPU_COOLER
              ? component?.CpuCooler
              : post.component.type === ComponentType.WIRELESS_NETWORK_CARD
              ? component?.WirelessNetworkCard
              : undefined,
        },
        seller: {
          id: post.user.id,
          name: post.user.name,
          rating: rating._avg.rating ?? 0,
        },
      };
    }),
});
