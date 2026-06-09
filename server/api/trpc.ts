import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@/server/auth";

export async function createTRPCContext({ headers }: { headers: Headers }) {
  const session = await auth.api.getSession({ headers });

  return {
    session: session?.session ?? null,
    user: session?.user ?? null,
  };
}

const t = initTRPC.context<Awaited<ReturnType<typeof createTRPCContext>>>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});
