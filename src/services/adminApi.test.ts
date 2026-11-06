import test from 'node:test';
import assert from 'node:assert/strict';
import { adminApi } from './adminApi.js';

test('adminApi.getMe returns signed-in admin status', async () => {
  const me = await adminApi.getMe('zubair.wani@appinventiv.com');
  assert.equal(me.email, 'zubair.wani@appinventiv.com');
  assert.equal(me.isAdmin, true);

  const nonAdmin = await adminApi.getMe('random.user@external.com');
  assert.equal(nonAdmin.isAdmin, false);
});

test('adminApi.getOverview calculates totals and content type breakdowns', async () => {
  const overview = await adminApi.getOverview('30d', 'all', false);
  assert.ok(overview.totals.users > 0);
  assert.ok(overview.totals.generations > 0);
  assert.ok(overview.createdByType.length === 5);
  assert.equal(overview.createdByType[0].type, 'landing');
  assert.equal(overview.createdByType[1].type, 'deck');
  assert.equal(overview.createdByType[2].type, 'poster');
  assert.equal(overview.createdByType[3].type, 'mobile');
  assert.equal(overview.createdByType[4].type, 'dashboard');
});

test('adminApi applies an exact custom date to overview and AI cost data', async () => {
  const range = { startDate: '2026-11-05', endDate: '2026-11-05' };
  const [overview, costs] = await Promise.all([
    adminApi.getOverview(range, 'all', false),
    adminApi.getAiCosts(range, 'all', false),
  ]);
  const dailyGenerationCount = overview.daily[0].generationsByType
    ? Object.values(overview.daily[0].generationsByType).reduce((sum, count) => sum + count, 0)
    : 0;

  assert.equal(overview.daily.length, 1);
  assert.equal(overview.daily[0].date, range.startDate);
  assert.equal(dailyGenerationCount, overview.totals.generations);
  assert.equal(
    costs.byType.reduce((sum, item) => sum + item.count, 0),
    overview.totals.generations
  );
});

test('adminApi.getUsers searches and filters users', async () => {
  const res = await adminApi.getUsers({
    range: '30d',
    type: 'all',
    includeInternal: true,
    page: 1,
  });
  assert.ok(res.items.length > 0);
  assert.equal(res.pageSize, 25);
});

test('adminApi.getAiCosts computes raw median and p90 for 5 content types', async () => {
  const costs = await adminApi.getAiCosts('30d', 'all', false);
  assert.equal(costs.byType.length, 5);
  for (const t of costs.byType) {
    assert.ok(t.medianInr >= 0);
    assert.ok(t.p90Inr >= t.medianInr);
  }
  assert.ok(costs.outcomes.length === 5);
  assert.ok(costs.topSpenders.length <= 10);
});
