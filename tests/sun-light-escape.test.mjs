import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkSources } from '../src/lib/sources.ts';
import { escapeYears, msEscapeYears, stepCount, figures, sources, calcs } from '../src/content/topics/sun-light-escape/data.ts';

const near = (value, expected, rel) => assert.ok(Math.abs(value / expected - 1) < rel, `${value} vs ${expected}`);

// Expected values recomputed independently in the sun source note (§ 1 and § 3).
test('light from the surface reaches the Earth in 8 min 17 s', () => {
  assert.equal(figures('en').fromSurface, '8 min 17 s');
  assert.equal(figures('en').crossing, '2.3');
});

test('with a 0.09 cm mean step, a 3D random walk takes about 28 400 years', () => {
  near(escapeYears(0.09), 28_420, 0.002);
  near(stepCount(0.09), 2.99e23, 0.01);
});

test('Mitalas and Sills’ equal-step formula gives their 170 000 years, six times more', () => {
  near(msEscapeYears(0.09), 1.7e5, 0.01);
  near(msEscapeYears(0.09) / escapeYears(0.09), 6, 1e-9);
});

test('Balian and Blaizot’s uniform Sun: 1.8 cm, about 8 × 10^20 steps and 1 400 years', () => {
  near(stepCount(1.8), 7.47e20, 0.01);
  near(escapeYears(1.8), 1421, 0.01);
});

test('the escape time is inversely proportional to the step', () => near(escapeYears(0.01), 10 * escapeYears(0.1), 1e-9));

test('every number is sourced', () => assert.deepEqual(checkSources(sources, calcs), []));
