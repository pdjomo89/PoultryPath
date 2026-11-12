import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import type { Doc } from './_generated/dataModel';
import { requireAdmin, sessionValid } from './admin';
import { FieldChecker } from './lib';

/**
 * News articles. Written and published from the admin page (/admin → News);
 * visitors only ever see published ones. Text is plain: blank lines separate
 * paragraphs, and nothing is interpreted as HTML.
 */

const LIMITS = { title: 150, summary: 300, body: 20_000 };

/** Short teaser for article cards: the summary, or the start of the article. */
function excerpt(summary: string, body: string) {
  if (summary.trim()) return summary.trim();
  const first = body.trim().split(/\n\s*\n/)[0] ?? '';
  return first.length > 220 ? `${first.slice(0, 217).trimEnd()}…` : first;
}

export interface NewsSummary {
  id: string;
  titleEn: string;
  titleFr: string;
  summaryEn: string;
  summaryFr: string;
  publishedAt: number;
}

export interface NewsArticle extends NewsSummary {
  bodyEn: string;
  bodyFr: string;
}

const toSummary = (a: Doc<'news'>): NewsSummary => ({
  id: a._id,
  titleEn: a.titleEn,
  titleFr: a.titleFr,
  summaryEn: excerpt(a.summaryEn, a.bodyEn),
  summaryFr: a.bodyFr.trim() || a.summaryFr.trim() ? excerpt(a.summaryFr, a.bodyFr) : '',
  publishedAt: a.publishedAt ?? a._creationTime,
});

/** Published articles, newest first, for the public News page. */
export const listPublished = query({
  args: {},
  handler: async (ctx): Promise<NewsSummary[]> => {
    const rows = await ctx.db
      .query('news')
      .withIndex('by_status_publishedAt', (q) => q.eq('status', 'published'))
      .order('desc')
      .take(100);
    return rows.map(toSummary);
  },
});

/** One published article, or null if it doesn't exist or isn't published. */
export const get = query({
  args: { id: v.string() },
  handler: async (ctx, { id }): Promise<NewsArticle | null> => {
    const newsId = ctx.db.normalizeId('news', id);
    const row = newsId && (await ctx.db.get(newsId));
    if (!row || row.status !== 'published') return null;
    return { ...toSummary(row), bodyEn: row.bodyEn, bodyFr: row.bodyFr };
  },
});

/** Every article, drafts included, for the admin page. Null for an invalid session. */
export const adminList = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    if (!(await sessionValid(ctx, token))) return null;
    const rows = await ctx.db.query('news').order('desc').take(500);
    return rows.map((a) => ({
      id: a._id,
      titleEn: a.titleEn,
      titleFr: a.titleFr,
      summaryEn: a.summaryEn,
      summaryFr: a.summaryFr,
      bodyEn: a.bodyEn,
      bodyFr: a.bodyFr,
      status: a.status,
      publishedAt: a.publishedAt ?? null,
      updatedAt: a.updatedAt,
    }));
  },
});

const articleFields = {
  titleEn: v.string(),
  titleFr: v.string(),
  summaryEn: v.string(),
  summaryFr: v.string(),
  bodyEn: v.string(),
  bodyFr: v.string(),
};

/** Creates (no id) or updates an article. `publish` publishes it; false keeps or makes it a draft. */
export const save = mutation({
  args: { token: v.string(), id: v.optional(v.id('news')), publish: v.boolean(), ...articleFields },
  handler: async (ctx, { token, id, publish, ...fields }) => {
    await requireAdmin(ctx, token);
    const c = new FieldChecker('en');
    const clean = {
      titleEn: c.text('titleEn', fields.titleEn, LIMITS.title, true),
      titleFr: c.text('titleFr', fields.titleFr, LIMITS.title),
      summaryEn: c.text('summaryEn', fields.summaryEn, LIMITS.summary),
      summaryFr: c.text('summaryFr', fields.summaryFr, LIMITS.summary),
      bodyEn: c.text('bodyEn', fields.bodyEn, LIMITS.body, true),
      bodyFr: c.text('bodyFr', fields.bodyFr, LIMITS.body),
    };
    // A French title without a French article (or the reverse) would show half-translated pages.
    if (clean.bodyFr && !clean.titleFr) c.fail('titleFr', 'Add a French title, or clear the French article.');
    if (clean.titleFr && !clean.bodyFr) c.fail('bodyFr', 'Add the French article, or clear the French title.');
    c.throwIfInvalid();

    const now = Date.now();
    const status = publish ? ('published' as const) : ('draft' as const);
    if (!id) {
      return await ctx.db.insert('news', { ...clean, status, publishedAt: publish ? now : undefined, updatedAt: now });
    }
    const existing = await ctx.db.get(id);
    if (!existing) throw new ConvexError({ message: 'This article no longer exists.' });
    await ctx.db.patch(id, { ...clean, status, publishedAt: existing.publishedAt ?? (publish ? now : undefined), updatedAt: now });
    return id;
  },
});

export const setPublished = mutation({
  args: { token: v.string(), id: v.id('news'), published: v.boolean() },
  handler: async (ctx, { token, id, published }) => {
    await requireAdmin(ctx, token);
    const row = await ctx.db.get(id);
    if (!row) throw new ConvexError({ message: 'This article no longer exists.' });
    const now = Date.now();
    await ctx.db.patch(id, {
      status: published ? 'published' : 'draft',
      publishedAt: row.publishedAt ?? (published ? now : undefined),
      updatedAt: now,
    });
  },
});

export const remove = mutation({
  args: { token: v.string(), id: v.id('news') },
  handler: async (ctx, { token, id }) => {
    await requireAdmin(ctx, token);
    if (await ctx.db.get(id)) await ctx.db.delete(id);
  },
});
