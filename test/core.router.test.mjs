import test from 'node:test';
import assert from 'node:assert/strict';
import { initTRPC } from '@trpc/server';
import { createRouter } from '../core/core.router.ts';

test('core.sync calls ctx.app.service.sync with normalized input + ctx', async () => {
  const t = initTRPC.context().create();
  const calls = [];
  const sync = async (input, ctx) => {
    calls.push({ input, ctx });
    return { ok: true };
  };

  const router = createRouter(t);
  const caller = t.createCallerFactory(router)({ app: { service: { sync } } });

  const input = { kind: ' refresh ', targets: [' quests '], reason: ' manual ' };
  const result = await caller.sync(input);

  assert.deepEqual(result, { ok: true });
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].input, { kind: 'refresh', targets: ['quests'], reason: 'manual' });
  assert.equal(calls[0].ctx.app.service.sync, sync);
});

test('core.sync throws clear error when ctx.app.service.sync is missing', async () => {
  const t = initTRPC.context().create();
  const router = createRouter(t);
  const caller = t.createCallerFactory(router)({ app: { service: {} } });

  await assert.rejects(
    caller.sync({ kind: 'refresh', targets: ['quests'], reason: 'manual' }),
    /forge\.core\.sync requires ctx\.app\.service\.sync to be a function/
  );
});

test('core.sync rejects blank kind/reason and empty targets', async () => {
  const t = initTRPC.context().create();
  const router = createRouter(t);
  const caller = t.createCallerFactory(router)({ app: { service: { sync: async () => ({ ok: true }) } } });

  await assert.rejects(caller.sync({ kind: ' ', targets: ['quests'], reason: 'manual' }));
  await assert.rejects(caller.sync({ kind: 'refresh', targets: [], reason: 'manual' }));
  await assert.rejects(caller.sync({ kind: 'refresh', targets: ['   '], reason: 'manual' }));
  await assert.rejects(caller.sync({ kind: 'refresh', targets: ['quests'], reason: '  ' }));
});
