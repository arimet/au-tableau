import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publishedTopics, alternateOf, buildNow } from '../src/lib/topics.ts';

const e = (topic, locale, date) => ({ data: { topic, locale, date: new Date(date) } });

test('publishedTopics filters locale and future, newest first', () => {
  const all = [e('a', 'fr', '2026-11-02'), e('b', 'fr', '2026-11-09'), e('a', 'en', '2026-11-02'), e('c', 'fr', '2027-01-01')];
  assert.deepEqual(publishedTopics(all, 'fr', new Date('2026-11-10')).map((x) => x.data.topic), ['b', 'a']);
});

test('buildNow shows every scheduled topic only with SHOW_FUTURE', () => {
  assert.ok(buildNow({ SHOW_FUTURE: '1' }) > new Date('3000-01-01'));
  assert.ok(buildNow({}) < new Date('3000-01-01'));
});

test('alternateOf finds the other locale or names the missing topic', () => {
  const fr = e('a', 'fr', '2026-11-02'), en = e('a', 'en', '2026-11-02');
  assert.equal(alternateOf([fr, en], fr), en);
  assert.throws(() => alternateOf([fr], fr), /a.*en/);
});
