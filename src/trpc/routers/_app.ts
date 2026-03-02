import { createTRPCRouter } from "../init";
import { userRouter } from "./user";
import { componentRouter } from "./components";
import { postRouter } from "./post";
import { configurationRouter } from "./configuration";
import { reportsRouter } from "./reports";
export const appRouter = createTRPCRouter({
    user: userRouter,
    components: componentRouter,
    posts: postRouter,
    configuration: configurationRouter,
    reports: reportsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
