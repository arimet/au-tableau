// Chalk outlines of a falling drop: a flattened ellipse (the oblate spheroid seen side on),
// and the teardrop of the cartoons, for the crossed-out comparison.
import { smoothPath, type Pt } from '../../../lib/chalk';

type Rand = () => number;

/** Wobbly ellipse, width 2 × rx and height 2 × ry, overshooting its start like a chalk circle. */
export function sketchEllipse(rand: Rand, cx: number, cy: number, rx: number, ry: number, wobble = 0.015): string {
  const a0 = rand() * 6.3, p = rand() * 6.3, n = 28, end = 2 * Math.PI + 0.3;
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + (end * i) / n;
    const k = 1 + wobble * Math.sin(a * 3 + p) + 0.02 * (i / n);
    pts.push([cx + rx * k * Math.cos(a), cy + ry * k * Math.sin(a)]);
  }
  return smoothPath(pts);
}

/** Teardrop of height `h`, its point upward, centred on the round part. */
export function teardrop(cx: number, cy: number, h: number): string {
  const r = h * 0.32;
  const pts: Pt[] = [[cx, cy - h * 0.68]];
  for (let i = 0; i <= 12; i++) {
    const a = -Math.PI * 0.2 + (Math.PI * 1.4 * i) / 12;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  pts.push([cx, cy - h * 0.68]);
  return smoothPath(pts);
}
