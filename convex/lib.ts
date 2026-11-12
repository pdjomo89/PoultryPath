import { ConvexError, v } from 'convex/values';
import type { MutationCtx } from './_generated/server';
import type { Doc } from './_generated/dataModel';

export type SubmissionType = Doc<'submissions'>['type'];

/** Allowed statuses per submission type; the first is the initial status. */
export const STATUSES: Record<SubmissionType, readonly string[]> = {
  consultation: ['new', 'handled'],
  application: ['new', 'handled'],
  enrolment: ['new', 'handled'],
  // Employer job posts are moderated before they appear on the public board.
  job: ['pending', 'approved', 'rejected'],
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Visitor's language, sent by the website with each form. */
export const langArg = v.optional(v.union(v.literal('en'), v.literal('fr')));
export type Lang = 'en' | 'fr';

/** Validation messages shown to visitors, in each site language. */
export const MESSAGES = {
  en: {
    required: (label: string) => `${label} is required.`,
    tooLong: (max: number) => `Please keep this under ${max} characters.`,
    email: 'That email doesn’t look right.',
    phoneOrEmail: 'Please give us a phone number or email.',
    checkFields: 'Please check the highlighted fields.',
    tooManyRequirements: 'Please list at most 20 requirements.',
    requirementTooLong: 'Please keep each requirement under 300 characters.',
    busy: 'We’re receiving a lot of requests right now — please try again in a few minutes.',
    labels: {
      name: 'Name', phone: 'Phone', service: 'Service', jobId: 'Job', jobTitle: 'Job title', courseId: 'Course',
      courseTitle: 'Course title', title: 'Job title', farm: 'Farm', location: 'Location', description: 'Description', contact: 'Contact',
      titleEn: 'English title', bodyEn: 'English article',
    } as Record<string, string>,
  },
  fr: {
    required: (label: string) => `${label} : champ obligatoire.`,
    tooLong: (max: number) => `Merci de ne pas dépasser ${max} caractères.`,
    email: 'Cette adresse e-mail semble incorrecte.',
    phoneOrEmail: 'Veuillez indiquer un numéro de téléphone ou un e-mail.',
    checkFields: 'Veuillez vérifier les champs signalés.',
    tooManyRequirements: 'Merci d’indiquer 20 critères au maximum.',
    requirementTooLong: 'Merci de limiter chaque critère à 300 caractères.',
    busy: 'Nous recevons beaucoup de demandes en ce moment — veuillez réessayer dans quelques minutes.',
    labels: {
      name: 'Nom', phone: 'Téléphone', service: 'Service', jobId: 'Offre', jobTitle: 'Intitulé du poste', courseId: 'Formation',
      courseTitle: 'Intitulé de la formation', title: 'Intitulé du poste', farm: 'Ferme', location: 'Localisation', description: 'Description', contact: 'Contact',
      titleEn: 'Titre en anglais', bodyEn: 'Article en anglais',
    } as Record<string, string>,
  },
};

/**
 * Collects per-field validation errors, then throws them together so the
 * form can highlight every problem at once. Messages are in the visitor's language.
 */
export class FieldChecker {
  errors: Record<string, string> = {};
  readonly m: (typeof MESSAGES)['en'];

  constructor(lang: Lang = 'en') {
    this.m = MESSAGES[lang];
  }

  text(key: string, value: string | undefined, max: number, required = false): string {
    const s = (value ?? '').trim();
    if (required && !s) this.errors[key] = this.m.required(this.m.labels[key] ?? key);
    else if (s.length > max) this.errors[key] = this.m.tooLong(max);
    return s;
  }

  email(key: string, value: string | undefined): string {
    const s = this.text(key, value, 200);
    if (s && !EMAIL_RE.test(s)) this.errors[key] = this.m.email;
    return s;
  }

  fail(key: string, message: string) {
    this.errors[key] = message;
  }

  throwIfInvalid() {
    if (Object.keys(this.errors).length) {
      throw new ConvexError({ message: this.m.checkFields, fields: this.errors });
    }
  }
}

/**
 * Fixed-window counter. Returns how many hits are already recorded in the
 * current window; pass `increment` to record one more.
 */
export async function rateLimitCount(ctx: MutationCtx, key: string, windowMs: number, increment: boolean) {
  const now = Date.now();
  const row = await ctx.db.query('rateLimits').withIndex('by_key', (q) => q.eq('key', key)).unique();
  const active = row && now - row.windowStart < windowMs;
  const count = active ? row.count : 0;
  if (increment) {
    if (!row) await ctx.db.insert('rateLimits', { key, windowStart: now, count: 1 });
    else if (active) await ctx.db.patch(row._id, { count: count + 1 });
    else await ctx.db.patch(row._id, { windowStart: now, count: 1 });
  }
  return count;
}

export async function sha256Hex(input: string): Promise<string> {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input)));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Compares two equal-length hex digests without early exit. */
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
