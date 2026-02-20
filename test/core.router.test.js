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
    ).rejects.toThrow('forge-protocol core.sync requires ctx.app.service.sync function');
  });

  test('throws a clear error when reading sync handler throws', async () => {
    const service = {};
    Object.defineProperty(service, 'sync', {
      get() {
        throw new Error('sync getter exploded');
      },
    });

    const caller = t.createCallerFactory(createRouter(t))({ app: { service } });

    await expect(caller.sync({ kind: 'refresh', targets: ['ui'], reason: 'manual' })).rejects.toThrow(
      'forge-protocol core.sync could not read ctx.app.service.sync'
    );
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

  test('converts sync throws of non-Error values into a stable protocol error', async () => {
    const sync = jest.fn(() => {
      throw 'sync exploded';
    });
    const caller = t.createCallerFactory(createRouter(t))({ app: { service: { sync } } });

    await expect(caller.sync({ kind: 'refresh', targets: ['ui'], reason: 'manual' })).rejects.toThrow(
      'forge-protocol core.sync failed with non-error throwable'
    );
  });

  test('converts sync rejections of non-Error values into a stable protocol error', async () => {
    const sync = jest.fn().mockRejectedValue(42);
    const caller = t.createCallerFactory(createRouter(t))({ app: { service: { sync } } });

    await expect(caller.sync({ kind: 'refresh', targets: ['ui'], reason: 'manual' })).rejects.toThrow(
      'forge-protocol core.sync failed with non-error throwable'
    );
  });
});
