import { readdirSync, readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { loadNewsFiles } from './src/lib/newsParse';
import { loadTestimonialFiles } from './src/lib/testimonialParse';

function readContent(dir: string) {
  const files: Record<string, string> = {};
  for (const name of readdirSync(dir)) {
    if (name.endsWith('.md') && name !== 'README.md') files[`/${dir}/${name}`] = readFileSync(`${dir}/${name}`, 'utf8');
  }
  return files;
}

/** Fails the production build if any file in content/news/ or content/testimonials/ can't be published. */
function checkContentFiles(): Plugin {
  return {
    name: 'check-content-files',
    apply: 'build',
    buildStart() {
      const news = loadNewsFiles(readContent('content/news')).errors;
      if (news.length) this.error(`Fix these news articles before deploying:\n  - ${news.join('\n  - ')}`);
      const testimonials = loadTestimonialFiles(readContent('content/testimonials')).errors;
      if (testimonials.length) this.error(`Fix these testimonials before deploying:\n  - ${testimonials.join('\n  - ')}`);
    },
  };
}

export default defineConfig({
  plugins: [react(), checkContentFiles()],
  server: { host: true },
  test: {
    // Convex function tests run in the same edge runtime Convex uses.
    environmentMatchGlobs: [['convex/**', 'edge-runtime']],
    server: { deps: { inline: ['convex-test'] } },
  },
});
