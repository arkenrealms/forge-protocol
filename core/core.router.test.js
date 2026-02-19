const { createRouter } = require('../build/core/core.router');

const createMockTrpc = () => {
  const state = { mutationResolver: null };

  const procedure = {
    input: () => ({
      mutation: (resolver) => {
        state.mutationResolver = resolver;
        return resolver;
      },
    }),
  };

  const t = {
    procedure,
    router: (shape) => shape,
  };

  return { t, state };
};

describe('core router sync mutation', () => {
  test('calls ctx.app.service.sync when present', () => {
    const { t, state } = createMockTrpc();
    createRouter(t);

    const input = { kind: 'sync', targets: ['a'], reason: 'test' };
    const ctx = { app: { service: { sync: jest.fn(() => 'ok') } } };

    const result = state.mutationResolver({ input, ctx });

    expect(result).toBe('ok');
    expect(ctx.app.service.sync).toHaveBeenCalledWith(input, ctx);
  });

  test('throws clear error when ctx.app.service.sync is missing', () => {
    const { t, state } = createMockTrpc();
    createRouter(t);

    expect(() => {
      state.mutationResolver({
        input: { kind: 'sync', targets: ['a'], reason: 'test' },
        ctx: { app: { service: {} } },
      });
    }).toThrow('forge-protocol core.sync requires ctx.app.service.sync function');
  });
});
