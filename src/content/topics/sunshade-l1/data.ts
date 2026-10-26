import { calcStep as step, type Source, type Calc } from '../../../lib/sources.ts';
import type { Locale } from '../../../lib/i18n.ts';
import { formatLargeCount, formatNumberText, formatPercent } from '../../../lib/format.ts';
import { sources as earthSources } from '../rockets-equator/data.ts';

const shared = (id: string): Source => earthSources.find((s) => s.id === id)!;

// Ordered by first citation on the page: SourceRef numbers follow this order.
export const sources: Source[] = [
  {
    id: 'kopp2016',
    citation: 'Kopp G. (2016). Magnitudes and timescales of total solar irradiance variability. Journal of Space Weather and Space Climate, 6, A30.',
    doi: '10.1051/swsc/2016025',
    url: 'https://doi.org/10.1051/swsc/2016025',
    peerReviewed: true,
  },
  {
    id: 'kravitz2013',
    citation:
      'Kravitz B., Caldeira K., Boucher O., Robock A., Rasch P. J., et al. (2013). Climate model response from the Geoengineering Model Intercomparison Project (GeoMIP). Journal of Geophysical Research: Atmospheres, 118(15), 8320–8332.',
    doi: '10.1002/jgrd.50646',
    url: 'https://doi.org/10.1002/jgrd.50646',
    peerReviewed: true,
  },
  shared('forster2024'),
  {
    id: 'sanchez2015',
    citation:
      'Sánchez J. P., McInnes C. R. (2015). Optimal sunshade configurations for space-based geoengineering near the Sun-Earth L1 point. PLoS ONE, 10(8), e0136648.',
    doi: '10.1371/journal.pone.0136648',
    url: 'https://doi.org/10.1371/journal.pone.0136648',
    peerReviewed: true,
  },
  {
    id: 'bromley2023',
    citation: 'Bromley B. C., Khan S. H., Kenyon S. J. (2023). Dust as a solar shield. PLOS Climate, 2(2), e0000133.',
    doi: '10.1371/journal.pclm.0000133',
    url: 'https://doi.org/10.1371/journal.pclm.0000133',
    peerReviewed: true,
  },
  {
    id: 'angel2006',
    citation:
      'Angel R. (2006). Feasibility of cooling the Earth with a cloud of small spacecraft near the inner Lagrange point (L1). PNAS, 103(46), 17184–17189.',
    doi: '10.1073/pnas.0608163103',
    url: 'https://doi.org/10.1073/pnas.0608163103',
    peerReviewed: true,
  },
  {
    id: 'salazar2016',
    citation:
      'Salazar F. J. T., McInnes C. R., Winter O. C. (2016). Intervening in Earth’s climate system through space-based solar reflectors. Advances in Space Research, 58(1), 17–29.',
    doi: '10.1016/j.asr.2016.04.007',
    url: 'https://doi.org/10.1016/j.asr.2016.04.007',
    peerReviewed: true,
  },
  {
    id: 'tilmes2013',
    citation:
      'Tilmes S., Fasullo J., Lamarque J.-F., et al. (2013). The hydrological impact of geoengineering in the Geoengineering Model Intercomparison Project (GeoMIP). Journal of Geophysical Research: Atmospheres, 118(19), 11036–11058.',
    doi: '10.1002/jgrd.50868',
    url: 'https://doi.org/10.1002/jgrd.50868',
    peerReviewed: true,
  },
];

// Values read in the publications, as printed there.
const solar = 1361; // W/m², total solar irradiance, kopp2016 § 1
const albedoLow = 0.287; // planetary albedo, lowest of 12 models, kravitz2013 table 2
const albedoHigh = 0.313; // highest of 12 models, kravitz2013 table 2
const forcing = 2.79; // W/m², human-caused effective radiative forcing 2023, forster2024 table 3
const forcingLow = 1.78; // W/m², same, low end, forster2024 table 3
const forcingHigh = 3.61; // W/m², same, high end, forster2024 table 3
const doubling = 0.017; // share of sunlight offsetting doubled CO2, sanchez2015 introduction
const l1Km = 1.5e6; // km, Earth–L1 distance, sanchez2015 § I
const efoldDays = 22; // days, drift e-folding time without control, angel2006
const driftFromKm = 1; // km, start offset from L1, bromley2023 § Orbits near the L1
const driftToKm = 1000; // km, reached in under a year, bromley2023 § Orbits near the L1
const deflectionRad = 0.02; // rad, minimum bend of the light, angel2006 Optical Design
const angelShare = 0.018; // share of sunlight the reference design removes, angel2006
const angelDistanceKm = 1.85e6; // km, reference design distance from Earth, angel2006 Optical Design
const angelAreaKm2 = 4.7e6; // km², reference design total area, angel2006 Optical Design
const angelDensity = 4.2; // g/m², reference design areal density, angel2006 Optical Design
const angelMassT = 20e6; // t, reference design mass, angel2006 Optical Design
const angelFlyers = 16e12; // flyers, angel2006 Discussion
const flyerDiameterM = 0.6; // m, angel2006 Flyer Size and Design
const flyerGrams = 1.2; // g, angel2006 Flyer Size and Design
const cloudLengthKm = 100000; // km, angel2006 The Sunshade as a Cloud
const lifetimeYears = 50; // years, at least, angel2006 Discussion
const launches = 20e6; // one-tonne launches, angel2006 Discussion
const launchYears = 10; // years, angel2006 Discussion
const launchers = 20; // electromagnetic launchers, angel2006 Discussion
const launchMinutes = 5; // minutes between shots of one launcher, angel2006 Discussion
const costDollars = 5e12; // dollars, upper bound, angel2006 Discussion
const dustPerYearKg = 1e10; // kg per year, at least, bromley2023 abstract and conclusion
const dustScenarioKg = 5.4e10; // kg per year, lunar-dust scenario, bromley2023 table 2
const dustDays = 5; // days a grain spends in front of the Sun, bromley2023 fig. 8
const moonEnergy = 0.04; // Moon→L1 potential-energy gap as a share of Earth→L1, bromley2023
const g1Share = [0.035, 0.05]; // less sunlight to offset 4×CO2, 12 models, kravitz2013 table 2
const g1Poles = 0.8; // K, poles left warmer than preindustrial, kravitz2013 § 3.1
const g1Tropics = 0.3; // K, tropics left cooler, kravitz2013 § 3.1
const g1Rain = 0.045; // global precipitation drop, kravitz2013 § 3.3, tilmes2013 § 3
const g1Monsoon = [0.05, 0.07]; // monsoon rainfall drop over land, tilmes2013 abstract

// The share of sunlight to remove to offset today's forcing: the forcing over the sunlight the Earth absorbs.
const perSquareMetre = solar / 4; // the Earth intercepts a disc, πR², and spreads it over its sphere, 4πR²
const absorbedLow = perSquareMetre * (1 - albedoHigh);
const absorbedHigh = perSquareMetre * (1 - albedoLow);
export const SHARE_TODAY = [forcing / absorbedHigh, forcing / absorbedLow];
const shareRange = [forcingLow / absorbedHigh, forcingHigh / absorbedLow];

/** Angel’s reference design, scaled to remove `share` of the sunlight: its area grows in proportion. */
export const angelFor = (share: number) => {
  const areaKm2 = angelAreaKm2 * (share / angelShare);
  return { areaKm2, massT: angelDensity * areaKm2 /* g/m² × km² = t */, flyers: angelFlyers * (share / angelShare) };
};

/** Slider range: share of sunlight removed, in percent. */
export const SLIDER = { min: 0.5, max: 3, step: 0.1, value: Math.round(((SHARE_TODAY[0] + SHARE_TODAY[1]) / 2) * 1000) / 10 };

export const calcs: Calc[] = [
  {
    id: 'today',
    steps: [
      step('Lumière du Soleil au-dessus de l’atmosphère, S', 'Sunlight above the atmosphere, S', solar, 'W/m²', { sourceIds: ['kopp2016'], digits: 4 }),
      step('En moyenne sur toute la surface de la Terre', 'Averaged over the whole surface of the Earth', perSquareMetre, 'W/m²', { formula: 'S / 4' }),
      step('Part renvoyée vers l’espace (albédo α), modèle le plus clair', 'Share sent back to space (albedo α), brightest model', albedoHigh, '', { sourceIds: ['kravitz2013'] }),
      step('La même, modèle le plus sombre', 'The same, darkest model', albedoLow, '', { sourceIds: ['kravitz2013'] }),
      step('Lumière absorbée, modèle le plus clair (a)', 'Sunlight absorbed, brightest model (a)', absorbedLow, 'W/m²', { formula: 'S / 4 × (1 − α)' }),
      step('Lumière absorbée, modèle le plus sombre (b)', 'Sunlight absorbed, darkest model (b)', absorbedHigh, 'W/m²', { formula: 'S / 4 × (1 − α)' }),
      step('Forçage dû aux activités humaines en 2023 (c)', 'Forcing from human activities in 2023 (c)', forcing, 'W/m²', { sourceIds: ['forster2024'] }),
      step('Lumière à retirer (b)', 'Sunlight to remove (b)', SHARE_TODAY[0] * 100, '%', { formula: 'c ÷ b' }),
      step('Lumière à retirer (a)', 'Sunlight to remove (a)', SHARE_TODAY[1] * 100, '%', { formula: 'c ÷ a' }),
      step('Forçage de 2023, bas de la fourchette (d)', '2023 forcing, low end of the range (d)', forcingLow, 'W/m²', { sourceIds: ['forster2024'] }),
      step('Forçage de 2023, haut de la fourchette (e)', '2023 forcing, high end of the range (e)', forcingHigh, 'W/m²', { sourceIds: ['forster2024'] }),
      step('Lumière à retirer, au plus bas', 'Sunlight to remove, lowest', shareRange[0] * 100, '%', { formula: 'd ÷ b' }),
      step('Lumière à retirer, au plus haut', 'Sunlight to remove, highest', shareRange[1] * 100, '%', { formula: 'e ÷ a' }),
    ],
  },
  {
    id: 'angel',
    steps: [
      step('Lumière retirée par la conception de référence, p₀', 'Sunlight removed by the reference design, p₀', angelShare * 100, '%', { sourceIds: ['angel2006'] }),
      step('Surface totale de l’écran, A₀', 'Total area of the shade, A₀', angelAreaKm2, 'km²', { sourceIds: ['angel2006'] }),
      step(`Surface pour retirer p = ${formatPercent(SLIDER.value / 100, 'fr')} (curseur au départ)`, `Area to remove p = ${formatPercent(SLIDER.value / 100, 'en')} (slider at start)`, angelFor(SLIDER.value / 100).areaKm2, 'km²', { formula: 'A = A₀ × p / p₀' }),
      step('Masse par mètre carré', 'Mass per square metre', angelDensity, 'g/m²', { sourceIds: ['angel2006'] }),
      step('Masse totale', 'Total mass', angelDensity * angelAreaKm2, 't', { formula: 'g/m² × km² = t' }),
      step('Masse donnée par l’auteur', 'Mass given by the author', angelMassT, 't', { sourceIds: ['angel2006'] }),
      step('Masse d’un disque', 'Mass of one disc', flyerGrams, 'g', { sourceIds: ['angel2006'] }),
      step('Nombre de disques donné par l’auteur', 'Number of discs given by the author', angelFlyers, '', { sourceIds: ['angel2006'] }),
      step('Lancements d’une tonne', 'One-tonne launches', launches, '', { sourceIds: ['angel2006'] }),
    ],
  },
];

const fmt = (n: number, locale: Locale) => formatNumberText(n, locale);
const percentRange = ([a, b]: number[], locale: Locale) => `${formatNumberText(a * 100, locale, 2)} ${locale === 'fr' ? 'à' : 'to'} ${formatPercent(b, locale)}`;

/** Every number the story prints, formatted for `locale`. Nothing is typed by hand in the MDX. */
export const figures = (locale: Locale) => ({
  solar: formatNumberText(solar, locale, 4),
  perSquareMetre: fmt(perSquareMetre, locale),
  albedo: percentRange([albedoLow, albedoHigh], locale),
  forcing: fmt(forcing, locale),
  forcingYear: 2023,
  shareToday: formatPercent((SHARE_TODAY[0] + SHARE_TODAY[1]) / 2, locale),
  shareRange: percentRange(shareRange, locale),
  doubling: formatPercent(doubling, locale),
  l1: formatLargeCount(l1Km, locale),
  efoldDays,
  efoldFactor: formatNumberText(Math.E, locale, 2),
  driftFrom: driftFromKm,
  driftTo: fmt(driftToKm, locale),
  deflection: formatNumberText((deflectionRad * 180) / Math.PI, locale, 2),
  angelYear: 2006,
  angelDistance: `${fmt(angelDistanceKm / 1e6, locale)} million`,
  angelShare: formatPercent(angelShare, locale),
  angelArea: formatLargeCount(angelAreaKm2, locale),
  angelMass: formatLargeCount(angelMassT, locale),
  angelFlyers: formatLargeCount(angelFlyers, locale),
  flyerDiameter: fmt(flyerDiameterM * 100, locale),
  flyerGrams: fmt(flyerGrams, locale),
  cloudLength: fmt(cloudLengthKm, locale),
  lifetimeYears,
  launches: formatLargeCount(launches, locale),
  launchYears,
  launchers,
  launchMinutes,
  cost: formatLargeCount(costDollars, locale),
  bromleyYear: 2023,
  dustPerYear: formatLargeCount(dustPerYearKg / 1000, locale),
  dustScenario: formatLargeCount(dustScenarioKg / 1000, locale),
  dustDays,
  moonEnergy: formatPercent(moonEnergy, locale),
  g1Share: percentRange(g1Share, locale),
  g1Poles: fmt(g1Poles, locale),
  g1Tropics: fmt(g1Tropics, locale),
  g1Rain: formatPercent(g1Rain, locale),
  g1Monsoon: percentRange(g1Monsoon, locale),
  sliderMin: fmt(SLIDER.min, locale),
  sliderMax: fmt(SLIDER.max, locale),
});

