import { calcStep as step, type Source, type Calc } from '../../../lib/sources.ts';
import type { Locale } from '../../../lib/i18n.ts';
import { formatNumberText, formatPercent } from '../../../lib/format.ts';

const comment = 'Comment on “The global tree restoration potential”. Science, 366';

// Ordered by first citation on the page: SourceRef numbers follow this order.
export const sources: Source[] = [
  {
    id: 'bastin2019',
    citation: 'Bastin J.-F., Finegold Y., Garcia C., Mollicone D., Rezende M., Routh D., Zohner C. M., Crowther T. W. (2019). The global tree restoration potential. Science, 365(6448), 76–79.',
    doi: '10.1126/science.aax0848',
    url: 'https://doi.org/10.1126/science.aax0848',
    peerReviewed: true,
  },
  {
    id: 'friedlingstein2019',
    citation: `Friedlingstein P., Allen M., Canadell J. G., Peters G. P., Seneviratne S. I. (2019). ${comment}(6463), eaay8060.`,
    doi: '10.1126/science.aay8060',
    url: 'https://doi.org/10.1126/science.aay8060',
    peerReviewed: true,
  },
  {
    id: 'gcb2025',
    citation: 'Friedlingstein P., O’Sullivan M., Jones M. W., Andrew R. M., et al. (2026). Global Carbon Budget 2025. Earth System Science Data, 18(5), 3211–3288.',
    doi: '10.5194/essd-18-3211-2026',
    url: 'https://doi.org/10.5194/essd-18-3211-2026',
    peerReviewed: true,
  },
  {
    id: 'lewis2019',
    citation: `Lewis S. L., Mitchard E. T. A., Prentice C., Maslin M., Poulter B. (2019). ${comment}(6463), eaaz0388.`,
    doi: '10.1126/science.aaz0388',
    url: 'https://doi.org/10.1126/science.aaz0388',
    peerReviewed: true,
  },
  {
    id: 'veldman2019',
    citation: `Veldman J. W., Aleman J. C., Alvarado S. T., Anderson T. M., Archibald S., et al. (2019). ${comment}(6463), eaay7976.`,
    doi: '10.1126/science.aay7976',
    url: 'https://doi.org/10.1126/science.aay7976',
    peerReviewed: true,
  },
  {
    id: 'mo2023',
    citation: 'Mo L., Zohner C. M., Reich P. B., Liang J., de Miguel S., et al. (2023). Integrated global assessment of the natural forest carbon potential. Nature, 624(7990), 92–101.',
    doi: '10.1038/s41586-023-06723-z',
    url: 'https://doi.org/10.1038/s41586-023-06723-z',
    peerReviewed: true,
  },
  {
    id: 'bastin2019reply',
    citation: 'Bastin J.-F., Finegold Y., Garcia C., Gellie N., Lowe A., et al. (2019). Response to Comments on “The global tree restoration potential”. Science, 366(6463), eaay8108.',
    doi: '10.1126/science.aay8108',
    url: 'https://doi.org/10.1126/science.aay8108',
    peerReviewed: true,
  },
  {
    id: 'bastin2019reply2',
    citation: 'Bastin J.-F., Finegold Y., Garcia C., Mollicone D., Rezende M., Routh D., Zohner C. M., Crowther T. W. (2019). Response to Comment on “The global tree restoration potential”. Science, 366(6469), eaaz0493.',
    doi: '10.1126/science.aaz0493',
    url: 'https://doi.org/10.1126/science.aaz0493',
    peerReviewed: true,
  },
  {
    id: 'erratum2020',
    citation: 'Erratum for the Report “The global tree restoration potential” by J.-F. Bastin et al. and for the Technical Response “Response to Comments on ‘The global tree restoration potential’” (2020). Science, 368(6494), eabc8905.',
    doi: '10.1126/science.abc8905',
    url: 'https://doi.org/10.1126/science.abc8905',
    peerReviewed: true,
  },
];

// Values read in the publications, as printed there.
const bastinAreaHa = 0.9e9; // ha of extra canopy cover, bastin2019 abstract
const bastinGtC = 205; // GtC stored by that canopy, bastin2019 abstract
const bastinBurdenGtC = 300; // GtC, "global anthropogenic carbon burden", bastin2019 as quoted by friedlingstein2019
const fossil = 10.3; // GtC/yr in 2024, gcb2025 abstract
const landUse = 1.3; // GtC/yr in 2024, gcb2025 abstract
const emittedSince1850 = 745; // GtC, 1850–2024, gcb2025 § 3.4 and table 8
const inAirSince1850 = 290; // GtC, atmospheric increase 1850–2024, gcb2025 § 3.9.1 and table 8
const airborne = 0.45; // share of emissions that stays in the air, friedlingstein2019
const lewisSoilGtC = 113; // GtC of new soil carbon counted by Bastin et al., lewis2019
const soilLostGtC = 116; // GtC lost by soils since the start of farming, lewis2019
const lewisGtC = 100; // GtC, "overall, restoration over 900 Mha is ~100 GtC", lewis2019
const lewisRange = [89, 108]; // GtC, four published methods scaled to 900 Mha, lewis2019
const coldShare = 0.25; // share of the new tree cover in tundra and boreal regions, lewis2019
const veldmanSoilGtC = 107; // GtC after the soil correction, veldman2019 table 1
const veldmanGtC = 42; // GtC after the soil and biome corrections, veldman2019 table 1
const veldmanColdGtC = 17; // GtC, soil-corrected, in boreal, tundra and montane biomes, veldman2019 text and table 1
const grassShare = 0.46; // share of the soil-corrected estimate in grasslands, savannas, shrublands, veldman2019
const moTotalGtC = 226; // GtC, forest carbon deficit outside urban and farm land, mo2023 abstract
const moForestsGtC = 139; // GtC in existing forests, mo2023 abstract
const moClearedGtC = 87; // GtC where forests were removed or fragmented, mo2023 abstract

/** Yearly human CO2 emissions in 2024, fossil plus land use, in GtC. */
export const EMISSIONS = fossil + landUse;

/** How many years of 2024 emissions a stock of carbon matches, and its share of all emissions since 1850. */
export const offsetFor = (gtc: number) => ({ years: gtc / EMISSIONS, share: gtc / emittedSince1850 });

/** The four published estimates the slider can jump to, largest first. */
export const ESTIMATES = [
  { id: 'bastin', gtc: bastinGtC, year: 2019 },
  { id: 'lewis', gtc: lewisGtC, year: 2019 },
  { id: 'mo', gtc: moClearedGtC, year: 2023 },
  { id: 'veldman', gtc: veldmanGtC, year: 2019 },
] as const;

/** Slider range: carbon stored by new trees, in GtC. */
export const SLIDER = { min: 20, max: 230, step: 1, value: bastinGtC };

export const calcs: Calc[] = [
  {
    id: 'claim',
    steps: [
      step('Carbone stocké par les nouveaux arbres, selon Bastin et al. (a)', 'Carbon stored by the new trees, per Bastin et al. (a)', bastinGtC, 'GtC', { sourceIds: ['bastin2019'] }),
      step('« Fardeau » de carbone humain auquel ils le comparent (b)', 'Human carbon “burden” they compare it with (b)', bastinBurdenGtC, 'GtC', { sourceIds: ['bastin2019', 'friedlingstein2019'] }),
      step('Part qui en découle', 'Resulting share', (bastinGtC / bastinBurdenGtC) * 100, '%', { formula: 'a ÷ b', digits: 2 }),
      step('Hausse du carbone dans l’air, 1850 à 2024', 'Rise of carbon in the air, 1850 to 2024', inAirSince1850, 'GtC', { sourceIds: ['gcb2025'] }),
      step('Carbone émis par les humains, 1850 à 2024 (c)', 'Carbon emitted by humans, 1850 to 2024 (c)', emittedSince1850, 'GtC', { sourceIds: ['gcb2025'] }),
      step('Part des émissions', 'Share of emissions', (bastinGtC / emittedSince1850) * 100, '%', { formula: 'a ÷ c', digits: 2 }),
    ],
  },
  {
    id: 'corrections',
    steps: [
      step('Estimation de Bastin et al.', 'Estimate by Bastin et al.', bastinGtC, 'GtC', { sourceIds: ['bastin2019'] }),
      step('Dont carbone du sol compté comme nouveau', 'Of which soil carbon counted as new', lewisSoilGtC, 'GtC', { sourceIds: ['lewis2019'] }),
      step('Carbone perdu par les sols depuis les débuts de l’agriculture', 'Carbon lost by soils since farming began', soilLostGtC, 'GtC', { sourceIds: ['lewis2019'] }),
      step('Après correction du sol, selon Veldman et al.', 'After the soil correction, per Veldman et al.', veldmanSoilGtC, 'GtC', { sourceIds: ['veldman2019'] }),
      step('Dont régions froides et montagnes, sol corrigé', 'Of which cold regions and mountains, soil corrected', veldmanColdGtC, 'GtC', { sourceIds: ['veldman2019'] }),
      step('Après exclusion des régions froides et des prairies', 'After leaving out cold regions and grasslands', veldmanGtC, 'GtC', { sourceIds: ['veldman2019'] }),
      step('Estimation corrigée de Lewis et al.', 'Corrected estimate by Lewis et al.', lewisGtC, 'GtC', { sourceIds: ['lewis2019'] }),
    ],
  },
  {
    id: 'years',
    steps: [
      step('Émissions fossiles en 2024, par an (F)', 'Fossil emissions in 2024, per year (F)', fossil, 'GtC', { sourceIds: ['gcb2025'] }),
      step('Émissions dues à l’usage des terres en 2024, par an (L)', 'Land-use emissions in 2024, per year (L)', landUse, 'GtC', { sourceIds: ['gcb2025'] }),
      step('Émissions humaines en 2024, par an (E)', 'Human emissions in 2024, per year (E)', EMISSIONS, 'GtC', { formula: 'F + L' }),
      ...ESTIMATES.flatMap(({ id, gtc }) => {
        const who = { bastin: 'Bastin et al.', lewis: 'Lewis et al.', mo: 'Mo et al.', veldman: 'Veldman et al.' }[id];
        const src = { bastin: 'bastin2019', lewis: 'lewis2019', mo: 'mo2023', veldman: 'veldman2019' }[id];
        return [
          step(`Stock selon ${who} (S)`, `Stock per ${who} (S)`, gtc, 'GtC', { sourceIds: [src] }),
          step(`Années d’émissions, ${who}`, `Years of emissions, ${who}`, gtc / EMISSIONS, '', { formula: 'S ÷ E', digits: 2 }),
        ];
      }),
    ],
  },
];

const fmt = (n: number, locale: Locale, digits = 3) => formatNumberText(n, locale, digits);
const years = (gtc: number, locale: Locale) => fmt(gtc / EMISSIONS, locale, 2);

/** Every number the story prints, formatted for `locale`. Nothing is typed by hand in the MDX. */
export const figures = (locale: Locale) => ({
  bastinYear: 2019,
  bastinArea: fmt(bastinAreaHa / 1e9, locale, 1),
  bastin: bastinGtC,
  bastinYears: years(bastinGtC, locale),
  burden: bastinBurdenGtC,
  burdenShare: formatPercent(bastinGtC / bastinBurdenGtC, locale),
  inAir: inAirSince1850,
  emitted: emittedSince1850,
  emittedShare: formatPercent(bastinGtC / emittedSince1850, locale),
  airborne: formatPercent(airborne, locale),
  emissions: fmt(EMISSIONS, locale),
  fossil: fmt(fossil, locale),
  landUse: fmt(landUse, locale),
  emissionsYear: 2024,
  lewisSoil: lewisSoilGtC,
  soilLost: soilLostGtC,
  lewis: lewisGtC,
  lewisRange: `${lewisRange[0]} ${locale === 'fr' ? 'à' : 'to'} ${lewisRange[1]}`,
  lewisYears: years(lewisGtC, locale),
  coldShare: formatPercent(coldShare, locale),
  veldmanSoil: veldmanSoilGtC,
  veldman: veldmanGtC,
  veldmanCold: veldmanColdGtC,
  veldmanYears: years(veldmanGtC, locale),
  veldmanFactor: Math.round(bastinGtC / veldmanGtC),
  grassShare: formatPercent(grassShare, locale),
  moYear: 2023,
  erratumYear: 2020,
  moTotal: moTotalGtC,
  moForests: moForestsGtC,
  moCleared: moClearedGtC,
  moYears: years(moClearedGtC, locale),
  sliderMin: SLIDER.min,
  sliderMax: SLIDER.max,
});
