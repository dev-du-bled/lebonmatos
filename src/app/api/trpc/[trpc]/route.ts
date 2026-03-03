import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createTRPCContext } from "@/trpc/init";
import { appRouter } from "@/trpc/routers/_app";

export const dynamic = "force-dynamic";

const handler = (req: Request) =>
    fetchRequestHandler({
        endpoint: "/api/trpc",
        req,
        router: appRouter,
        createContext: createTRPCContext,
        onError:
            process.env.NODE_ENV === "development"
                ? ({ path, error }) => {
                      console.error(`[tRPC] /${path}`, error);
                  }
                : undefined,
    });
export { handler as GET, handler as POST };
