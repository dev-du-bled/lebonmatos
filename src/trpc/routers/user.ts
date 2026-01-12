import { createTRPCRouter, privateProcedure } from "../init";

export const userRouter = createTRPCRouter({
  meId: privateProcedure.query(({ ctx }) => {
    return ctx.session!.user.id;
  }),
});
