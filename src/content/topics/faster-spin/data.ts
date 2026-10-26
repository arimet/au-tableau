import { calcStep as step, type Source, type Calc } from '../../../lib/sources.ts';
import type { Locale } from '../../../lib/i18n.ts';
import { formatNumberText, formatPercent } from '../../../lib/format.ts';
import { EARTH, GEO, sources as earthSources } from '../rockets-equator/data.ts';

const shared = (id: string): Source => earthSources.find((s) => s.id === id)!;

// Ordered by first citation on the page: SourceRef numbers follow this order.
export const sources: Source[] = [
  shared('chen2015'),
  shared('gottl2021'),
  shared('zhang2013'),
  {
    id: 'kaspi2015',
    citation:
      'Kaspi Y., Showman A. P. (2015). Atmospheric dynamics of terrestrial exoplanets over a wide range of orbital and atmospheric parameters. The Astrophysical Journal, 804(1), 60.',
    doi: '10.1088/0004-637X/804/1/60',
    url: 'https://doi.org/10.1088/0004-637X/804/1/60',
    peerReviewed: true,
  },
  {
    id: 'charnay2013',
    citation:
      'Charnay B., Forget F., Wordsworth R., Leconte J., Millour E., Codron F., Spiga A. (2013). Exploring the faint young Sun problem and the possible climates of the Archean Earth with a 3-D GCM. Journal of Geophysical Research: Atmospheres, 118(18).',
    doi: '10.1002/jgrd.50808',
    url: 'https://doi.org/10.1002/jgrd.50808',
    peerReviewed: true,
  },
  {
    id: 'navarra2002',
    citation:
      'Navarra A., Boccaletti G. (2002). Numerical general circulation experiments of sensitivity to Earth rotation rate. Climate Dynamics, 19(5–6), 467–483.',
    doi: '10.1007/s00382-002-0238-8',
    url: 'https://doi.org/10.1007/s00382-002-0238-8',
    peerReviewed: true,
  },
  {
    id: 'jenkins1996',
    citation:
      'Jenkins G. S. (1996). A sensitivity study of changes in Earth’s rotation rate with an atmospheric general circulation model. Global and Planetary Change, 11(4), 141–154.',
    doi: '10.1016/0921-8181(95)00050-X',
    url: 'https://doi.org/10.1016/0921-8181(95)00050-X',
    peerReviewed: true,
  },
  {
    id: 'jenkins1993',
    citation:
      'Jenkins G. S., Marshall H. G., Kuhn W. R. (1993). Precambrian climate: The effects of land area and Earth’s rotation rate. Journal of Geophysical Research: Atmospheres, 98(D5), 8785–8791.',
    doi: '10.1029/93JD00033',
    url: 'https://doi.org/10.1029/93JD00033',
    peerReviewed: true,
  },
  {
    id: 'yang2014',
    citation:
      'Yang J., Boué G., Fabrycky D. C., Abbot D. S. (2014). Strong dependence of the inner edge of the habitable zone on planetary rotation rate. The Astrophysical Journal Letters, 787(1), L2.',
    doi: '10.1088/2041-8205/787/1/L2',
    url: 'https://doi.org/10.1088/2041-8205/787/1/L2',
    peerReviewed: true,
  },
  {
    id: 'way2016',
    citation:
      'Way M. J., Del Genio A. D., Kiang N. Y., Sohl L. E., Grinspoon D. H., Aleinov I., Kelley M., Clune T. (2016). Was Venus the first habitable world of our solar system? Geophysical Research Letters, 43(16), 8376–8383.',
    doi: '10.1002/2016GL069790',
    url: 'https://doi.org/10.1002/2016GL069790',
    peerReviewed: true,
  },
];

const { momentOfInertia: C, omega, equatorialRadius: R, gm } = EARTH;
const earthL = C * omega;
const earthEnergy = 0.5 * C * omega ** 2;

// Chosen, not data: today's 24 h day, the 20 h target of the idea, and a constant push over one Julian year.
const HOURS_NOW = 24;
export const TARGET_HOURS = 20;
const YEAR = 365.25 * 86400; // s

/** Angular momentum to add, in kg·m²/s, to shorten a 24 h day to `hours` (same kind of day before and after). */
export const momentumToAdd = (hours: number): number => earthL * (HOURS_NOW / hours - 1);

/** Rotation energy to add, as a share of today's (0.44 for +44 %). */
export const energyShare = (hours: number): number => (HOURS_NOW / hours) ** 2 - 1;

// To speed the Earth up, mass must leave it heading west: a circular equatorial orbit run westward,
// at the geostationary radius (the higher the orbit, the more each tonne takes).
const TONNE = 1000;
const { orbitRadiusM: westRadius, orbitalSpeedMs: westSpeed } = GEO;
const groundL = TONNE * omega * R ** 2;
const orbitL = TONNE * westRadius * westSpeed;

/** Angular momentum one tonne on the westward orbit gives the Earth: its eastward ground momentum, plus its westward orbit's. */
export const MOMENTUM_PER_TONNE = orbitL + groundL;

/** Tonnes to send onto the westward orbit to shorten the day to `hours`. */
export const tonnesFor = (hours: number): number => momentumToAdd(hours) / MOMENTUM_PER_TONNE;

const targetFactor = HOURS_NOW / TARGET_HOURS;
const targetL = momentumToAdd(TARGET_HOURS);
const torque = targetL / YEAR;

// Values read in the publications, as printed there.
const charnayTemperate = -1; // °C, mean surface temperature, 14 h vs 24 h day, temperate climate, charnay2013 § 5.3
const charnayWarm = 1.5; // °C, same, warm ice-free climate, charnay2013 § 5.3
const charnayDay = 14; // h, charnay2013 § 5.3
const charnayAge = 3.8; // billion years ago, charnay2013 § 5.3
const jenkinsShortest = 14; // h, shortest day tested, jenkins1996 abstract
const jenkinsThreshold = 18; // h, large circulation change only below, jenkins1996 abstract
const jenkinsClouds = 20; // %, fewer clouds with a 14 h day, jenkins1993 abstract
const navarraStorms = 144; // h, storm-track rain practically zero from this day length, navarra2002 § 6.1
const wayDays = 16; // Earth days, rotation slow enough for a temperate early Venus, way2016 abstract

/** Slider range: target day length, in hours. */
export const SLIDER = { min: 14, max: 23, step: 0.5 };

export const calcs: Calc[] = [
  {
    id: 'target',
    steps: [
      step('Moment d’inertie de la Terre, C', 'Moment of inertia of the Earth, C', C, 'kg·m²', { sourceIds: ['chen2015'], digits: 6 }),
      step('Vitesse de rotation de la Terre, Ω', 'Rotation rate of the Earth, Ω', omega, 'rad/s', { sourceIds: ['gottl2021'], digits: 7 }),
      step('Élan de la Terre', 'Angular momentum of the Earth', earthL, 'kg·m²/s', { formula: 'L = C × Ω' }),
      step(`Facteur de vitesse pour passer de ${HOURS_NOW} h à ${TARGET_HOURS} h`, `Speed factor to go from ${HOURS_NOW} h to ${TARGET_HOURS} h`, targetFactor, '', { formula: `k = ${HOURS_NOW} / ${TARGET_HOURS}` }),
      step('Élan à ajouter', 'Angular momentum to add', targetL, 'kg·m²/s', { formula: 'ΔL = L × (k − 1)' }),
      step('Une année, t', 'One year, t', YEAR, 's', { formula: '86 400 s × 365¼', digits: 6 }),
      step('Couple à exercer pendant un an', 'Torque to apply for one year', torque, 'N·m', { formula: 'τ = ΔL / t' }),
      step('Énergie de rotation de la Terre', 'Rotation energy of the Earth', earthEnergy, 'J', { formula: 'E = ½ × C × Ω²' }),
      step('Énergie de rotation à ajouter', 'Rotation energy to add', earthEnergy * energyShare(TARGET_HOURS), 'J', { formula: 'ΔE = E × (k² − 1)' }),
    ],
  },
  {
    id: 'west',
    steps: [
      step('Rayon de la Terre à l’équateur, R', 'Equatorial radius of the Earth, R', R, 'm', { sourceIds: ['chen2015'], digits: 8 }),
      step('Constante de gravitation de la Terre, GM', 'Gravitational constant of the Earth, GM', gm, 'm³/s²', { sourceIds: ['chen2015'], digits: 10 }),
      step('Vitesse de rotation de la Terre, Ω', 'Rotation rate of the Earth, Ω', omega, 'rad/s', { sourceIds: ['gottl2021'], digits: 7 }),
      step('Élan d’une tonne posée sur l’équateur, vers l’est', 'Angular momentum of one tonne resting on the equator, eastward', groundL, 'kg·m²/s', { formula: 'L₀ = 1 t × Ω × R²' }),
      step('Rayon de l’orbite choisie (géostationnaire)', 'Radius of the chosen orbit (geostationary)', westRadius, 'm', { formula: 'r = ∛(GM / Ω²)', digits: 8 }),
      step('Vitesse sur cette orbite, vers l’ouest', 'Speed on that orbit, westward', westSpeed, 'm/s', { formula: 'v = Ω × r' }),
      step('Élan d’une tonne sur cette orbite, vers l’ouest', 'Angular momentum of one tonne on that orbit, westward', orbitL, 'kg·m²/s', { formula: 'L₁ = 1 t × r × v' }),
      step('Élan donné à la Terre par une tonne (a)', 'Angular momentum one tonne gives the Earth (a)', MOMENTUM_PER_TONNE, 'kg·m²/s', { formula: 'ΔL₁ = L₀ + L₁' }),
      step(`Élan à ajouter pour des jours de ${TARGET_HOURS} h (b)`, `Angular momentum to add for ${TARGET_HOURS} h days (b)`, targetL, 'kg·m²/s', { formula: `ΔL = C × Ω × (${HOURS_NOW} / ${TARGET_HOURS} − 1)` }),
      step('Tonnes à lancer vers l’ouest', 'Tonnes to launch westward', tonnesFor(TARGET_HOURS), 't', { formula: 'b ÷ a' }),
    ],
  },
];

/** 8.8 × 10^18 → "8,8 milliards de milliards". */
const billionsOfBillions = (n: number, locale: Locale) =>
  `${(n / 1e18).toLocaleString(locale, { maximumSignificantDigits: 2 })} ${locale === 'fr' ? 'milliards de milliards' : 'billion billion'}`;

/** Every number the story prints, formatted for `locale`. Nothing is typed by hand in the MDX. */
export const figures = (locale: Locale) => ({
  hoursNow: HOURS_NOW,
  hoursTarget: TARGET_HOURS,
  speedFactor: formatNumberText(targetFactor, locale),
  momentumShare: formatPercent(targetFactor - 1, locale),
  energyShare: formatPercent(energyShare(TARGET_HOURS), locale),
  westAltitude: formatNumberText((westRadius - R) / 1000, locale),
  westTonnes: billionsOfBillions(tonnesFor(TARGET_HOURS), locale),
  sliderMin: SLIDER.min,
  sliderMax: SLIDER.max,
  charnayDay,
  charnayAge: formatNumberText(charnayAge, locale),
  charnayTemperate: formatNumberText(charnayTemperate, locale).replace('-', '−'),
  charnayWarm: `+${formatNumberText(charnayWarm, locale)}`,
  charnayCooling: formatNumberText(-charnayTemperate, locale),
  charnayWarming: formatNumberText(charnayWarm, locale),
  siderealDay: `${Math.floor(EARTH.siderealDay / 3600)} h ${Math.floor((EARTH.siderealDay % 3600) / 60)} min`,
  jenkinsShortest,
  jenkinsThreshold,
  jenkinsClouds: formatPercent(jenkinsClouds / 100, locale),
  navarraStorms,
  navarraStormDays: navarraStorms / 24,
  wayDays,
});

export const MEAN = { charnayTemperate, charnayWarm };
