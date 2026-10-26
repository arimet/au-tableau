import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sliderToValue, logPosition } from '../src/lib/scale.ts';

test('slider scales', () => {
  assert.equal(sliderToValue(0, 'log'), 1);
  assert.equal(sliderToValue(3, 'log'), 1000);
  assert.equal(sliderToValue(6, 'log'), 1e6);
  assert.equal(sliderToValue(42, 'linear'), 42);
});
test('logPosition is clamped and logarithmic', () => {
  assert.equal(logPosition(1e-12, 1e-12, 1), 0);
  assert.equal(logPosition(1e-6, 1e-12, 1), 0.5);
  assert.equal(logPosition(10, 1e-12, 1), 1);
  assert.equal(logPosition(1e-20, 1e-12, 1), 0);
});
