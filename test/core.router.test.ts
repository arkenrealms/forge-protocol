import { createRouter } from '../core/core.router';
import { t } from '../index';

describe('forge protocol core.sync router', () => {
  it('dispatches to ctx.app.service.sync with input and ctx', async () => {
    const sync = jest.fn().mockResolvedValue({ ok: true });
    const router = createRouter(t);
    const caller = t.createCallerFactory(router)({
      app: { service: { sync } },
    } as any);

    const input = {
      kind: 'profile.refresh',
      targets: ['user:1'],
      reason: 'manual',
    };

    await expect(caller.sync(input)).resolves.toEqual({ ok: true });
    expect(sync).toHaveBeenCalledWith(input, expect.anything());
  });

  it('throws a clear error when ctx.app.service.sync is unavailable', async () => {
    const router = createRouter(t);
    const caller = t.createCallerFactory(router)({ app: { service: {} } } as any);

    await expect(
      caller.sync({
        kind: 'profile.refresh',
        targets: ['user:1'],
        reason: 'manual',
      })
    ).rejects.toThrow('forge.core.sync service is unavailable');
  });
});
