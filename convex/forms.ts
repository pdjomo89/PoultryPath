import { ConvexError, v } from 'convex/values';
import { internalQuery, mutation, type MutationCtx } from './_generated/server';
import { internal } from './_generated/api';
import { FieldChecker, MESSAGES, STATUSES, langArg, rateLimitCount, type Lang, type SubmissionType } from './lib';

/**
 * Public form endpoints. Each validates its input, stores it, and schedules
 * an email notification to the business owner.
 *
 * `website` is a honeypot: hidden from people, filled in by bots. Bot
 * submissions get a normal-looking success response but are not stored.
 */

const experience = v.union(v.literal('No experience'), v.literal('Entry level'), v.literal('Experienced'));
const jobType = v.union(v.literal('Full-time'), v.literal('Part-time'), v.literal('Internship'), v.literal('Contract'));
/** Livestock a job involves — same list as the website's training and job filters. */
const animal = v.union(
  v.literal('Poultry'), v.literal('Pigs'), v.literal('Goats'), v.literal('Rabbits'),
  v.literal('Sheep'), v.literal('Cattle'), v.literal('Fish'), v.literal('Bees'),
);

// Convex mutations don't see client IPs, so this is a per-form global cap that
// stops floods (and email spam) rather than a per-visitor limit.
const MAX_PER_WINDOW = 100;
const WINDOW_MS = 10 * 60_000;

const isBot = (website?: string) => !!website?.trim();

async function save(ctx: MutationCtx, type: SubmissionType, data: Record<string, unknown>, lang: Lang) {
  if ((await rateLimitCount(ctx, `form:${type}`, WINDOW_MS, true)) >= MAX_PER_WINDOW) {
    throw new ConvexError({ message: MESSAGES[lang].busy });
  }
  const id = await ctx.db.insert('submissions', {
    type,
    status: STATUSES[type][0],
    // Record the visitor's language so you know which language to reply in.
    data: { ...data, language: lang === 'fr' ? 'French' : 'English' },
    submittedAt: Date.now(),
  });
  await ctx.scheduler.runAfter(0, internal.notify.send, { id });
  return { ok: true as const };
}

export const submitConsultation = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    location: v.optional(v.string()),
    service: v.string(),
    animals: v.optional(v.string()),
    stage: v.optional(v.string()),
    flock: v.optional(v.string()),
    contactMethod: v.optional(v.string()),
    message: v.optional(v.string()),
    website: v.optional(v.string()),
    lang: langArg,
  },
  handler: async (ctx, { website, lang = 'en', ...input }) => {
    if (isBot(website)) return { ok: true as const };
    const f = new FieldChecker(lang);
    const data = {
      name: f.text('name', input.name, 120, true),
      email: f.email('email', input.email),
      phone: f.text('phone', input.phone, 40),
      location: f.text('location', input.location, 160),
      service: f.text('service', input.service, 60, true),
      animals: f.text('animals', input.animals, 80),
      stage: f.text('stage', input.stage, 80),
      flock: f.text('flock', input.flock, 60),
      contactMethod: f.text('contactMethod', input.contactMethod, 40),
      message: f.text('message', input.message, 4000),
    };
    if (!data.email && !data.phone && !f.errors.phone) f.fail('phone', f.m.phoneOrEmail);
    f.throwIfInvalid();
    return save(ctx, 'consultation', data, lang);
  },
});

export const submitApplication = mutation({
  args: {
    jobId: v.string(),
    jobTitle: v.string(),
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    experience,
    message: v.optional(v.string()),
    website: v.optional(v.string()),
    lang: langArg,
  },
  handler: async (ctx, { website, lang = 'en', ...input }) => {
    if (isBot(website)) return { ok: true as const };
    const f = new FieldChecker(lang);
    const data = {
      jobId: f.text('jobId', input.jobId, 80, true),
      jobTitle: f.text('jobTitle', input.jobTitle, 200, true),
      name: f.text('name', input.name, 120, true),
      phone: f.text('phone', input.phone, 40, true),
      email: f.email('email', input.email),
      experience: input.experience,
      message: f.text('message', input.message, 4000),
    };
    f.throwIfInvalid();
    return save(ctx, 'application', data, lang);
  },
});

export const submitEnrolment = mutation({
  args: {
    courseId: v.string(),
    courseTitle: v.string(),
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    lang: langArg,
  },
  handler: async (ctx, { website, lang = 'en', ...input }) => {
    if (isBot(website)) return { ok: true as const };
    const f = new FieldChecker(lang);
    const data = {
      courseId: f.text('courseId', input.courseId, 80, true),
      courseTitle: f.text('courseTitle', input.courseTitle, 160, true),
      name: f.text('name', input.name, 120, true),
      phone: f.text('phone', input.phone, 40, true),
      email: f.email('email', input.email),
    };
    f.throwIfInvalid();
    return save(ctx, 'enrolment', data, lang);
  },
});

export const submitJob = mutation({
  args: {
    title: v.string(),
    farm: v.string(),
    location: v.string(),
    type: jobType,
    experience,
    trainingProvided: v.boolean(),
    // Optional so older versions of the page can still submit; the current form requires it.
    animals: v.optional(v.array(animal)),
    description: v.string(),
    requirements: v.array(v.string()),
    contact: v.string(),
    website: v.optional(v.string()),
    lang: langArg,
  },
  handler: async (ctx, { website, lang = 'en', ...input }) => {
    if (isBot(website)) return { ok: true as const };
    const f = new FieldChecker(lang);
    const requirements = input.requirements.map((r) => r.trim()).filter(Boolean);
    if (requirements.length > 20) f.fail('requirements', f.m.tooManyRequirements);
    if (requirements.some((r) => r.length > 300)) f.fail('requirements', f.m.requirementTooLong);
    const data = {
      title: f.text('title', input.title, 160, true),
      farm: f.text('farm', input.farm, 160, true),
      location: f.text('location', input.location, 160, true),
      type: input.type,
      experience: input.experience,
      trainingProvided: input.trainingProvided,
      animals: [...new Set(input.animals ?? [])],
      description: f.text('description', input.description, 4000, true),
      requirements,
      contact: f.text('contact', input.contact, 200, true),
    };
    f.throwIfInvalid();
    return save(ctx, 'job', data, lang);
  },
});

/** Used by the email action to load what it should send. */
export const get = internalQuery({
  args: { id: v.id('submissions') },
  handler: (ctx, { id }) => ctx.db.get(id),
});
