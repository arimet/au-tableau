// Drawing helpers: lines of a dipole magnetic field around the Earth, axis vertical.
import type { Pt } from '../../../lib/chalk';

/**
 * One field line r = L·R·sin²θ (θ from the north pole), from the surface back to the surface,
 * on the right (side 1) or the left (side −1) of the axis. Screen y points down.
 */
export function fieldLine(cx: number, cy: number, radius: number, L: number, side: 1 | -1, n = 40): Pt[] {
  const t0 = Math.asin(Math.sqrt(1 / L));
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = t0 + ((Math.PI - 2 * t0) * i) / n;
    const r = L * radius * Math.sin(t) ** 2;
    return [cx + side * r * Math.sin(t), cy - r * Math.cos(t)] as Pt;
  });
}

/** Straight segments through `pts`: chalk texture comes from the scene filter. */
export const polyline = (pts: Pt[]): string => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('');
