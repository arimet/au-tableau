import type { Locale } from './i18n.ts';

// [singular, plural] per locale.
type Forms = Record<Locale, [string, string]>;
type Entry = { factor: number; forms: Forms };

// Tables run from the largest entry to the smallest, each step a factor of 1 000.
const UNITS: Entry[] = [
  { factor: 1, forms: { fr: ['seconde', 'secondes'], en: ['second', 'seconds'] } },
  { factor: 1e-3, forms: { fr: ['milliseconde', 'millisecondes'], en: ['millisecond', 'milliseconds'] } },
  { factor: 1e-6, forms: { fr: ['microseconde', 'microsecondes'], en: ['microsecond', 'microseconds'] } },
  { factor: 1e-9, forms: { fr: ['nanoseconde', 'nanosecondes'], en: ['nanosecond', 'nanoseconds'] } },
  { factor: 1e-12, forms: { fr: ['picoseconde', 'picosecondes'], en: ['picosecond', 'picoseconds'] } },
  { factor: 1e-15, forms: { fr: ['femtoseconde', 'femtosecondes'], en: ['femtosecond', 'femtoseconds'] } },
];

const SCALES: Entry[] = [
  { factor: 1e9, forms: { fr: ['milliard', 'milliards'], en: ['billion', 'billion'] } },
  { factor: 1e6, forms: { fr: ['million', 'millions'], en: ['million', 'million'] } },
];

const shownValue = (amount: number, factor: number): number =>
  Number((amount / factor).toPrecision(2));

// The first entry the amount reaches, then up while the shown value would read 1 000 or more.
const pick = (table: Entry[], amount: number): Entry | undefined => {
  let i = table.findIndex((e) => Math.abs(amount) >= e.factor);
  if (i === -1) return undefined;
  while (i > 0 && Math.abs(shownValue(amount, table[i].factor)) >= 1000) i--;
  return table[i];
};

// The number as shown (2 significant digits) and the word in its form.
// FR plural from 2, EN plural for anything but 1, judged on the shown number.
const phrase = (value: number, locale: Locale, forms: Forms): string => {
  const shown = Math.abs(Number(value.toPrecision(2)));
  const many = locale === 'fr' ? shown >= 2 : shown !== 1;
  const [one, plural] = forms[locale];
  return `${value.toLocaleString(locale, { maximumSignificantDigits: 2 })} ${many ? plural : one}`;
};

export const formatDuration = (seconds: number, locale: Locale): string => {
  // Below a femtosecond, stay in femtoseconds. Zero reads as seconds.
  const unit = pick(UNITS, seconds) ?? (seconds === 0 ? UNITS[0] : UNITS[UNITS.length - 1]);
  return phrase(seconds / unit.factor, locale, unit.forms);
};

export const formatLargeCount = (n: number, locale: Locale): string => {
  const scale = pick(SCALES, n);
  return scale ? phrase(n / scale.factor, locale, scale.forms) : n.toLocaleString(locale);
};

// A number as shown: `digits` significant digits (3 by default), plain from 10^-3 to under 10^9, otherwise a mantissa and an exponent.
const numberParts = (value: number, locale: Locale, digits: number): { mantissa: string; exp?: string } => {
  const abs = Math.abs(value);
  if (abs === 0 || (abs >= 1e-3 && abs < 1e9))
    return { mantissa: value.toLocaleString(locale, { maximumSignificantDigits: digits }) };
  const [mantissa, exp] = value.toExponential(digits - 1).split('e');
  return {
    mantissa: `${Number(mantissa).toLocaleString(locale, { maximumSignificantDigits: digits })} ×`,
    exp: exp.replace('+', '').replace('-', '−'),
  };
};

/** A share as a percentage, 2 significant digits: 0.44 → "44 %" (fr), "44%" (en). */
export const formatPercent = (share: number, locale: Locale): string =>
  `${formatNumberText(share * 100, locale, 2)}${locale === 'fr' ? ' %' : '%'}`;

/** A number for display, HTML-safe: mantissa × 10<sup>exp</sup> when out of the plain range. Never "e+37". */
export const formatNumberHtml = (value: number, locale: Locale, digits = 3): string => {
  const { mantissa, exp } = numberParts(value, locale, digits);
  return exp === undefined ? mantissa : `${mantissa} 10<sup>${exp}</sup>`;
};

/** Same number as plain text, for attributes and screen readers: "8,03 × 10^37". */
export const formatNumberText = (value: number, locale: Locale, digits = 3): string => {
  const { mantissa, exp } = numberParts(value, locale, digits);
  return exp === undefined ? mantissa : `${mantissa} 10^${exp}`;
};
