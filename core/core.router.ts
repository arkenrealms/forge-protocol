// arken/forge/protocol/core/core.router.ts
//
import { z } from 'zod';

export const createRouter = (t: any) =>
  t.router({
    sync: t.procedure
      .input(
        z
          .object({
            kind: z.string().trim().min(1, 'kind is required'),
            targets: z.array(z.string().trim().min(1, 'target entry is required')).min(1, 'at least one target is required'),
            reason: z.string().trim().min(1, 'reason is required'),
          })
          .strict()
      )
      .mutation(({ input, ctx }) => {
        const sync = (ctx as any)?.app?.service?.sync;
        if (typeof sync !== 'function') {
          throw new Error('forge-protocol core.sync requires ctx.app.service.sync function');
        }

        const normalizedInput = {
          kind: input.kind.trim(),
          targets: input.targets.map((target) => target.trim()),
          reason: input.reason.trim(),
        };

        return sync(normalizedInput, ctx);
      }),
  });
