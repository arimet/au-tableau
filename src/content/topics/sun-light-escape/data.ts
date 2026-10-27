import { calcStep as step, type Source, type Calc } from '../../../lib/sources.ts';
import type { Locale } from '../../../lib/i18n.ts';
import { formatLargeCount, formatNumberText, formatPercent } from '../../../lib/format.ts';

// Ordered by first citation on the page: SourceRef numbers follow this order.
export const sources: Source[] = [
  {
    id: 'prsa2016',
    citation:
      'Prša A., Harmanec P., Torres G., Mamajek E., Asplund M., et al. (2016). Nominal values for selected solar and planetary quantities: IAU 2015 Resolution B3. The Astronomical Journal, 152(2), 41.',
    doi: '10.3847/0004-6256/152/2/41',
    url: 'https://doi.org/10.3847/0004-6256/152/2/41',
    peerReviewed: true,
  },
  {
    id: 'balian1999',
    citation: 'Balian R., Blaizot J.-P. (1999). Stars and statistical physics: a teaching experience. American Journal of Physics, 67(12), 1189–1206.',
    doi: '10.1119/1.19105',
    url: 'https://doi.org/10.1119/1.19105',
    peerReviewed: true,
  },
  {
    id: 'mitalas1992',
    citation: 'Mitalas R., Sills K. R. (1992). On the photon diffusion time scale for the sun. The Astrophysical Journal, 401, 759–760.',
    doi: '10.1086/172103',
    url: 'https://doi.org/10.1086/172103',
    peerReviewed: true,
  },
  {
    id: 'bahcall2005',
    citation:
      'Bahcall J. N., Serenelli A. M., Basu S. (2005). New solar opacities, abundances, helioseismology, and neutrino fluxes. The Astrophysical Journal, 621(1), L85–L88.',
    doi: '10.1086/428929',
    url: 'https://doi.org/10.1086/428929',
    peerReviewed: true,
  },
  {
    id: 'osacar2020',
    citation:
      'Osácar C., Membrado M., Fernández-Pacheco A. (2020). Brief communication: Residence time of energy in the atmosphere. Nonlinear Processes in Geophysics, 27(2), 235–237.',
    doi: '10.5194/npg-27-235-2020',
    url: 'https://doi.org/10.5194/npg-27-235-2020',
    peerReviewed: true,
  },
];

// Values read in the publications, as printed there.
const radius = 6.957e8; // m, nominal solar radius, prsa2016 table 1
const au = 149_597_870_700; // m, astronomical unit (IAU 2012), quoted in prsa2016 § 4
const tau = '2/3'; // optical depth that defines the photosphere, as printed in prsa2016 § 4
const uniformStepCm = 1.8; // cm, mean free path in a uniform Sun, electron scattering only, balian1999 § VI.B
const transparentSeconds = 2; // s, centre to surface if matter were transparent, balian1999 § VI.B
const localStepCm = 0.1; // cm, local mean free path stays below this over almost half the radius, mitalas1992 § 2, fig. 1
const localMaxCm = 0.4; // cm, local mean free path never above this except near the photosphere, mitalas1992 § 2
const textbookStepCm = [0.5, 1]; // cm, usual textbook step, mitalas1992 § 1
const textbookYears = [3e3, 3e4]; // years, what that step gives, mitalas1992 § 1
const meanStepCm = 0.09; // cm, average step from a solar model, mitalas1992 § 3
const msYears = 1.7e5; // years, centre to the base of the convective zone, mitalas1992 § 3
const msSteps = 1.0e25; // steps, mitalas1992 § 3
const convectiveBase = 0.713; // radius of the base of the convective zone, in solar radii, helioseismology, bahcall2005 eq. 1
const residenceYears = 0.83e7; // years, residence time of energy in the Sun, osacar2020 eq. 10 and § 4
const kelvinHelmholtzYears = 3e7; // years, Kelvin–Helmholtz timescale of the Sun, osacar2020 eq. 11

// Defined, not measured: the speed of light (SI) and the Julian year.
const C = 299_792_458; // m/s
const YEAR = 365.25 * 86400; // s

const fromSurface = (au - radius) / C; // s
const crossing = radius / C; // s

/**
 * Time for light to random-walk out to one solar radius from the centre with steps of mean length `stepCm`,
 * in years. Free paths are random (mean square 2ℓ²), the walk is in three dimensions: ⟨r²⟩ = 2ℓct (balian1999).
 */
export const escapeYears = (stepCm: number): number => radius ** 2 / (2 * (stepCm / 100) * C) / YEAR;

/** The same with Mitalas and Sills’ equal-step formula, t = 3R² / (ℓc): six times more. */
export const msEscapeYears = (stepCm: number): number => (3 * radius ** 2) / ((stepCm / 100) * C) / YEAR;

/** Number of steps for the same walk: n = R² / (2ℓ²). */
export const stepCount = (stepCm: number): number => radius ** 2 / (2 * (stepCm / 100) ** 2);

/** Slider: the step length in cm, on a log scale (min, max and value are exponents of ten). */
export const SLIDER = { minExp: -2, maxExp: 1, step: 0.0001, valueExp: Math.round(Math.log10(meanStepCm) * 1e4) / 1e4 };

const walk = escapeYears(meanStepCm);
const msWalk = msEscapeYears(meanStepCm);
const convectiveShare = 1 - convectiveBase;

export const calcs: Calc[] = [
  {
    id: 'trip',
    steps: [
      step('Distance de référence Terre–Soleil (unité astronomique)', 'Reference Earth–Sun distance (astronomical unit)', au, 'm', { sourceIds: ['prsa2016'], digits: 12 }),
      step('Rayon du Soleil, R', 'Radius of the Sun, R', radius, 'm', { sourceIds: ['prsa2016'], digits: 4 }),
      step('Vitesse de la lumière, c (valeur exacte)', 'Speed of light, c (exact value)', C, 'm/s', { formula: 'SI', digits: 9 }),
      step('Trajet de la surface du Soleil à la Terre', 'Trip from the surface of the Sun to the Earth', fromSurface, 's', { formula: '(au − R) / c', digits: 4 }),
      step('Le même trajet, en minutes', 'The same trip, in minutes', fromSurface / 60, 'min', { formula: '÷ 60' }),
      step('Du centre à la surface, si la matière était transparente', 'From the centre to the surface, if matter were transparent', crossing, 's', { formula: 'R / c' }),
    ],
  },
  {
    id: 'walk',
    steps: [
      step('Rayon du Soleil, R', 'Radius of the Sun, R', radius, 'm', { sourceIds: ['prsa2016'], digits: 4 }),
      step('Vitesse de la lumière, c (valeur exacte)', 'Speed of light, c (exact value)', C, 'm/s', { formula: 'SI', digits: 9 }),
      step('Une année', 'One year', YEAR, 's', { formula: '365¼ × 86 400 s', digits: 7 }),
      step('Pas moyen tiré d’un modèle du Soleil, ℓ', 'Average step from a model of the Sun, ℓ', meanStepCm, 'cm', { sourceIds: ['mitalas1992'], digits: 2 }),
      step('Carré moyen d’un pas de longueur aléatoire', 'Mean square of a step of random length', 2 * meanStepCm ** 2, 'cm²', { formula: '⟨l²⟩ = 2 ℓ²', sourceIds: ['balian1999'] }),
      step('Nombre de pas pour s’éloigner de R', 'Number of steps to get R away', stepCount(meanStepCm), '', { formula: 'n = R² / ⟨l²⟩', sourceIds: ['balian1999'] }),
      step('Temps de sortie, en années (a)', 'Escape time, in years (a)', walk, '', { formula: 't = n ℓ / c = R² / (2 ℓ c)', sourceIds: ['balian1999'] }),
      step('Formule de Mitalas et Sills, en années (b)', 'Mitalas and Sills’ formula, in years (b)', msWalk, '', { formula: 't = 3 R² / (ℓ c)', sourceIds: ['mitalas1992'] }),
      step('Temps donné par Mitalas et Sills, en années', 'Time given by Mitalas and Sills, in years', msYears, '', { sourceIds: ['mitalas1992'], digits: 2 }),
      step('Rapport entre les deux', 'Ratio between the two', msWalk / walk, '', { formula: 'b ÷ a = 3 × 2' }),
    ],
  },
  {
    id: 'zone',
    steps: [
      step('Base de la zone convective, en rayons du Soleil (z)', 'Base of the convective zone, in solar radii (z)', convectiveBase, '', { sourceIds: ['bahcall2005'] }),
      step('Épaisseur de la zone convective, en part du rayon', 'Thickness of the convective zone, as a share of the radius', convectiveShare * 100, '%', { formula: '1 − z' }),
      step('Rayon du Soleil, R', 'Radius of the Sun, R', radius / 1000, 'km', { sourceIds: ['prsa2016'], digits: 4 }),
      step('Épaisseur de la zone convective', 'Thickness of the convective zone', (convectiveShare * radius) / 1000, 'km', { formula: '(1 − z) × R' }),
    ],
  },
  {
    id: 'energy',
    steps: [
      step('Temps de séjour de l’énergie dans le Soleil, en années (s)', 'Residence time of energy in the Sun, in years (s)', residenceYears, '', { sourceIds: ['osacar2020'], digits: 2 }),
      step('Échelle de temps de Kelvin-Helmholtz, en années', 'Kelvin–Helmholtz timescale, in years', kelvinHelmholtzYears, '', { sourceIds: ['osacar2020'], digits: 1 }),
      step('Temps de sortie du rayonnement, en années (r)', 'Escape time of the radiation, in years (r)', walk, '', { formula: 'R² / (2 ℓ c)' }),
      step('Rapport entre le séjour de l’énergie et la sortie du rayonnement', 'Ratio of the energy’s residence to the radiation’s escape', residenceYears / walk, '', { formula: 's ÷ r' }),
    ],
  },
];

/** A duration in years for display, 2 significant digits: "28 000", "1,5 million". */
export const formatYears = (years: number, locale: Locale): string => formatLargeCount(Number(years.toPrecision(2)), locale);

/** "28 000 ans", "1,5 million d’années"; "28,000 years", "1.5 million years". */
export const yearsPhrase = (years: number, locale: Locale): string => {
  const n = formatYears(years, locale);
  if (locale === 'en') return `${n} years`;
  return years >= 1e6 ? `${n} d’années` : `${n} ans`;
};

const fmt = (n: number, locale: Locale, digits = 3) => formatNumberText(n, locale, digits);
const minSec = (s: number) => `${Math.floor(s / 60)} min ${Math.round(s % 60)} s`;
const range = ([a, b]: number[], locale: Locale) => `${fmt(a, locale)} ${locale === 'fr' ? 'à' : 'to'} ${fmt(b, locale)}`;

/** Every number the story prints, formatted for `locale`. Nothing is typed by hand in the MDX. */
export const figures = (locale: Locale) => ({
  fromSurface: minSec(fromSurface),
  fromSurfaceMinutes: Math.floor(fromSurface / 60),
  auKm: formatLargeCount(Number((au / 1000).toPrecision(3)), locale),
  msYear: 1992,
  crossing: fmt(crossing, locale, 2),
  transparentSeconds,
  radiusKm: formatLargeCount(Number((radius / 1000).toPrecision(3)), locale),
  uniformStep: fmt(uniformStepCm, locale),
  localStep: fmt(localStepCm, locale),
  localMax: fmt(localMaxCm, locale),
  textbookStep: range(textbookStepCm, locale),
  textbookYears: range(textbookYears, locale),
  meanStep: fmt(meanStepCm, locale),
  walkYears: formatYears(walk, locale),
  msYears: formatYears(msYears, locale),
  msStepsExp: Math.round(Math.log10(msSteps)),
  ratio: Math.round(msWalk / walk),
  residence: yearsPhrase(residenceYears, locale),
  convectiveBase: fmt(convectiveBase, locale),
  convectiveShare: formatPercent(convectiveShare, locale),
  convectiveKm: formatLargeCount(Number(((convectiveShare * radius) / 1000).toPrecision(2)), locale),
  tau,
  sliderMin: fmt(10 ** SLIDER.minExp, locale),
  sliderMax: fmt(10 ** SLIDER.maxExp, locale),
});
