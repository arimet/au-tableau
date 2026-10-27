import { calcStep as step, type Source, type Calc } from '../../../lib/sources.ts';
import type { Locale } from '../../../lib/i18n.ts';
import { formatLargeCount, formatNumberText, formatPercent } from '../../../lib/format.ts';
import { EARTH, sources as rocketSources } from '../rockets-equator/data.ts';
import { sources as skySources } from '../blue-sky/data.ts';

const shared = (from: Source[], id: string): Source => from.find((s) => s.id === id)!;

// Ordered by first citation on the page: SourceRef numbers follow this order.
export const sources: Source[] = [
  {
    id: 'gbd2024',
    citation:
      'GBD 2021 Demographics Collaborators (2024). Global age-sex-specific mortality, life expectancy, and population estimates in 204 countries and territories and 811 subnational locations, 1950–2021. The Lancet, 403(10440), 1989–2056.',
    doi: '10.1016/S0140-6736(24)00476-8',
    url: 'https://doi.org/10.1016/S0140-6736(24)00476-8',
    peerReviewed: true,
  },
  {
    id: 'greenspoon2023',
    citation:
      'Greenspoon L., Krieger E., Sender R., Rosenberg Y., Bar-On Y. M., Moran U., Antman T., Meiri S., Roll U., Noor E., Milo R. (2023). The global biomass of wild mammals. PNAS, 120(10), e2204892120.',
    doi: '10.1073/pnas.2204892120',
    url: 'https://doi.org/10.1073/pnas.2204892120',
    peerReviewed: true,
  },
  shared(rocketSources, 'chen2015'),
  {
    id: 'walpole2012',
    citation:
      'Walpole S. C., Prieto-Merino D., Edwards P., Cleland J., Stevens G., Roberts I. (2012). The weight of nations: an estimation of adult human biomass. BMC Public Health, 12, 439.',
    doi: '10.1186/1471-2458-12-439',
    url: 'https://doi.org/10.1186/1471-2458-12-439',
    peerReviewed: true,
  },
  shared(skySources, 'tiesinga2021'),
  {
    id: 'grether2010',
    citation: 'Grether J.-M., Mathys N. A. (2010). Is the world’s economic centre of gravity already in Asia? Area, 42(1), 47–50.',
    doi: '10.1111/j.1475-4762.2009.00895.x',
    url: 'https://doi.org/10.1111/j.1475-4762.2009.00895.x',
    peerReviewed: true,
  },
  {
    id: 'diaz2017',
    citation:
      'Díaz J., Ruiz M., Sánchez-Pastor P. S., Romero P. (2017). Urban seismology: on the origin of earth vibrations within a city. Scientific Reports, 7, 15296.',
    doi: '10.1038/s41598-017-15499-y',
    url: 'https://doi.org/10.1038/s41598-017-15499-y',
    peerReviewed: true,
  },
];

// Values read in the publications, as printed there.
const population2021 = 7.89e9; // people, gbd2024 summary and table 5
const meanMass = 50; // kg per person, age-weighted, greenspoon2023 SI § Estimating the total biomass of humans
const humansMt = 390; // Mt, greenspoon2023 abstract
const adultMass = 62.0; // kg, world adults in 2005, walpole2012 table 3
const adultCount = 4630e6; // adults in 2005, walpole2012 table 3
const asiaAdultMass = 57.7; // kg, walpole2012 table 3
const northAmericaAdultMass = 80.7; // kg, walpole2012 table 3
const G = 6.6743e-11; // m³/(kg·s²), tiesinga2021 table XXX
const bohrRadius = 5.29177210903e-11; // m, tiesinga2021 table XXXI
const protonRadius = 8.414e-16; // m, proton rms charge radius, tiesinga2021 table XXXI
const demographicCentreKm = 3800; // km from the Earth’s centre, grether2010 § Location of the WECG
const bigCities = 392; // cities over one million people in the sample, grether2010 § Empirical results
const sample = [1975, 2004]; // years covered by that sample, grether2010 table 1
const diazDistanceM = 500; // m, seismic station to the stadium, diaz2017 § Vibrations related to Rock concerts
const diazGoalCrowd = 90_000; // people, diaz2017 § Footquakes
const diazConcertCrowd = 65_000; // people, diaz2017 § Vibrations related to Rock concerts

// Chosen, not data: the 8 billion of the question, and a 30 cm jump.
export const PEOPLE = 8e9;
export const JUMP_M = 0.3;

const { gm, equatorialRadius: R } = EARTH;
const earthMass = gm / G;
const humanityMass = PEOPLE * meanMass;
const massRatio = earthMass / humanityMass;
/** Share of the jumps left once those on opposite sides cancel: the demographic centre’s distance over the radius. */
export const KEPT = (demographicCentreKm * 1000) / R;

/** How far the Earth moves back, in metres, if everyone jumped `h` metres from the same spot. */
const fullRecoil = (h: number): number => (humanityMass * h) / (earthMass + humanityMass);

/** How far the Earth moves back, in metres, when 8 billion people jump `h` metres where they live. */
export const recoilM = (h: number): number => fullRecoil(h) * KEPT;

export const FEMTOMETRE = 1e-15;
export const LENGTHS = { protonRadius, bohrRadius };

/** Slider: the jump height in metres, on a log scale (min, max and value are exponents of ten). */
export const SLIDER = { minExp: -2, maxExp: 1, step: 0.0001, valueExp: Math.round(Math.log10(JUMP_M) * 1e4) / 1e4 };

const recoil = recoilM(JUMP_M);
// The jump that moves the Earth by one proton radius.
const protonJump = protonRadius / recoilM(1);

export const calcs: Calc[] = [
  {
    id: 'mass',
    steps: [
      step('Population mondiale en 2021', 'World population in 2021', population2021, '', { sourceIds: ['gbd2024'], digits: 3 }),
      step('Nombre d’humains de la question, N', 'Number of humans in the question, N', PEOPLE, '', { formula: 'N = 8 × 10⁹', digits: 1 }),
      step('Masse moyenne d’un humain, tous âges confondus', 'Mean mass of a human, all ages', meanMass, 'kg', { sourceIds: ['greenspoon2023'], digits: 2 }),
      step('Masse de l’humanité, m', 'Mass of humanity, m', humanityMass, 'kg', { formula: 'm = N × 50 kg' }),
      step('Paramètre de masse de la Terre, GM', 'Earth’s mass parameter, GM', gm, 'm³/s²', { sourceIds: ['chen2015'], digits: 10 }),
      step('Constante de la gravitation, G', 'Gravitational constant, G', G, 'm³/(kg·s²)', { sourceIds: ['tiesinga2021'], digits: 6 }),
      step('Masse de la Terre, M', 'Mass of the Earth, M', earthMass, 'kg', { formula: 'M = GM / G', digits: 4 }),
      step('Combien de fois la Terre est plus lourde', 'How many times heavier the Earth is', massRatio, '', { formula: 'M / m', digits: 2 }),
    ],
  },
  {
    id: 'recoil',
    steps: [
      step('Hauteur du saut, h (notre choix)', 'Height of the jump, h (our choice)', JUMP_M, 'm', { formula: 'h', digits: 1 }),
      step('Masse de l’humanité, m', 'Mass of humanity, m', humanityMass, 'kg', { formula: 'N × 50 kg' }),
      step('Masse de la Terre, M', 'Mass of the Earth, M', earthMass, 'kg', { formula: 'GM / G', digits: 4 }),
      step('Recul de la Terre si tous sautaient du même endroit', 'Recoil of the Earth if all jumped from the same spot', fullRecoil(JUMP_M), 'm', { formula: 'd₁ = m × h / (M + m)' }),
      step('Distance du centre démographique au centre de la Terre, OD', 'Distance from the demographic centre to the centre of the Earth, OD', demographicCentreKm, 'km', { sourceIds: ['grether2010'], digits: 2 }),
      step('Rayon de la Terre à l’équateur, R', 'Equatorial radius of the Earth, R', R / 1000, 'km', { sourceIds: ['chen2015'], digits: 8 }),
      step('Part des sauts qui ne se compensent pas', 'Share of the jumps that do not cancel', KEPT * 100, '%', { formula: 'k = OD / R' }),
      step('Recul de la Terre', 'Recoil of the Earth', recoil, 'm', { formula: 'd = d₁ × k' }),
      step('Le même recul, en femtomètres', 'The same recoil, in femtometres', recoil / FEMTOMETRE, 'fm', { formula: '1 fm = 10⁻¹⁵ m', digits: 2 }),
    ],
  },
  {
    id: 'scale',
    steps: [
      step('Recul de la Terre, d', 'Recoil of the Earth, d', recoil, 'm', { formula: 'd = d₁ × k' }),
      step('Rayon du proton, rₚ', 'Radius of the proton, rₚ', protonRadius, 'm', { sourceIds: ['tiesinga2021'], digits: 4 }),
      step('Rayon de Bohr, a₀, la taille d’un atome d’hydrogène', 'Bohr radius, a₀, the size of a hydrogen atom', bohrRadius, 'm', { sourceIds: ['tiesinga2021'], digits: 6 }),
      step('Recul en rayons du proton', 'Recoil in proton radii', recoil / protonRadius, '', { formula: 'd / rₚ', digits: 2 }),
      step('Combien de fois le recul est plus petit qu’un atome', 'How many times smaller than an atom the recoil is', bohrRadius / recoil, '', { formula: 'a₀ / d', digits: 2 }),
      step('Saut qui ferait reculer la Terre d’un rayon de proton', 'Jump that would move the Earth by one proton radius', protonJump * 100, 'cm', { formula: 'h × rₚ / d', digits: 2 }),
    ],
  },
];

const fmt = (n: number, locale: Locale, digits = 3) => formatNumberText(n, locale, digits);
/** A whole number rounded to 2 significant digits: 4 420 → "4 400". */
const round2 = (n: number, locale: Locale) => formatLargeCount(Number(n.toPrecision(2)), locale);

/** The slider’s sentence for a jump of `h` metres: the recoil in femtometres, in proton radii, and how many times smaller than an atom. */
export const recoilPhrases = (h: number, locale: Locale) => {
  const d = recoilM(h);
  const fm = d / FEMTOMETRE;
  const shown = Number(fm.toPrecision(2));
  const word = locale === 'fr' ? (shown >= 2 ? 'femtomètres' : 'femtomètre') : shown === 1 ? 'femtometre' : 'femtometres';
  const cm = h * 100;
  const fr = locale === 'fr';
  // Below one proton radius, say how many times smaller rather than "0.47 times".
  const big = d >= protonRadius;
  const ratio = fmt(big ? d / protonRadius : protonRadius / d, locale, 2);
  return {
    height: cm < 100 ? `${fmt(cm, locale, 2)} cm` : `${fmt(h, locale, 2)} m`,
    recoil: `${fmt(fm, locale, 2)} ${word}`,
    proton: big
      ? `${ratio} ${fr ? 'fois le rayon du proton' : 'times the proton radius'}`
      : `${ratio} ${fr ? 'fois moins que le rayon du proton' : 'times smaller than the proton radius'}`,
    atom: round2(bohrRadius / d, locale),
  };
};

/** Every number the story prints, formatted for `locale`. Nothing is typed by hand in the MDX. */
export const figures = (locale: Locale) => ({
  people: formatLargeCount(PEOPLE, locale),
  population2021: `${fmt(population2021 / 1e9, locale)} ${locale === 'fr' ? 'milliards' : 'billion'}`,
  meanMass,
  adultMass: fmt(adultMass, locale),
  adultCount: `${fmt(adultCount / 1e9, locale)} ${locale === 'fr' ? 'milliards' : 'billion'}`,
  adultExtra: formatPercent(adultMass / meanMass - 1, locale),
  asiaAdultMass: fmt(asiaAdultMass, locale),
  northAmericaAdultMass: fmt(northAmericaAdultMass, locale),
  humansMt,
  humanityMt: formatLargeCount(humanityMass / 1000, locale),
  massRatio: formatLargeCount(Number(massRatio.toPrecision(2)), locale),
  jumpCm: Math.round(JUMP_M * 100),
  fullFm: fmt(fullRecoil(JUMP_M) / FEMTOMETRE, locale, 2),
  centreKm: formatLargeCount(demographicCentreKm, locale),
  radiusKm: formatLargeCount(Number((R / 1000).toPrecision(4)), locale),
  bigCities,
  sampleFrom: sample[0],
  sampleTo: sample[1],
  kept: formatPercent(KEPT, locale),
  recoilFm: fmt(recoil / FEMTOMETRE, locale, 2),
  protonFm: fmt(protonRadius / FEMTOMETRE, locale, 2),
  protonTimes: Math.round(recoil / protonRadius),
  atomFm: formatLargeCount(Number((bohrRadius / FEMTOMETRE).toPrecision(2)), locale),
  atomTimes: round2(bohrRadius / recoil, locale),
  protonJumpCm: fmt(protonJump * 100, locale, 2),
  sliderMinCm: Math.round(10 ** SLIDER.minExp * 100),
  sliderMaxM: Math.round(10 ** SLIDER.maxExp),
  diazDistanceM,
  diazGoalCrowd: diazGoalCrowd.toLocaleString(locale),
  diazConcertCrowd: diazConcertCrowd.toLocaleString(locale),
});
