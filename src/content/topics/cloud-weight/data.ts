import { calcStep as step, type Source, type Calc } from '../../../lib/sources.ts';
import type { Locale } from '../../../lib/i18n.ts';
import { formatLargeCount, formatNumberText } from '../../../lib/format.ts';

// Ordered by first citation on the page: SourceRef numbers follow this order.
export const sources: Source[] = [
  {
    id: 'gerber2008',
    citation:
      'Gerber H. E., Frick G. M., Jensen J. B., Hudson J. G. (2008). Entrainment, mixing, and microphysics in trade-wind cumulus. Journal of the Meteorological Society of Japan, 86A, 87–106.',
    doi: '10.2151/jmsj.86a.87',
    url: 'https://doi.org/10.2151/jmsj.86a.87',
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
    id: 'tiesinga2021',
    citation:
      'Tiesinga E., Mohr P. J., Newell D. B., Taylor B. N. (2021). CODATA recommended values of the fundamental physical constants: 2018. Journal of Physical and Chemical Reference Data, 50(3), 033105.',
    doi: '10.1063/5.0064853',
    url: 'https://doi.org/10.1063/5.0064853',
    peerReviewed: true,
  },
  {
    id: 'lemmon2004',
    citation:
      'Lemmon E. W., Jacobsen R. T. (2004). Viscosity and thermal conductivity equations for nitrogen, oxygen, argon, and air. International Journal of Thermophysics, 25(1), 21–69.',
    doi: '10.1023/B:IJOT.0000022327.04529.f3',
    url: 'https://doi.org/10.1023/B:IJOT.0000022327.04529.f3',
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
    id: 'warner1955',
    citation: 'Warner J. (1955). The water content of cumuliform cloud. Tellus, 7(4), 449–457.',
    doi: '10.3402/tellusa.v7i4.8917',
    url: 'https://doi.org/10.3402/tellusa.v7i4.8917',
    peerReviewed: true,
  },
];

// Values read in the publications, as printed there.
// gerber2008: one RICO flight (RF12) over the Caribbean, 35 trade-wind cumuli, 7 at each of 5 levels.
const CLOUDS = 35;
const TRAVERSED = 200; // "> 200 Cu traversed on this flight", abstract
const WIDTH = 550; // m, average width of the 35 Cu, § 3
const LEVEL_HEIGHTS = [252, 439, 615, 918, 1074]; // m above cloud base, table 2 (za − zo)
const LWC_LEVELS = [0.284, 0.427, 0.52, 0.536, 0.331]; // g/m³, mean liquid water content, table 3
const RV_LEVELS = [9.2, 10.6, 10.2, 10.6, 11.9]; // µm, mean volume radius, table 3
const W_LEVELS = [1.18, 1.25, 1.92, 1.9]; // m/s, mean vertical velocity, levels 1–4, table 2 (level 5 sinks)
const W_MAX = 4.88; // m/s, largest of the maximum vertical velocities, table 2
const W_TOP = -0.283; // m/s, mean vertical velocity at level 5, near the tops, table 2
const P_MID = 885.4; // hPa, pressure at level 3, table 4
const THETA_MID = 300.5; // K, potential temperature in cloud at level 3, table 4
const QV_MID = 13.8; // g/kg, water vapour mixing ratio in cloud at level 3, table 4
const QV_ENV = 11; // g/kg, same in the air around the cloud at level 3, table 4
const RH_BELOW = 86; // %, relative humidity about 100 m below cloud base, § 5

const RHO_WATER = 998.803; // kg/m³, liquid water at 290 K and 0.1 MPa, wagner2002 table 13.2
const M_WATER = 18.015268; // g/mol, wagner2002, list of physical constants and § 6.1
const R = 8.314462618; // J/(mol·K), exact, tiesinga2021 table I (N_A × k)
const M_AIR = 28.9586; // g/mol, air as a pseudo-pure fluid, lemmon2004 table I
const G = 9.7803267715; // m/s², normal gravity at the equator, moritz2000 § 4
const WARNER_YEAR = 1955;
const WARNER_FT = 1500; // ft, clouds narrower than this are drier, warner1955 § 3 (e)
const FOOT = 0.3048; // m, the international foot

// Air viscosity, lemmon2004 eq. (1)–(3) with the air coefficients of tables I–III. Result in Pa·s.
const SIGMA = 0.36, EPS_K = 103.3, T_CRIT = 132.6312, RHO_CRIT = 10.4477; // nm, K, K, mol/dm³
const OMEGA_B = [0.431, -0.4623, 0.08406, 0.005341, -0.00331];
const RESIDUAL: [number, number, number, number][] = [
  [10.72, 0.2, 1, 0],
  [1.122, 0.05, 4, 0],
  [0.002019, 2.4, 9, 0],
  [-8.876, 0.6, 1, 1],
  [-0.02916, 3.6, 8, 1],
];
export const airViscosity = (T: number, molPerDm3 = 0): number => {
  const lnT = Math.log(T / EPS_K);
  const omega = Math.exp(OMEGA_B.reduce((sum, b, i) => sum + b * lnT ** i, 0));
  const dilute = (0.0266958 * Math.sqrt(M_AIR * T)) / (SIGMA ** 2 * omega);
  const [tau, delta] = [T_CRIT / T, molPerDm3 / RHO_CRIT];
  const residual = RESIDUAL.reduce((sum, [n, t, d, l]) => sum + n * tau ** t * delta ** d * (l ? Math.exp(-(delta ** l)) : 1), 0);
  return (dilute + residual) * 1e-6;
};

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

// Water.
const lwc = mean(LWC_LEVELS); // g/m³
const lwcMin = Math.min(...LWC_LEVELS);
const lwcMax = Math.max(...LWC_LEVELS);

/** Liquid water of a cube of cumulus of edge `edgeM` metres, in tonnes, at the mean measured content. */
export const waterTonnes = (edgeM: number, gPerM3 = lwc): number => (gPerM3 * edgeM ** 3) / 1e6;
/** Edge in metres of the cube of liquid water with the same mass. */
export const waterCubeEdge = (tonnes: number): number => Math.cbrt((tonnes * 1000) / RHO_WATER);

// Air, in the middle of the measured layer: temperature from the potential temperature (ideal diatomic gas, R/cp = 2/7).
const T_MID = THETA_MID * (P_MID / 1000) ** (2 / 7);
const rhoDry = (P_MID * 100 * M_AIR * 1e-3) / (R * T_MID);
const qv = QV_MID / 1000;
const rhoAir = (rhoDry * (1 + qv)) / (1 + (qv * M_AIR) / M_WATER); // moist air at the same pressure
/** Mass of the air in the same cube, in tonnes. */
export const airTonnes = (edgeM: number): number => (rhoAir * edgeM ** 3) / 1000;
const airPerWater = (rhoAir * 1000) / lwc;
const vapour = (rhoAir * 1000 * qv) / (1 + qv); // g/m³ of water vapour in the cloud's air
const vapourPerLiquid = vapour / lwc;

// Fall of a droplet: Stokes' law.
const radius = mean(RV_LEVELS) * 1e-6; // m
const eta = airViscosity(T_MID, rhoAir / (M_AIR * 1e-3) / 1000);
const fall = ((2 / 9) * (RHO_WATER - rhoAir) * G * radius ** 2) / eta; // m/s
const reynolds = (2 * radius * fall * rhoAir) / eta;
const hoursPerKm = 1000 / fall / 3600;
const [wMin, wMax] = [Math.min(...W_LEVELS), Math.max(...W_LEVELS)];

const REF = 1000; // m, edge of the reference cloud
const refTonnes = waterTonnes(REF);

/** Slider range: edge of the cloud, in metres. */
export const SLIDER = { min: 100, max: 3000, step: 50, value: REF, measured: WIDTH };
/** For the drawings. */
export const PROFILE = LEVEL_HEIGHTS.map((h, i) => ({ h, lwc: LWC_LEVELS[i] }));
export const SPEEDS = { fall, wMin, wMax };
export const AIR_PER_WATER = airPerWater;
/** Edge in metres below which Warner's clouds are drier. */
export const WARNER_M = WARNER_FT * FOOT;
export const LWC_MEAN = lwc;
/** The water cube's edge as a share of the cloud's edge: the same for every size. */
export const CUBE_SHARE = waterCubeEdge(waterTonnes(1));

export const calcs: Calc[] = [
  {
    id: 'lwc',
    steps: [
      ...LWC_LEVELS.map((v, i) =>
        step(`Eau liquide à ${LEVEL_HEIGHTS[i].toLocaleString('fr')} m au-dessus de la base, q${'₁₂₃₄₅'[i]}`, `Liquid water ${LEVEL_HEIGHTS[i].toLocaleString('en')} m above the base, q${'₁₂₃₄₅'[i]}`, v, 'g/m³', { sourceIds: ['gerber2008'] }),
      ),
      step('Moyenne des cinq niveaux, q', 'Mean of the five levels, q', lwc, 'g/m³', { formula: 'q = (q₁ + q₂ + q₃ + q₄ + q₅) / 5', digits: 2 }),
    ],
  },
  {
    id: 'mass',
    steps: [
      step('Eau liquide par mètre cube, q', 'Liquid water per cubic metre, q', lwc, 'g/m³', { sourceIds: ['gerber2008'], formula: 'q = (q₁ + … + q₅) / 5', digits: 2 }),
      step('Côté du nuage de référence, a', 'Edge of the reference cloud, a', REF, 'm', { formula: 'a = 1 km' }),
      step('Volume du nuage, V', 'Volume of the cloud, V', REF ** 3, 'm³', { formula: 'V = a³' }),
      step('Eau du nuage', 'Water in the cloud', refTonnes, 't', { formula: 'q × V / 10⁶', digits: 2 }),
      step('Eau du nuage, avec le niveau le plus sec', 'Water in the cloud, at the driest level', waterTonnes(REF, lwcMin), 't', { sourceIds: ['gerber2008'], formula: 'q₁ × V / 10⁶', digits: 2 }),
      step('Eau du nuage, avec le niveau le plus humide', 'Water in the cloud, at the wettest level', waterTonnes(REF, lwcMax), 't', { sourceIds: ['gerber2008'], formula: 'q₄ × V / 10⁶', digits: 2 }),
      step('Masse volumique de l’eau liquide à 290 K, ρₗ', 'Density of liquid water at 290 K, ρₗ', RHO_WATER, 'kg/m³', { sourceIds: ['wagner2002'], digits: 6 }),
      step('Côté du cube d’eau de même masse', 'Edge of the cube of water with the same mass', waterCubeEdge(refTonnes), 'm', { formula: '∛(q × V / 1000 / ρₗ)', digits: 2 }),
      step('Côté du nuage par rapport au côté du cube d’eau', 'Edge of the cloud compared with the edge of the water cube', 1 / CUBE_SHARE, '×', { formula: '∛(1000 × ρₗ / q)', digits: 2 }),
    ],
  },
  {
    id: 'air',
    steps: [
      step('Pression au milieu de la couche mesurée, p', 'Pressure in the middle of the measured layer, p', P_MID, 'hPa', { sourceIds: ['gerber2008'], digits: 4 }),
      step('Température potentielle dans le nuage, θ', 'Potential temperature in the cloud, θ', THETA_MID, 'K', { sourceIds: ['gerber2008'], digits: 4 }),
      step('Température, T', 'Temperature, T', T_MID, 'K', { formula: 'T = θ × (p / 1000 hPa)^(2/7)', digits: 4 }),
      step('Masse molaire de l’air sec, M', 'Molar mass of dry air, M', M_AIR, 'g/mol', { sourceIds: ['lemmon2004'], digits: 6 }),
      step('Constante des gaz parfaits, R', 'Molar gas constant, R', R, 'J/(mol·K)', { sourceIds: ['tiesinga2021'], digits: 10 }),
      step('Air sec, ρ', 'Dry air, ρ', rhoDry, 'kg/m³', { formula: 'ρ = p × M / (R × T)' }),
      step('Vapeur d’eau dans le nuage, r', 'Water vapour in the cloud, r', QV_MID, 'g/kg', { sourceIds: ['gerber2008'] }),
      step('Masse molaire de l’eau, Mᵥ', 'Molar mass of water, Mᵥ', M_WATER, 'g/mol', { sourceIds: ['wagner2002'], digits: 8 }),
      step('Air humide du nuage, ρₐ', 'Moist air of the cloud, ρₐ', rhoAir, 'kg/m³', { formula: 'ρₐ = ρ × (1 + r) / (1 + r × M / Mᵥ)' }),
      step('Air dans le nuage de référence', 'Air in the reference cloud', airTonnes(REF), 't', { formula: 'ρₐ × V / 1000', digits: 2 }),
      step('Air par rapport à l’eau liquide', 'Air compared with liquid water', airPerWater, '×', { formula: '1000 × ρₐ / q', digits: 2 }),
      step('Vapeur d’eau par mètre cube, qᵥ', 'Water vapour per cubic metre, qᵥ', vapour, 'g/m³', { formula: 'qᵥ = 1000 × ρₐ × r / (1 + r)' }),
      step('Vapeur par rapport à l’eau liquide', 'Vapour compared with liquid water', vapourPerLiquid, '×', { formula: 'qᵥ / q', digits: 2 }),
    ],
  },
  {
    id: 'fall',
    steps: [
      step('Rayon moyen des gouttelettes, moyenne des cinq niveaux, r', 'Mean radius of the droplets, mean of the five levels, r', radius * 1e6, 'µm', { sourceIds: ['gerber2008'] }),
      step('Masse volumique de l’eau liquide, ρₗ', 'Density of liquid water, ρₗ', RHO_WATER, 'kg/m³', { sourceIds: ['wagner2002'], digits: 6 }),
      step('Masse volumique de l’air du nuage, ρₐ', 'Density of the cloud’s air, ρₐ', rhoAir, 'kg/m³', { formula: 'ρₐ = ρ × (1 + r) / (1 + r × M / Mᵥ)' }),
      step('Pesanteur à l’équateur, g', 'Gravity at the equator, g', G, 'm/s²', { sourceIds: ['moritz2000'], digits: 5 }),
      step('Viscosité de l’air à 290 K, η', 'Viscosity of air at 290 K, η', eta, 'Pa·s', { sourceIds: ['lemmon2004'] }),
      step('Vitesse de chute, v', 'Fall speed, v', fall * 100, 'cm/s', { formula: 'v = 2/9 × (ρₗ − ρₐ) × g × r² / η', digits: 2 }),
      step('Nombre de Reynolds de la gouttelette', 'Reynolds number of the droplet', reynolds, '', { formula: 'Re = 2 × r × v × ρₐ / η ≪ 1', digits: 2 }),
      step('Temps pour tomber d’un kilomètre', 'Time to fall one kilometre', hoursPerKm, 'h', { formula: '1000 m / v', digits: 2 }),
      step('Vitesse moyenne de l’air dans les tours, niveau ascendant le plus lent, w₁', 'Mean air speed in the turrets, slowest rising level, w₁', wMin, 'm/s', { sourceIds: ['gerber2008'] }),
      step('Vitesse moyenne de l’air dans les tours, niveau ascendant le plus rapide, w₃', 'Mean air speed in the turrets, fastest rising level, w₃', wMax, 'm/s', { sourceIds: ['gerber2008'] }),
      step('Vitesse moyenne de l’air près du sommet des plus hautes tours, w₅', 'Mean air speed near the top of the tallest turrets, w₅', W_TOP, 'm/s', { sourceIds: ['gerber2008'] }),
      step('Air qui monte par rapport à la chute, niveau ascendant le plus lent', 'Rising air compared with the fall, slowest rising level', wMin / fall, '×', { formula: 'w₁ / v', digits: 2 }),
      step('Air qui monte par rapport à la chute, niveau ascendant le plus rapide', 'Rising air compared with the fall, fastest rising level', wMax / fall, '×', { formula: 'w₃ / v', digits: 2 }),
    ],
  },
];

const n2 = (n: number, locale: Locale) => formatNumberText(n, locale, 2);
const n3 = (n: number, locale: Locale) => formatNumberText(n, locale, 3);
/** Liquid water as Gerber et al. print it, three decimals: 0.520, not 0.52. */
export const gramsText = (g: number, locale: Locale) => g.toLocaleString(locale, { minimumFractionDigits: 3, maximumFractionDigits: 3 });

/** A mass in tonnes, with its unit: "0,42 tonne", "420 tonnes", "1,1 million de tonnes" (fr) or "1.1 million tonnes" (en). */
export const tonnesText = (t: number, locale: Locale): string => {
  if (t >= 1e6) return `${formatLargeCount(t, locale)} ${locale === 'fr' ? 'de tonnes' : 'tonnes'}`;
  const shown = Number(t.toPrecision(2));
  const many = locale === 'fr' ? shown >= 2 : shown !== 1;
  return `${n2(t, locale)} ${many ? 'tonnes' : 'tonne'}`;
};

/** Every number the story prints, formatted for `locale`. Nothing is typed by hand in the MDX. */
export const figures = (locale: Locale) => ({
  clouds: CLOUDS,
  traversed: TRAVERSED,
  width: WIDTH,
  levelLow: LEVEL_HEIGHTS[0].toLocaleString(locale),
  levelHigh: LEVEL_HEIGHTS[LEVEL_HEIGHTS.length - 1].toLocaleString(locale),
  levelMid: LEVEL_HEIGHTS[2].toLocaleString(locale),
  lwc: n2(lwc, locale),
  lwcMin: gramsText(lwcMin, locale),
  lwcMax: gramsText(lwcMax, locale),
  refKm: REF / 1000,
  refVolume: formatLargeCount(REF ** 3, locale),
  massRef: n2(refTonnes, locale),
  massMin: n2(waterTonnes(REF, lwcMin), locale),
  massMax: n2(waterTonnes(REF, lwcMax), locale),
  massMeasured: n2(waterTonnes(WIDTH), locale),
  cubeEdge: n2(waterCubeEdge(refTonnes), locale),
  cubeShare: n2(1 / CUBE_SHARE, locale),
  airRef: tonnesText(airTonnes(REF), locale),
  airDensity: n3(rhoAir, locale),
  airPerWater: n2(airPerWater, locale),
  vapourPerLiquid: n2(vapourPerLiquid, locale),
  qvCloud: n3(QV_MID, locale),
  qvEnv: n3(QV_ENV, locale),
  radius: n3(radius * 1e6, locale),
  fallCm: n2(fall * 100, locale),
  hoursPerKm: n2(hoursPerKm, locale),
  wMin: n3(wMin, locale),
  wMax: n3(wMax, locale),
  wPeak: n2(W_MAX, locale),
  wTop: n2(-W_TOP, locale),
  fasterMin: n2(wMin / fall, locale),
  fasterMax: n2(wMax / fall, locale),
  rhBelow: RH_BELOW,
  warnerYear: WARNER_YEAR,
  warnerM: n2(WARNER_M, locale),
});
