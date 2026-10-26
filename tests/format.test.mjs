import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDuration, formatLargeCount } from '../src/lib/format.ts';

test('durations', () => {
  assert.equal(formatDuration(4e-13, 'fr'), '0,4 picoseconde');
  assert.equal(formatDuration(4e-13, 'en'), '0.4 picoseconds');
  assert.equal(formatDuration(1e-12, 'en'), '1 picosecond');
  assert.equal(formatDuration(2.5e-9, 'fr'), '2,5 nanosecondes');
  assert.equal(formatDuration(1.2e-3, 'en'), '1.2 milliseconds');
  assert.equal(formatDuration(3, 'fr'), '3 secondes');
  assert.doesNotMatch(formatDuration(1.24e-14, 'fr'), /e-|^0 /);
});
test('large counts', () => {
  assert.equal(formatLargeCount(2.5e11, 'fr'), '250 milliards');
  assert.equal(formatLargeCount(2.5e11, 'en'), '250 billion');
  assert.equal(formatLargeCount(1.5e6, 'fr'), '1,5 million');
  assert.equal(formatLargeCount(2e6, 'fr'), '2 millions');
  assert.equal(formatLargeCount(250000, 'fr'), '250 000');
  assert.equal(formatLargeCount(250000, 'en'), '250,000');
});
