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
});
