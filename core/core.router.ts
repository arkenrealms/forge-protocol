// arken/forge/protocol/core/core.router.ts
//
import { z } from 'zod';

const createErrorWithCause = (message: string, cause: unknown) => {
  const error = new Error(message) as Error & { cause?: unknown };
  error.cause = cause;
  return error;
};

const containsControlChars = (value: string) => /[\p{Cc}\p{Cf}]/u.test(value);

const sanitizeTypeDetail = (value: string, maxLength = 80) => {
  const withoutControls = value.replace(/[\p{Cc}\p{Cf}]+/gu, ' ').trim();
  if (withoutControls.length === 0) {
    return 'unknown';
  }

  return withoutControls.length > maxLength ? `${withoutControls.slice(0, maxLength)}…` : withoutControls;
};

const describeValueType = (value: unknown) => {
  if (value === null) {
    return 'null';
  }

  if (Array.isArray(value)) {
    return 'array';
  }

  const primitiveType = typeof value;
  if (primitiveType === 'function') {
    try {
      const rawName = (value as { name?: unknown })?.name;
      const fnName = typeof rawName === 'string' ? sanitizeTypeDetail(rawName) : 'unknown';
      return fnName === 'unknown' ? 'function' : `function:${fnName}`;
    } catch {
      return 'function:uninspectable-name';
    }
  }

  if (primitiveType !== 'object') {
    return primitiveType;
  }

  try {
    const constructorName = (value as { constructor?: { name?: unknown } })?.constructor?.name;
    if (typeof constructorName === 'string' && constructorName.length > 0) {
      return `object:${sanitizeTypeDetail(constructorName)}`;
    }
  } catch {
    return 'object:uninspectable-constructor';
  }

  return 'object';
};

const isClassConstructor = (value: unknown) => {
  if (typeof value !== 'function') {
    return false;
  }

  try {
    const source = Function.prototype.toString.call(value);
    if (/^class\s/.test(source)) {
      return true;
    }
  } catch {
    // ignore source inspection failures and continue with descriptor heuristics
  }

  try {
    const prototypeDescriptor = Object.getOwnPropertyDescriptor(value, 'prototype');
    if (prototypeDescriptor && prototypeDescriptor.writable === false) {
      return true;
    }
  } catch {
    // ignore descriptor inspection failures
  }

  return false;
};

const isInvokableSyncHandler = (value: unknown): value is (input: unknown, ctx: unknown) => unknown =>
  typeof value === 'function' && !isClassConstructor(value);

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

        if (!isInvokableSyncHandler(sync)) {
          throw new Error(
            `forge-protocol core.sync requires invokable ctx.app.service.sync function (received ${describeValueType(sync)})`
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
