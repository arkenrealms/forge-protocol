const { initTRPC } = require('@trpc/server');
const { createRouter } = require('../build/core/core.router');

describe('forge protocol core.sync router', () => {
  const t = initTRPC.context().create();

  test('dispatches to ctx.app.service.sync when available', async () => {
    const sync = jest.fn().mockResolvedValue({ ok: true });
    const caller = t.createCallerFactory(createRouter(t))({
      app: { service: { sync } },
    });

    const payload = { kind: 'refresh', targets: ['ui'], reason: 'manual' };
    await expect(caller.sync(payload)).resolves.toEqual({ ok: true });
    expect(sync).toHaveBeenCalledWith(payload, expect.any(Object));
  });

  test('throws a clear error when sync handler is missing', async () => {
    const caller = t.createCallerFactory(createRouter(t))({ app: { service: {} } });

    await expect(
      caller.sync({ kind: 'refresh', targets: ['ui'], reason: 'manual' })
    ).rejects.toThrow('forge-protocol core.sync requires ctx.app.service.sync function (received undefined)');
  });

  test('surfaces the received sync handler type in missing-handler errors', async () => {
    const caller = t.createCallerFactory(createRouter(t))({ app: { service: { sync: null } } });

    await expect(
      caller.sync({ kind: 'refresh', targets: ['ui'], reason: 'manual' })
    ).rejects.toThrow('forge-protocol core.sync requires ctx.app.service.sync function (received null)');
  });

  test('surfaces constructor-aware type diagnostics for non-callable object handlers', async () => {
    const caller = t.createCallerFactory(createRouter(t))({ app: { service: { sync: {} } } });

    await expect(
      caller.sync({ kind: 'refresh', targets: ['ui'], reason: 'manual' })
    ).rejects.toThrow('forge-protocol core.sync requires ctx.app.service.sync function (received object:Object)');
  });

  test('falls back to uninspectable constructor diagnostics when constructor access throws', async () => {
    const unstableSync = {};
    Object.defineProperty(unstableSync, 'constructor', {
      get() {
        throw new Error('constructor getter exploded');
      },
    });

    const caller = t.createCallerFactory(createRouter(t))({ app: { service: { sync: unstableSync } } });

    await expect(
      caller.sync({ kind: 'refresh', targets: ['ui'], reason: 'manual' })
    ).rejects.toThrow(
      'forge-protocol core.sync requires ctx.app.service.sync function (received object:uninspectable-constructor)'
    );
  });

  test('throws a clear error when reading sync handler throws', async () => {
    const service = {};
    Object.defineProperty(service, 'sync', {
      get() {
        throw new Error('sync getter exploded');
      },
    });

    const caller = t.createCallerFactory(createRouter(t))({ app: { service } });

    await expect(caller.sync({ kind: 'refresh', targets: ['ui'], reason: 'manual' })).rejects.toMatchObject({
      message: 'forge-protocol core.sync could not read ctx.app.service.sync',
      cause: expect.any(Error),
    });
  });

  test('rejects empty targets payloads', async () => {
    const sync = jest.fn();
    const caller = t.createCallerFactory(createRouter(t))({ app: { service: { sync } } });

    await expect(caller.sync({ kind: 'refresh', targets: [], reason: 'manual' })).rejects.toThrow(
      'at least one target is required'
    );
    expect(sync).not.toHaveBeenCalled();
  });

  test('rejects blank reason payloads', async () => {
    const sync = jest.fn();
    const caller = t.createCallerFactory(createRouter(t))({ app: { service: { sync } } });

    await expect(caller.sync({ kind: 'refresh', targets: ['ui'], reason: '   ' })).rejects.toThrow(
      'reason is required'
    );
    expect(sync).not.toHaveBeenCalled();
  });

  test('rejects mixed target arrays with blank entries', async () => {
    const sync = jest.fn();
    const caller = t.createCallerFactory(createRouter(t))({ app: { service: { sync } } });

    await expect(caller.sync({ kind: 'refresh', targets: ['ui', '   '], reason: 'manual' })).rejects.toThrow(
      'target entry is required'
    );
    expect(sync).not.toHaveBeenCalled();
  });

  test('normalizes whitespace around payload fields before dispatch', async () => {
    const sync = jest.fn().mockResolvedValue({ ok: true });
    const caller = t.createCallerFactory(createRouter(t))({ app: { service: { sync } } });

    await expect(
      caller.sync({ kind: '  refresh  ', targets: [' ui ', ' jobs '], reason: ' manual  ' })
    ).resolves.toEqual({ ok: true });

    expect(sync).toHaveBeenCalledWith(
      { kind: 'refresh', targets: ['ui', 'jobs'], reason: 'manual' },
      expect.any(Object)
    );
  });

  test('normalizes Unicode canonically equivalent payload text before dispatch', async () => {
    const sync = jest.fn().mockResolvedValue({ ok: true });
    const caller = t.createCallerFactory(createRouter(t))({ app: { service: { sync } } });

    await expect(caller.sync({ kind: 're\u0301fresh', targets: ['ui'], reason: 'manu\u0301al' })).resolves.toEqual({ ok: true });

    expect(sync).toHaveBeenCalledWith(
      { kind: 'réfresh', targets: ['ui'], reason: 'manúal'.normalize('NFC') },
      expect.any(Object)
    );
  });

  test('rejects kind values that become empty after trimming', async () => {
    const sync = jest.fn();
    const caller = t.createCallerFactory(createRouter(t))({ app: { service: { sync } } });

    await expect(caller.sync({ kind: '   ', targets: ['ui'], reason: 'manual' })).rejects.toThrow('kind is required');
    expect(sync).not.toHaveBeenCalled();
  });

  test('rejects unknown keys to avoid silent payload drift', async () => {
    const sync = jest.fn();
    const caller = t.createCallerFactory(createRouter(t))({ app: { service: { sync } } });

    await expect(
      caller.sync({ kind: 'refresh', targets: ['ui'], reason: 'manual', extra: 'field' })
    ).rejects.toThrow('Unrecognized key(s) in object');
    expect(sync).not.toHaveBeenCalled();
  });

  test('rejects duplicate targets after normalization', async () => {
    const sync = jest.fn();
    const caller = t.createCallerFactory(createRouter(t))({ app: { service: { sync } } });

    await expect(
      caller.sync({ kind: 'refresh', targets: [' ui ', 'ui'], reason: 'manual' })
    ).rejects.toThrow('targets must be unique');
    expect(sync).not.toHaveBeenCalled();
  });

  test('rejects canonically equivalent Unicode targets as duplicates', async () => {
    const sync = jest.fn();
    const caller = t.createCallerFactory(createRouter(t))({ app: { service: { sync } } });

    await expect(caller.sync({ kind: 'refresh', targets: ['caf\u00E9', 'cafe\u0301'], reason: 'manual' })).rejects.toThrow(
      'targets must be unique'
    );
    expect(sync).not.toHaveBeenCalled();
  });

  test('rejects oversized kind values', async () => {
    const sync = jest.fn();
    const caller = t.createCallerFactory(createRouter(t))({ app: { service: { sync } } });

    await expect(caller.sync({ kind: 'k'.repeat(129), targets: ['ui'], reason: 'manual' })).rejects.toThrow(
      'kind must be at most 128 characters'
    );
    expect(sync).not.toHaveBeenCalled();
  });

  test('rejects oversized target entries', async () => {
    const sync = jest.fn();
    const caller = t.createCallerFactory(createRouter(t))({ app: { service: { sync } } });

    await expect(caller.sync({ kind: 'refresh', targets: ['t'.repeat(129)], reason: 'manual' })).rejects.toThrow(
      'target entry must be at most 128 characters'
    );
    expect(sync).not.toHaveBeenCalled();
  });

  test('rejects oversized target arrays', async () => {
    const sync = jest.fn();
    const caller = t.createCallerFactory(createRouter(t))({ app: { service: { sync } } });

    await expect(
      caller.sync({ kind: 'refresh', targets: Array.from({ length: 65 }, (_, index) => `target-${index}`), reason: 'manual' })
    ).rejects.toThrow('at most 64 targets are allowed');
    expect(sync).not.toHaveBeenCalled();
  });

  test('rejects oversized reason values', async () => {
    const sync = jest.fn();
    const caller = t.createCallerFactory(createRouter(t))({ app: { service: { sync } } });

    await expect(caller.sync({ kind: 'refresh', targets: ['ui'], reason: 'r'.repeat(513) })).rejects.toThrow(
      'reason must be at most 512 characters'
    );
    expect(sync).not.toHaveBeenCalled();
  });

  test('rejects kind values containing control characters even when trimmable', async () => {
    const sync = jest.fn();
    const caller = t.createCallerFactory(createRouter(t))({ app: { service: { sync } } });

    await expect(caller.sync({ kind: '\nrefresh', targets: ['ui'], reason: 'manual' })).rejects.toThrow(
      'kind must not contain control characters'
    );
    expect(sync).not.toHaveBeenCalled();
  });

  test('rejects target entries containing control characters', async () => {
    const sync = jest.fn();
    const caller = t.createCallerFactory(createRouter(t))({ app: { service: { sync } } });

    await expect(caller.sync({ kind: 'refresh', targets: ['ui\tpanel'], reason: 'manual' })).rejects.toThrow(
      'target entry must not contain control characters'
    );
    expect(sync).not.toHaveBeenCalled();
  });

  test('rejects reason values containing control characters', async () => {
    const sync = jest.fn();
    const caller = t.createCallerFactory(createRouter(t))({ app: { service: { sync } } });

    await expect(caller.sync({ kind: 'refresh', targets: ['ui'], reason: 'manual\nops' })).rejects.toThrow(
      'reason must not contain control characters'
    );
    expect(sync).not.toHaveBeenCalled();
  });

  test('rejects reason values with trailing control characters that trim would otherwise remove', async () => {
    const sync = jest.fn();
    const caller = t.createCallerFactory(createRouter(t))({ app: { service: { sync } } });

    await expect(caller.sync({ kind: 'refresh', targets: ['ui'], reason: 'manual\n' })).rejects.toThrow(
      'reason must not contain control characters'
    );
    expect(sync).not.toHaveBeenCalled();
  });

  test('rejects C1 unicode control characters in target entries', async () => {
    const sync = jest.fn();
    const caller = t.createCallerFactory(createRouter(t))({ app: { service: { sync } } });

    await expect(caller.sync({ kind: 'refresh', targets: ['ui\u0085panel'], reason: 'manual' })).rejects.toThrow(
      'target entry must not contain control characters'
    );
    expect(sync).not.toHaveBeenCalled();
  });

  test('rejects format control characters in kind values', async () => {
    const sync = jest.fn();
    const caller = t.createCallerFactory(createRouter(t))({ app: { service: { sync } } });

    await expect(caller.sync({ kind: 're\u200Bfresh', targets: ['ui'], reason: 'manual' })).rejects.toThrow(
      'kind must not contain control characters'
    );
    expect(sync).not.toHaveBeenCalled();
  });

  test('converts sync throws of non-Error values into a stable protocol error', async () => {
    const sync = jest.fn(() => {
      throw 'sync exploded';
    });
    const caller = t.createCallerFactory(createRouter(t))({ app: { service: { sync } } });

    try {
      await caller.sync({ kind: 'refresh', targets: ['ui'], reason: 'manual' });
      throw new Error('expected sync call to reject');
    } catch (error) {
      expect(error.cause).toBeInstanceOf(Error);
      expect(error.cause.message).toBe('forge-protocol core.sync failed with non-error throwable');
      expect(error.cause.cause).toBe('sync exploded');
    }
  });

  test('converts sync rejections of non-Error values into a stable protocol error', async () => {
    const sync = jest.fn().mockRejectedValue(42);
    const caller = t.createCallerFactory(createRouter(t))({ app: { service: { sync } } });

    try {
      await caller.sync({ kind: 'refresh', targets: ['ui'], reason: 'manual' });
      throw new Error('expected sync call to reject');
    } catch (error) {
      expect(error.cause).toBeInstanceOf(Error);
      expect(error.cause.message).toBe('forge-protocol core.sync failed with non-error throwable');
      expect(error.cause.cause).toBe(42);
    }
  });
});
