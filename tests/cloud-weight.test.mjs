import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkSources } from '../src/lib/sources.ts';
import { airViscosity, waterTonnes, waterCubeEdge, airTonnes, figures, sources, calcs, SPEEDS, AIR_PER_WATER } from '../src/content/topics/cloud-weight/data.ts';

const near = (value, expected, rel) => assert.ok(Math.abs(value / expected - 1) < rel, `${value} vs ${expected}`);

// Expected values recomputed independently in the cloud-weight source note (§ 3).
test('a cumulus one kilometre on a side holds about 420 tonnes of water, a cube 7.5 m on a side', () => {
  near(waterTonnes(1000), 419.6, 1e-4);
  near(waterCubeEdge(waterTonnes(1000)), 7.489, 1e-3);
  near(waterTonnes(550), 69.81, 1e-3);
  near(waterTonnes(2000) / waterTonnes(1000), 8, 1e-12);
});

test('the air viscosity code matches the check values of Lemmon and Jacobsen', () => {
  near(airViscosity(300), 18.523e-6, 1e-4);
  near(airViscosity(300, 5), 21.3241e-6, 1e-4);
});

test('the cloud air weighs about 2 500 times its liquid water', () => {
  near(airTonnes(1000), 1.0538e6, 1e-3);
  near(AIR_PER_WATER, 2511, 1e-3);
});

test('a droplet of 10.5 µm falls 1.3 cm/s, 89 to 145 times slower than the rising air', () => {
  near(SPEEDS.fall, 0.013237, 1e-3);
  near(SPEEDS.wMin / SPEEDS.fall, 89.14, 1e-3);
  near(SPEEDS.wMax / SPEEDS.fall, 145.05, 1e-3);
});

test('figures print the key numbers', () => {
  const fr = figures('fr'), en = figures('en');
  assert.equal(fr.massRef, '420');
  assert.equal(fr.lwc, '0,42');
  assert.equal(fr.cubeEdge, '7,5');
  assert.equal(fr.fallCm, '1,3');
  assert.equal(en.airRef, '1.1 million tonnes');
  assert.equal(en.airPerWater, '2,500');
  assert.equal(en.vapourPerLiquid, '34');
  assert.equal(fr.lwcMax, '0,536');
  assert.equal(en.wTop, '0.28');
});

test('every number is sourced', () => assert.deepEqual(checkSources(sources, calcs), []));
