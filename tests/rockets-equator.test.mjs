import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkSources } from '../src/lib/sources.ts';
import {
  EARTH,
  REFERENCE_LAUNCH,
  payloadAngularMomentum,
  dayLengthChange,
  sources,
  calcs,
} from '../src/content/topics/rockets-equator/data.ts';

test('deltaL equal to Earth spin adds one full day', () => {
  const L = EARTH.momentOfInertia * EARTH.omega;
  assert.ok(Math.abs(dayLengthChange(L) - EARTH.siderealDay) < 1e-6);
});

test('a payload at rest on the equator takes nothing', () => {
  const R = EARTH.equatorialRadius;
  assert.ok(Math.abs(payloadAngularMomentum(1000, R, EARTH.omega * R)) < 1e-3);
});

test('one tonne in low orbit is under a femtosecond', () => {
  const { payloadKg, orbitRadiusM, orbitalSpeedMs } = REFERENCE_LAUNCH;
  const dt = dayLengthChange(payloadAngularMomentum(payloadKg, orbitRadiusM, orbitalSpeedMs));
  assert.ok(dt > 1e-16 && dt < 1e-14);
  // Values recomputed independently in the source verification note: 0.72 fs (400 km), 1.86 fs (GEO).
  assert.ok(Math.abs(dt - 7.208e-16) < 0.005e-16);
  const geo = calcs.find((c) => c.id === 'one-tonne').steps.at(-1).value;
  assert.ok(Math.abs(geo - 1.8629e-15) < 0.0005e-15);
});

test('every number is sourced', () => assert.deepEqual(checkSources(sources, calcs), []));
