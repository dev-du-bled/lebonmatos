import { createTRPCRouter } from "../init";
import { userRouter } from "./user";
import { componentRouter } from "./components";
import { postRouter } from "./post";
import { configurationRouter } from "./configuration";
import { discussionRouter } from "./discussion";
import { reportsRouter } from "./reports";
import { adminRouter } from "./admin";
export const appRouter = createTRPCRouter({
    user: userRouter,
    components: componentRouter,
    posts: postRouter,
    configuration: configurationRouter,
    discussions: discussionRouter,
    reports: reportsRouter,
    admin: adminRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
