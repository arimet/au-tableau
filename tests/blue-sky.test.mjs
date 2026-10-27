import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkSources } from '../src/lib/sources.ts';
import { scatterVsRed, sunVsRed, skyVsRed, figures, sources, calcs } from '../src/content/topics/blue-sky/data.ts';

const near = (value, expected, rel) => assert.ok(Math.abs(value / expected - 1) < rel, `${value} vs ${expected}`);

// Expected values recomputed independently in the blue-sky source note (§ 4).
test('violet at 400 nm is scattered 9.4 times more than red, 1.9 times more than blue', () => {
  near(scatterVsRed(400), 9.3789, 1e-4);
  near(scatterVsRed(400) / scatterVsRed(470), 1.9061, 1e-4);
  assert.equal(scatterVsRed(700), 1);
});

test('the 5762 K Sun gives 12 % less light at 400 nm than at 470 nm', () => {
  near(sunVsRed(400) / sunVsRed(470), 0.8813, 1e-3);
  near(sunVsRed(470), 1.249, 1e-3);
});

test('after scattering, the sky still holds 1.7 times more violet than blue', () => {
  near(skyVsRed(400), 10.32, 1e-3);
  near(skyVsRed(470), 6.146, 1e-3);
  near(skyVsRed(400) / skyVsRed(470), 1.680, 1e-3);
  for (let nm = 400; nm < 700; nm += 5) assert.ok(skyVsRed(nm) > skyVsRed(nm + 5), `sky light grows toward violet at ${nm} nm`);
});

test('figures print the sun peak near 503 nm and 60 % white in the match', () => {
  assert.equal(figures('en').sunPeakNm, '503');
  assert.equal(figures('en').whiteShare, '60%');
  assert.equal(figures('fr').violetVsRed, '9,4');
});

test('every number is sourced', () => assert.deepEqual(checkSources(sources, calcs), []));
