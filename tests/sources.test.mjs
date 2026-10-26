import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkSources } from '../src/lib/sources.ts';

test('checkSources catches unknown, duplicate and unsourced', () => {
  const s = { id: 'a', citation: 'A', url: 'https://doi.org/x', peerReviewed: true };
  const step = (o) => ({ label: { fr: 'x', en: 'x' }, value: 1, unit: 'kg', ...o });
  assert.deepEqual(checkSources([s], [{ id: 'c', steps: [step({ sourceIds: ['a'] })] }]), []);
  assert.equal(checkSources([s], [{ id: 'c', steps: [step({ sourceIds: ['b'] })] }]).length, 1);
  assert.equal(checkSources([s, s], []).length, 1);
  assert.equal(checkSources([s], [{ id: 'c', steps: [step({})] }]).length, 1);
});
