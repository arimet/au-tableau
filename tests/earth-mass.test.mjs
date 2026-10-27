import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkSources } from '../src/lib/sources.ts';
import { loss, netLoss, balance, balancePhrase, figures, sources, calcs } from '../src/content/topics/earth-mass/data.ts';

const near = (value, expected, rel) => assert.ok(Math.abs(value / expected - 1) < rel, `${value} vs ${expected}`);

// Expected values recomputed independently in the earth mass source note (§ 4).
test('hydrogen (low or high estimate) plus polar-wind oxygen: 56 800 to 101 200 tonnes a year', () => {
  near(loss.low, 56_845, 1e-3);
  near(loss.high, 101_155, 1e-3);
});

test('with 43 ± 14 tonnes of dust a day, the Earth loses 36 000 to 91 000 tonnes a year', () => {
  near(netLoss.low, 36_026, 1e-3);
  near(netLoss.high, 90_563, 1e-3);
  assert.equal(figures('en').netLow, '36,000');
  assert.equal(figures('en').netHigh, '91,000');
});

test('Love and Brownlee: the central value means a loss, only the top of their range beats the low loss', () => {
  assert.ok(balance(40_000 / 365.25).high < 0);
  assert.ok(balance(60_000 / 365.25).high > 0);
});

test('the slider sentence follows the sign, with one break point near 156 tonnes a day', () => {
  assert.match(balancePhrase(43, 'fr'), /^La Terre perd/);
  assert.match(balancePhrase(155, 'en'), /^The Earth loses/);
  assert.match(balancePhrase(157, 'en'), /^Depending on the hydrogen estimate/);
  assert.match(balancePhrase(270, 'en'), /^Depending on the hydrogen estimate/);
  assert.equal(figures('en').breakLow, '160');
});

test('the Earth’s mass is 5.97 × 10^24 kg; a billion years removes 6 to 15 billionths', () => {
  assert.equal(figures('en').massMantissa, '5.97');
  assert.equal(figures('en').massExp, 24);
  assert.equal(figures('en').shareLow, '6');
  assert.equal(figures('en').shareHigh, '15');
});

test('every number is sourced', () => assert.deepEqual(checkSources(sources, calcs), []));
