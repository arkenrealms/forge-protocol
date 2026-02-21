// arken/forge/protocol/core/core.router.ts
//
import { z } from 'zod';

const createErrorWithCause = (message: string, cause: unknown) => {
  const error = new Error(message) as Error & { cause?: unknown };
  error.cause = cause;
  return error;
};

const containsControlChars = (value: string) => /[\p{Cc}\p{Cf}]/u.test(value);

const describeValueType = (value: unknown) => {
  if (value === null) {
    return 'null';
  }

  if (Array.isArray(value)) {
    return 'array';
  }

  const primitiveType = typeof value;
  if (primitiveType !== 'object') {
    return primitiveType;
  }

  try {
    const constructorName = (value as { constructor?: { name?: unknown } })?.constructor?.name;
    if (typeof constructorName === 'string' && constructorName.length > 0) {
      return `object:${constructorName}`;
    }
  } catch {
    return 'object:uninspectable-constructor';
  }

  return 'object';
};

const zz = {
  string: (fieldName: string, maxLength: number) =>
    z
      .string()
      .refine((value) => !containsControlChars(value), `${fieldName} must not contain control/format characters`)
      .transform((value) => value.trim().normalize('NFC'))
      .pipe(
        z
          .string()
          .min(1, `${fieldName} is required`)
          .max(maxLength, `${fieldName} must be at most ${maxLength} characters`)
      ),
};

const syncInputSchema = z
  .object({
    kind: zz.string('kind', 128),
    targets: z.array(zz.string('target entry', 128)).min(1, 'at least one target is required').max(64, 'at most 64 targets are allowed'),
    reason: zz.string('reason', 512),
  })
  .strict()
  .refine(({ targets }) => new Set(targets).size === targets.length, {
    path: ['targets'],
    message: 'targets must be unique',
  });

export const createRouter = (t: any) =>
  t.router({
    sync: t.procedure
      .input(syncInputSchema)
      .mutation(async ({ input, ctx }) => {
        let sync: unknown;
        try {
          sync = (ctx as any)?.app?.service?.sync;
        } catch (error) {
          throw createErrorWithCause('forge-protocol core.sync could not read ctx.app.service.sync', error);
        }

        if (typeof sync !== 'function') {
          throw new Error(
            `forge-protocol core.sync requires ctx.app.service.sync function (received ${describeValueType(sync)})`
          );
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

          throw createErrorWithCause(
            `forge-protocol core.sync failed with non-error throwable (received ${describeValueType(error)})`,
            error
          );
        }
      }),
  });
