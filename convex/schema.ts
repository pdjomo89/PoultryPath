import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export const submissionType = v.union(
  v.literal('consultation'),
  v.literal('application'),
  v.literal('enrolment'),
  v.literal('job'),
);

export default defineSchema({
  /**
   * Every form submission. `data` holds the validated form fields (checked in
   * forms.ts before insert), so adding a form field needs no schema change.
   */
  submissions: defineTable({
    type: submissionType,
    status: v.string(),
    data: v.any(),
    submittedAt: v.number(),
    /** Row id from the old SQLite database, for imported submissions. */
    legacyId: v.optional(v.number()),
  })
    .index('by_submittedAt', ['submittedAt'])
    .index('by_type_status', ['type', 'status', 'submittedAt'])
    .index('by_legacyId', ['legacyId']),

  /**
   * News articles written in the admin page. French fields may be left empty;
   * the site then shows the English text to French visitors.
   */
  news: defineTable({
    titleEn: v.string(),
    titleFr: v.string(),
    summaryEn: v.string(),
    summaryFr: v.string(),
    bodyEn: v.string(),
    bodyFr: v.string(),
    status: v.union(v.literal('draft'), v.literal('published')),
    /** Set the first time an article is published; shown as its date. */
    publishedAt: v.optional(v.number()),
    updatedAt: v.number(),
  }).index('by_status_publishedAt', ['status', 'publishedAt']),

  /** Signed-in admin sessions. Only a hash of the token is stored. */
  adminSessions: defineTable({
    tokenHash: v.string(),
    expiresAt: v.number(),
  })
    .index('by_tokenHash', ['tokenHash'])
    .index('by_expiresAt', ['expiresAt']),

  /** Fixed-window counters for spam and brute-force protection. */
  rateLimits: defineTable({
    key: v.string(),
    windowStart: v.number(),
    count: v.number(),
  }).index('by_key', ['key']),
});
