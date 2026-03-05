import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createTRPCRouter, adminProcedure } from "../init";
import { Prisma } from "@prisma/client";

const userSelect = {
    id: true,
    name: true,
    email: true,
    emailVerified: true,
    image: true,
    createdAt: true,
    updatedAt: true,
    role: true,
    banned: true,
    banReason: true,
    banExpires: true,
    username: true,
} satisfies Prisma.UserSelect;

const ALLOWED_SORT_FIELDS = [
    "createdAt",
    "name",
    "email",
    "updatedAt",
] as const;
type SortField = (typeof ALLOWED_SORT_FIELDS)[number];

export const adminRouter = createTRPCRouter({
    listUsers: adminProcedure
        .input(
            z.object({
                limit: z.number().int().min(1).max(100).default(10),
                offset: z.number().int().min(0).default(0),
                sortBy: z.enum(ALLOWED_SORT_FIELDS).default("createdAt"),
                sortDirection: z.enum(["asc", "desc"]).default("desc"),
                search: z.string().optional(),
            })
        )
        .query(async ({ input }) => {
            const { limit, offset, sortBy, sortDirection, search } = input;

            const where: Prisma.UserWhereInput = search
                ? {
                      OR: [
                          { name: { contains: search, mode: "insensitive" } },
                          { email: { contains: search, mode: "insensitive" } },
                          {
                              username: {
                                  contains: search,
                                  mode: "insensitive",
                              },
                          },
                          {
                              phoneNumber: {
                                  contains: search,
                                  mode: "insensitive",
                              },
                          },
                      ],
                  }
                : {};

            const orderBy: Prisma.UserOrderByWithRelationInput = {
                [sortBy as SortField]: sortDirection,
            };

            const [users, total] = await prisma.$transaction([
                prisma.user.findMany({
                    where,
                    select: userSelect,
                    orderBy,
                    take: limit,
                    skip: offset,
                }),
                prisma.user.count({ where }),
            ]);

            return { users, total };
        }),
});
