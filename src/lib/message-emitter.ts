import { EventEmitter } from "events";
import { Prisma } from "@prisma/client";

export type MessageEvent = Omit<
    Prisma.MessageGetPayload<{
        include: { author: { select: { id: true; name: true; image: true } } };
    }>,
    "sendedAt"
> & { sendedAt: string };

export type TypingEvent = {
    userId: string;
    name: string;
};

const globalForEmitter = global as unknown as { messageEmitter: EventEmitter };

export const messageEmitter =
    globalForEmitter.messageEmitter || new EventEmitter();

messageEmitter.setMaxListeners(200);

if (process.env.NODE_ENV !== "production") {
    globalForEmitter.messageEmitter = messageEmitter;
}
