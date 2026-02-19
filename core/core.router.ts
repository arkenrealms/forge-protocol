// arken/forge/protocol/core/core.router.ts
//
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
      .mutation(({ input, ctx }) => {
        const sync = (ctx as any)?.app?.service?.sync;

        if (typeof sync !== 'function') {
          throw new Error('forge.core.sync service is unavailable');
        }

        return sync(input, ctx);
      }),
  });
