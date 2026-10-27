import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkSources } from '../src/lib/sources.ts';
import { NPP, OCEAN_SHARE, O2_TOTAL, YEARS_IN_AIR, OUTGASSING_SHARE, ORGANIC_SHARE, ORGANIC_YEARS, withoutPhotosynthesis, figures, sources, calcs } from '../src/content/topics/ocean-oxygen/data.ts';

const near = (value, expected, rel) => assert.ok(Math.abs(value / expected - 1) < rel, `${value} vs ${expected}`);

// Expected values recomputed independently in the ocean oxygen source note (§ 4).
test('the ocean makes 46 % of net primary production', () => {
  near(NPP, 104.9, 1e-9);
  near(OCEAN_SHARE, 0.4624, 0.001);
  assert.equal(figures('fr').oceanShare, '46 %');
});

test('the air holds about 4,200 years of net photosynthesis', () => {
  near(O2_TOTAL, 8.74e15, 0.002);
  near(YEARS_IN_AIR, 4232, 0.002);
  assert.equal(figures('en').yearsInAir, '4,200');
});

test('the warming ocean gives back about 1 % of its photosynthetic oxygen', () => near(OUTGASSING_SHARE, 0.0111, 0.01));

test('decaying all surface organic matter uses 1.2 % of the air’s oxygen, in about 49 years', () => {
  near(ORGANIC_SHARE, 0.01189, 0.001);
  near(ORGANIC_YEARS, 48.9, 0.001);
  near(withoutPhotosynthesis(1).used, 2.432e-4, 0.001);
  assert.equal(withoutPhotosynthesis(100).used, ORGANIC_SHARE);
  assert.ok(withoutPhotosynthesis(49).exhausted && !withoutPhotosynthesis(48).exhausted);
});

test('every number is sourced', () => assert.deepEqual(checkSources(sources, calcs), []));
