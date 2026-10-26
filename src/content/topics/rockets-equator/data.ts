import type { Source, Calc, CalcStep } from '../../../lib/sources.ts';
import type { Locale } from '../../../lib/i18n.ts';
import { formatDuration, formatLargeCount, formatNumberText } from '../../../lib/format.ts';

// Ordered by first citation on the page: SourceRef numbers follow this order.
export const sources: Source[] = [
  {
    id: 'barker2024',
    citation:
      'Barker C. R., Marais E. A., McDowell J. C. (2024). Global 3D rocket launch and re-entry air pollutant and CO2 emissions at the onset of the megaconstellation era. Scientific Data, 11, 1079.',
    doi: '10.1038/s41597-024-03910-z',
    url: 'https://doi.org/10.1038/s41597-024-03910-z',
    peerReviewed: true,
  },
  {
    id: 'chen2015',
    citation:
      'Chen W., Li J., Ray J., Shen W., Huang C. (2015). Consistent estimates of the dynamic figure parameters of the earth. Journal of Geodesy, 89(2), 179–188.',
    doi: '10.1007/s00190-014-0768-y',
    url: 'https://doi.org/10.1007/s00190-014-0768-y',
    peerReviewed: true,
  },
  {
    id: 'gottl2021',
    citation:
      'Göttl F., Groh A., Schmidt M., Schröder L., Seitz F. (2021). The influence of Antarctic ice loss on polar motion: an assessment based on GRACE and multi-mission satellite altimetry. Earth, Planets and Space, 73, 99.',
    doi: '10.1186/s40623-021-01403-6',
    url: 'https://doi.org/10.1186/s40623-021-01403-6',
    peerReviewed: true,
  },
  {
    id: 'zhang2013',
    citation:
      'Zhang G. (2013). The change in the motions of the Earth and spacecraft launching: a college physics level analysis. Revista Brasileira de Ensino de Física, 35(3).',
    doi: '10.1590/S1806-11172013000300015',
    url: 'https://doi.org/10.1590/S1806-11172013000300015',
    peerReviewed: true,
  },
  {
    id: 'stephenson2016',
    citation:
      'Stephenson F. R., Morrison L. V., Hohenkerk C. Y. (2016). Measurement of the Earth’s rotation: 720 BC to AD 2015. Proceedings of the Royal Society A, 472(2196), 20160404.',
    doi: '10.1098/rspa.2016.0404',
    url: 'https://doi.org/10.1098/rspa.2016.0404',
    peerReviewed: true,
  },
  {
    id: 'gross-chao2006',
    citation:
      'Gross R. S., Chao B. F. (2006). The rotational and gravitational signature of the December 26, 2004 Sumatran earthquake. Surveys in Geophysics, 27(6), 615–632.',
    doi: '10.1007/s10712-006-9008-1',
    url: 'https://doi.org/10.1007/s10712-006-9008-1',
    peerReviewed: true,
  },
  {
    id: 'valencic2026',
    citation:
      'Valencic N., Mihas A., Lyons M. J., Sheehan B. A., Sutherland K. R., Vargas J. J., Hawley W. B., Pan L., Mitrovica J. X. (2026). Length-of-day changes driven by artificial water impoundment post-1835. Geophysical Journal International, 247(2), ggag336.',
    doi: '10.1093/gji/ggag336',
    url: 'https://doi.org/10.1093/gji/ggag336',
    peerReviewed: true,
  },
  {
    id: 'kiani2024',
    citation:
      'Kiani Shahvandi M., Adhikari S., Dumberry M., Mishra S., Soja B. (2024). The increasingly dominant role of climate change on length of day variations. PNAS, 121(30), e2406930121.',
    doi: '10.1073/pnas.2406930121',
    url: 'https://doi.org/10.1073/pnas.2406930121',
    peerReviewed: true,
  },
  {
    id: 'forster2024',
    citation:
      'Forster P. M. et al. (2024). Indicators of Global Climate Change 2023: annual update of key indicators of the state of the climate system and human influence. Earth System Science Data, 16, 2625–2658.',
    doi: '10.5194/essd-16-2625-2024',
    url: 'https://doi.org/10.5194/essd-16-2625-2024',
    peerReviewed: true,
  },
];

// Inputs read in the publications (see the source ids).
const omega = 7.292115e-5; // rad/s, gottl2021 table 1
export const EARTH = {
  momentOfInertia: 8.0349e37, // kg·m², polar moment C, chen2015 eq. 20
  equatorialRadius: 6378136.6, // m, chen2015 eq. 1
  gm: 3.986004418e14, // m³/s², chen2015 eq. 1
  omega,
  siderealDay: (2 * Math.PI) / omega, // s
};

/**
 * Angular momentum a payload carries away, in kg·m²/s: what it has on an equatorial orbit (r·v),
 * minus what it already had on the ground at the equator (ω·R²).
 */
export const payloadAngularMomentum = (payloadKg: number, orbitRadiusM: number, orbitalSpeedMs: number): number =>
  payloadKg * (orbitRadiusM * orbitalSpeedMs - EARTH.omega * EARTH.equatorialRadius ** 2);

/** Lengthening of the day, in seconds, when the Earth loses `deltaL` of its spin C·ω. */
export const dayLengthChange = (deltaL: number): number =>
  (EARTH.siderealDay * deltaL) / (EARTH.momentOfInertia * EARTH.omega);

// Chosen, not data: we reason per tonne, on a circular equatorial orbit at 400 km (low orbit)
// and, for comparison, on the geostationary orbit.
const TONNE = 1000;
const LEO_ALTITUDE_KM = 400;
const leoRadius = EARTH.equatorialRadius + LEO_ALTITUDE_KM * 1000;
export const REFERENCE_LAUNCH = {
  payloadKg: TONNE,
  orbitRadiusM: leoRadius,
  orbitalSpeedMs: Math.sqrt(EARTH.gm / leoRadius),
};
const geoRadius = Math.cbrt(EARTH.gm / omega ** 2);
const GEO = { orbitRadiusM: geoRadius, orbitalSpeedMs: omega * geoRadius };

const groundSpeed = omega * EARTH.equatorialRadius;
const groundL = TONNE * omega * EARTH.equatorialRadius ** 2;
const leoL = TONNE * REFERENCE_LAUNCH.orbitRadiusM * REFERENCE_LAUNCH.orbitalSpeedMs;
const leoDeltaL = payloadAngularMomentum(TONNE, REFERENCE_LAUNCH.orbitRadiusM, REFERENCE_LAUNCH.orbitalSpeedMs);
const geoDeltaL = payloadAngularMomentum(TONNE, GEO.orbitRadiusM, GEO.orbitalSpeedMs);
const earthL = EARTH.momentOfInertia * omega;

/** Day lengthening per tonne placed on the reference low orbit, in seconds. */
export const SECONDS_PER_TONNE = dayLengthChange(leoDeltaL);
const geoSeconds = dayLengthChange(geoDeltaL);

// Values read in the publications, as printed there.
const tidesPerCentury = 2.3e-3; // s, tidal prediction, stephenson2016 abstract
const sumatra = 6.8e-6; // s, day shortened (model), gross-chao2006 abstract
const dams = 1e-5; // s, "∼0.01 ms", day shortened 1835–2011, valencic2026 abstract
const climatePerCentury = 1.33e-3; // s, since 2000, kiani2024 abstract
const warming = 1.19; // °C, 2014–2023 vs 1850–1900, forster2024 abstract
const launches2022 = 186; // launches in the emissions inventory, failures included, barker2024 methods

/** Slider range: tonnes placed in orbit, as powers of ten. */
export const SLIDER = { minExp: 0, maxExp: 10 };

const step = (fr: string, en: string, value: number, unit: string, how: Pick<CalcStep, 'sourceIds' | 'formula' | 'digits'>): CalcStep => ({
  label: { fr, en },
  value,
  unit,
  ...how,
});

export const calcs: Calc[] = [
  {
    id: 'one-tonne',
    steps: [
      step('Moment d’inertie de la Terre, C', 'Moment of inertia of the Earth, C', EARTH.momentOfInertia, 'kg·m²', { sourceIds: ['chen2015'], digits: 6 }),
      step('Rayon de la Terre à l’équateur, R', 'Equatorial radius of the Earth, R', EARTH.equatorialRadius, 'm', { sourceIds: ['chen2015'], digits: 8 }),
      step('Constante de gravitation de la Terre, GM', 'Gravitational constant of the Earth, GM', EARTH.gm, 'm³/s²', { sourceIds: ['chen2015'], digits: 10 }),
      step('Vitesse de rotation de la Terre, Ω', 'Rotation rate of the Earth, Ω', omega, 'rad/s', { sourceIds: ['gottl2021'], digits: 7 }),
      step('Durée d’un tour, le jour sidéral', 'Time for one turn, the sidereal day', EARTH.siderealDay, 's', { formula: 'T = 2π / Ω', digits: 6 }),
      step('Élan de la Terre', 'Angular momentum of the Earth', earthL, 'kg·m²/s', { formula: 'L = C × Ω' }),
      step('Vitesse du sol à l’équateur', 'Speed of the ground at the equator', groundSpeed, 'm/s', { formula: 'Ω × R' }),
      step('Élan d’une tonne posée sur l’équateur', 'Angular momentum of one tonne resting on the equator', groundL, 'kg·m²/s', { formula: 'L₀ = 1 t × Ω × R²' }),
      step(
        `Rayon de l’orbite basse choisie, à ${LEO_ALTITUDE_KM} km d’altitude`,
        `Radius of the chosen low orbit, ${LEO_ALTITUDE_KM} km up`,
        REFERENCE_LAUNCH.orbitRadiusM, 'm', { formula: `r = R + ${LEO_ALTITUDE_KM} km` },
      ),
      step('Vitesse sur cette orbite', 'Speed on that orbit', REFERENCE_LAUNCH.orbitalSpeedMs, 'm/s', { formula: 'v = √(GM / r)' }),
      step('Élan d’une tonne sur cette orbite', 'Angular momentum of one tonne on that orbit', leoL, 'kg·m²/s', { formula: 'L₁ = 1 t × r × v' }),
      step('Élan emporté', 'Angular momentum carried away', leoDeltaL, 'kg·m²/s', { formula: 'ΔL = L₁ − L₀' }),
      step('Allongement du jour', 'Lengthening of the day', SECONDS_PER_TONNE, 's', { formula: 'ΔT = T × ΔL / L' }),
      step('Rayon de l’orbite géostationnaire', 'Radius of the geostationary orbit', GEO.orbitRadiusM, 'm', { formula: 'r = ∛(GM / Ω²)', digits: 8 }),
      step('Vitesse sur cette orbite', 'Speed on that orbit', GEO.orbitalSpeedMs, 'm/s', { formula: 'v = Ω × r' }),
      step('Élan emporté par une tonne', 'Angular momentum carried away by one tonne', geoDeltaL, 'kg·m²/s', { formula: 'ΔL = 1 t × (r × v − Ω × R²)' }),
      step('Allongement du jour', 'Lengthening of the day', geoSeconds, 's', { formula: 'ΔT = T × ΔL / L' }),
    ],
  },
  {
    id: 'comparisons',
    steps: [
      step('Allongement du jour par une tonne en orbite basse (a)', 'Day lengthening from one tonne in low orbit (a)', SECONDS_PER_TONNE, 's', { formula: 'ΔT = T × ΔL / L' }),
      step('Allongement du jour par les marées, par siècle (prédiction)', 'Day lengthening from the tides, per century (prediction)', tidesPerCentury, 's', { sourceIds: ['stephenson2016'] }),
      step('Le même, par an', 'The same, per year', tidesPerCentury / 100, 's', { formula: '÷ 100' }),
      step('Raccourcissement du jour, séisme de Sumatra de 2004 (modèle) (b)', 'Day shortening, 2004 Sumatra earthquake (model) (b)', sumatra, 's', { sourceIds: ['gross-chao2006'] }),
      step('Tonnes en orbite basse pour un effet de même ampleur, en sens inverse', 'Tonnes in low orbit for an effect of the same size, in the opposite direction', sumatra / SECONDS_PER_TONNE, 't', { formula: 'b ÷ a' }),
      step('Raccourcissement du jour, barrages de 1835 à 2011 (environ)', 'Day shortening, dams from 1835 to 2011 (about)', dams, 's', { sourceIds: ['valencic2026'] }),
    ],
  },
  {
    id: 'climate',
    steps: [
      step('Allongement du jour par une tonne en orbite basse (a)', 'Day lengthening from one tonne in low orbit (a)', SECONDS_PER_TONNE, 's', { formula: 'ΔT = T × ΔL / L' }),
      step('Allongement du jour dû au climat, par siècle, depuis 2000 (c)', 'Day lengthening due to climate, per century, since 2000 (c)', climatePerCentury, 's', { sourceIds: ['kiani2024'] }),
      step('Tonnes en orbite basse pour le même effet', 'Tonnes in low orbit for the same effect', climatePerCentury / SECONDS_PER_TONNE, 't', { formula: 'c ÷ a' }),
    ],
  },
];

/** Comparisons for the Magnitude ruler. */
export const magnitudeItems = (locale: Locale) => {
  const fr = locale === 'fr';
  return [
    { label: fr ? 'Une tonne en orbite basse' : 'One tonne in low orbit', seconds: SECONDS_PER_TONNE },
    { label: fr ? 'Les marées, en un an' : 'The tides, in one year', seconds: tidesPerCentury / 100, sourceId: 'stephenson2016' },
    { label: fr ? 'Séisme de Sumatra (raccourci)' : 'Sumatra earthquake (shorter)', seconds: sumatra, sourceId: 'gross-chao2006' },
    { label: fr ? 'Barrages, 1835–2011 (raccourci)' : 'Dams, 1835–2011 (shorter)', seconds: dams, sourceId: 'valencic2026' },
  ];
};

/** Every number the story prints, formatted for `locale`. Nothing is typed by hand in the MDX. */
export const figures = (locale: Locale) => ({
  groundSpeed: formatNumberText(groundSpeed, locale),
  leoSpeed: formatNumberText(REFERENCE_LAUNCH.orbitalSpeedMs, locale),
  leoAltitude: formatNumberText(LEO_ALTITUDE_KM, locale),
  perTonne: formatDuration(SECONDS_PER_TONNE, locale),
  femtosecond: locale === 'fr' ? 'un millionième de milliardième de seconde' : 'a millionth of a billionth of a second',
  perTonneGeo: formatDuration(geoSeconds, locale),
  launchesYear: 2022,
  launches: formatNumberText(launches2022, locale),
  sliderMax: formatLargeCount(10 ** SLIDER.maxExp, locale),
  tidesYear: formatDuration(tidesPerCentury / 100, locale),
  sumatraYear: 2004,
  sumatra: formatDuration(sumatra, locale),
  sumatraTonnes: formatLargeCount(sumatra / SECONDS_PER_TONNE, locale),
  damsFrom: 1835,
  damsTo: 2011,
  dams: formatDuration(dams, locale),
  climatePerCentury: formatDuration(climatePerCentury, locale),
  climateSince: 2000,
  climateTonnes: formatLargeCount(climatePerCentury / SECONDS_PER_TONNE, locale),
  warming: formatNumberText(warming, locale),
  warmingPeriod: [2014, 2023],
  baselinePeriod: [1850, 1900],
});
