import { loadNewsFiles } from '../lib/newsParse';

/**
 * News articles written as files in content/news/. They are bundled into the
 * site at build time, so every Vercel deploy publishes whatever is in that
 * folder — no admin login or database needed. See content/news/README.md.
 */
const loaded = loadNewsFiles(
  import.meta.glob(['/content/news/*.md', '!/content/news/README.md'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>,
);
for (const e of loaded.errors) console.warn(`[news] skipped ${e}`);

export const fileArticles = loaded.articles;
