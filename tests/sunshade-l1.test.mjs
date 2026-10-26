import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkSources } from '../src/lib/sources.ts';
import { SHARE_TODAY, angelFor, sources, calcs } from '../src/content/topics/sunshade-l1/data.ts';

const near = (value, expected, rel) => assert.ok(Math.abs(value / expected - 1) < rel, `${value} vs ${expected}`);

// Expected values recomputed independently in the sunshade source note (§ 6).
test('offsetting the 2023 forcing takes about 1.2 % of the sunlight', () => {
  near(SHARE_TODAY[0], 0.0115, 0.01);
  near(SHARE_TODAY[1], 0.0119, 0.01);
});

test('Angel’s design at 1.8 % is 4.7 million km², about 20 million tonnes', () => {
  const { areaKm2, massT, flyers } = angelFor(0.018);
  near(areaKm2, 4.7e6, 1e-9);
  near(massT, 20e6, 0.02);
  near(flyers, 16e12, 1e-9);
  near(angelFor(0.009).areaKm2, 2.35e6, 1e-9);
});

test('every number is sourced', () => assert.deepEqual(checkSources(sources, calcs), []));
