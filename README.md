# Au tableau!

Science popularisation on a chalkboard: short answers to surprising questions, with the calculation shown step by step. Diagrams draw themselves, every number is sourced, and every page exists in French and English.

Live site: https://arimet.github.io/au-tableau/

## Stack

[Astro](https://astro.build) with MDX, no client framework. The only scripts are the chalk drawing animation and the slider. Without JavaScript, or with reduced motion, every drawing is shown complete.

## Run it

```sh
npm install
npm run dev      # http://localhost:4321
npm test         # unit tests, plus the source check of each topic that has its own test file
npm run build    # static site in dist/
```

For a build served under a sub-path, as on GitHub Pages:

```sh
export BASE_PATH=/au-tableau/   # preview needs it too, or every page is a 404
npm run build
npx astro preview
```

`SITE_URL` sets the origin used for canonical and Open Graph URLs. Both variables are set by `.github/workflows/deploy.yml`.

## Add a topic

A topic is one folder in `src/content/topics/`. The folder name is the topic key and links the two languages together. The existing `rockets-equator` folder is a complete example.

1. **Create the folder** `src/content/topics/<topic>/`.
2. **Write the story twice**, in `fr.mdx` and `en.mdx`. The frontmatter is validated by `src/content.config.ts`:
   `topic` (the folder name), `locale` (`fr` or `en`), `slug` (kebab-case, used in the URL), `question`, `hook`, `discipline`, `date` and `answer` (the short answer). A topic dated in the future is published by the first build after that date; the deploy workflow rebuilds the site every Monday at 06:00 UTC, so date topics on Mondays. To preview scheduled topics locally, run `SHOW_FUTURE=1 npm run dev`. A topic without both languages fails the build.
3. **Add `data.ts`** with the facts behind the story:
   - `sources: Source[]`, peer-reviewed only (`peerReviewed: true`, with the required `url` and, when there is one, the `doi`), ordered by first citation on the page;
   - `calcs: Calc[]`, the calculations. Each step is either taken from a source (`sourceIds`) or derived (`formula`), never neither;
   - the model functions that compute the numbers, so the text and the figures read from one place.
4. **Add `Hero.astro`**, the opening drawing, with a single prop `{ locale }`. Build it with `Scene` and `Annotation` from `src/components/chalk/` and the sketch helpers in `src/lib/chalk.ts`. The story itself is assembled from `Step`, `ShowCalc`, `Magnitude`, `Slider`, `Aside` and `SourceRef` in `src/components/`.
5. **Check it.** Copy `tests/rockets-equator.test.mjs` for the topic and keep its `checkSources(sources, calcs)` assertion: it fails on an unknown source, a duplicate id or a number with no source and no formula. Then run `npm test` and `npm run build`, and look at both language versions in the browser.

## Layout

```
src/content/topics/<topic>/   fr.mdx, en.mdx, data.ts, Hero.astro
src/components/               narrative building blocks and chalk scenes
src/lib/                      i18n, number formatting, chalk geometry, source checks
src/styles/chalkboard.css     theme tokens and drawing animation rules
tests/                        node:test suites
```

## License

MIT, see [LICENSE](LICENSE).
