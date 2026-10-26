import type { Locale } from './i18n.ts';

// [singular, plural] per locale.
type Forms = Record<Locale, [string, string]>;

const UNITS: { factor: number; forms: Forms }[] = [
  { factor: 1, forms: { fr: ['seconde', 'secondes'], en: ['second', 'seconds'] } },
  { factor: 1e-3, forms: { fr: ['milliseconde', 'millisecondes'], en: ['millisecond', 'milliseconds'] } },
  { factor: 1e-6, forms: { fr: ['microseconde', 'microsecondes'], en: ['microsecond', 'microseconds'] } },
  { factor: 1e-9, forms: { fr: ['nanoseconde', 'nanosecondes'], en: ['nanosecond', 'nanoseconds'] } },
  { factor: 1e-12, forms: { fr: ['picoseconde', 'picosecondes'], en: ['picosecond', 'picoseconds'] } },
];

const SCALES: { factor: number; forms: Forms }[] = [
  { factor: 1e9, forms: { fr: ['milliard', 'milliards'], en: ['billion', 'billion'] } },
  { factor: 1e6, forms: { fr: ['million', 'millions'], en: ['million', 'million'] } },
];

// The number as shown (2 significant digits) and the word in its form.
// FR plural from 2, EN plural for anything but 1, judged on the shown number.
// ponytail: a value that rounds up to 1 000 keeps its unit (999.6 µs shows as "1 000 microsecondes"); re-pick the unit after rounding if it matters.
const phrase = (value: number, locale: Locale, forms: Forms): string => {
  const shown = Number(value.toPrecision(2));
  const many = locale === 'fr' ? shown >= 2 : shown !== 1;
  const [one, plural] = forms[locale];
  return `${value.toLocaleString(locale, { maximumSignificantDigits: 2 })} ${many ? plural : one}`;
};

export const formatDuration = (seconds: number, locale: Locale): string => {
  const size = Math.abs(seconds);
  // Largest unit that keeps the value at 1 or more. Below a picosecond, stay in picoseconds.
  const unit =
    size === 0 ? UNITS[0] : (UNITS.find((u) => size >= u.factor) ?? UNITS[UNITS.length - 1]);
  return phrase(seconds / unit.factor, locale, unit.forms);
};

export const formatLargeCount = (n: number, locale: Locale): string => {
  const scale = SCALES.find((s) => Math.abs(n) >= s.factor);
  return scale ? phrase(n / scale.factor, locale, scale.forms) : n.toLocaleString(locale);
};
