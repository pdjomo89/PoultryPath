import type { NewsArticle } from '../../convex/news';

/**
 * Parser for news articles written as files in content/news/ (see the README
 * there). Kept free of Vite-only APIs so vite.config.ts can use it to check
 * the files during the build.
 */

const FILE_NAME = /\/(\d{4}-\d{2}-\d{2})-([a-z0-9-]+)\.md$/;
const FRENCH_SEPARATOR = /^\s*===\s*fr\s*===\s*$/im;

/** Parses one article file; returns an error message instead if it's invalid. */
export function parseNewsFile(path: string, raw: string): NewsArticle | string {
  const name = FILE_NAME.exec(path);
  if (!name) return `${path}: file name must look like 2026-11-12-my-article.md (date, then lowercase words joined by dashes)`;
  const [, date, slug] = name;

  const text = raw.replace(/^﻿/, '').replace(/\r\n/g, '\n');
  const header = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (!header) return `${path}: must start with a --- header --- block containing at least "title:"`;

  const fields: Record<string, string> = {};
  for (const line of header[1].split('\n')) {
    const m = /^(\w+):\s*(.*)$/.exec(line.trim());
    if (m) fields[m[1]] = m[2].trim();
  }
  if (/^(true|yes)$/i.test(fields.draft ?? '')) return '';
  if (!fields.title) return `${path}: the header needs a "title:" line`;

  const [bodyEn, bodyFr = ''] = text.slice(header[0].length).split(FRENCH_SEPARATOR);
  if (!bodyEn.trim()) return `${path}: the article has no text below the header`;

  const publishedAt = Date.parse(`${date}T12:00:00Z`);
  if (Number.isNaN(publishedAt) || new Date(publishedAt).toISOString().slice(0, 10) !== date) return `${path}: ${date} is not a real date`;

  return {
    id: slug,
    titleEn: fields.title,
    titleFr: fields.titleFr ?? '',
    summaryEn: fields.summary || excerpt(bodyEn),
    summaryFr: fields.summaryFr || (bodyFr.trim() ? excerpt(bodyFr) : ''),
    bodyEn: bodyEn.trim(),
    bodyFr: bodyFr.trim(),
    publishedAt,
  };
}

function excerpt(body: string) {
  const first = body.trim().split(/\n\s*\n/)[0] ?? '';
  return first.length > 220 ? `${first.slice(0, 217).trimEnd()}…` : first;
}

/** Parses every file; returns the valid articles (newest first) and any problems. */
export function loadNewsFiles(files: Record<string, string>) {
  const articles: NewsArticle[] = [];
  const errors: string[] = [];
  for (const [path, raw] of Object.entries(files)) {
    const result = parseNewsFile(path, raw);
    if (typeof result === 'string') {
      if (result) errors.push(result);
    } else if (articles.some((a) => a.id === result.id)) {
      errors.push(`${path}: another article already uses the name "${result.id}"`);
    } else {
      articles.push(result);
    }
  }
  articles.sort((a, b) => b.publishedAt - a.publishedAt || a.id.localeCompare(b.id));
  return { articles, errors };
}
