import { Link, useParams } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { ArrowLeft, ArrowRight, CalendarDays } from 'lucide-react';
import { api } from '../../convex/_generated/api';
import type { NewsSummary } from '../../convex/news';
import { useI18n, type Lang } from '../i18n';
import PageHero from '../components/PageHero';

/**
 * Text of an article in the visitor's language. Articles without a French
 * version are shown in English, marked with lang="en" for screen readers.
 */
function localized<T extends NewsSummary & { bodyEn?: string; bodyFr?: string }>(a: T, lang: Lang) {
  const fr = lang === 'fr' && !!a.titleFr.trim();
  return {
    lang: fr ? 'fr' : 'en',
    title: fr ? a.titleFr : a.titleEn,
    summary: fr ? a.summaryFr : a.summaryEn,
    body: (fr ? a.bodyFr : a.bodyEn) ?? '',
  } as const;
}

const paragraphs = (text: string) => text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

function PublishedDate({ at }: { at: number }) {
  const { locale } = useI18n();
  const d = new Date(at);
  return (
    <time className="news-date" dateTime={d.toISOString().slice(0, 10)}>
      <CalendarDays size={15} aria-hidden="true" /> {d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
    </time>
  );
}

function Header({ title, lead, eyebrow }: { title: string; lead?: string; eyebrow?: string }) {
  return (
    <section className="page-hero">
      <div className="container">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {lead && <p className="lead" style={{ maxWidth: 720, marginBottom: 0 }}>{lead}</p>}
      </div>
    </section>
  );
}

export default function News() {
  const { t, lang } = useI18n();
  const n = t.news;
  const articles = useQuery(api.news.listPublished);

  return (
    <>
      <PageHero eyebrow={n.eyebrow} title={n.title} lead={n.lead} photo="news" wide />
      <section className="section" style={{ paddingTop: 48 }}>
        <div className="container">
          {articles === undefined ? (
            <p className="muted" role="status">{n.loading}</p>
          ) : articles.length === 0 ? (
            <div className="card empty">{n.none}</div>
          ) : (
            <div className="grid grid--3">
              {articles.map((a) => {
                const l = localized(a, lang);
                return (
                  <article className="card card--hover news-card" key={a.id} lang={l.lang === lang ? undefined : l.lang}>
                    <PublishedDate at={a.publishedAt} />
                    <h2 className="news-card__title">
                      <Link to={`/news/${a.id}`}>{l.title}</Link>
                    </h2>
                    {l.summary && <p>{l.summary}</p>}
                    <div className="card__foot">
                      <Link to={`/news/${a.id}`} className="news-card__more" aria-label={n.readMoreLabel(l.title)}>
                        {n.readMore} <ArrowRight size={16} aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export function NewsArticle() {
  const { id = '' } = useParams();
  const { t, lang } = useI18n();
  const n = t.news;
  const article = useQuery(api.news.get, { id });

  const back = (
    <Link to="/news" className="news-back"><ArrowLeft size={16} aria-hidden="true" /> {n.back}</Link>
  );

  if (article === undefined) {
    return (
      <section className="section">
        <div className="container news-article"><p className="muted" role="status">{n.loading}</p></div>
      </section>
    );
  }
  if (article === null) {
    return (
      <>
        <Header title={n.notFoundTitle} lead={n.notFoundLead} />
        <section className="section" style={{ paddingTop: 40 }}><div className="container">{back}</div></section>
      </>
    );
  }

  const l = localized(article, lang);
  return (
    <article className="section" style={{ paddingTop: 40 }}>
      <div className="container news-article">
        {back}
        <div lang={l.lang === lang ? undefined : l.lang}>
          <h1 className="news-article__title">{l.title}</h1>
          <PublishedDate at={article.publishedAt} />
          {l.lang !== lang && <p className="alert alert--info" lang={lang} style={{ marginTop: 16 }}>{n.englishOnly}</p>}
          <div className="news-article__body">
            {paragraphs(l.body).map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
        {back}
      </div>
    </article>
  );
}
