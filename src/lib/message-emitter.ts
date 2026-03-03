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

export { messageEmitter, publish } from "./pg-pubsub";
