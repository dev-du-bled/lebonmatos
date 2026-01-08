import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "../init";
import { ComponentType } from "@prisma/client";
import { TRPCError } from "@trpc/server";

const configurationItemSchema = z.object({
  componentType: z.enum(ComponentType),
  postId: z.string().nullable(),
  quantity: z.number().min(1).max(10).default(1),
});

const saveConfigurationSchema = z.object({
  id: z.string().optional(), // If provided, update existing configuration
  name: z.string().min(1).max(100),
  isPublic: z.boolean().default(false),
  items: z.array(configurationItemSchema),
});

// Include component details with post
const postWithComponentInclude = {
  component: {
    include: {
      Cpu: true,
      Gpu: true,
      Motherboard: true,
      Ram: true,
      Ssd: true,
      Hdd: true,
      Psu: true,
      CpuCooler: true,
      Case: true,
      CaseFan: true,
      SoundCard: true,
      WirelessNetworkCard: true,
    },
  },
};

export const configurationRouter = createTRPCRouter({
  // Save a configuration (create or update)
  save: privateProcedure
    .input(saveConfigurationSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // If updating existing configuration, verify ownership
      if (input.id) {
        const existing = await prisma.configuration.findUnique({
          where: { id: input.id },
        });

        if (!existing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Configuration non trouvée",
          });
        }

        if (existing.userId !== userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Vous ne pouvez pas modifier cette configuration",
          });
        }

        // Delete existing items and create new ones
        await prisma.configurationItem.deleteMany({
          where: { configurationId: input.id },
        });

        const updated = await prisma.configuration.update({
          where: { id: input.id },
          data: {
            name: input.name,
            isPublic: input.isPublic,
            items: {
              create: input.items
                .filter((item) => item.postId)
                .map((item) => ({
                  componentType: item.componentType,
                  postId: item.postId,
                  quantity: item.quantity,
                })),
            },
          },
          include: {
            items: {
              include: {
                post: {
                  include: postWithComponentInclude,
                },
              },
            },
          },
        });

        return updated;
      }

      // Create new configuration
      const configuration = await prisma.configuration.create({
        data: {
          name: input.name,
          userId,
          isPublic: input.isPublic,
          items: {
            create: input.items
              .filter((item) => item.postId)
              .map((item) => ({
                componentType: item.componentType,
                postId: item.postId,
                quantity: item.quantity,
              })),
          },
        },
        include: {
          items: {
            include: {
              post: {
                include: postWithComponentInclude,
              },
            },
          },
        },
      });

      return configuration;
    }),

  // Get a configuration by ID (public if isPublic, or owner only)
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const configuration = await prisma.configuration.findUnique({
        where: { id: input.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              displayUsername: true,
              image: true,
            },
          },
          items: {
            include: {
              post: {
                include: postWithComponentInclude,
              },
            },
          },
        },
      });

      if (!configuration) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Configuration non trouvée",
        });
      }

      // Check access rights
      const userId = ctx.session?.user?.id;
      if (!configuration.isPublic && configuration.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cette configuration n'est pas publique",
        });
      }

      return configuration;
    }),

  // List user's configurations
  list: privateProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const configurations = await prisma.configuration.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        items: {
          include: {
            post: {
              select: {
                id: true,
                title: true,
                price: true,
                images: true,
              },
            },
          },
        },
      },
    });

    return configurations.map((config) => ({
      ...config,
      totalPrice: config.items.reduce(
        (acc, item) => acc + (item.post?.price || 0) * item.quantity,
        0
      ),
      itemCount: config.items.length,
    }));
  }),

  // Delete a configuration
  delete: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const configuration = await prisma.configuration.findUnique({
        where: { id: input.id },
      });

      if (!configuration) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Configuration non trouvée",
        });
      }

      if (configuration.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Vous ne pouvez pas supprimer cette configuration",
        });
      }

      await prisma.configuration.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Clone a configuration (for sharing feature)
  clone: privateProcedure
    .input(z.object({ id: z.string(), name: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const original = await prisma.configuration.findUnique({
        where: { id: input.id },
        include: {
          items: true,
        },
      });

      if (!original) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Configuration non trouvée",
        });
      }

      // Check if user can access this config
      if (!original.isPublic && original.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cette configuration n'est pas publique",
        });
      }

      // Create a clone for the current user
      const clone = await prisma.configuration.create({
        data: {
          name: input.name || `${original.name} (copie)`,
          userId,
          isPublic: false,
          items: {
            create: original.items.map((item) => ({
              componentType: item.componentType,
              postId: item.postId,
              quantity: item.quantity,
            })),
          },
        },
        include: {
          items: {
            include: {
              post: {
                include: postWithComponentInclude,
              },
            },
          },
        },
      });

      return clone;
    }),

  // Search posts by component type (for the component selector)
  searchPosts: publicProcedure
    .input(
      z.object({
        componentType: z.nativeEnum(ComponentType),
        query: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ input }) => {
      const posts = await prisma.post.findMany({
        where: {
          component: {
            type: input.componentType,
            ...(input.query && input.query.length >= 2
              ? {
                  name: {
                    contains: input.query,
                    mode: "insensitive",
                  },
                }
              : {}),
          },
        },
        include: {
          component: {
            include: {
              Cpu: true,
              Gpu: true,
              Motherboard: true,
              Ram: true,
              Ssd: true,
              Hdd: true,
              Psu: true,
              CpuCooler: true,
              Case: true,
              CaseFan: true,
              SoundCard: true,
              WirelessNetworkCard: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              displayUsername: true,
            },
          },
        },
        orderBy: { price: "asc" },
        take: input.limit,
      });

      return posts;
    }),

  // Get user's favorite posts for a component type
  getFavoritePosts: privateProcedure
    .input(
      z.object({
        componentType: z.nativeEnum(ComponentType),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const favorites = await prisma.favorite.findMany({
        where: {
          userId,
          post: {
            component: {
              type: input.componentType,
            },
          },
        },
        include: {
          post: {
            include: {
              component: {
                include: {
                  Cpu: true,
                  Gpu: true,
                  Motherboard: true,
                  Ram: true,
                  Ssd: true,
                  Hdd: true,
                  Psu: true,
                  CpuCooler: true,
                  Case: true,
                  CaseFan: true,
                  SoundCard: true,
                  WirelessNetworkCard: true,
                },
              },
              user: {
                select: {
                  id: true,
                  name: true,
                  displayUsername: true,
                },
              },
            },
          },
        },
      });

      return favorites.map((f) => f.post);
    }),
});
