import type { Source, Calc } from './sources';

// One folder per topic: fr.mdx, en.mdx, data.ts (sources, calcs) and Hero.astro.
// The folder name is the topic key. Vite-only (import.meta.glob), so kept out of topics.ts, which tests import directly.
const dataModules = import.meta.glob<{ sources: Source[]; calcs: Calc[] }>('../content/topics/*/data.ts', { eager: true });
const heroModules = import.meta.glob<{ default: (props: { locale: 'fr' | 'en' }) => unknown }>('../content/topics/*/Hero.astro', { eager: true });

const find = <M>(modules: Record<string, M>, topic: string, file: string): M => {
  const module = modules[`../content/topics/${topic}/${file}`];
  if (!module) throw new Error(`Topic "${topic}" is missing ${file}`);
  return module;
};

export const topicData = (topic: string) => find(dataModules, topic, 'data.ts');
export const topicHero = (topic: string) => find(heroModules, topic, 'Hero.astro').default;
