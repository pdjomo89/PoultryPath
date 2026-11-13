import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { loadTestimonialFiles, parseTestimonialFile } from './testimonialParse';

const file = (body: string) => `---\nname: Amina T.\nrole: Poultry farmer, Bafoussam\nroleFr: Éleveuse de volailles, Bafoussam\n---\n\n${body}`;

describe('testimonial files', () => {
  it('reads the name, role and quote, and splits English from French', () => {
    const t = parseTestimonialFile('/content/testimonials/2026-03-04-amina.md', file('Great help.\n\nThank you.\n\n=== fr ===\n\nMerci.'));
    expect(t).toMatchObject({
      id: 'amina',
      name: 'Amina T.',
      roleEn: 'Poultry farmer, Bafoussam',
      roleFr: 'Éleveuse de volailles, Bafoussam',
      quoteEn: 'Great help.\n\nThank you.',
      quoteFr: 'Merci.',
      addedAt: Date.parse('2026-03-04T12:00:00Z'),
    });
  });

  it('role and French are optional', () => {
    expect(parseTestimonialFile('/content/testimonials/2026-03-04-x.md', '---\nname: X\n---\nGood.')).toMatchObject({ roleEn: '', roleFr: '', quoteFr: '' });
  });

  it('skips drafts and explains broken files', () => {
    expect(parseTestimonialFile('/content/testimonials/2026-03-04-x.md', '---\nname: X\ndraft: true\n---\nText')).toBe('');
    expect(parseTestimonialFile('/content/testimonials/amina.md', file('Text'))).toMatch(/file name/);
    expect(parseTestimonialFile('/content/testimonials/2026-03-04-x.md', 'No header')).toMatch(/header/);
    expect(parseTestimonialFile('/content/testimonials/2026-03-04-x.md', '---\nrole: X\n---\nText')).toMatch(/name/);
    expect(parseTestimonialFile('/content/testimonials/2026-03-04-x.md', file(''))).toMatch(/no text/);
    expect(parseTestimonialFile('/content/testimonials/2026-02-30-x.md', file('Text'))).toMatch(/not a real date/);
  });

  it('sorts newest first and rejects duplicate names', () => {
    const { testimonials, errors } = loadTestimonialFiles({
      '/content/testimonials/2026-01-01-a.md': file('A'),
      '/content/testimonials/2026-05-01-b.md': file('B'),
      '/content/testimonials/2026-06-01-a.md': file('C'),
    });
    expect(testimonials.map((t) => t.id)).toEqual(['b', 'a']);
    expect(errors).toEqual([expect.stringMatching(/already uses the name "a"/)]);
  });

  it('every testimonial in content/testimonials can be published', () => {
    const files = Object.fromEntries(
      readdirSync('content/testimonials')
        .filter((n) => n.endsWith('.md') && n !== 'README.md')
        .map((n) => [`/content/testimonials/${n}`, readFileSync(`content/testimonials/${n}`, 'utf8')]),
    );
    expect(loadTestimonialFiles(files).errors).toEqual([]);
  });
});
