import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkSources } from '../src/lib/sources.ts';
import { programme, sources, calcs, figures } from '../src/content/topics/contrails/data.ts';

const near = (value, expected, rel) => assert.ok(Math.abs(value / expected - 1) < rel, `${value} vs ${expected}`);

// Expected values recomputed independently in the chemtrails source note (§ 11).
test('the programme flies about 4 000 flights in year 1 and 60 000 in year 15', () => {
  near(programme(1).flights, 4007, 0.01);
  near(programme(15).flights, 60109, 0.01);
  near(programme(1).so2Mt, 0.2, 1e-9);
  near(programme(15).so2Mt, 3.0, 1e-9);
  near(programme(1).perDay, 11, 0.01);
});

test('76 experts out of 77 is 98.7 %', () => assert.equal(figures('en').expertsShare, '98.7%'));

test('every number is sourced', () => assert.deepEqual(checkSources(sources, calcs), []));
