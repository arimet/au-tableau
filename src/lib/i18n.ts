export type Locale = 'fr' | 'en';

export const locales: Locale[] = ['fr', 'en'];

/** French lives at the root, English under /en. `path` starts with "/". */
export const localePath = (locale: Locale, path: string): string =>
  locale === 'fr' ? path : `/en${path}`;

const fr = {
  replay: 'Rejouer',
  showCalc: 'Voir le calcul',
  sources: 'Sources',
  previousQuestions: 'Questions précédentes',
  readAnswer: 'Lire la réponse',
  shortAnswer: 'La réponse en bref',
  switchTo: 'English',
} as const;

export type UiKey = keyof typeof fr;

const en: Record<UiKey, string> = {
  replay: 'Replay',
  showCalc: 'Show the Calculation',
  sources: 'Sources',
  previousQuestions: 'Previous Questions',
  readAnswer: 'Read the answer',
  shortAnswer: 'The Short Answer',
  switchTo: 'Français',
};

export const ui: Record<Locale, Record<UiKey, string>> = { fr, en };
