import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Only the story files: data.ts and Hero.astro live in the same folder but are not entries.
const topics = defineCollection({
  loader: glob({ pattern: '*/{fr,en}.mdx', base: './src/content/topics' }),
  schema: z.object({
    topic: z.string(),
    locale: z.enum(['fr', 'en']),
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'slug must be kebab-case'),
    question: z.string(),
    hook: z.string(),
    discipline: z.string(),
    date: z.coerce.date(),
    answer: z.string(),
  }),
});

export const collections = { topics };
