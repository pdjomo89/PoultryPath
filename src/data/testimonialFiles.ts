import { loadTestimonialFiles } from '../lib/testimonialParse';

/**
 * Testimonials written as files in content/testimonials/. They are bundled
 * into the site at build time, so every deploy publishes whatever is in that
 * folder. See content/testimonials/README.md.
 */
const loaded = loadTestimonialFiles(
  import.meta.glob(['/content/testimonials/*.md', '!/content/testimonials/README.md'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>,
);
for (const e of loaded.errors) console.warn(`[testimonials] skipped ${e}`);

export const testimonials = loaded.testimonials;
