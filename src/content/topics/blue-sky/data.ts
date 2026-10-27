import { calcStep as step, type Source, type Calc } from '../../../lib/sources.ts';
import type { Locale } from '../../../lib/i18n.ts';
import { formatNumberText, formatPercent } from '../../../lib/format.ts';

// Ordered by first citation on the page: SourceRef numbers follow this order.
export const sources: Source[] = [
  {
    id: 'smith2005',
    citation: 'Smith G. S. (2005). Human color vision and the unsaturated blue color of the daytime sky. American Journal of Physics, 73(7), 590–597.',
    doi: '10.1119/1.1858479',
    url: 'https://doi.org/10.1119/1.1858479',
    peerReviewed: true,
  },
  {
    id: 'tiesinga2021',
    citation:
      'Tiesinga E., Mohr P. J., Newell D. B., Taylor B. N. (2021). CODATA recommended values of the fundamental physical constants: 2018. Journal of Physical and Chemical Reference Data, 50(3), 033105.',
    doi: '10.1063/5.0064853',
    url: 'https://doi.org/10.1063/5.0064853',
    peerReviewed: true,
  },
  {
    id: 'stockman2000',
    citation:
      'Stockman A., Sharpe L. T. (2000). The spectral sensitivities of the middle- and long-wavelength-sensitive cones derived from measurements in observers of known genotype. Vision Research, 40(13), 1711–1737.',
    doi: '10.1016/S0042-6989(00)00021-3',
    url: 'https://doi.org/10.1016/S0042-6989(00)00021-3',
    peerReviewed: true,
  },
  {
    id: 'stockman1999',
    citation:
      'Stockman A., Sharpe L. T., Fach C. (1999). The spectral sensitivity of the human short-wavelength sensitive cones derived from thresholds and color matches. Vision Research, 39(17), 2901–2927.',
    doi: '10.1016/S0042-6989(98)00225-9',
    url: 'https://doi.org/10.1016/S0042-6989(98)00225-9',
    peerReviewed: true,
  },
];

/** Violet chalk, which the shared palette lacks; light enough to read on the slate. */
export const VIOLET_CHALK = '#c9b3ef';

// Values read in the publications, as printed there.
const T = 5762; // K, blackbody temperature fitted to the measured sunlight, smith2005 eq. (1)
const VIOLET = 400; // nm, short end of the visible range used in smith2005 § IV
const RED = 700; // nm, long end of the same range, smith2005 § IV
const BLUE = 470; // nm, blue filter of the demonstration, smith2005 § IV
const coneL = 570; // nm, peak sensitivity of the L cones, smith2005 § II
const coneM = 543; // nm, M cones, smith2005 § II
const coneS = 442; // nm, S cones, smith2005 § II
const matchNm = 474; // nm, spectral blue matching the Rayleigh sky, smith2005 § III
const measuredMatchNm = 476; // nm, same for the measured sky, smith2005 § III
const whitePerNm = 0.049; // white / blue spectral irradiance of the match, smith2005 § III
const bandNm = 10; // nm, width of the blue band, smith2005 § II and § IV
const whitePerBlue = 1.47; // white / blue irradiance over 400–700 nm, smith2005 eq. (14)

// Exact SI values, tiesinga2021 table I.
const h = 6.62607015e-34; // J/Hz
const c = 299792458; // m/s
const k = 1.380649e-23; // J/K
const c2 = (h * c) / k; // m·K, second radiation constant
const WIEN_X = 4.965114231744276; // root of x = 5 (1 − e^−x), from Planck's law

/** Planck's law for the Sun, constant factors dropped: only ratios between wavelengths are used. */
const planck = (nm: number): number => (nm * 1e-9) ** -5 / Math.expm1(c2 / (nm * 1e-9 * T));

/** How much more light of `nm` the air scatters than red light at 700 nm: (700 / λ)⁴. */
export const scatterVsRed = (nm: number): number => (RED / nm) ** 4;

/** Sunlight at `nm`, as a multiple of sunlight at 700 nm (blackbody at 5762 K). */
export const sunVsRed = (nm: number): number => planck(nm) / planck(RED);

/** Light of the sky at `nm` (sunlight × scattering), as a multiple of the same at 700 nm. */
export const skyVsRed = (nm: number): number => scatterVsRed(nm) * sunVsRed(nm);

const sunPeakNm = c2 / (WIEN_X * T) / 1e-9;
const whiteShare = whitePerBlue / (whitePerBlue + 1);

/** Slider range: wavelength in nm, over the visible range used by Smith. */
export const SLIDER = { min: VIOLET, max: RED, step: 5 };
export const WAVELENGTHS = { VIOLET, BLUE, RED, MATCH: matchNm, CONES: { S: coneS, M: coneM, L: coneL } };
/** For the drawing of the match: blue band height over white, per nm. */
export const MATCH = { bandNm, bluePerWhite: 1 / whitePerNm };

export const calcs: Calc[] = [
  {
    id: 'scatter',
    steps: [
      step('Puissance de λ dans la diffusion (1 / λ⁴)', 'Power of λ in the scattering (1 / λ⁴)', 4, '', { sourceIds: ['smith2005'] }),
      step('Violet', 'Violet', VIOLET, 'nm', { sourceIds: ['smith2005'] }),
      step('Bleu', 'Blue', BLUE, 'nm', { sourceIds: ['smith2005'] }),
      step('Rouge', 'Red', RED, 'nm', { sourceIds: ['smith2005'] }),
      step('Violet diffusé, par rapport au rouge', 'Violet scattered, compared with red', scatterVsRed(VIOLET), '×', { formula: '(700 / 400)⁴' }),
      step('Bleu diffusé, par rapport au rouge', 'Blue scattered, compared with red', scatterVsRed(BLUE), '×', { formula: '(700 / 470)⁴' }),
      step('Violet diffusé, par rapport au bleu', 'Violet scattered, compared with blue', scatterVsRed(VIOLET) / scatterVsRed(BLUE), '×', { formula: '(470 / 400)⁴' }),
    ],
  },
  {
    id: 'sun',
    steps: [
      step('Température du Soleil vu comme un corps noir, T', 'Temperature of the Sun seen as a blackbody, T', T, 'K', { sourceIds: ['smith2005'], digits: 4 }),
      step('Constante de Planck, h', 'Planck constant, h', h, 'J/Hz', { sourceIds: ['tiesinga2021'], digits: 9 }),
      step('Vitesse de la lumière, c', 'Speed of light, c', c, 'm/s', { sourceIds: ['tiesinga2021'], digits: 9 }),
      step('Constante de Boltzmann, k', 'Boltzmann constant, k', k, 'J/K', { sourceIds: ['tiesinga2021'], digits: 7 }),
      step('Deuxième constante de rayonnement, c₂', 'Second radiation constant, c₂', c2, 'm·K', { formula: 'c₂ = h × c / k', digits: 7 }),
      step('Maximum du corps noir, par nanomètre', 'Blackbody peak, per nanometre', sunPeakNm, 'nm', { formula: 'λ = c₂ / (x × T), x = 5 × (1 − e⁻ˣ)' }),
      step('Soleil à 400 nm, par rapport à 470 nm', 'Sun at 400 nm, compared with 470 nm', sunVsRed(VIOLET) / sunVsRed(BLUE), '×', { formula: 'B(400) / B(470), B(λ) = λ⁻⁵ / (e^(c₂/λT) − 1)' }),
      step('Lumière du ciel à 400 nm, par rapport au rouge', 'Sky light at 400 nm, compared with red', skyVsRed(VIOLET), '×', { formula: 'S(400) / S(700), S(λ) = B(λ) × λ⁻⁴' }),
      step('Lumière du ciel à 470 nm, par rapport au rouge', 'Sky light at 470 nm, compared with red', skyVsRed(BLUE), '×', { formula: 'S(470) / S(700)' }),
      step('Lumière du ciel : violet par rapport au bleu', 'Sky light: violet compared with blue', skyVsRed(VIOLET) / skyVsRed(BLUE), '×', { formula: 'S(400) / S(470)' }),
    ],
  },
  {
    id: 'eye',
    steps: [
      step('Pic des cônes S', 'Peak of the S cones', coneS, 'nm', { sourceIds: ['smith2005'] }),
      step('Pic des cônes M', 'Peak of the M cones', coneM, 'nm', { sourceIds: ['smith2005'] }),
      step('Pic des cônes L', 'Peak of the L cones', coneL, 'nm', { sourceIds: ['smith2005'] }),
      step('Bleu pur qui, mêlé de blanc, imite le ciel', 'Pure blue that, mixed with white, mimics the sky', matchNm, 'nm', { sourceIds: ['smith2005'] }),
      step('Blanc par rapport au bleu, par nanomètre (bande de 10 nm), b', 'White compared with blue, per nanometre (10 nm band), b', whitePerNm, '', { sourceIds: ['smith2005'] }),
      step('Blanc par rapport au bleu, de 400 à 700 nm, w', 'White compared with blue, from 400 to 700 nm, w', whitePerBlue, '×', { sourceIds: ['smith2005'], formula: 'w = (700 − 400) nm × b / 10 nm' }),
      step('Part du blanc dans le mélange', 'Share of white in the mix', whiteShare * 100, '%', { formula: '100 × w / (w + 1)', digits: 2 }),
    ],
  },
];

const nm = (n: number, locale: Locale) => formatNumberText(n, locale, 3);
const times = (n: number, locale: Locale) => formatNumberText(n, locale, 2);

/** Every number the story prints, formatted for `locale`. Nothing is typed by hand in the MDX. */
export const figures = (locale: Locale) => ({
  violetNm: VIOLET,
  blueNm: BLUE,
  redNm: RED,
  violetVsRed: times(scatterVsRed(VIOLET), locale),
  blueVsRed: times(scatterVsRed(BLUE), locale),
  violetVsBlue: times(scatterVsRed(VIOLET) / scatterVsRed(BLUE), locale),
  sunTemp: T.toLocaleString(locale),
  sunPeakNm: nm(sunPeakNm, locale),
  sunDeficit: formatPercent(1 - sunVsRed(VIOLET) / sunVsRed(BLUE), locale),
  skyVioletVsRed: times(skyVsRed(VIOLET), locale),
  skyBlueVsRed: times(skyVsRed(BLUE), locale),
  skyVioletVsBlue: times(skyVsRed(VIOLET) / skyVsRed(BLUE), locale),
  coneS,
  coneM,
  coneL,
  matchNm,
  measuredMatchNm,
  bandNm,
  whitePerBlue: times(whitePerBlue, locale),
  whiteShare: formatPercent(whiteShare, locale),
  sliderMin: SLIDER.min,
  sliderMax: SLIDER.max,
});
