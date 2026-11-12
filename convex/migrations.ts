import { internalQuery } from './_generated/server';

/**
 * Old SQLite row ids already imported into Convex, so
 * scripts/import-sqlite.ts can be re-run without creating duplicates.
 */
export const importedLegacyIds = internalQuery({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query('submissions')
      .withIndex('by_legacyId', (q) => q.gt('legacyId', 0))
      .collect();
    return rows.map((r) => r.legacyId);
  },
});
