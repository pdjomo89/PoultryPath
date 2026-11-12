import { ConvexError, v } from 'convex/values';
import { internalMutation, mutation, query } from './_generated/server';
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

/** Starter articles: general farming advice, so the page isn't empty at launch. Edit or delete them in the admin page. */
const SAMPLES = [
  {
    titleEn: 'Biosecurity basics every small farm can afford',
    titleFr: 'Les bases de la biosécurité, à la portée de toute petite ferme',
    summaryEn: 'Most disease reaches a farm on boots, vehicles, new animals and visitors. A few cheap habits keep it out.',
    summaryFr: 'La plupart des maladies arrivent à la ferme par les bottes, les véhicules, les nouveaux animaux et les visiteurs. Quelques habitudes peu coûteuses suffisent à les tenir à distance.',
    bodyEn: `Disease is one of the fastest ways to lose a flock or herd, and it rarely appears from nowhere. It usually arrives on boots, crates, vehicles, new animals or visitors. The good news: the most effective protections cost very little.

Set up a footbath or a change of boots at the entrance to every animal house, and keep the disinfectant fresh. Limit visitors, and keep a simple log of who came in and when.

Quarantine new animals away from your existing stock for two to three weeks before mixing them, and watch them closely for signs of illness.

Keep feed stores closed and dry, control rodents and wild birds, and remove dead animals promptly and safely.

Clean and disinfect houses and equipment between batches, and give the house time to rest empty before new animals arrive.

If you'd like a biosecurity plan written for your own farm, our Farm Management service covers it.`,
    bodyFr: `Les maladies sont l’un des moyens les plus rapides de perdre un troupeau, et elles n’apparaissent presque jamais par hasard. Elles arrivent généralement par les bottes, les caisses, les véhicules, les nouveaux animaux ou les visiteurs. Bonne nouvelle : les protections les plus efficaces coûtent très peu.

Installez un pédiluve ou un changement de bottes à l’entrée de chaque bâtiment, et renouvelez régulièrement le désinfectant. Limitez les visites et tenez un registre simple de qui entre, et quand.

Placez les nouveaux animaux en quarantaine, à l’écart de votre cheptel, pendant deux à trois semaines avant de les mélanger, et surveillez de près tout signe de maladie.

Gardez les stocks d’aliments fermés et au sec, luttez contre les rongeurs et les oiseaux sauvages, et retirez rapidement et proprement les animaux morts.

Nettoyez et désinfectez les bâtiments et le matériel entre deux bandes, et laissez le bâtiment vide quelque temps avant l’arrivée des nouveaux animaux.

Si vous souhaitez un plan de biosécurité adapté à votre ferme, notre service de gestion de ferme s’en charge.`,
  },
  {
    titleEn: 'Keeping animals comfortable in hot weather',
    titleFr: 'Protéger vos animaux pendant les fortes chaleurs',
    summaryEn: 'Heat stress cuts growth, egg production and fertility. Here is how to spot it early and what to change on hot days.',
    summaryFr: 'Le stress thermique réduit la croissance, la ponte et la fertilité. Voici comment le repérer tôt et quoi changer les jours de forte chaleur.',
    bodyEn: `Hot weather is hard on livestock, and poultry suffer most because they cannot sweat. Animals under heat stress eat less, grow more slowly, lay fewer eggs and become more vulnerable to disease.

Learn the warning signs: birds panting with open beaks and holding their wings away from their bodies, or pigs and goats lying flat, breathing fast and refusing feed.

Make sure clean, cool water is always available, and add extra drinkers on hot days; animals drink far more in the heat. Shade water tanks and pipes so the water doesn't warm up.

Improve air flow: open sides and vents, and use fans where you have power. Reduce stocking density if houses feel crowded.

Feed during the cooler hours of early morning and evening, and avoid handling, moving or vaccinating animals in the heat of the day.

Planning a new house? Orientation, roof insulation and ventilation decided at the start save a lot of money later. Ask us about it during a consultation.`,
    bodyFr: `La chaleur est éprouvante pour le bétail, et surtout pour les volailles, qui ne transpirent pas. Les animaux en stress thermique mangent moins, grandissent plus lentement, pondent moins et deviennent plus sensibles aux maladies.

Apprenez à reconnaître les signes d’alerte : volailles qui halètent bec ouvert et écartent les ailes du corps, porcs ou chèvres couchés à plat, qui respirent vite et refusent l’aliment.

Veillez à ce qu’une eau propre et fraîche soit toujours disponible, et ajoutez des abreuvoirs les jours chauds : les animaux boivent beaucoup plus. Mettez les cuves et les tuyaux à l’ombre pour que l’eau ne chauffe pas.

Améliorez la circulation de l’air : ouvrez les côtés et les aérations, et utilisez des ventilateurs si vous avez de l’électricité. Réduisez la densité si les bâtiments semblent surchargés.

Distribuez l’aliment aux heures fraîches, tôt le matin et le soir, et évitez de manipuler, déplacer ou vacciner les animaux aux heures les plus chaudes.

Vous prévoyez un nouveau bâtiment ? L’orientation, l’isolation du toit et la ventilation décidées dès le départ font économiser beaucoup d’argent par la suite. Parlons-en lors d’une consultation.`,
  },
  {
    titleEn: 'Farm records: the habit that pays for itself',
    titleFr: 'Les registres d’élevage : une habitude qui rapporte',
    summaryEn: 'You can’t improve what you don’t measure. Five numbers to write down every day, and how they show where your money goes.',
    summaryFr: 'On ne peut pas améliorer ce qu’on ne mesure pas. Cinq chiffres à noter chaque jour, et comment ils montrent où va votre argent.',
    bodyEn: `Many farms that struggle are not badly run; they simply don't know where their money goes. Good records turn guesswork into decisions.

Start with five numbers, written down every day for each house or pen: animals alive, deaths, feed used, water used, and production (eggs collected, or weight at regular weigh-ins).

Add every purchase and every sale, with the date and the amount. A notebook works; a simple spreadsheet is even better.

Review the numbers every week. A sudden drop in feed or water intake is often the first sign of illness, days before animals look sick.

At the end of each batch or month, compare your costs with your income. Our free Profit Calculator shows the main figures to track, such as cost per unit and break-even price.

Records are also what banks and investors ask for when you want to grow. Starting the habit now makes that conversation much easier.`,
    bodyFr: `Beaucoup de fermes en difficulté ne sont pas mal gérées : elles ne savent simplement pas où passe leur argent. De bons registres transforment les suppositions en décisions.

Commencez par cinq chiffres, notés chaque jour pour chaque bâtiment ou enclos : animaux présents, mortalité, aliment consommé, eau consommée et production (œufs ramassés, ou poids lors des pesées régulières).

Ajoutez chaque achat et chaque vente, avec la date et le montant. Un cahier suffit ; un tableur simple, c’est encore mieux.

Relisez les chiffres chaque semaine. Une baisse soudaine de la consommation d’aliment ou d’eau est souvent le premier signe d’une maladie, plusieurs jours avant que les animaux paraissent malades.

À la fin de chaque bande ou de chaque mois, comparez vos coûts à vos recettes. Notre calculateur de rentabilité gratuit montre les principaux indicateurs à suivre, comme le coût par unité et le prix d’équilibre.

Les registres sont aussi ce que demandent les banques et les investisseurs quand vous voulez vous agrandir. Prendre l’habitude dès maintenant facilitera beaucoup cette discussion.`,
  },
];

/**
 * Adds the starter articles, published, if there are no articles yet.
 * Run once per deployment: `npx convex run news:seedSamples` (add `--prod` for production).
 */
export const seedSamples = internalMutation({
  args: {},
  handler: async (ctx) => {
    if (await ctx.db.query('news').first()) return { added: 0 };
    const now = Date.now();
    // A minute apart, newest first, so they list in the order written above.
    for (const [i, s] of SAMPLES.entries()) {
      const at = now - (i + 1) * 60_000;
      await ctx.db.insert('news', { ...s, status: 'published', publishedAt: at, updatedAt: at });
    }
    return { added: SAMPLES.length };
  },
});
