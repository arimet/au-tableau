import { calcStep as step, type Source, type Calc } from '../../../lib/sources.ts';
import type { Locale } from '../../../lib/i18n.ts';
import { formatNumberText, formatPercent } from '../../../lib/format.ts';

// Ordered by first citation on the page: SourceRef numbers follow this order.
export const sources: Source[] = [
  {
    id: 'love1993',
    citation: 'Love S. G., Brownlee D. E. (1993). A direct measurement of the terrestrial mass accretion rate of cosmic dust. Science, 262(5133), 550–553.',
    doi: '10.1126/science.262.5133.550',
    url: 'https://doi.org/10.1126/science.262.5133.550',
    peerReviewed: true,
  },
  {
    id: 'carrillo2016',
    citation:
      'Carrillo-Sánchez J. D., Nesvorný D., Pokorný P., Janches D., Plane J. M. C. (2016). Sources of cosmic dust in the Earth’s atmosphere. Geophysical Research Letters, 43(23), 11979–11986.',
    doi: '10.1002/2016GL071697',
    url: 'https://doi.org/10.1002/2016GL071697',
    peerReviewed: true,
  },
  {
    id: 'rojas2021',
    citation:
      'Rojas J., Duprat J., Engrand C., Dartois E., Delauche L., Godard M., Gounelle M., Carrillo-Sánchez J. D., Pokorný P., Plane J. M. C. (2021). The micrometeorite flux at Dome C (Antarctica), monitoring the accretion of extraterrestrial dust on Earth. Earth and Planetary Science Letters, 560, 116794.',
    doi: '10.1016/j.epsl.2021.116794',
    url: 'https://doi.org/10.1016/j.epsl.2021.116794',
    peerReviewed: true,
  },
  {
    id: 'gronoff2020',
    citation:
      'Gronoff G., Arras P., Baraka S., Bell J. M., Cessateur G., Cohen O., et al. (2020). Atmospheric escape processes and planetary atmospheric evolution. Journal of Geophysical Research: Space Physics, 125(8), e2019JA027639.',
    doi: '10.1029/2019JA027639',
    url: 'https://doi.org/10.1029/2019JA027639',
    peerReviewed: true,
  },
  {
    id: 'cooke2026',
    citation:
      'Cooke G. J., Marsh D. R., Walsh C., Sainsbury-Martinez F., Braam M. (2026). The oxygen valve on hydrogen escape since the great oxidation event. Climate of the Past, 22(3), 483–504.',
    doi: '10.5194/cp-22-483-2026',
    url: 'https://doi.org/10.5194/cp-22-483-2026',
    peerReviewed: true,
  },
  {
    id: 'gunell2018',
    citation:
      'Gunell H., Maggiolo R., Nilsson H., Stenberg Wieser G., Slapak R., Lindkvist J., Hamrin M., De Keyser J. (2018). Why an intrinsic magnetic field does not protect a planet against atmospheric escape. Astronomy & Astrophysics, 614, L3.',
    doi: '10.1051/0004-6361/201832934',
    url: 'https://doi.org/10.1051/0004-6361/201832934',
    peerReviewed: true,
  },
  {
    id: 'prsa2016',
    citation:
      'Prša A., Harmanec P., Torres G., Mamajek E., Asplund M., et al. (2016). Nominal values for selected solar and planetary quantities: IAU 2015 Resolution B3. The Astronomical Journal, 152(2), 41.',
    doi: '10.3847/0004-6256/152/2/41',
    url: 'https://doi.org/10.3847/0004-6256/152/2/41',
    peerReviewed: true,
  },
];

// Values read in the publications, as printed there.
const lbYear = 40e6; // kg/yr, small-particle accretion rate, love1993 abstract
const lbError = 20e6; // kg/yr, its uncertainty, love1993 abstract
const lbMaxGrams = 1e-4; // g, largest grains counted, love1993 abstract
const bodies = { minCm: 1, maxKm: 10 }; // size range of the larger bodies they compare with, love1993 abstract
const csDay = 43; // t/day, total input mass, carrillo2016 abstract
const csErrorDay = 14; // t/day, carrillo2016 abstract
const csComets = 0.8; // share from Jupiter Family Comets, carrillo2016 abstract
const rangeDay = [5, 270]; // t/day, published estimates, carrillo2016 § 1
const rojasGround = 5200; // t/yr reaching the surface, 12–700 µm, rojas2021 abstract
const rojasTop = [10_000, 20_000]; // t/yr before atmospheric entry, from the CABMOD-ZoDy model, rojas2021 § 4
const hAtoms = 6e26; // /s, neutral hydrogen escape, gronoff2020 table 3
const hIons = 8e25; // /s, H+ in the polar wind (net escape), gronoff2020 table 3, gunell2018 table A.1
const oIons = 3e25; // /s, O+ in the polar wind (net escape), gronoff2020 table 3, gunell2018 table A.1
const oOther = 6e24; // /s, O+ "unmagnetized ion outflow/K-H/clouds", gronoff2020 table 3
const hCitedMol = 4e10; // mol H/yr, current escape rate quoted by cooke2026 § 1 (from Zahnle et al. 2013)
const hModelMol = 7.54e10; // mol H/yr, diffusion-limited escape, pre-industrial run, cooke2026 table 1
const cookePi = 1850; // year of the pre-industrial atmosphere, cooke2026 § 2
const sekiYear = 2001; // year of the estimate that most O+ returns, gunell2018 p. 3
const earthGM = 3.986004e14; // m³/s², nominal terrestrial mass parameter, prsa2016 table 1
const G = 6.67408e-11; // m³/(kg s²), CODATA 2014, quoted in prsa2016 Resolution item 5

// Defined, not measured: the Julian year and the atomic mass unit (CODATA 2018) with standard atomic weights.
const YEAR = 365.25 * 86400; // s
const U = 1.6605390666e-27; // kg
const H_MASS = 1.008 * U;
const O_MASS = 15.999 * U;
const H_MOLAR = 1.008e-6; // t/mol

const perYear = (kgPerSecond: number) => (kgPerSecond * YEAR) / 1000; // t/yr

const csYear = csDay * 365.25;
const dust = { low: (csDay - csErrorDay) * 365.25, high: (csDay + csErrorDay) * 365.25 }; // t/yr
const hKgS = hAtoms * H_MASS;
const hYear = perYear(hKgS);
const hCited = hCitedMol * H_MOLAR;
const hModel = hModelMol * H_MOLAR;
const hIonsYear = perYear(hIons * H_MASS);
const oxygenYear = perYear(oIons * O_MASS);
const oOtherYear = perYear(oOther * O_MASS);
/** Loss in t/yr: hydrogen (lowest or highest published estimate) plus the oxygen of the polar wind. */
export const loss = { low: hYear + oxygenYear, high: hModel + oxygenYear };
/** Net loss in t/yr with the 2016 dust model and its uncertainty: most favourable, least favourable. */
export const netLoss = { low: loss.low - dust.high, high: loss.high - dust.low };
const earthMass = earthGM / G; // kg
const GYR = 1e9;
const share = (tonnesPerYear: number) => (tonnesPerYear * 1000 * GYR) / earthMass;

/** Net change of the Earth's mass, t/yr, for a dust input in t/day: negative is a loss. */
export const balance = (dustPerDay: number) => ({
  low: dustPerDay * 365.25 - loss.high,
  high: dustPerDay * 365.25 - loss.low,
});

/** Rows of the budget chart, t/yr: a bar from `from` to `to`, and an optional range drawn as a whisker. */
const IN = 'var(--chalk-yellow)', OUT = 'var(--pink)';
export const budget: { label: Record<Locale, string>; colour: string; from?: number; to: number; range?: [number, number] }[] = [
  { label: { fr: 'mesure 1993', en: '1993 measurement' }, colour: IN, from: 0, to: lbYear / 1000, range: [(lbYear - lbError) / 1000, (lbYear + lbError) / 1000] },
  { label: { fr: 'modèle 2016', en: '2016 model' }, colour: IN, from: 0, to: csYear, range: [dust.low, dust.high] },
  { label: { fr: 'modèle 2021', en: '2021 model' }, colour: IN, to: rojasTop[1], range: [rojasTop[0], rojasTop[1]] },
  { label: { fr: 'hydrogène', en: 'hydrogen' }, colour: OUT, from: 0, to: hYear, range: [hYear, hModel] },
  { label: { fr: 'avec l’oxygène', en: 'with oxygen' }, colour: OUT, from: 0, to: loss.low, range: [loss.low, loss.high] },
];

/** Slider: the dust input in tonnes per day, on a log scale across the published range. */
const exp = (n: number) => Math.round(Math.log10(n) * 1e4) / 1e4;
export const SLIDER = { minExp: exp(rangeDay[0]), maxExp: exp(rangeDay[1]), step: 0.0001, valueExp: exp(csDay) };

const SECONDS = '× 365¼ × 86 400 s ÷ 1 000';
export const calcs: Calc[] = [
  {
    id: 'dust',
    steps: [
      step('Mesure de LDEF, par an', 'LDEF measurement, per year', lbYear / 1000, 't', { sourceIds: ['love1993'], digits: 2 }),
      step('Son incertitude', 'Its uncertainty', lbError / 1000, 't', { sourceIds: ['love1993'], digits: 2 }),
      step('Modèle calé sur le sodium, le fer et les sphérules, par jour', 'Model fitted to sodium, iron and spherules, per day', csDay, 't', { sourceIds: ['carrillo2016'], digits: 2 }),
      step('Son incertitude, par jour', 'Its uncertainty, per day', csErrorDay, 't', { sourceIds: ['carrillo2016'], digits: 2 }),
      step('Le même apport, par an (p)', 'The same input, per year (p)', csYear, 't', { formula: '× 365¼' }),
      step('Bas de la fourchette, par an (p₁)', 'Low end, per year (p₁)', dust.low, 't', { formula: '(43 − 14) × 365¼' }),
      step('Haut de la fourchette, par an (p₂)', 'High end, per year (p₂)', dust.high, 't', { formula: '(43 + 14) × 365¼' }),
      step('Modèle de 2021 calé sur Dome C, par an : bas', '2021 model fitted to Dome C, per year: low end', rojasTop[0], 't', { sourceIds: ['rojas2021'], digits: 2 }),
      step('Modèle de 2021 calé sur Dome C, par an : haut', '2021 model fitted to Dome C, per year: high end', rojasTop[1], 't', { sourceIds: ['rojas2021'], digits: 2 }),
      step('Ce qui atteint le sol, d’après Dome C, par an', 'What reaches the ground, from Dome C, per year', rojasGround, 't', { sourceIds: ['rojas2021'], digits: 2 }),
    ],
  },
  {
    id: 'escape',
    steps: [
      step('Atomes d’hydrogène qui s’échappent, par seconde', 'Hydrogen atoms escaping, per second', hAtoms, '', { sourceIds: ['gronoff2020'], digits: 1 }),
      step('Masse d’un atome d’hydrogène (1,008 u)', 'Mass of a hydrogen atom (1.008 u)', H_MASS, 'kg', { formula: 'IUPAC, CODATA', digits: 4 }),
      step('Hydrogène perdu par seconde', 'Hydrogen lost per second', hKgS, 'kg/s', { formula: 'atoms × m_H' }),
      step('Hydrogène perdu par an, estimation basse (h₁)', 'Hydrogen lost per year, low estimate (h₁)', hYear, 't', { formula: SECONDS }),
      step('Valeur citée par Cooke et ses collègues, en moles d’hydrogène par an', 'Value quoted by Cooke and colleagues, in moles of hydrogen per year', hCitedMol, '', { sourceIds: ['cooke2026'], digits: 1 }),
      step('La même, par an', 'The same, per year', hCited, 't', { formula: '× 1,008 g/mol' }),
      step('Leur modèle de l’atmosphère de 1850, en moles par an', 'Their model of the 1850 atmosphere, in moles per year', hModelMol, '', { sourceIds: ['cooke2026'], digits: 3 }),
      step('Hydrogène perdu par an, estimation haute (h₂)', 'Hydrogen lost per year, high estimate (h₂)', hModel, 't', { formula: '× 1,008 g/mol' }),
      step('Ions O⁺ du vent polaire, perdus pour de bon, par seconde', 'O⁺ ions in the polar wind, lost for good, per second', oIons, '', { sourceIds: ['gronoff2020', 'gunell2018'], digits: 1 }),
      step('Oxygène perdu par an (o), 15,999 u par atome', 'Oxygen lost per year (o), 15.999 u per atom', oxygenYear, 't', { formula: `O⁺ × m_O ${SECONDS}` }),
      step('Perte basse, par an', 'Low loss, per year', loss.low, 't', { formula: 'h₁ + o' }),
      step('Perte haute, par an', 'High loss, per year', loss.high, 't', { formula: 'h₂ + o' }),
      step('Non compté : ions H⁺ du vent polaire, par an', 'Not counted: H⁺ ions in the polar wind, per year', hIonsYear, 't', { sourceIds: ['gronoff2020', 'gunell2018'], formula: `H⁺ × m_H ${SECONDS}` }),
      step('Non compté : autre fuite d’ions O⁺, par an', 'Not counted: other O⁺ leak, per year', oOtherYear, 't', { sourceIds: ['gronoff2020'], formula: `O⁺ × m_O ${SECONDS}` }),
    ],
  },
  {
    id: 'balance',
    steps: [
      step('Poussière, haut de la fourchette du modèle de 2016 (p₂)', 'Dust, high end of the 2016 model (p₂)', dust.high, 't', { sourceIds: ['carrillo2016'], formula: '(43 + 14) × 365¼' }),
      step('Poussière, bas de la fourchette (p₁)', 'Dust, low end (p₁)', dust.low, 't', { sourceIds: ['carrillo2016'], formula: '(43 − 14) × 365¼' }),
      step('Perte basse, par an', 'Low loss, per year', loss.low, 't', { formula: 'h₁ + o' }),
      step('Perte haute, par an', 'High loss, per year', loss.high, 't', { formula: 'h₂ + o' }),
      step('Perte nette par an, cas le plus favorable', 'Net loss per year, most favourable case', netLoss.low, 't', { formula: 'h₁ + o − p₂' }),
      step('Perte nette par an, cas le moins favorable', 'Net loss per year, least favourable case', netLoss.high, 't', { formula: 'h₂ + o − p₁' }),
    ],
  },
  {
    id: 'mass',
    steps: [
      step('Paramètre de masse de la Terre, GM', 'Earth’s mass parameter, GM', earthGM, 'm³/s²', { sourceIds: ['prsa2016'], digits: 7 }),
      step('Constante de la gravitation, G (CODATA 2014)', 'Gravitational constant, G (CODATA 2014)', G, 'm³/(kg s²)', { sourceIds: ['prsa2016'], digits: 6 }),
      step('Masse de la Terre, M', 'Mass of the Earth, M', earthMass, 'kg', { formula: 'GM ÷ G', digits: 4 }),
      step('Perte nette sur un milliard d’années, cas le plus favorable', 'Net loss over a billion years, most favourable case', netLoss.low * GYR * 1000, 'kg', { formula: '× 10⁹ × 1 000' }),
      step('Perte nette sur un milliard d’années, cas le moins favorable', 'Net loss over a billion years, least favourable case', netLoss.high * GYR * 1000, 'kg', { formula: '× 10⁹ × 1 000' }),
      step('Part de M, cas le plus favorable', 'Share of M, most favourable case', share(netLoss.low), '', { formula: '÷ M', digits: 2 }),
      step('Part de M, cas le moins favorable', 'Share of M, least favourable case', share(netLoss.high), '', { formula: '÷ M', digits: 2 }),
    ],
  },
];

const fmt = (n: number, locale: Locale, digits = 2) => formatNumberText(n, locale, digits);

/** The slider’s sentence: what the Earth gains or loses each year for a dust input in t/day. */
export const balancePhrase = (dustPerDay: number, locale: Locale): string => {
  const { low, high } = balance(dustPerDay);
  const n = (t: number) => fmt(t, locale);
  if (locale === 'fr') {
    if (high < 0) return `La Terre perd de ${n(-high)} à ${n(-low)} tonnes par an.`;
    if (low > 0) return `La Terre gagne de ${n(low)} à ${n(high)} tonnes par an.`;
    return `Selon l’estimation de l’hydrogène, la Terre gagne jusqu’à ${n(high)} tonnes ou perd jusqu’à ${n(-low)} tonnes par an.`;
  }
  if (high < 0) return `The Earth loses ${n(-high)} to ${n(-low)} tonnes a year.`;
  if (low > 0) return `The Earth gains ${n(low)} to ${n(high)} tonnes a year.`;
  return `Depending on the hydrogen estimate, the Earth gains up to ${n(high)} tonnes or loses up to ${n(-low)} tonnes a year.`;
};

/** Dust per year for a dust input in t/day, as shown. */
export const dustPerYear = (dustPerDay: number, locale: Locale) => fmt(dustPerDay * 365.25, locale);

/** Every number the story prints, formatted for `locale`. Nothing is typed by hand in the MDX. */
export const figures = (locale: Locale) => {
  const massExp = Math.floor(Math.log10(earthMass));
  return {
    lbYear: fmt(lbYear / 1000, locale),
    lbError: fmt(lbError / 1000, locale),
    lbHigh: fmt((lbYear + lbError) / 1000, locale),
    lbMaxMg: fmt(lbMaxGrams * 1000, locale),
    csDay: fmt(csDay, locale),
    csErrorDay: fmt(csErrorDay, locale),
    csYear: fmt(csYear, locale),
    csLow: fmt(dust.low, locale),
    csHigh: fmt(dust.high, locale),
    csComets: formatPercent(csComets, locale),
    rangeLo: fmt(rangeDay[0], locale),
    rangeHi: fmt(rangeDay[1], locale),
    rojasGround: fmt(rojasGround, locale),
    rojasTopLo: fmt(rojasTop[0], locale),
    rojasTopHi: fmt(rojasTop[1], locale),
    hKgS: fmt(hKgS, locale),
    hYear: fmt(hYear, locale),
    hCited: fmt(hCited, locale),
    hModel: fmt(hModel, locale),
    hModelKgS: fmt((hModel * 1000) / YEAR, locale),
    hIonsYear: fmt(hIonsYear, locale),
    oxygenYear: fmt(oxygenYear, locale),
    oOtherYear: fmt(oOtherYear, locale, 1),
    lossLow: fmt(loss.low, locale),
    lossHigh: fmt(loss.high, locale),
    netLow: fmt(netLoss.low, locale),
    netHigh: fmt(netLoss.high, locale),
    massMantissa: fmt(earthMass / 10 ** massExp, locale, 3),
    massExp,
    shareLow: fmt(share(netLoss.low) * GYR, locale),
    shareHigh: fmt(share(netLoss.high) * GYR, locale),
    lbPub: 1993,
    csPub: 2016,
    rojasPub: 2021,
    cookePi,
    sekiYear,
    bodyMinCm: bodies.minCm,
    bodyMaxKm: bodies.maxKm,
    breakLow: fmt(loss.low / 365.25, locale),
    sliderMin: fmt(rangeDay[0], locale),
    sliderMax: fmt(rangeDay[1], locale),
  };
};
