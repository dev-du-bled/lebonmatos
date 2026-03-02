import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export type AuthContext = {
    session: Awaited<ReturnType<typeof auth.api.getSession>> | null;
};

export const createTRPCContext = cache(async (): Promise<AuthContext> => {
    const hdrs = await headers();
    const session = await auth.api.getSession({ headers: hdrs });
    return { session };
});

const t = initTRPC.context<AuthContext>().create({});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;

export const privateProcedure = t.procedure.use(async ({ ctx, next }) => {
    if (!ctx.session || !ctx.session.session) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
        ctx: {
            session: ctx.session,
        },
    });
});

export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
    if (!ctx.session || !ctx.session.session) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    if (ctx.session.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
    }
    return next({
        ctx: {
            session: ctx.session,
        },
    });
});
