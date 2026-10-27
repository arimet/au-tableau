import { sketchCircle, sketchLine, type Pt } from '../../../lib/chalk.ts';

type Rand = () => number;

/**
 * A stick figure in mid-jump, arms up, standing on the point `base` of a surface whose outward
 * direction is `angle` (radians, SVG axes). `lift` is the gap under its feet, `size` its height.
 * Returns the strokes in drawing order: legs, body, arms, then the head.
 */
export const jumper = (rand: Rand, base: Pt, angle: number, size: number, lift = 0): string[] => {
  const [nx, ny] = [Math.cos(angle), Math.sin(angle)];
  const [tx, ty] = [-ny, nx];
  const at = (up: number, side: number): Pt => [base[0] + nx * up + tx * side, base[1] + ny * up + ty * side];
  const feet = lift;
  const hip = feet + size * 0.42;
  const shoulder = hip + size * 0.33;
  const head = shoulder + size * 0.14;
  const j = size * 0.02;
  return [
    sketchLine(rand, at(hip, 0), at(feet, -size * 0.16), j),
    sketchLine(rand, at(hip, 0), at(feet, size * 0.16), j),
    sketchLine(rand, at(hip, 0), at(shoulder, 0), j),
    sketchLine(rand, at(shoulder, 0), at(shoulder + size * 0.22, -size * 0.2), j),
    sketchLine(rand, at(shoulder, 0), at(shoulder + size * 0.22, size * 0.2), j),
    sketchCircle(rand, ...at(head, 0), size * 0.11, { overshoot: 0.2 }),
  ];
};
