export type Scale = 'linear' | 'log';

/** Raw slider position to the value it stands for: a log slider holds the exponent. */
export const sliderToValue = (raw: number, scale: Scale): number => (scale === 'log' ? 10 ** raw : raw);

/** Where `value` sits between `min` and `max` on a log axis, from 0 to 1. Out of range is clamped. */
export const logPosition = (value: number, min: number, max: number): number => {
  const [lo, hi] = [Math.log10(min), Math.log10(max)];
  return Math.min(1, Math.max(0, (Math.log10(value) - lo) / (hi - lo)));
};
