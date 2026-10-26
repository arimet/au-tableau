import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rng, sketchCircle, sketchArc, sketchLine, arrowHead, hatch } from '../src/lib/chalk.ts';

// Extract every "x,y" pair of a path string.
const coords = (d) => [...d.matchAll(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)].map((m) => [+m[1], +m[2]]);

test('same seed, same drawing', () => {
  assert.equal(sketchCircle(rng(7), 100, 100, 50), sketchCircle(rng(7), 100, 100, 50));
  assert.notEqual(sketchCircle(rng(7), 100, 100, 50), sketchCircle(rng(8), 100, 100, 50));
});
test('circle stays close to its radius', () => {
  for (const [x, y] of coords(sketchCircle(rng(1), 0, 0, 100)))
    assert.ok(Math.hypot(x, y) > 94 && Math.hypot(x, y) < 106);
});
test('arc tip lies on the arc end', () => {
  const { tip } = sketchArc(rng(1), 0, 0, 100, 0, Math.PI / 2, 0);
  assert.ok(Math.abs(tip[0]) < 0.5 && Math.abs(tip[1] - 100) < 0.5);
});
test('arc angle follows the direction of travel', () => {
  const { angle } = sketchArc(rng(1), 0, 0, 100, 0, Math.PI / 2, 0);
  assert.ok(Math.abs(angle - Math.PI) < 0.2); // moving towards -x at the end
});
test('hatch covers the disc', () => {
  assert.equal(hatch(rng(1), 0, 0, 100, 10, 0.6).length, 23); // one line every `spacing` from -1.1r to +1.1r inclusive
});
test('arrowHead returns two strokes', () => {
  assert.equal(arrowHead(rng(1), [0, 0], 0).length, 2);
});
test('paths start with a move', () => assert.match(sketchLine(rng(1), [0, 0], [10, 10]), /^M/));
