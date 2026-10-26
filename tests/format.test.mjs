import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDuration, formatLargeCount, formatNumberHtml, formatNumberText } from '../src/lib/format.ts';

test('durations', () => {
  assert.equal(formatDuration(4e-13, 'fr'), '400 femtosecondes');
  assert.equal(formatDuration(4e-13, 'en'), '400 femtoseconds');
  assert.equal(formatDuration(1e-12, 'en'), '1 picosecond');
  assert.equal(formatDuration(2.5e-9, 'fr'), '2,5 nanosecondes');
  assert.equal(formatDuration(1.2e-3, 'en'), '1.2 milliseconds');
  assert.equal(formatDuration(3, 'fr'), '3 secondes');
  assert.doesNotMatch(formatDuration(1.24e-14, 'fr'), /e-|^0 /);
});
test('femtoseconds are the smallest unit', () => {
  assert.equal(formatDuration(1.86e-15, 'fr'), '1,9 femtoseconde');
  assert.equal(formatDuration(7.2e-16, 'en'), '0.72 femtoseconds');
  assert.equal(formatDuration(7.2e-16, 'fr'), '0,72 femtoseconde');
  assert.equal(formatDuration(3e-18, 'fr'), '0,003 femtoseconde');
  assert.equal(formatDuration(9.996e-13, 'en'), '1 picosecond');
});
test('large counts', () => {
  assert.equal(formatLargeCount(2.5e11, 'fr'), '250 milliards');
  assert.equal(formatLargeCount(2.5e11, 'en'), '250 billion');
  assert.equal(formatLargeCount(1.6e13, 'en'), '16 trillion');
  assert.equal(formatLargeCount(1.6e13, 'fr'), '16\u202f000 milliards');
  assert.equal(formatLargeCount(1.5e6, 'fr'), '1,5 million');
  assert.equal(formatLargeCount(2e6, 'fr'), '2 millions');
  assert.equal(formatLargeCount(250000, 'fr'), '250 000');
  assert.equal(formatLargeCount(250000, 'en'), '250,000');
});
test('rounding that reaches 1 000 moves up a unit', () => {
  assert.equal(formatDuration(999.6e-6, 'fr'), '1 milliseconde');
  assert.equal(formatDuration(9.996e-10, 'en'), '1 nanosecond');
  assert.equal(formatLargeCount(999999999, 'fr'), '1 milliard');
});
test('negative values pluralise like positive ones', () => {
  assert.equal(formatDuration(-3, 'en'), '-3 seconds');
  assert.equal(formatDuration(-1, 'en'), '-1 second');
  assert.equal(formatDuration(-2.5e-9, 'fr'), '-2,5 nanosecondes');
});

test('numbers never use scientific notation, they use a power of ten', () => {
  assert.equal(formatNumberHtml(1234.5, 'en'), '1,230');
  assert.equal(formatNumberHtml(0.0123, 'fr'), '0,0123');
  assert.equal(formatNumberHtml(8.03e37, 'fr'), '8,03 × 10<sup>37</sup>');
  assert.equal(formatNumberHtml(1e-12, 'en'), '1 × 10<sup>−12</sup>');
  assert.equal(formatNumberHtml(0, 'en'), '0');
});

test('number digits default to 3 and can show a sourced input as printed', () => {
  assert.equal(formatNumberHtml(6378136.6, 'fr'), '6\u202f380\u202f000');
  assert.equal(formatNumberHtml(6378136.6, 'fr', 8), '6\u202f378\u202f136,6');
  assert.equal(formatNumberHtml(7.292115e-5, 'en', 7), '7.292115 × 10<sup>−5</sup>');
  assert.equal(formatNumberHtml(7.292115e-5, 'en'), '7.29 × 10<sup>−5</sup>');
  assert.equal(formatNumberHtml(3.986004418e14, 'fr', 10), '3,986004418 × 10<sup>14</sup>');
  assert.equal(formatNumberText(8.0349e37, 'en', 6), '8.0349 × 10^37');
});

test('plain-text numbers keep the exponent unambiguous', () => {
  assert.equal(formatNumberText(1e12, 'en'), '1 × 10^12');
  assert.equal(formatNumberText(8.03e37, 'fr'), '8,03 × 10^37');
  assert.equal(formatNumberText(1e-12, 'en'), '1 × 10^−12');
  assert.equal(formatNumberText(1234, 'fr'), formatNumberHtml(1234, 'fr'));
  assert.equal(formatNumberText(0, 'en'), '0');
});
