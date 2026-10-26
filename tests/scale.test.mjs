import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sliderToValue, logPosition, assignLanes } from '../src/lib/scale.ts';

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

test('assignLanes: close labels get lanes where nothing overlaps or is crossed', () => {
  const labels = [100, 130, 160, 190, 220, 250].map((x) => ({ x, from: x, to: x + 150 }));
  const out = assignLanes(labels);
  const pairs = out.map((l) => `${l.side}${l.lane}`);
  assert.equal(new Set(pairs).size, pairs.length, 'distinct lanes');
  const spanOverlap = (a, b) => a.from < b.to && b.from < a.to;
  for (let i = 0; i < labels.length; i++)
    for (let j = 0; j < labels.length; j++) {
      if (i === j || out[i].side !== out[j].side) continue;
      if (out[i].lane === out[j].lane) assert.ok(!spanOverlap(labels[i], labels[j]), `${i}/${j} overlap`);
      // stem j goes out past label i when i is closer: its x must be outside label i
      if (out[i].lane < out[j].lane)
        assert.ok(labels[j].x <= labels[i].from || labels[j].x >= labels[i].to, `stem ${j} crosses label ${i}`);
    }
});
test('assignLanes: a stem never goes down through a tick label', () => {
  const out = assignLanes([{ x: 100, from: 100, to: 200 }], [{ x: 100, from: 80, to: 120 }]);
  assert.equal(out[0].side, 'up');
});

test('assignLanes: a crowded ruler with tick labels never falls back to the overflow lane', () => {
  const xs = [40, 133, 195, 236, 303, 568, 600];
  const labels = xs.map((x) => ({ x, from: x, to: x + 400 }));
  const blocked = [40, 164, 288, 413, 537].map((x) => ({ x, from: x - 32, to: x + 32 }));
  const out = assignLanes(labels, blocked);
  for (const l of out) assert.ok(l.lane < labels.length);
  out.forEach((l, i) => {
    if (l.side === 'down') assert.ok(!blocked.some((b) => labels[i].x > b.from && labels[i].x < b.to), `stem ${i} crosses a tick label`);
  });
});
