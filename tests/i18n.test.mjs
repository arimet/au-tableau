import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localePath, ui } from '../src/lib/i18n.ts';

test('localePath prefixes English only', () => {
  assert.equal(localePath('fr', '/'), '/');
  assert.equal(localePath('en', '/'), '/en/');
  assert.equal(localePath('fr', '/la-terre-ralentit'), '/la-terre-ralentit');
  assert.equal(localePath('en', '/does-earth-slow-down'), '/en/does-earth-slow-down');
});

test('ui has the same keys in both locales', () => {
  assert.deepEqual(Object.keys(ui.fr).sort(), Object.keys(ui.en).sort());
});
