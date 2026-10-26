import type { Locale } from './i18n.ts';

export type Source = { id: string; citation: string; doi?: string; url: string; peerReviewed: true };

// A step is either an input taken from sources, or a result derived by a formula.
export type CalcStep = {
  label: Record<Locale, string>;
  value: number;
  unit: string;
  sourceIds?: string[];
  formula?: string;
  /** Significant digits shown; 3 when absent. Sourced inputs use the precision printed in the source. */
  digits?: number;
};

export type Calc = { id: string; steps: CalcStep[] };

/** A calc step from its French and English labels. */
export const calcStep = (fr: string, en: string, value: number, unit: string, how: Pick<CalcStep, 'sourceIds' | 'formula' | 'digits'>): CalcStep => ({
  label: { fr, en },
  value,
  unit,
  ...how,
});

/** Every number shown must cite a known source or come from a formula. Empty result means all is well. */
export const checkSources = (sources: Source[], calcs: Calc[]): string[] => {
  const errors: string[] = [];
  const known = new Set<string>();
  for (const source of sources) {
    if (known.has(source.id)) errors.push(`duplicate source id "${source.id}"`);
    known.add(source.id);
  }
  for (const calc of calcs)
    for (const step of calc.steps) {
      const where = `calc "${calc.id}", step "${step.label.en}"`;
      for (const id of step.sourceIds ?? [])
        if (!known.has(id)) errors.push(`${where}: unknown source "${id}"`);
      if (!step.sourceIds?.length && !step.formula) errors.push(`${where}: no source and no formula`);
    }
  return errors;
};
