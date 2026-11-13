/**
 * Parser for testimonials written as files in content/testimonials/ (see the
 * README there). Kept free of Vite-only APIs so vite.config.ts can use it to
 * check the files during the build.
 */

export interface Testimonial {
  id: string;
  name: string;
  /** Who they are, e.g. "Poultry farmer, Bafoussam". Optional. */
  roleEn: string;
  roleFr: string;
  quoteEn: string;
  /** Empty when there is no French version. */
  quoteFr: string;
  /** From the file name; newest is shown first. */
  addedAt: number;
}

const FILE_NAME = /\/(\d{4}-\d{2}-\d{2})-([a-z0-9-]+)\.md$/;
const FRENCH_SEPARATOR = /^\s*===\s*fr\s*===\s*$/im;

/** Parses one testimonial file; returns an error message instead if it's invalid ('' for drafts). */
export function parseTestimonialFile(path: string, raw: string): Testimonial | string {
  const name = FILE_NAME.exec(path);
  if (!name) return `${path}: file name must look like 2026-11-12-amina.md (date, then lowercase words joined by dashes)`;
  const [, date, slug] = name;

  const text = raw.replace(/^﻿/, '').replace(/\r\n/g, '\n');
  const header = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (!header) return `${path}: must start with a --- header --- block containing at least "name:"`;

  const fields: Record<string, string> = {};
  for (const line of header[1].split('\n')) {
    const m = /^(\w+):\s*(.*)$/.exec(line.trim());
    if (m) fields[m[1]] = m[2].trim();
  }
  if (/^(true|yes)$/i.test(fields.draft ?? '')) return '';
  if (!fields.name) return `${path}: the header needs a "name:" line`;

  const [quoteEn, quoteFr = ''] = text.slice(header[0].length).split(FRENCH_SEPARATOR);
  if (!quoteEn.trim()) return `${path}: the testimonial has no text below the header`;

  const addedAt = Date.parse(`${date}T12:00:00Z`);
  if (Number.isNaN(addedAt) || new Date(addedAt).toISOString().slice(0, 10) !== date) return `${path}: ${date} is not a real date`;

  return {
    id: slug,
    name: fields.name,
    roleEn: fields.role ?? '',
    roleFr: fields.roleFr ?? '',
    quoteEn: quoteEn.trim(),
    quoteFr: quoteFr.trim(),
    addedAt,
  };
}

/** Parses every file; returns the valid testimonials (newest first) and any problems. */
export function loadTestimonialFiles(files: Record<string, string>) {
  const testimonials: Testimonial[] = [];
  const errors: string[] = [];
  for (const [path, raw] of Object.entries(files)) {
    const result = parseTestimonialFile(path, raw);
    if (typeof result === 'string') {
      if (result) errors.push(result);
    } else if (testimonials.some((t) => t.id === result.id)) {
      errors.push(`${path}: another testimonial already uses the name "${result.id}"`);
    } else {
      testimonials.push(result);
    }
  }
  testimonials.sort((a, b) => b.addedAt - a.addedAt || a.id.localeCompare(b.id));
  return { testimonials, errors };
}
