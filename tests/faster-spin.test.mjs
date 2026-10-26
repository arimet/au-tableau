import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkSources } from '../src/lib/sources.ts';
import {
  TARGET_HOURS,
  MOMENTUM_PER_TONNE,
  momentumToAdd,
  energyShare,
  tonnesFor,
  sources,
  calcs,
} from '../src/content/topics/faster-spin/data.ts';

const near = (value, expected, rel) => assert.ok(Math.abs(value / expected - 1) < rel, `${value} vs ${expected}`);

test('keeping a 24 h day adds nothing', () => {
  assert.equal(momentumToAdd(24), 0);
  assert.equal(energyShare(24), 0);
});

// Expected values recomputed independently in the rotation source note.
test('20 h days need 20 % more spin and 44 % more rotation energy', () => {
  near(momentumToAdd(TARGET_HOURS), 1.1718e33, 1e-4);
  near(energyShare(TARGET_HOURS), 0.44, 1e-9);
  const torque = calcs.find((c) => c.id === 'target').steps.find((s) => s.unit === 'N·m').value;
  near(torque, 3.713e25, 1e-3);
});

test('one tonne on the westward geostationary orbit gives 1.326e14, so 8.8e18 tonnes for 20 h', () => {
  near(MOMENTUM_PER_TONNE, 1.326e14, 1e-3);
  near(tonnesFor(TARGET_HOURS), 8.8e18, 5e-3);
});

test('every number is sourced', () => assert.deepEqual(checkSources(sources, calcs), []));
