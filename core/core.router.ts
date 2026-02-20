// arken/forge/protocol/core/core.router.ts
//
import { z } from 'zod';

export const createRouter = (t: any) =>
  t.router({
    sync: t.procedure
      .input(
        z
          .object({
            kind: z.string().trim().min(1, 'kind is required').max(128, 'kind must be at most 128 characters'),
            targets: z
              .array(z.string().trim().min(1, 'target entry is required').max(128, 'target entry must be at most 128 characters'))
              .min(1, 'at least one target is required')
              .max(64, 'at most 64 targets are allowed'),
            reason: z.string().trim().min(1, 'reason is required').max(512, 'reason must be at most 512 characters'),
          })
          .strict()
          .superRefine((value, ctx) => {
            const seen = new Set();
            for (const target of value.targets) {
              const normalizedTarget = target.trim();
              if (seen.has(normalizedTarget)) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  path: ['targets'],
                  message: 'targets must be unique',
                });
                break;
              }
              seen.add(normalizedTarget);
            }
          })
      )
      .mutation(async ({ input, ctx }) => {
        let sync: unknown;
        try {
          sync = (ctx as any)?.app?.service?.sync;
        } catch {
          throw new Error('forge-protocol core.sync could not read ctx.app.service.sync');
        }

        if (typeof sync !== 'function') {
          throw new Error('forge-protocol core.sync requires ctx.app.service.sync function');
        }

        const normalizedInput = {
          kind: input.kind.trim(),
          targets: input.targets.map((target) => target.trim()),
          reason: input.reason.trim(),
        };

        try {
          return await Promise.resolve(sync(normalizedInput, ctx));
        } catch (error) {
          if (error instanceof Error) {
            throw error;
          }

          throw new Error('forge-protocol core.sync failed with non-error throwable');
        }
      }),
  });
