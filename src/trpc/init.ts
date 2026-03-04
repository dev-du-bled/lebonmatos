import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

type Session = Awaited<ReturnType<typeof auth.api.getSession>>;

export type AuthContext = {
    /**
     * Résout la session uniquement à la demande.
     * Les procédures publiques ne l'appellent jamais → pas de headers() au
     * moment du build / des pages publiques → rendu statique possible.
     */
    getSession: () => Promise<Session | null>;
};

// Résolution de la session mise en cache par requête (React cache).
const getSessionCached = cache(async (): Promise<Session | null> => {
    const hdrs = await headers();
    return auth.api.getSession({ headers: hdrs });
});

export const createTRPCContext = cache(async (): Promise<AuthContext> => {
    return { getSession: getSessionCached };
});

const t = initTRPC.context<AuthContext>().create({});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;

export const privateProcedure = t.procedure.use(async ({ ctx, next }) => {
    const session = await ctx.getSession();
    if (!session || !session.session) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
        ctx: {
            session,
        },
    });
});

export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
    const session = await ctx.getSession();
    if (!session || !session.session) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    if (session.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
    }
    return next({
        ctx: {
            session,
        },
    });
});
