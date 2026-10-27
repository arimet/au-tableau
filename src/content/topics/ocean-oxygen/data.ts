import { calcStep as step, type Source, type Calc } from '../../../lib/sources.ts';
import type { Locale } from '../../../lib/i18n.ts';
import { formatLargeCount, formatNumberText, formatPercent } from '../../../lib/format.ts';

// Ordered by first citation on the page: SourceRef numbers follow this order.
export const sources: Source[] = [
  {
    id: 'field1998',
    citation: 'Field C. B., Behrenfeld M. J., Randerson J. T., Falkowski P. (1998). Primary production of the biosphere: integrating terrestrial and oceanic components. Science, 281(5374), 237–240.',
    doi: '10.1126/science.281.5374.237',
    url: 'https://doi.org/10.1126/science.281.5374.237',
    peerReviewed: true,
  },
  {
    id: 'catling2020',
    citation: 'Catling D. C., Zahnle K. J. (2020). The Archean atmosphere. Science Advances, 6(9), eaax1420.',
    doi: '10.1126/sciadv.aax1420',
    url: 'https://doi.org/10.1126/sciadv.aax1420',
    peerReviewed: true,
  },
  {
    id: 'bender1994',
    citation: 'Bender M., Sowers T., Labeyrie L. (1994). The Dole effect and its variations during the last 130,000 years as measured in the Vostok ice core. Global Biogeochemical Cycles, 8(3), 363–376.',
    doi: '10.1029/94GB00724',
    url: 'https://doi.org/10.1029/94GB00724',
    peerReviewed: true,
  },
  {
    id: 'manning2006',
    citation: 'Manning A. C., Keeling R. F. (2006). Global oceanic and land biotic carbon sinks from the Scripps atmospheric oxygen flask sampling network. Tellus B, 58(2), 95–116.',
    doi: '10.1111/j.1600-0889.2006.00175.x',
    url: 'https://doi.org/10.1111/j.1600-0889.2006.00175.x',
    peerReviewed: true,
  },
  {
    id: 'breitburg2018',
    citation: 'Breitburg D., Levin L. A., Oschlies A., Grégoire M., Chavez F. P., et al. (2018). Declining oxygen in the global ocean and coastal waters. Science, 359(6371), eaam7240.',
    doi: '10.1126/science.aam7240',
    url: 'https://doi.org/10.1126/science.aam7240',
    peerReviewed: true,
  },
  {
    id: 'gcb2025',
    citation: 'Friedlingstein P., O’Sullivan M., Jones M. W., Andrew R. M., et al. (2026). Global Carbon Budget 2025. Earth System Science Data, 18(5), 3211–3288.',
    doi: '10.5194/essd-18-3211-2026',
    url: 'https://doi.org/10.5194/essd-18-3211-2026',
    peerReviewed: true,
  },
];

// Values read in the publications, as printed there.
const oceanNpp = 48.5; // PgC/yr, field1998 table 1 (includes 1 PgC of macroalgae, note 38)
const landNpp = 56.4; // PgC/yr, field1998 table 1
const oceanPerM2 = 140; // gC/m2/yr, field1998 p. 239
const landPerM2 = 426; // gC/m2/yr on ice-free land, field1998 p. 239
const o2PerC = 1; // mol O2 released per mol of organic carbon made, catling2020 reaction 1
const decayMol = 9000e12; // mol/yr of oxidative decay or respiration today, catling2020
const organicMol = 4.4e5 * 1e12; // mol of surface organic matter, catling2020
const stockMol = 3.7e19; // mol of O2 in the air, bender1994 table 1c
const grossLand = 20.4e15; // mol O2/yr, land gross production with photorespiration, bender1994 table 1a
const grossOcean = 10.6e15; // mol O2/yr, marine gross production (12) less what the ocean uses before it reaches the air, bender1994 table 1b
const toAir = 0.88; // share of marine photosynthetic O2 that reaches the air first, bender1994 p. 365
const outgassing = 0.45e14; // mol O2/yr given off by the warming ocean, 1993–2003, manning2006 abstract
const inAir = 0.99; // share of the O2 of the ocean-atmosphere system held by the air, manning2006 § 1
const fossilRatio = 1.39; // mol O2 used per mol CO2 from fossil fuels, manning2006 § 1
const fossil = 10.3; // GtC/yr in 2024, gcb2025 abstract
const oceanLossMol = 4.8e15; // mol O2 lost by the open ocean in 50 years, breitburg2018 p. 1
const oceanLoss = 0.02; // share of its oxygen, breitburg2018 p. 1

// Rounded atomic masses: 12 g per mol of carbon, 32 g per mol of O2.
const molOfC = (pgc: number) => (pgc * 1e15) / 12;
const tonnesO2 = (mol: number) => (mol * 32) / 1e6;

export const NPP = oceanNpp + landNpp;
export const OCEAN_SHARE = oceanNpp / NPP;
/** Oxygen released each year by net primary production, in mol. */
export const O2_OCEAN = molOfC(oceanNpp) * o2PerC;
export const O2_TOTAL = molOfC(NPP) * o2PerC;
/** Years of net photosynthesis that the oxygen of the air holds. */
export const YEARS_IN_AIR = stockMol / O2_TOTAL;
/** Share of the air's oxygen that one year of net photosynthesis releases. */
export const ONE_YEAR_SHARE = O2_TOTAL / stockMol;
export const OUTGASSING_SHARE = outgassing / O2_OCEAN;
export const ORGANIC_SHARE = organicMol / stockMol;
/** Years for today's decay to use up all surface organic matter. */
export const ORGANIC_YEARS = organicMol / decayMol;

/**
 * Our simple model for the slider: photosynthesis stops, decay keeps today's pace until the surface
 * organic matter runs out, then stops. Returns the share of the air's oxygen used and left.
 */
export const withoutPhotosynthesis = (years: number) => {
  const used = Math.min(years * decayMol, organicMol) / stockMol;
  return { used, left: 1 - used, exhausted: years >= ORGANIC_YEARS };
};

/** Slider range: years without any photosynthesis. */
// Past about 49 years the model has used up all organic matter: the result no longer moves.
export const SLIDER = { min: 1, max: 60, step: 1, value: 10 };

const fossilMol = molOfC(fossil) * fossilRatio;

export const calcs: Calc[] = [
  {
    id: 'split',
    steps: [
      step('Production primaire nette de l’océan, par an (a)', 'Net primary production of the ocean, per year (a)', oceanNpp, 'PgC', { sourceIds: ['field1998'] }),
      step('Production primaire nette des terres, par an (b)', 'Net primary production of the land, per year (b)', landNpp, 'PgC', { sourceIds: ['field1998'] }),
      step('Production primaire nette de la planète', 'Net primary production of the planet', NPP, 'PgC', { formula: 'a + b', digits: 4 }),
      step('Part de l’océan', 'Share of the ocean', OCEAN_SHARE * 100, '%', { formula: 'a ÷ (a + b)' }),
      step('Oxygène libéré par mole de carbone fixée (c)', 'Oxygen released per mole of carbon fixed (c)', o2PerC, 'mol/mol', { sourceIds: ['catling2020'] }),
      step('Oxygène libéré par l’océan, par an (o)', 'Oxygen released by the ocean, per year (o)', O2_OCEAN, 'mol', { formula: 'a × c ÷ 12 g' }),
      step('Le même, en tonnes', 'The same, in tonnes', tonnesO2(O2_OCEAN), 't', { formula: 'o × 32 g', digits: 2 }),
      step('Oxygène libéré par toute la planète, par an (p)', 'Oxygen released by the whole planet, per year (p)', O2_TOTAL, 'mol', { formula: '(a + b) × c ÷ 12 g' }),
    ],
  },
  {
    id: 'balance',
    steps: [
      step('Oxygène libéré par l’océan, par an (o)', 'Oxygen released by the ocean, per year (o)', O2_OCEAN, 'mol', { formula: 'a × c ÷ 12 g' }),
      step('Part qui passe d’abord dans l’air, selon le calcul de Bender et al.', 'Share that first goes into the air, per the calculation of Bender et al.', toAir * 100, '%', { sourceIds: ['bender1994'], digits: 2 }),
      step('Oxygène consommé chaque année par la respiration et la décomposition', 'Oxygen used each year by respiration and decay', decayMol, 'mol', { sourceIds: ['catling2020'], digits: 2 }),
      step('Oxygène que l’océan qui se réchauffe rend en plus à l’air, par an (g)', 'Extra oxygen the warming ocean gives the air, per year (g)', outgassing, 'mol', { sourceIds: ['manning2006'], digits: 2 }),
      step('Part de l’oxygène libéré par l’océan', 'Share of the oxygen released by the ocean', OUTGASSING_SHARE * 100, '%', { formula: 'g ÷ o', digits: 2 }),
      step('Part de l’oxygène de l’océan et de l’air qui se trouve dans l’air', 'Share of the oxygen of ocean and air that sits in the air', inAir * 100, '%', { sourceIds: ['manning2006'], digits: 2 }),
      step('Production brute d’oxygène des terres, photorespiration comprise, par an (L)', 'Gross oxygen production of the land, photorespiration included, per year (L)', grossLand, 'mol', { sourceIds: ['bender1994'] }),
      step('Oxygène marin qui passe dans l’air, par an (M)', 'Marine oxygen that enters the air, per year (M)', grossOcean, 'mol', { sourceIds: ['bender1994'] }),
      step('Part de l’océan dans l’oxygène qui entre dans l’air', 'Share of the ocean in the oxygen entering the air', (grossOcean / (grossLand + grossOcean)) * 100, '%', { formula: 'M ÷ (L + M)', digits: 2 }),
    ],
  },
  {
    id: 'stock',
    steps: [
      step('Oxygène de l’air (S)', 'Oxygen in the air (S)', stockMol, 'mol', { sourceIds: ['bender1994'], digits: 2 }),
      step('Le même, en tonnes', 'The same, in tonnes', tonnesO2(stockMol), 't', { formula: 'S × 32 g', digits: 2 }),
      step('Oxygène libéré par la photosynthèse nette, par an (p)', 'Oxygen released by net photosynthesis, per year (p)', O2_TOTAL, 'mol', { formula: '(a + b) × c ÷ 12 g' }),
      step('Années de photosynthèse nette contenues dans l’air', 'Years of net photosynthesis held in the air', YEARS_IN_AIR, '', { formula: 'S ÷ p', digits: 2 }),
      step('Part de l’air produite en un an', 'Share of the air made in one year', ONE_YEAR_SHARE * 100, '%', { formula: 'p ÷ S', digits: 2 }),
      step('Renouvellement par l’oxygène de la photosynthèse qui entre dans l’air', 'Turnover by the photosynthetic oxygen entering the air', stockMol / (grossLand + grossOcean), '', { formula: 'S ÷ (L + M)', digits: 2 }),
      step('Matière organique à la surface de la Terre (m)', 'Organic matter at the surface of the Earth (m)', organicMol, 'mol', { sourceIds: ['catling2020'], digits: 2 }),
      step('Oxygène que sa décomposition consommerait, part de l’air', 'Oxygen its decay would use, as a share of the air', ORGANIC_SHARE * 100, '%', { formula: 'm × c ÷ S', digits: 2 }),
      step('Années pour tout décomposer au rythme actuel (d)', 'Years to decay all of it at today’s pace (d)', ORGANIC_YEARS, '', { formula: 'm ÷ d', digits: 2 }),
    ],
  },
  {
    id: 'decline',
    steps: [
      step('Émissions fossiles en 2024, par an (F)', 'Fossil emissions in 2024, per year (F)', fossil, 'GtC', { sourceIds: ['gcb2025'] }),
      step('Oxygène consommé par mole de CO2 fossile (r)', 'Oxygen used per mole of fossil CO2 (r)', fossilRatio, 'mol/mol', { sourceIds: ['manning2006'] }),
      step('Oxygène consommé par les combustibles fossiles, par an', 'Oxygen used by fossil fuels, per year', fossilMol, 'mol', { formula: 'F × r ÷ 12 g' }),
      step('Part de l’oxygène de l’air, par an', 'Share of the oxygen in the air, per year', (fossilMol / stockMol) * 100, '%', { formula: 'F × r ÷ 12 g ÷ S', digits: 2 }),
      step('Oxygène perdu par l’océan ouvert en 50 ans', 'Oxygen lost by the open ocean in 50 years', oceanLossMol, 'mol', { sourceIds: ['breitburg2018'], digits: 2 }),
      step('Part de son oxygène', 'Share of its oxygen', oceanLoss * 100, '%', { sourceIds: ['breitburg2018'], digits: 1 }),
    ],
  },
];

const fmt = (n: number, locale: Locale, digits = 3) => formatNumberText(n, locale, digits);
const round2 = (n: number) => Number(n.toPrecision(2));
/** A percentage with more digits than formatPercent shows: 98.8 → "98,8 %" (fr), "98.8%" (en). */
export const pct = (n: number, locale: Locale, digits: number) => `${formatNumberText(n, locale, digits)}${locale === 'fr' ? ' %' : '%'}`;

/** Every number the story prints, formatted for `locale`. Nothing is typed by hand in the MDX. */
export const figures = (locale: Locale) => {
  const fr = locale === 'fr';
  const start = withoutPhotosynthesis(SLIDER.value);
  return {
    fieldYear: 1998,
    npp: fmt(NPP, locale, 4),
    ocean: fmt(oceanNpp, locale),
    land: fmt(landNpp, locale),
    oceanShare: formatPercent(OCEAN_SHARE, locale),
    landShare: formatPercent(1 - OCEAN_SHARE, locale),
    oceanPerM2,
    landPerM2,
    macroalgae: 1,
    oceanO2: formatLargeCount(round2(tonnesO2(O2_OCEAN)), locale),
    totalO2: formatLargeCount(round2(tonnesO2(O2_TOTAL)), locale),
    benderYear: 1994,
    toAir: formatPercent(toAir, locale),
    outgassing: formatLargeCount(round2(tonnesO2(outgassing)), locale),
    outgassingShare: formatPercent(OUTGASSING_SHARE, locale),
    inAir: formatPercent(inAir, locale),
    grossOceanShare: formatPercent(grossOcean / (grossLand + grossOcean), locale),
    stock: `${formatLargeCount(round2(tonnesO2(stockMol) / 1e9), locale)} ${fr ? 'de milliards' : 'billion'}`,
    yearsInAir: fmt(YEARS_IN_AIR, locale, 2),
    oneYearShare: formatPercent(ONE_YEAR_SHARE, locale),
    turnover: fmt(stockMol / (grossLand + grossOcean), locale, 2),
    organicShare: formatPercent(ORGANIC_SHARE, locale),
    organicYears: fmt(ORGANIC_YEARS, locale, 2),
    goeStart: fmt(2.4, locale),
    goeEnd: fmt(2.3, locale),
    // Fossil charcoal since 0.4 Ga implies O2 above 0.15 bar, catling2020 fig. 2 caption.
    charcoalMyr: 400,
    charcoalBar: fmt(0.15, locale),
    fossil: fmt(fossil, locale),
    fossilYear: 2024,
    fossilShare: formatPercent(fossilMol / stockMol, locale),
    oceanLoss: formatPercent(oceanLoss, locale),
    oceanLossYears: 50,
    sliderMin: SLIDER.min,
    sliderMax: SLIDER.max,
    sliderStart: SLIDER.value,
    sliderStartLeft: pct(start.left * 100, locale, 4),
  };
};
