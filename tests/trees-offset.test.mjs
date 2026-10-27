import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkSources } from '../src/lib/sources.ts';
import { EMISSIONS, ESTIMATES, offsetFor, figures, sources, calcs } from '../src/content/topics/trees-offset/data.ts';

const near = (value, expected, rel) => assert.ok(Math.abs(value / expected - 1) < rel, `${value} vs ${expected}`);

// Expected values recomputed independently in the trees source note (§ 5).
test('2024 emissions are 11.6 GtC', () => near(EMISSIONS, 11.6, 1e-9));

test('the published estimates match 3.6 to 17.7 years of emissions', () => {
  const years = Object.fromEntries(ESTIMATES.map((e) => [e.id, offsetFor(e.gtc).years]));
  near(years.bastin, 17.67, 0.001);
  near(years.lewis, 8.62, 0.001);
  near(years.mo, 7.5, 0.001);
  near(years.veldman, 3.62, 0.001);
});

test('205 GtC is 28 % of emissions since 1850, not two-thirds', () => {
  near(offsetFor(205).share, 0.275, 0.001);
  assert.equal(figures('fr').emittedShare, '28 %');
  assert.equal(figures('en').bastinYears, '18');
});

test('every number is sourced', () => assert.deepEqual(checkSources(sources, calcs), []));
