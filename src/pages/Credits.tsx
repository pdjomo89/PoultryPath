import { PHOTO_CREDITS, isMirrored } from '../components/HeroPhoto';
import { useI18n } from '../i18n';

export default function Credits() {
  const { t } = useI18n();
  const p = t.photos;
  return (
    <section className="section">
      <div className="container">
        <span className="eyebrow">{p.creditsEyebrow}</span>
        <h1 style={{ fontSize: '2.2rem' }}>{p.creditsTitle}</h1>
        <p className="lead">{p.creditsLead}</p>
        <div className="grid grid--3" style={{ marginTop: 32 }}>
          {PHOTO_CREDITS.map((c) => (
            <article className="card" key={c.key}>
              <img
                src={`/images/hero/${c.key}-720.webp`}
                alt={p.alt[c.key]}
                loading="lazy"
                width={720}
                height={480}
                style={{ borderRadius: 10, aspectRatio: '3 / 2', objectFit: 'cover', marginBottom: 14 }}
              />
              <h3 style={{ fontSize: '1rem' }}>{p.usedOn[c.key]}</h3>
              <p style={{ margin: '0 0 4px', fontSize: '0.92rem' }}>“{c.title}” — {c.author}</p>
              <p style={{ margin: 0, fontSize: '0.92rem' }}>
                <a href={c.licenseUrl} target="_blank" rel="noopener noreferrer">{c.license}</a>
                {' · '}
                <a href={c.source} target="_blank" rel="noopener noreferrer">{p.source}</a>
              </p>
              <p className="muted" style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>{isMirrored(c.key) ? p.changesMirrored : p.changesCropped}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
