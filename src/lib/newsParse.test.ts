import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { loadNewsFiles, parseNewsFile } from './newsParse';

const file = (body: string) => `---\ntitle: Hello: world\ntitleFr: Bonjour\n---\n\n${body}`;

describe('news files', () => {
  it('reads the date and name from the file name, and splits English from French', () => {
    const a = parseNewsFile('/content/news/2026-03-04-spring-tips.md', file('First.\n\nSecond.\n\n=== fr ===\n\nPremier.'));
    expect(a).toMatchObject({
      id: 'spring-tips',
      titleEn: 'Hello: world',
      titleFr: 'Bonjour',
      summaryEn: 'First.',
      summaryFr: 'Premier.',
      bodyEn: 'First.\n\nSecond.',
      bodyFr: 'Premier.',
      publishedAt: Date.parse('2026-03-04T12:00:00Z'),
    });
  });

  it('skips drafts and explains broken files', () => {
    expect(parseNewsFile('/content/news/2026-03-04-x.md', '---\ntitle: X\ndraft: true\n---\nText')).toBe('');
    expect(parseNewsFile('/content/news/spring.md', file('Text'))).toMatch(/file name/);
    expect(parseNewsFile('/content/news/2026-03-04-x.md', 'No header')).toMatch(/header/);
    expect(parseNewsFile('/content/news/2026-03-04-x.md', '---\ntitleFr: X\n---\nText')).toMatch(/title/);
    expect(parseNewsFile('/content/news/2026-03-04-x.md', file(''))).toMatch(/no text/);
    expect(parseNewsFile('/content/news/2026-02-30-x.md', file('Text'))).toMatch(/not a real date/);
  });

  it('sorts newest first and rejects duplicate names', () => {
    const { articles, errors } = loadNewsFiles({
      '/content/news/2026-01-01-old.md': file('A'),
      '/content/news/2026-05-01-new.md': file('B'),
      '/content/news/2026-06-01-old.md': file('C'),
    });
    expect(articles.map((a) => a.publishedAt)).toEqual([Date.parse('2026-05-01T12:00:00Z'), Date.parse('2026-01-01T12:00:00Z')]);
    expect(errors).toEqual([expect.stringMatching(/already uses the name "old"/)]);
  });

  it('every article in content/news can be published', () => {
    const files = Object.fromEntries(
      readdirSync('content/news')
        .filter((n) => n.endsWith('.md') && n !== 'README.md')
        .map((n) => [`/content/news/${n}`, readFileSync(`content/news/${n}`, 'utf8')]),
    );
    expect(loadNewsFiles(files).errors).toEqual([]);
  });
});
