import { calcStep as step, type Source, type Calc } from '../../../lib/sources.ts';
import type { Locale } from '../../../lib/i18n.ts';
import { formatLargeCount, formatNumberText, formatPercent } from '../../../lib/format.ts';

// Ordered by first citation on the page: SourceRef numbers follow this order.
export const sources: Source[] = [
  {
    id: 'gunn1949',
    citation: 'Gunn R., Kinzer G. D. (1949). The terminal velocity of fall for water droplets in stagnant air. Journal of Meteorology, 6(4), 243–248.',
    doi: '10.1175/1520-0469(1949)006<0243:TTVOFF>2.0.CO;2',
    url: 'https://doi.org/10.1175/1520-0469(1949)006%3C0243:TTVOFF%3E2.0.CO;2',
    peerReviewed: true,
  },
  {
    id: 'bringi2018',
    citation: 'Bringi V., Thurai M., Baumgardner D. (2018). Raindrop fall velocities from an optical array probe and 2-D video disdrometer. Atmospheric Measurement Techniques, 11(3), 1377–1384.',
    doi: '10.5194/amt-11-1377-2018',
    url: 'https://doi.org/10.5194/amt-11-1377-2018',
    peerReviewed: true,
  },
  {
    id: 'atlas1973',
    citation: 'Atlas D., Srivastava R. C., Sekhon R. S. (1973). Doppler radar characteristics of precipitation at vertical incidence. Reviews of Geophysics, 11(1), 1–35.',
    doi: '10.1029/RG011i001p00001',
    url: 'https://doi.org/10.1029/RG011i001p00001',
    peerReviewed: true,
  },
  {
    id: 'ma2019',
    citation:
      'Ma Y., Ni G., Chandra C. V., Tian F., Chen H. (2019). Statistical characteristics of raindrop size distribution during rainy seasons in the Beijing urban area and implications for radar rainfall estimation. Hydrology and Earth System Sciences, 23(10), 4153–4170.',
    doi: '10.5194/hess-23-4153-2019',
    url: 'https://doi.org/10.5194/hess-23-4153-2019',
    peerReviewed: true,
  },
  {
    id: 'wagner2002',
    citation:
      'Wagner W., Pruß A. (2002). The IAPWS formulation 1995 for the thermodynamic properties of ordinary water substance for general and scientific use. Journal of Physical and Chemical Reference Data, 31(2), 387–535.',
    doi: '10.1063/1.1461829',
    url: 'https://doi.org/10.1063/1.1461829',
    peerReviewed: true,
  },
  {
    id: 'loftus2021',
    citation: 'Loftus K., Wordsworth R. D. (2021). The physics of falling raindrops in diverse planetary atmospheres. Journal of Geophysical Research: Planets, 126(4), e2020JE006653.',
    doi: '10.1029/2020JE006653',
    url: 'https://doi.org/10.1029/2020JE006653',
    peerReviewed: true,
  },
  {
    id: 'moritz2000',
    citation: 'Moritz H. (2000). Geodetic Reference System 1980. Journal of Geodesy, 74(1), 128–133.',
    doi: '10.1007/s001900050278',
    url: 'https://doi.org/10.1007/s001900050278',
    peerReviewed: true,
  },
  {
    id: 'pruppacher1970',
    citation:
      'Pruppacher H. R., Beard K. V. (1970). A wind tunnel investigation of the internal circulation and shape of water drops falling at terminal velocity in air. Quarterly Journal of the Royal Meteorological Society, 96(408), 247–256.',
    doi: '10.1002/qj.49709640807',
    url: 'https://doi.org/10.1002/qj.49709640807',
    peerReviewed: true,
  },
  {
    id: 'abhijeet2023',
    citation:
      'Abhijeet K., Rao T. N., Rao N. R., Jyothi K. A. (2023). Retrieval of microphysical parameters of monsoonal rain using X-band dual-polarization radar: their seasonal dependence and evaluation. Atmospheric Measurement Techniques, 16(4), 871–888.',
    doi: '10.5194/amt-16-871-2023',
    url: 'https://doi.org/10.5194/amt-16-871-2023',
    peerReviewed: true,
  },
];

// Values read in the publications, as printed there.
const DROPS_TIMED = 1500; // drops measured, gunn1949 abstract
const MAX_MASS_UG = 100_000; // µg, largest drop measured, gunn1949 abstract
const RHO_WATER = 997.807; // kg/m³, liquid water at 295 K and 0.1 MPa, wagner2002 table 13.2
const A = 9.65; // m/s, atlas1973 fit as printed in ma2019 eq. (3)
const B = 10.3; // m/s, same fit
const K = 0.6; // per mm, same fit
const SHAPE_0 = 1.03; // axis ratio at D = 0, pruppacher1970 as printed in abhijeet2023 eq. (17)
const SHAPE_SLOPE = 0.062; // per mm, same fit
const GAMMA_E = 9.780327; // m/s², GRS80 conventional series, moritz2000 § 4
const GAMMA_F2 = 0.0053024; // sin² φ term, same series
const GAMMA_F4 = 0.0000058; // sin² 2φ term, same series
const SEEN_DROPS = 2.4e8; // raindrops observed by Gatlin et al. (2015), as quoted in loftus2021 § 3.4
const SEEN_RADIUS_BIG = 2.5; // mm, equivalent radius reached by 0.4 % of them, loftus2021 § 3.4
const SEEN_SHARE_BIG = 0.004; // 0.4 %, loftus2021 § 3.4
const SEEN_RADIUS_HUGE = 4; // mm, equivalent radius reached by 1.9 × 10⁻⁵ % of them, loftus2021 § 3.4
const SEEN_SHARE_HUGE = 1.9e-7; // 1.9 × 10⁻⁵ %, loftus2021 § 3.4
const TURBULENT_SLOWER = [0.25, 0.3]; // mean fall speed below terminal speed in a tornadic supercell and squall lines, bringi2018 § 3
const TURBULENT_MM = [1.3, 2]; // mm, drop sizes that slowdown applies to, bringi2018 § 3
const TURBULENT_LESS_MM = 3; // mm, size slowed less, bringi2018 § 3

// Our choices.
const LATITUDE = 45; // degrees, for gravity
const FALL_M = 1000; // m, height of the fall without air
const BIG_MM = 2 * SEEN_RADIUS_BIG; // 5 mm: the size only 0.4 % of drops reach
const SMALL_MM = 1;

/** Terminal speed in still air at sea level, m/s, for a drop of `mm` diameter (fit of Atlas et al.). */
export const terminalSpeed = (mm: number): number => A - B * Math.exp(-K * mm);

/** Height over width of a falling drop (Pruppacher and Beard), a sphere below about 0.5 mm. */
export const axisRatio = (mm: number): number => Math.min(1, SHAPE_0 - SHAPE_SLOPE * mm);

/** Half-width and half-height, in mm, of a flattened drop with the volume of a sphere of `mm` diameter. */
export const dropAxes = (mm: number): { a: number; b: number } => {
  const r = axisRatio(mm);
  return { a: (mm / 2) * r ** (-1 / 3), b: (mm / 2) * r ** (2 / 3) };
};

const sin = (deg: number) => Math.sin((deg * Math.PI) / 180);
export const G = GAMMA_E * (1 + GAMMA_F2 * sin(LATITUDE) ** 2 - GAMMA_F4 * sin(2 * LATITUDE) ** 2);

/** Height of a fall without air that ends at `speed` m/s. */
export const freeFallHeight = (speed: number): number => speed ** 2 / (2 * G);

export const kmh = (ms: number): number => ms * 3.6;

const maxDiameterMm = Math.cbrt((6 * MAX_MASS_UG * 1e-9) / (Math.PI * RHO_WATER)) * 1000;
/** Speed at the end of a fall of FALL_M metres without air. */
export const FREE_SPEED = Math.sqrt(2 * G * FALL_M);

/** Slider range: drop diameter in mm. Above 5 mm, the fit drifts above the measurements and drops are rare. */
export const SLIDER = { min: 0.5, max: BIG_MM, step: 0.1, value: 2 };
export const SIZES = { SMALL_MM, BIG_MM, MID_MM: 3 };

export const calcs: Calc[] = [
  {
    id: 'speed',
    steps: [
      step('Gouttes chronométrées par Gunn et Kinzer', 'Drops timed by Gunn and Kinzer', DROPS_TIMED, '', { sourceIds: ['gunn1949'] }),
      step('Masse de la plus grosse, m', 'Mass of the largest, m', MAX_MASS_UG, 'µg', { sourceIds: ['gunn1949'] }),
      step('Masse volumique de l’eau à 295 K, ρ', 'Density of water at 295 K, ρ', RHO_WATER, 'kg/m³', { sourceIds: ['wagner2002'], digits: 6 }),
      step('Diamètre d’une sphère de cette masse', 'Diameter of a sphere of that mass', maxDiameterMm, 'mm', { formula: 'D = ∛(6 m / (π ρ))', digits: 2 }),
      step('Vitesse plafond de la formule, A', 'Ceiling speed of the formula, A', A, 'm/s', { sourceIds: ['atlas1973', 'ma2019'] }),
      step('Écart pour une goutte minuscule, B', 'Gap for a tiny drop, B', B, 'm/s', { sourceIds: ['atlas1973', 'ma2019'] }),
      step('Rythme de rapprochement du plafond, k', 'Rate of approach to the ceiling, k', K, '/mm', { sourceIds: ['atlas1973', 'ma2019'] }),
      step('Vitesse d’une goutte de 1 mm', 'Speed of a 1 mm drop', terminalSpeed(SMALL_MM), 'm/s', { formula: 'v = A − B × e^(−k × 1)', digits: 2 }),
      step('Vitesse d’une goutte de 3 mm', 'Speed of a 3 mm drop', terminalSpeed(3), 'm/s', { formula: 'v = A − B × e^(−k × 3)', digits: 2 }),
      step('Vitesse d’une goutte de 5 mm', 'Speed of a 5 mm drop', terminalSpeed(BIG_MM), 'm/s', { formula: 'v = A − B × e^(−k × 5)', digits: 2 }),
      step('La même, en km/h', 'The same, in km/h', kmh(terminalSpeed(BIG_MM)), 'km/h', { formula: 'v × 3600 / 1000', digits: 2 }),
    ],
  },
  {
    id: 'freefall',
    steps: [
      step('Pesanteur normale à l’équateur, γₑ', 'Normal gravity at the equator, γₑ', GAMMA_E, 'm/s²', { sourceIds: ['moritz2000'], digits: 7 }),
      step('Coefficient de sin² φ, f₂', 'Coefficient of sin² φ, f₂', GAMMA_F2, '', { sourceIds: ['moritz2000'], digits: 5 }),
      step('Coefficient de sin² 2φ, f₄', 'Coefficient of sin² 2φ, f₄', GAMMA_F4, '', { sourceIds: ['moritz2000'], digits: 2 }),
      step('Latitude, φ (notre choix)', 'Latitude, φ (our choice)', LATITUDE, '°', { formula: 'φ' }),
      step('Pesanteur à cette latitude, g', 'Gravity at that latitude, g', G, 'm/s²', { formula: 'g = γₑ × (1 + f₂ sin² φ − f₄ sin² 2φ)', digits: 4 }),
      step('Hauteur de chute, h (notre choix)', 'Height of the fall, h (our choice)', FALL_M, 'm', { formula: 'h' }),
      step('Vitesse au bout de la chute, sans air', 'Speed at the end of the fall, without air', FREE_SPEED, 'm/s', { formula: 'v = √(2 g h)' }),
      step('La même, en km/h', 'The same, in km/h', kmh(FREE_SPEED), 'km/h', { formula: 'v × 3600 / 1000' }),
      step('Rapport à la vitesse d’une goutte de 5 mm', 'Ratio to the speed of a 5 mm drop', FREE_SPEED / terminalSpeed(BIG_MM), '×', { formula: '√(2 g h) / v(5 mm)', digits: 2 }),
      step('Gouttes ralenties par la turbulence, petite taille', 'Drops slowed by turbulence, small size', TURBULENT_MM[0], 'mm', { sourceIds: ['bringi2018'] }),
      step('Gouttes ralenties par la turbulence, grande taille', 'Drops slowed by turbulence, large size', TURBULENT_MM[1], 'mm', { sourceIds: ['bringi2018'] }),
      step('Ralentissement moyen, bas de la fourchette', 'Mean slowdown, low end', TURBULENT_SLOWER[0] * 100, '%', { sourceIds: ['bringi2018'] }),
      step('Ralentissement moyen, haut de la fourchette', 'Mean slowdown, high end', TURBULENT_SLOWER[1] * 100, '%', { sourceIds: ['bringi2018'] }),
      step('Taille moins ralentie', 'Size slowed less', TURBULENT_LESS_MM, 'mm', { sourceIds: ['bringi2018'] }),
      step('Chute sans air qui mène à la vitesse d’une goutte de 5 mm', 'Fall without air that reaches the speed of a 5 mm drop', freeFallHeight(terminalSpeed(BIG_MM)), 'm', { formula: 'h = v² / (2 g)', digits: 2 }),
    ],
  },
  {
    id: 'shape',
    steps: [
      step('Rapport hauteur sur largeur à D = 0, a', 'Height over width at D = 0, a', SHAPE_0, '', { sourceIds: ['pruppacher1970', 'abhijeet2023'] }),
      step('Perte par millimètre de diamètre, s', 'Loss per millimetre of diameter, s', SHAPE_SLOPE, '/mm', { sourceIds: ['pruppacher1970', 'abhijeet2023'] }),
      step('Goutte de 1 mm', '1 mm drop', axisRatio(SMALL_MM), '', { formula: 'a − s × 1', digits: 2 }),
      step('Goutte de 3 mm', '3 mm drop', axisRatio(3), '', { formula: 'a − s × 3', digits: 2 }),
      step('Goutte de 5 mm', '5 mm drop', axisRatio(BIG_MM), '', { formula: 'a − s × 5', digits: 2 }),
    ],
  },
  {
    id: 'rare',
    steps: [
      step('Gouttes de pluie observées', 'Raindrops observed', SEEN_DROPS, '', { sourceIds: ['loftus2021'], digits: 2 }),
      step('Rayon équivalent d’une goutte de 5 mm', 'Equivalent radius of a 5 mm drop', SEEN_RADIUS_BIG, 'mm', { sourceIds: ['loftus2021'] }),
      step('Part des gouttes au moins aussi grosses', 'Share of drops at least that big', SEEN_SHARE_BIG * 100, '%', { sourceIds: ['loftus2021'] }),
      step('Rayon équivalent d’une goutte de 8 mm', 'Equivalent radius of an 8 mm drop', SEEN_RADIUS_HUGE, 'mm', { sourceIds: ['loftus2021'] }),
      step('Part des gouttes au moins aussi grosses, p', 'Share of drops at least that big, p', SEEN_SHARE_HUGE * 100, '%', { sourceIds: ['loftus2021'] }),
      step('Soit une goutte sur', 'That is one drop in', 1 / SEEN_SHARE_HUGE, '', { formula: '100 / p', digits: 2 }),
    ],
  },
];

const n = (value: number, locale: Locale, digits = 2) => formatNumberText(value, locale, digits);

/** Every number the story prints, formatted for `locale`. Nothing is typed by hand in the MDX. */
export const figures = (locale: Locale) => ({
  dropsTimed: n(DROPS_TIMED, locale, 4),
  maxMassG: n(MAX_MASS_UG * 1e-6, locale),
  maxDiameterMm: n(maxDiameterMm, locale),
  smallMm: SMALL_MM,
  bigMm: BIG_MM,
  midMm: SIZES.MID_MM,
  vSmall: n(terminalSpeed(SMALL_MM), locale),
  vMid: n(terminalSpeed(SIZES.MID_MM), locale),
  vBig: n(terminalSpeed(BIG_MM), locale),
  vBigKmh: n(kmh(terminalSpeed(BIG_MM)), locale),
  gainMidBig: n(terminalSpeed(BIG_MM) - terminalSpeed(SIZES.MID_MM), locale),
  latitude: LATITUDE,
  g: n(G, locale, 3),
  fallM: n(FALL_M, locale, 4),
  vFree: n(FREE_SPEED, locale),
  vFreeKmh: n(kmh(FREE_SPEED), locale),
  freeRatio: n(FREE_SPEED / terminalSpeed(BIG_MM), locale),
  reachM: n(freeFallHeight(terminalSpeed(BIG_MM)), locale),
  turbLow: n(TURBULENT_SLOWER[0] * 100, locale),
  turbHigh: formatPercent(TURBULENT_SLOWER[1], locale),
  turbSmallMm: n(TURBULENT_MM[0], locale),
  turbBigMm: n(TURBULENT_MM[1], locale),
  turbLessMm: TURBULENT_LESS_MM,
  ratioSmall: formatPercent(axisRatio(SMALL_MM), locale),
  ratioMid: formatPercent(axisRatio(SIZES.MID_MM), locale),
  ratioBig: formatPercent(axisRatio(BIG_MM), locale),
  seenDrops: formatLargeCount(SEEN_DROPS, locale),
  bigShare: formatPercent(SEEN_SHARE_BIG, locale),
  hugeMm: 2 * SEEN_RADIUS_HUGE,
  hugeOneIn: formatLargeCount(1 / SEEN_SHARE_HUGE, locale),
  sliderMin: n(SLIDER.min, locale),
  sliderMax: n(SLIDER.max, locale),
});
