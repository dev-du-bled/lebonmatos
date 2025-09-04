import { z } from "zod";
import { publicProcedure, createTRPCRouter } from "../init";
import { userRouter } from "./user";
export const appRouter = createTRPCRouter({
  hello: publicProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
  user: userRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
