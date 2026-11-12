import { ConvexError, v } from 'convex/values';
import { internalMutation, mutation, query, type MutationCtx, type QueryCtx } from './_generated/server';
import { STATUSES, constantTimeEqual, rateLimitCount, sha256Hex } from './lib';

/**
 * Password-protected admin inbox. The password lives in the Convex
 * environment (`npx convex env set ADMIN_PASSWORD ...`). Signing in issues a
 * random session token; only its hash is stored.
 */

const SESSION_MS = 12 * 60 * 60_000;
const MAX_FAILURES = 10;
const FAILURE_WINDOW_MS = 15 * 60_000;

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

async function sessionValid(ctx: QueryCtx, token: string) {
  if (!token) return false;
  const tokenHash = await sha256Hex(token);
  const row = await ctx.db.query('adminSessions').withIndex('by_tokenHash', (q) => q.eq('tokenHash', tokenHash)).unique();
  return !!row && row.expiresAt > Date.now();
}

async function requireAdmin(ctx: QueryCtx | MutationCtx, token: string) {
  if (!(await sessionValid(ctx, token))) {
    throw new ConvexError({ code: 'UNAUTHORIZED', message: 'Your session has expired — please sign in again.' });
  }
}

/**
 * Returns a result instead of throwing on failure: a thrown error would roll
 * back the failed-attempt counter and defeat the brute-force lockout.
 */
export const login = mutation({
  args: { password: v.string() },
  handler: async (ctx, { password }) => {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) {
      return { ok: false as const, error: 'Admin is disabled. Set ADMIN_PASSWORD in your Convex environment.' };
    }
    if ((await rateLimitCount(ctx, 'admin-login-failures', FAILURE_WINDOW_MS, false)) >= MAX_FAILURES) {
      return { ok: false as const, error: 'Too many failed attempts. Please try again in 15 minutes.' };
    }
    if (!constantTimeEqual(await sha256Hex(password), await sha256Hex(expected))) {
      await rateLimitCount(ctx, 'admin-login-failures', FAILURE_WINDOW_MS, true);
      return { ok: false as const, error: 'Wrong password.' };
    }
    const token = randomToken();
    await ctx.db.insert('adminSessions', { tokenHash: await sha256Hex(token), expiresAt: Date.now() + SESSION_MS });
    return { ok: true as const, token };
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const tokenHash = await sha256Hex(token);
    const row = await ctx.db.query('adminSessions').withIndex('by_tokenHash', (q) => q.eq('tokenHash', tokenHash)).unique();
    if (row) await ctx.db.delete(row._id);
  },
});

/**
 * All submissions, newest first. Returns null (rather than throwing) for an
 * invalid session so the live-updating admin page can just show the sign-in form.
 */
export const list = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    if (!(await sessionValid(ctx, token))) return null;
    const rows = await ctx.db.query('submissions').withIndex('by_submittedAt').order('desc').take(2000);
    return rows.map(({ _id, type, status, data, submittedAt }) => ({ id: _id, type, status, data: data as Record<string, unknown>, submittedAt }));
  },
});

export const setStatus = mutation({
  args: { token: v.string(), id: v.id('submissions'), status: v.string() },
  handler: async (ctx, { token, id, status }) => {
    await requireAdmin(ctx, token);
    const row = await ctx.db.get(id);
    if (!row) throw new ConvexError({ message: 'This submission no longer exists.' });
    if (!STATUSES[row.type].includes(status)) {
      throw new ConvexError({ message: `Status must be one of: ${STATUSES[row.type].join(', ')}.` });
    }
    await ctx.db.patch(id, { status });
  },
});

export const remove = mutation({
  args: { token: v.string(), id: v.id('submissions') },
  handler: async (ctx, { token, id }) => {
    await requireAdmin(ctx, token);
    if (await ctx.db.get(id)) await ctx.db.delete(id);
  },
});

/** Daily housekeeping (see crons.ts): drop expired sessions and stale rate-limit windows. */
export const cleanup = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db.query('adminSessions').withIndex('by_expiresAt', (q) => q.lt('expiresAt', now)).take(500);
    for (const s of expired) await ctx.db.delete(s._id);
    const stale = await ctx.db.query('rateLimits').collect();
    for (const r of stale) if (now - r.windowStart > 24 * 60 * 60_000) await ctx.db.delete(r._id);
  },
});
