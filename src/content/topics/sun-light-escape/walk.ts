// A seeded random walk for the drawings: steps of fixed length in random directions, with a slight
// outward pull so the drawing ends in a few hundred steps. Illustration only: the real walk has no pull.
import type { Pt } from '../../../lib/chalk';

export function randomWalk(rand: () => number, from: Pt, centre: Pt, step: number, radius: number, pull = 0.25, maxSteps = 600): Pt[] {
  const pts: Pt[] = [from];
  let [x, y] = from;
  while (pts.length < maxSteps && Math.hypot(x - centre[0], y - centre[1]) < radius) {
    const a = rand() * 2 * Math.PI;
    const d = Math.hypot(x - centre[0], y - centre[1]) || 1;
    const out = d < 1 ? [Math.cos(a), Math.sin(a)] : [(x - centre[0]) / d, (y - centre[1]) / d];
    const dx = Math.cos(a) + pull * out[0], dy = Math.sin(a) + pull * out[1];
    const k = step / Math.hypot(dx, dy);
    x += dx * k;
    y += dy * k;
    pts.push([x, y]);
  }
  return pts;
}

/** Straight segments through `pts`: chalk texture comes from the scene filter. */
export const polyline = (pts: Pt[]): string => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('');

/** Turns the walk about `centre` so that its last point lies in the direction `angle`. */
export function aimAt(pts: Pt[], centre: Pt, angle: number): Pt[] {
  const [lx, ly] = pts[pts.length - 1];
  const turn = angle - Math.atan2(ly - centre[1], lx - centre[0]);
  const [c, s] = [Math.cos(turn), Math.sin(turn)];
  return pts.map(([x, y]) => [centre[0] + (x - centre[0]) * c - (y - centre[1]) * s, centre[1] + (x - centre[0]) * s + (y - centre[1]) * c]);
}
