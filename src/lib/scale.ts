export type Scale = 'linear' | 'log';

/** Raw slider position to the value it stands for: a log slider holds the exponent. */
export const sliderToValue = (raw: number, scale: Scale): number => (scale === 'log' ? 10 ** raw : raw);

/** Where `value` sits between `min` and `max` on a log axis, from 0 to 1. Out of range is clamped. */
export const logPosition = (value: number, min: number, max: number): number => {
  const [lo, hi] = [Math.log10(min), Math.log10(max)];
  return Math.min(1, Math.max(0, (Math.log10(value) - lo) / (hi - lo)));
};

/** Horizontal extent of a label on the ruler, and the x of the stem that leads to it. */
export type Span = { x: number; from: number; to: number };
export type Lane = { side: 'up' | 'down'; lane: number };

const GAP = 8;
const overlaps = (a: Span, b: Span) => a.from < b.to + GAP && b.from < a.to + GAP;
const within = (x: number, s: Span) => x > s.from - 2 && x < s.to + GAP;

/**
 * Puts each label on a side of the axis (up or down) and a lane (0 is closest to the axis) so that
 * no two labels overlap and no stem crosses another label. `blocked` spans (tick labels) sit on the
 * down side, closer than lane 0: no stem may go down through them. Greedy, from the right: a label
 * running rightwards from its stem never covers the stems of the labels placed before it.
 * If no lane fits (stems less than 2 units apart with the other side blocked), the label goes on the outermost up lane.
 */
export const assignLanes = (labels: Span[], blocked: Span[] = []): Lane[] => {
  const result: Lane[] = [];
  const placed: (Lane & { span: Span })[] = [];
  // A stem going out to `lane` must clear the closer labels on its side; a closer label's stem must clear this one.
  const fits = (span: Span, side: Lane['side'], lane: number) =>
    (side === 'up' || !blocked.some((b) => within(span.x, b))) &&
    placed
      .filter((p) => p.side === side)
      .every((p) =>
        p.lane === lane ? !overlaps(p.span, span) : p.lane < lane ? !within(span.x, p.span) : !within(p.span.x, span),
      );
  const order = labels.map((_, i) => i).sort((a, b) => labels[b].x - labels[a].x);
  for (const i of order) {
    const span = labels[i];
    let found: Lane = { side: 'up', lane: labels.length };
    search: for (let lane = 0; lane < labels.length; lane++)
      for (const side of ['up', 'down'] as const)
        if (fits(span, side, lane)) {
          found = { side, lane };
          break search;
        }
    placed.push({ ...found, span });
    result[i] = found;
  }
  return result;
};
