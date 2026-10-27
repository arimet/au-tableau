import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkSources } from '../src/lib/sources.ts';
import { terminalSpeed, axisRatio, dropAxes, freeFallHeight, G, FREE_SPEED, figures, sources, calcs } from '../src/content/topics/raindrop-speed/data.ts';

const near = (value, expected, rel) => assert.ok(Math.abs(value / expected - 1) < rel, `${value} vs ${expected}`);

// Expected values recomputed independently in the raindrop source note (§ 5).
test('a 5 mm drop falls at 9.1 m/s, a 1 mm drop at 4.0 m/s', () => {
  near(terminalSpeed(5), 9.1371, 1e-4);
  near(terminalSpeed(1), 3.9971, 1e-4);
  near(terminalSpeed(3), 7.947, 1e-3);
  for (let mm = 0.5; mm < 5; mm += 0.1) assert.ok(terminalSpeed(mm + 0.1) > terminalSpeed(mm), `speed grows at ${mm} mm`);
});

test('the fit stays within 2 % of the sea-level values Bringi et al. tabulate', () => {
  near(terminalSpeed(0.6), 2.5, 0.02);
  near(terminalSpeed(1.0), 4.0, 0.02);
  near(terminalSpeed(2.0), 6.5, 0.02);
});

test('a 5 mm drop is 72 % as tall as it is wide; small drops stay spheres', () => {
  near(axisRatio(5), 0.72, 1e-9);
  near(axisRatio(1), 0.968, 1e-9);
  assert.equal(axisRatio(0.4), 1);
});

test('the drawn drop keeps the volume of a sphere of its diameter', () => {
  for (const mm of [0.5, 1, 3, 5]) {
    const { a, b } = dropAxes(mm);
    near(a * a * b, (mm / 2) ** 3, 1e-12);
    near(b / a, axisRatio(mm), 1e-12);
  }
  near(2 * dropAxes(5).a, 5.58, 1e-3);
});

test('the turbulence slowdown is stated for 1.3 and 2 mm drops only', () => {
  assert.equal(figures('en').turbSmallMm, '1.3');
  assert.equal(figures('en').turbBigMm, '2');
  assert.equal(figures('fr').turbHigh, '30 %');
});

test('without air, 1 000 m of fall ends at 140 m/s; 4.3 m reach 9.1 m/s', () => {
  near(G, 9.8062, 1e-5);
  near(FREE_SPEED, 140.04, 1e-4);
  near(freeFallHeight(terminalSpeed(5)), 4.257, 1e-3);
  assert.equal(figures('fr').vFreeKmh, '500');
  assert.equal(figures('en').freeRatio, '15');
});

test('Gunn and Kinzer’s largest drop is a 5.8 mm sphere', () => {
  assert.equal(figures('en').maxDiameterMm, '5.8');
  assert.equal(figures('fr').vBig, '9,1');
});

test('every number is sourced', () => assert.deepEqual(checkSources(sources, calcs), []));
