// Hand-drawn chalk geometry: pure functions returning SVG path strings.
// Ported from the approved mockup; no DOM involved.

export type Pt = [number, number];
type Rand = () => number;

/** Seeded random generator (mulberry32): same seed, same drawing. */
export function rng(seed: number): Rand {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n: number) => n.toFixed(1);

/** Catmull-Rom spline through `p`, as cubic Bézier segments. */
export function smoothPath(p: Pt[]): string {
  let d = `M${f(p[0][0])},${f(p[0][1])}`;
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || c;
    d += `C${f(b[0] + (c[0] - a[0]) / 6)},${f(b[1] + (c[1] - a[1]) / 6)} ${f(c[0] - (e[0] - b[0]) / 6)},${f(c[1] - (e[1] - b[1]) / 6)} ${f(c[0])},${f(c[1])}`;
  }
  return d;
}

// Points of an arc whose radius wobbles (two sines) and drifts by `grow` along the way.
function arcPoints(rand: Rand, cx: number, cy: number, r: number, a0: number, a1: number, amp: number, grow = 0): Pt[] {
  const n = Math.max(10, Math.round(Math.abs(a1 - a0) * 10));
  const p1 = rand() * 6.3, p2 = rand() * 6.3;
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = a0 + (a1 - a0) * t;
    const rr = r * (1 + amp * (Math.sin(a * 2 + p1) * 0.6 + Math.sin(a * 3 + p2) * 0.4) + grow * t);
    pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
  }
  return pts;
}

/** Full circle from a random start angle, overshooting so the ends do not meet. */
export function sketchCircle(
  rand: Rand, cx: number, cy: number, r: number,
  { wobble = 0.012, overshoot = 0.3, grow = 0.025 }: { wobble?: number; overshoot?: number; grow?: number } = {},
): string {
  const a0 = rand() * 6.3;
  return smoothPath(arcPoints(rand, cx, cy, r, a0, a0 + 2 * Math.PI + overshoot, wobble, grow));
}

/** Wobbly arc; `tip` is the last point, `angle` the tangent there in the direction of travel. */
export function sketchArc(
  rand: Rand, cx: number, cy: number, r: number, a0: number, a1: number, wobble = 0.012,
): { d: string; tip: Pt; angle: number } {
  const pts = arcPoints(rand, cx, cy, r, a0, a1, wobble);
  const tip = pts[pts.length - 1], prev = pts[pts.length - 3];
  return { d: smoothPath(pts), tip, angle: Math.atan2(tip[1] - prev[1], tip[0] - prev[0]) };
}

/** Straight line bent through a midpoint pushed sideways by up to `jitter`. */
export function sketchLine(rand: Rand, from: Pt, to: Pt, jitter = 1.4): string {
  const dx = to[0] - from[0], dy = to[1] - from[1];
  const l = Math.hypot(dx, dy) || 1;
  const o = (rand() - 0.5) * 2 * jitter;
  return smoothPath([from, [(from[0] + to[0]) / 2 - (dy / l) * o, (from[1] + to[1]) / 2 + (dx / l) * o], to]);
}

/** Two strokes forming an arrowhead at `tip`, for a line travelling along `angle`. */
export function arrowHead(rand: Rand, tip: Pt, angle: number, size = 11): string[] {
  return [0.5, -0.5].map((k) =>
    sketchLine(rand, tip, [tip[0] - size * Math.cos(angle + k), tip[1] - size * Math.sin(angle + k)], 0.6),
  );
}

/** Parallel lines along `angle`, one every `spacing`, covering the disc (clip it in SVG). */
export function hatch(rand: Rand, cx: number, cy: number, r: number, spacing: number, angle: number): string[] {
  const dx = Math.cos(angle), dy = Math.sin(angle), half = r * 1.1;
  const count = Math.floor((2 * half) / spacing + 1e-9) + 1;
  const lines: string[] = [];
  for (let i = 0; i < count; i++) {
    const k = -half + i * spacing;
    const mx = cx - dy * k, my = cy + dx * k;
    lines.push(sketchLine(rand, [mx - dx * half, my - dy * half], [mx + dx * half, my + dy * half], 0.8));
  }
  return lines;
}
