import { z } from 'zod';

export const createRouter = (t: any) =>
  t.router({
    sync: t.procedure
      .input(
        z.object({
          kind: z.string(),
          targets: z.array(z.string()),
          reason: z.string(),
        })
      )
      .mutation(({ input, ctx }) => (ctx.app.service.sync as any)(input, ctx)),
  });
