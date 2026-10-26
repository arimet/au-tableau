import type { Locale } from './i18n.ts';

/** The build time, or the far future with SHOW_FUTURE set, to preview scheduled topics locally. */
export const buildNow = (env: Record<string, string | undefined> = process.env): Date =>
  env.SHOW_FUTURE ? new Date(8.64e15) : new Date();

/**
 * Topics of one locale whose date has passed, newest first.
 * `now` is the build time: a topic dated in the future only appears after a rebuild.
 */
export const publishedTopics = <T extends { data: { locale: Locale; date: Date } }>(
  entries: T[],
  locale: Locale,
  now: Date,
): T[] =>
  entries
    .filter((e) => e.data.locale === locale && e.data.date <= now)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

/** The same topic in the other language. A missing translation fails the build, naming the topic. */
export const alternateOf = <T extends { data: { topic: string; locale: Locale } }>(entries: T[], entry: T): T => {
  const other: Locale = entry.data.locale === 'fr' ? 'en' : 'fr';
  const found = entries.find((e) => e.data.topic === entry.data.topic && e.data.locale === other);
  if (!found) throw new Error(`Topic "${entry.data.topic}" has no "${other}" version`);
  return found;
};
