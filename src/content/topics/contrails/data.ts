import { calcStep as step, type Source, type Calc } from '../../../lib/sources.ts';
import type { Locale } from '../../../lib/i18n.ts';
import { formatLargeCount, formatNumberText } from '../../../lib/format.ts';

// Ordered by first citation on the page: SourceRef numbers follow this order.
export const sources: Source[] = [
  {
    id: 'schumann1996',
    citation: 'Schumann U. (1996). On conditions for contrail formation from aircraft exhausts. Meteorologische Zeitschrift, 5(1), 4–23.',
    doi: '10.1127/metz/5/1996/4',
    url: 'https://doi.org/10.1127/metz/5/1996/4',
    peerReviewed: true,
  },
  {
    id: 'karcher2018',
    citation: 'Kärcher B. (2018). Formation and radiative forcing of contrail cirrus. Nature Communications, 9, 1824.',
    doi: '10.1038/s41467-018-04068-0',
    url: 'https://doi.org/10.1038/s41467-018-04068-0',
    peerReviewed: true,
  },
  {
    id: 'spichtinger2005',
    citation:
      'Spichtinger P., Gierens K., Wernli H. (2005). A case study on the formation and evolution of ice supersaturation in the vicinity of a warm conveyor belt’s outflow region. Atmospheric Chemistry and Physics, 5, 973–987.',
    doi: '10.5194/acp-5-973-2005',
    url: 'https://doi.org/10.5194/acp-5-973-2005',
    peerReviewed: true,
  },
  {
    id: 'lee2021',
    citation:
      'Lee D. S., Fahey D. W., Skowron A., et al. (2021). The contribution of global aviation to anthropogenic climate forcing for 2000 to 2018. Atmospheric Environment, 244, 117834.',
    doi: '10.1016/j.atmosenv.2020.117834',
    url: 'https://doi.org/10.1016/j.atmosenv.2020.117834',
    peerReviewed: true,
  },
  {
    id: 'kremser2016',
    citation:
      'Kremser S., Thomason L. W., von Hobe M., et al. (2016). Stratospheric aerosol—Observations, processes, and impact on climate. Reviews of Geophysics, 54(2), 278–335.',
    doi: '10.1002/2015RG000511',
    url: 'https://doi.org/10.1002/2015RG000511',
    peerReviewed: true,
  },
  {
    id: 'pitari2002',
    citation:
      'Pitari G., Mancini E. (2002). Short-term climatic impact of the 1991 volcanic eruption of Mt. Pinatubo and effects on atmospheric tracers. Natural Hazards and Earth System Sciences, 2, 91–108.',
    doi: '10.5194/nhess-2-91-2002',
    url: 'https://doi.org/10.5194/nhess-2-91-2002',
    peerReviewed: true,
  },
  {
    id: 'canty2013',
    citation:
      'Canty T., Mascioli N. R., Smarte M. D., Salawitch R. J. (2013). An empirical model of global climate – Part 1: A critical evaluation of volcanic cooling. Atmospheric Chemistry and Physics, 13, 3997–4031.',
    doi: '10.5194/acp-13-3997-2013',
    url: 'https://doi.org/10.5194/acp-13-3997-2013',
    peerReviewed: true,
  },
  {
    id: 'robock2000',
    citation: 'Robock A. (2000). Volcanic eruptions and climate. Reviews of Geophysics, 38(2), 191–219.',
    doi: '10.1029/1998RG000054',
    url: 'https://doi.org/10.1029/1998RG000054',
    peerReviewed: true,
  },
  {
    id: 'smith2018',
    citation:
      'Smith W., Wagner G. (2018). Stratospheric aerosol injection tactics and costs in the first 15 years of deployment. Environmental Research Letters, 13(12), 124001.',
    doi: '10.1088/1748-9326/aae98d',
    url: 'https://doi.org/10.1088/1748-9326/aae98d',
    peerReviewed: true,
  },
  {
    id: 'shearer2016',
    citation:
      'Shearer C., West M., Caldeira K., Davis S. J. (2016). Quantifying expert consensus against the existence of a secret, large-scale atmospheric spraying program. Environmental Research Letters, 11(8), 084011.',
    doi: '10.1088/1748-9326/11/8/084011',
    url: 'https://doi.org/10.1088/1748-9326/11/8/084011',
    peerReviewed: true,
  },
  {
    id: 'jones2013',
    citation:
      'Jones A., Haywood J. M., Alterskjær K., et al. (2013). The impact of abrupt suspension of solar radiation management (termination effect) in experiment G2 of the Geoengineering Model Intercomparison Project (GeoMIP). Journal of Geophysical Research: Atmospheres, 118(17), 9743–9752.',
    doi: '10.1002/jgrd.50762',
    url: 'https://doi.org/10.1002/jgrd.50762',
    peerReviewed: true,
  },
];

// Values read in the publications, as printed there.
const formationC = -40; // °C, air typically colder than this, schumann1996 § 1, karcher2018 Formation stage
const shortMinutes = [0.1, 10]; // min, contrail life in air below ice saturation, karcher2018 table 1
const persistentHours = 10; // h, persistent contrails last 10 min to 10 h, karcher2018 table 1
const supersaturatedShare = [0.1, 0.15]; // share of flight time in ice-supersaturated air, karcher2018 Spreading stage
const cruiseKm = [8, 13]; // km, airliner cruise altitude, karcher2018 introduction
const forcingYear = 2018; // lee2021
const contrailErf = 57.4; // mW/m², contrail cirrus effective radiative forcing 2018, lee2021 table 2
const contrailErfRange = [17, 98]; // mW/m², 5–95 % range, lee2021 table 2
const aviationCo2Erf = 34.3; // mW/m², aviation CO2, lee2021 table 2
const pinatuboSo2Mt = [18, 19]; // Mt of SO2, kremser2016 § 3.1.1
const pinatuboYear = 1991;
const stratosphereKm = 20; // km, tropical injection above about this height, kremser2016 § 2.1
const aerosolEfoldYears = 1; // years for stratospheric sulfate to drop by a factor e, robock2000 § 2, pitari2002
const coolingC = 0.3; // °C, surface cooling after Pinatubo, canty2013 § 4.1
const coolingYears = [2, 3]; // years, robock2000 § 5
const payloadT = 25; // t of sulfur per flight of the purpose-built aircraft, smith2018 § 4.1
const researchPayloadT = 1; // t, research aircraft that reach the altitude, smith2018 § 3
const sulfurPerYearMt = 0.1; // Mt of sulfur lofted in year 1, then +0.1 Mt each year, smith2018 table 3
const flightsYear1 = 4007; // smith2018 table 3
const flightsYear15 = 60109; // smith2018 table 3
const aircraftYear1 = 8; // smith2018 table 3
const aircraftYear15 = 95; // smith2018 table 3
const costPerYear = 2.25e9; // dollars a year on average over 15 years, smith2018 § 4.4
const coolingYear15 = 0.3; // K, cooling aimed for in year 15, smith2018 table 1
const experts = 77; // shearer2016 Methods
const expertsNo = 76; // shearer2016 abstract
const lidarSince = 1974; // regular lidar measurements of stratospheric aerosol, kremser2016 § 4
const volcanoMt = [0.2, 0.5]; // Mt of SO2, smallest volcanic injections measured by satellite, kremser2016 table 1
const terminationFactor = 4.1; // warming rate after stopping, ×, mean of 11 models, jones2013 table 2
const terminationModels = 11; // jones2013 § 2

/** Smith & Wagner’s programme in a given year: sulfur lofted grows by the same amount each year, burnt into twice its mass of SO2. */
export const programme = (year: number) => {
  const sulfurT = sulfurPerYearMt * 1e6 * year;
  const flights = sulfurT / payloadT;
  return { so2Mt: (2 * sulfurT) / 1e6, flights, perDay: flights / 365 };
};

/** A mass in tonnes as words: "200 000 tonnes", "3 millions de tonnes", "3 million tonnes". */
export const tonnesText = (t: number, locale: Locale) =>
  `${formatLargeCount(Number(t.toPrecision(2)), locale)} ${t >= 1e6 && locale === 'fr' ? 'de tonnes' : 'tonnes'}`;

/** Slider range: year of the programme. */
export const SLIDER = { min: 1, max: 15, step: 1, value: 1 };

const pinatuboTimes = (year: number) => pinatuboSo2Mt[0] / programme(year).so2Mt;

export const calcs: Calc[] = [
  {
    id: 'programme',
    steps: [
      step('Soufre emporté par vol, à environ 20 km', 'Sulfur carried per flight, to about 20 km', payloadT, 't', { sourceIds: ['smith2018'] }),
      step('Soufre monté la 1re année (a)', 'Sulfur lofted in year 1 (a)', sulfurPerYearMt, 'Mt', { sourceIds: ['smith2018'] }),
      step('Vols la 1re année', 'Flights in year 1', programme(1).flights, '', { formula: 'a ÷ 25 t' }),
      step('Vols la 1re année, dans l’étude', 'Flights in year 1, in the study', flightsYear1, '', { sourceIds: ['smith2018'] }),
      step('Vols par jour la 1re année', 'Flights per day in year 1', programme(1).perDay, '', { formula: 'a ÷ 25 t ÷ 365' }),
      step('SO2 dispersé la 1re année', 'SO2 released in year 1', programme(1).so2Mt, 'Mt', { formula: '2 × a' }),
      step('Soufre monté la 15e année (b)', 'Sulfur lofted in year 15 (b)', 15 * sulfurPerYearMt, 'Mt', { formula: '15 × a' }),
      step('Vols la 15e année', 'Flights in year 15', programme(15).flights, '', { formula: 'b ÷ 25 t' }),
      step('Vols la 15e année, dans l’étude', 'Flights in year 15, in the study', flightsYear15, '', { sourceIds: ['smith2018'] }),
      step('SO2 du Pinatubo (c)', 'SO2 from Pinatubo (c)', pinatuboSo2Mt[0], 'Mt', { sourceIds: ['kremser2016'] }),
      step('Fois moins que le Pinatubo, 1re année', 'Times less than Pinatubo, year 1', pinatuboTimes(1), '', { formula: 'c ÷ (2 × a)' }),
      step('Fois moins que le Pinatubo, 15e année', 'Times less than Pinatubo, year 15', pinatuboTimes(15), '', { formula: 'c ÷ (2 × b)' }),
    ],
  },
  {
    id: 'forcing',
    steps: [
      step('Forçage des traînées et cirrus de traînée, 2018 (d)', 'Forcing from contrails and contrail cirrus, 2018 (d)', contrailErf, 'mW/m²', { sourceIds: ['lee2021'] }),
      step('Forçage du CO2 de l’aviation, 2018 (e)', 'Forcing from aviation CO2, 2018 (e)', aviationCo2Erf, 'mW/m²', { sourceIds: ['lee2021'] }),
      step('Rapport', 'Ratio', contrailErf / aviationCo2Erf, '', { formula: 'd ÷ e' }),
    ],
  },
];

const fmt = (n: number, locale: Locale, digits = 3) => formatNumberText(n, locale, digits);
const range = ([a, b]: number[], locale: Locale, unit = '') => `${fmt(a, locale)} ${locale === 'fr' ? 'à' : 'to'} ${fmt(b, locale)}${unit}`;

/** Every number the story prints, formatted for `locale`. Nothing is typed by hand in the MDX. */
export const figures = (locale: Locale) => ({
  formation: `−${fmt(-formationC, locale)}`,
  shortMinutes: range(shortMinutes, locale),
  persistentHours,
  supersaturated: `${range(supersaturatedShare.map((s) => s * 100), locale)}${locale === 'fr' ? ' %' : '%'}`,
  cruise: range(cruiseKm, locale),
  forcingYear,
  contrailErf: fmt(contrailErf, locale),
  contrailErfRange: range(contrailErfRange, locale),
  aviationCo2Erf: fmt(aviationCo2Erf, locale),
  pinatuboYear,
  pinatuboSo2: range(pinatuboSo2Mt, locale),
  stratosphere: stratosphereKm,
  aerosolDrop: formatNumberText((1 - Math.exp(-1 / aerosolEfoldYears)) * 100, locale, 2) + (locale === 'fr' ? ' %' : '%'),
  cooling: fmt(coolingC, locale),
  coolingYears: range(coolingYears, locale),
  payload: payloadT,
  researchPayload: researchPayloadT,
  flightsYear1: formatNumberText(flightsYear1, locale, 5),
  flightsYear15: formatNumberText(flightsYear15, locale, 5),
  aircraftYear1,
  aircraftYear15,
  cost: `${formatNumberText(costPerYear / 1e9, locale)} ${locale === 'fr' ? 'milliards' : 'billion'}`,
  coolingYear15: fmt(coolingYear15, locale),
  so2Year1: fmt(programme(1).so2Mt, locale),
  so2Year15: fmt(programme(15).so2Mt, locale),
  pinatuboTimes1: fmt(pinatuboTimes(1), locale, 2),
  pinatuboTimes15: fmt(pinatuboTimes(15), locale),
  experts,
  expertsNo,
  expertsShare: `${fmt((expertsNo / experts) * 100, locale)}${locale === 'fr' ? ' %' : '%'}`,
  lidarSince,
  volcanoMt: range(volcanoMt, locale),
  terminationFactor: fmt(terminationFactor, locale),
  terminationModels,
  sliderMax: SLIDER.max,
});

export const BARS = { contrail: contrailErf, contrailRange: contrailErfRange, co2: aviationCo2Erf };
