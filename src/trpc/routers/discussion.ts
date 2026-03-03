import { on } from "node:events";
import { createTRPCRouter, privateProcedure } from "../init";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import {
    messageEmitter,
    publish,
    type MessageEvent,
    type TypingEvent,
} from "@/lib/message-emitter";

async function createSystemMessage(
    discussionId: string,
    options: {
        content?: string;
        imageUrls?: string[];
        buttonLabel?: string;
        buttonUrl?: string;
        buttonAction?: string;
    }
) {
    const message = await prisma.message.create({
        data: {
            discussionId,
            type: "SYSTEM",
            content: options.content ?? null,
            authorID: null,
            viewed: true,
            imageUrls: options.imageUrls ?? [],
            buttonLabel: options.buttonLabel ?? null,
            buttonUrl: options.buttonUrl ?? null,
            buttonAction: options.buttonAction ?? null,
        },
        include: {
            author: { select: { id: true, name: true, image: true } },
        },
    });

    const payload: MessageEvent = {
        id: message.id,
        discussionId: message.discussionId,
        type: message.type,
        content: message.content,
        price: message.price,
        authorID: message.authorID,
        author: null,
        sendedAt: message.sendedAt.toISOString(),
        viewed: message.viewed,
        imageUrls: message.imageUrls,
        buttonLabel: message.buttonLabel,
        buttonUrl: message.buttonUrl,
        buttonAction: message.buttonAction,
    };

    await publish(`message:${discussionId}`, payload);
    return payload;
}

export const discussionRouter = createTRPCRouter({
    getOrCreate: privateProcedure
        .input(
            z.object({
                postId: z.string().cuid(),
                sellerId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            if (userId === input.sellerId) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message:
                        "Vous ne pouvez pas contacter votre propre annonce",
                });
            }

            // Vérifier que sellerId est bien l'auteur du post
            const post = await prisma.post.findUnique({
                where: { id: input.postId },
                select: { userId: true, title: true },
            });

            if (!post) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Annonce introuvable",
                });
            }

            if (post.userId !== input.sellerId) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Vendeur invalide",
                });
            }

            const discussion = await prisma.discussion.upsert({
                where: {
                    postId_buyerId: {
                        postId: input.postId,
                        buyerId: userId,
                    },
                },
                create: {
                    postId: input.postId,
                    buyerId: userId,
                    sellerId: input.sellerId,
                },
                update: {},
            });

            // Si nouvelle discussion (aucun message), créer le message SYSTEM
            const messageCount = await prisma.message.count({
                where: { discussionId: discussion.id },
            });

            if (messageCount === 0) {
                await createSystemMessage(discussion.id, {
                    content: `Conversation démarrée pour "${post.title}"`,
                });
            }

            return { discussionId: discussion.id };
        }),

    getDiscussions: privateProcedure.query(async ({ ctx }) => {
        const userId = ctx.session.user.id;

        const discussions = await prisma.discussion.findMany({
            where: {
                OR: [{ buyerId: userId }, { sellerId: userId }],
            },
            include: {
                post: {
                    select: {
                        id: true,
                        title: true,
                        price: true,
                        images: true,
                    },
                },
                buyer: {
                    select: { id: true, image: true, username: true },
                },
                seller: {
                    select: { id: true, image: true, username: true },
                },
                messages: {
                    orderBy: { sendedAt: "desc" },
                    take: 1,
                },
                _count: {
                    select: {
                        messages: {
                            where: {
                                viewed: false,
                                authorID: { not: userId },
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        discussions.sort((a, b) => {
            const aTime = (a.messages[0]?.sendedAt ?? a.createdAt).getTime();
            const bTime = (b.messages[0]?.sendedAt ?? b.createdAt).getTime();
            return bTime - aTime;
        });

        return discussions.map((d) => {
            const isBuyer = d.buyerId === userId;
            const otherParty = isBuyer ? d.seller : d.buyer;
            const lastMsg = d.messages[0] ?? null;

            return {
                id: d.id,
                post: {
                    id: d.post?.id ?? "",
                    title: d.post?.title ?? "Annonce supprimée",
                    price: d.post?.price ?? 0,
                    thumbnail: d.post?.images[0] ?? null,
                },
                otherParty: otherParty
                    ? {
                          id: otherParty.id,
                          image: otherParty.image,
                          username: otherParty.username,
                      }
                    : { id: "", image: null, username: null },
                lastMessage: lastMsg
                    ? {
                          type: lastMsg.type,
                          content: lastMsg.content,
                          price: lastMsg.price,
                          imageUrls: lastMsg.imageUrls,
                          sendedAt: lastMsg.sendedAt.toISOString(),
                      }
                    : null,
                unreadCount: d._count.messages,
                isBuyer,
            };
        });
    }),

    getMessages: privateProcedure
        .input(
            z.object({
                discussionId: z.string().cuid(),
                cursor: z.string().cuid().optional(),
                limit: z.number().int().min(1).max(50).default(30),
            })
        )
        .query(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            const discussion = await prisma.discussion.findUnique({
                where: { id: input.discussionId },
                include: {
                    post: {
                        select: {
                            id: true,
                            title: true,
                            price: true,
                            images: true,
                        },
                    },
                    buyer: {
                        select: { id: true, image: true, username: true },
                    },
                    seller: {
                        select: { id: true, image: true, username: true },
                    },
                },
            });

            if (!discussion) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            if (
                discussion.buyerId !== userId &&
                discussion.sellerId !== userId
            ) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }

            // Marquer les messages reçus comme lus
            const updated = await prisma.message.updateMany({
                where: {
                    discussionId: input.discussionId,
                    authorID: { not: userId },
                    viewed: false,
                },
                data: { viewed: true },
            });

            // Notifier l'expéditeur que ses messages ont été lus
            if (updated.count > 0) {
                await publish(`read:${input.discussionId}`);
            }

            const rawMessages = await prisma.message.findMany({
                where: { discussionId: input.discussionId },
                orderBy: { sendedAt: "desc" },
                take: input.limit + 1,
                ...(input.cursor
                    ? { cursor: { id: input.cursor }, skip: 1 }
                    : {}),
                include: {
                    author: {
                        select: { id: true, name: true, image: true },
                    },
                },
            });

            const hasMore = rawMessages.length > input.limit;
            const messages = (
                hasMore ? rawMessages.slice(0, -1) : rawMessages
            ).reverse();
            const nextCursor = hasMore ? messages[0]?.id : undefined;

            const isBuyer = discussion.buyerId === userId;
            const otherParty = isBuyer ? discussion.seller : discussion.buyer;

            return {
                discussion: {
                    id: discussion.id,
                    post: {
                        id: discussion.post?.id ?? "",
                        title: discussion.post?.title ?? "Annonce supprimée",
                        price: discussion.post?.price ?? 0,
                        images: discussion.post?.images ?? [],
                    },
                    otherParty: otherParty
                        ? {
                              id: otherParty.id,
                              image: otherParty.image,
                              username: otherParty.username,
                          }
                        : {
                              id: "",
                              image: null,
                              username: null,
                          },
                    isBuyer,
                },
                messages: messages.map((m) => ({
                    id: m.id,
                    discussionId: m.discussionId,
                    type: m.type,
                    content: m.content,
                    price: m.price,
                    authorID: m.authorID,
                    author: m.author
                        ? {
                              id: m.author.id,
                              name: m.author.name,
                              image: m.author.image,
                          }
                        : null,
                    sendedAt: m.sendedAt.toISOString(),
                    viewed: m.viewed,
                    imageUrls: m.imageUrls,
                    buttonLabel: m.buttonLabel,
                    buttonUrl: m.buttonUrl,
                    buttonAction: m.buttonAction,
                })) satisfies MessageEvent[],
                hasMore,
                nextCursor,
            };
        }),

    markAsRead: privateProcedure
        .input(z.object({ discussionId: z.string().cuid() }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            const discussion = await prisma.discussion.findUnique({
                where: { id: input.discussionId },
                select: { buyerId: true, sellerId: true },
            });

            if (
                !discussion ||
                (discussion.buyerId !== userId &&
                    discussion.sellerId !== userId)
            ) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }

            const updated = await prisma.message.updateMany({
                where: {
                    discussionId: input.discussionId,
                    authorID: { not: userId },
                    viewed: false,
                },
                data: { viewed: true },
            });

            if (updated.count > 0) {
                await publish(`read:${input.discussionId}`);
            }

            return { count: updated.count };
        }),

    sendMessage: privateProcedure
        .input(
            z
                .object({
                    discussionId: z.string().cuid(),
                    content: z.string().min(1).max(2000).optional(),
                    price: z.number().int().min(1).max(32767).optional(),
                    type: z.enum(["TEXT", "OFFER"]).default("TEXT"),
                    imageUrls: z.array(z.string().url()).max(8).default([]),
                })
                .refine(
                    (d) =>
                        d.type !== "TEXT" ||
                        d.content !== undefined ||
                        d.imageUrls.length > 0,
                    {
                        message:
                            "Un message texte doit avoir du contenu ou des images",
                    }
                )
                .refine((d) => d.type !== "OFFER" || d.price !== undefined, {
                    message: "Une offre doit avoir un prix",
                })
        )
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            const discussion = await prisma.discussion.findUnique({
                where: { id: input.discussionId },
                select: { buyerId: true, sellerId: true },
            });

            if (!discussion) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            if (
                discussion.buyerId !== userId &&
                discussion.sellerId !== userId
            ) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }

            const message = await prisma.message.create({
                data: {
                    discussionId: input.discussionId,
                    type: input.type,
                    content: input.content ?? null,
                    price: input.price ?? null,
                    authorID: userId,
                    imageUrls: input.imageUrls,
                },
                include: {
                    author: {
                        select: { id: true, name: true, image: true },
                    },
                },
            });

            const payload: MessageEvent = {
                id: message.id,
                discussionId: message.discussionId,
                type: message.type,
                content: message.content,
                price: message.price,
                authorID: message.authorID,
                author: message.author
                    ? {
                          id: message.author.id,
                          name: message.author.name,
                          image: message.author.image,
                      }
                    : null,
                sendedAt: message.sendedAt.toISOString(),
                viewed: message.viewed,
                imageUrls: message.imageUrls,
                buttonLabel: message.buttonLabel,
                buttonUrl: message.buttonUrl,
                buttonAction: message.buttonAction,
            };

            // Notifier la conversation
            await publish(`message:${input.discussionId}`, payload);

            // Notifier la boîte de réception du destinataire
            const recipientId =
                discussion.buyerId === userId
                    ? discussion.sellerId
                    : discussion.buyerId;
            if (recipientId) {
                await publish(`inbox:${recipientId}`);
            }

            return payload;
        }),

    sendTyping: privateProcedure
        .input(z.object({ discussionId: z.cuid() }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;
            const name = ctx.session.user.name ?? "Quelqu'un";

            const discussion = await prisma.discussion.findUnique({
                where: { id: input.discussionId },
                select: { buyerId: true, sellerId: true },
            });

            if (
                !discussion ||
                (discussion.buyerId !== userId &&
                    discussion.sellerId !== userId)
            ) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }

            const event: TypingEvent = { userId, name };
            await publish(`typing:${input.discussionId}`, event);
            return { ok: true };
        }),

    onMessage: privateProcedure
        .input(z.object({ discussionId: z.cuid() }))
        .subscription(async function* ({ ctx, input, signal }) {
            const userId = ctx.session.user.id;

            const discussion = await prisma.discussion.findUnique({
                where: { id: input.discussionId },
                select: { buyerId: true, sellerId: true },
            });

            if (
                !discussion ||
                (discussion.buyerId !== userId &&
                    discussion.sellerId !== userId)
            ) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }

            try {
                for await (const [event] of on(
                    messageEmitter,
                    `message:${input.discussionId}`,
                    { signal }
                )) {
                    yield event as MessageEvent;
                }
            } catch (err) {
                if ((err as Error).name !== "AbortError") throw err;
            }
        }),

    onTyping: privateProcedure
        .input(z.object({ discussionId: z.cuid() }))
        .subscription(async function* ({ ctx, input, signal }) {
            const userId = ctx.session.user.id;

            const discussion = await prisma.discussion.findUnique({
                where: { id: input.discussionId },
                select: { buyerId: true, sellerId: true },
            });

            if (
                !discussion ||
                (discussion.buyerId !== userId &&
                    discussion.sellerId !== userId)
            ) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }

            try {
                for await (const [event] of on(
                    messageEmitter,
                    `typing:${input.discussionId}`,
                    { signal }
                )) {
                    const typingEvent = event as TypingEvent;
                    if (typingEvent.userId !== userId) {
                        yield typingEvent;
                    }
                }
            } catch (err) {
                if ((err as Error).name !== "AbortError") throw err;
            }
        }),

    onReadReceipt: privateProcedure
        .input(z.object({ discussionId: z.cuid() }))
        .subscription(async function* ({ ctx, input, signal }) {
            const userId = ctx.session.user.id;

            const discussion = await prisma.discussion.findUnique({
                where: { id: input.discussionId },
                select: { buyerId: true, sellerId: true },
            });

            if (
                !discussion ||
                (discussion.buyerId !== userId &&
                    discussion.sellerId !== userId)
            ) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }

            try {
                for await (const _ of on(
                    messageEmitter,
                    `read:${input.discussionId}`,
                    { signal }
                )) {
                    yield null;
                }
            } catch (err) {
                if ((err as Error).name !== "AbortError") throw err;
            }
        }),

    devSendSystemMessage: privateProcedure
        .input(
            z.object({
                discussionId: z.string().cuid(),
                content: z.string().optional(),
                imageUrls: z.array(z.string()).optional(),
                buttonLabel: z.string().optional(),
                buttonUrl: z.string().optional(),
                buttonAction: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            if (process.env.NODE_ENV !== "development") {
                throw new TRPCError({ code: "FORBIDDEN" });
            }
            const userId = ctx.session.user.id;
            const discussion = await prisma.discussion.findUnique({
                where: { id: input.discussionId },
                select: { buyerId: true, sellerId: true },
            });
            if (
                !discussion ||
                (discussion.buyerId !== userId &&
                    discussion.sellerId !== userId)
            ) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }
            return createSystemMessage(input.discussionId, {
                content: input.content ?? "Message système de test",
                imageUrls: input.imageUrls,
                buttonLabel: input.buttonLabel,
                buttonUrl: input.buttonUrl,
                buttonAction: input.buttonAction,
            });
        }),

    onNewMessage: privateProcedure.subscription(async function* ({
        ctx,
        signal,
    }) {
        const userId = ctx.session.user.id;

        try {
            for await (const _ of on(messageEmitter, `inbox:${userId}`, {
                signal,
            })) {
                yield null;
            }
        } catch (err) {
            if ((err as Error).name !== "AbortError") throw err;
        }
    }),
});
