import { readdirSync, readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { loadNewsFiles } from './src/lib/newsParse';

/** Fails the production build if any file in content/news/ can't be published. */
function checkNewsFiles(): Plugin {
  return {
    name: 'check-news-files',
    apply: 'build',
    buildStart() {
      const dir = 'content/news';
      const files: Record<string, string> = {};
      for (const name of readdirSync(dir)) {
        if (name.endsWith('.md') && name !== 'README.md') files[`/${dir}/${name}`] = readFileSync(`${dir}/${name}`, 'utf8');
      }
      const { errors } = loadNewsFiles(files);
      if (errors.length) this.error(`Fix these news articles before deploying:\n  - ${errors.join('\n  - ')}`);
    },
  };
}

export default defineConfig({
  plugins: [react(), checkNewsFiles()],
  server: { host: true },
  test: {
    // Convex function tests run in the same edge runtime Convex uses.
    environmentMatchGlobs: [['convex/**', 'edge-runtime']],
    server: { deps: { inline: ['convex-test'] } },
  },
});
