import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkSources } from '../src/lib/sources.ts';
import { KEPT, JUMP_M, LENGTHS, recoilM, figures, sources, calcs } from '../src/content/topics/earth-jump/data.ts';

const near = (value, expected, rel) => assert.ok(Math.abs(value / expected - 1) < rel, `${value} vs ${expected}`);

// Expected values recomputed independently in the source note (§ 6).
test('the Earth is about 15 000 billion times heavier than 400 million tonnes of humans', () => {
  const step = calcs.find((c) => c.id === 'mass').steps;
  near(step.find((s) => s.label.en === 'Mass of the Earth, M').value, 5.9722e24, 1e-4);
  near(step.find((s) => s.label.en === 'Mass of humanity, m').value, 4.0e11, 1e-12);
  assert.equal(figures('fr').massRatio.replace(/\s/g, ' '), '15 000 milliards');
  assert.equal(figures('en').massRatio, '15 trillion');
});

test('about 60 % of the jumps survive the cancellation between opposite sides', () => near(KEPT, 0.5958, 1e-3));

test('a 30 cm jump moves the Earth back by 12 femtometres', () => {
  near(recoilM(JUMP_M), 1.197e-14, 2e-3);
  assert.equal(figures('en').recoilFm, '12');
  assert.equal(figures('en').fullFm, '20');
});

test('the recoil lies between a proton and an atom', () => {
  const d = recoilM(JUMP_M);
  assert.ok(LENGTHS.protonRadius < d && d < LENGTHS.bohrRadius);
  assert.equal(figures('en').protonTimes, 14);
  assert.equal(figures('en').atomTimes, '4,400');
  assert.equal(figures('en').protonJumpCm, '2.1');
});

test('the recoil grows in proportion to the jump', () => near(recoilM(10), 1000 * recoilM(0.01), 1e-9));

test('every number is sourced', () => assert.deepEqual(checkSources(sources, calcs), []));
