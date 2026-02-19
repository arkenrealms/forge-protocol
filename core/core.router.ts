// arken/forge/protocol/core/core.router.ts
//
import { z } from 'zod';

export const createRouter = (t: any) =>
  t.router({
    sync: t.procedure
      .input(
        z.object({
          kind: z.string().trim().min(1),
          targets: z.array(z.string().trim().min(1)).min(1),
          reason: z.string().trim().min(1),
        })
      )
      .mutation(({ input, ctx }) => {
        const sync = ctx?.app?.service?.sync;

        if (typeof sync !== 'function') {
          throw new TypeError('forge.core.sync requires ctx.app.service.sync to be a function');
        }

        return sync(input, ctx);
      }),
  });
