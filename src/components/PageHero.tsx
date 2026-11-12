import type { ReactNode } from 'react';
import HeroPhoto, { type PhotoKey } from './HeroPhoto';

/** Shared hero for inner pages: the photo fills the whole hero, text sits on a cream fade. */
export default function PageHero({
  eyebrow,
  title,
  lead,
  photo,
  wide = false,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  photo: PhotoKey;
  /** Let the text run edge to edge across the screen instead of the centred page column. */
  wide?: boolean;
  children?: ReactNode;
}) {
  return (
    <section className={`page-hero hero-bg${wide ? ' hero-bg--wide' : ''}`}>
      <HeroPhoto photo={photo} />
      <div className="container">
        <div className="hero-bg__text">
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          {lead && <p className="lead">{lead}</p>}
          {children}
        </div>
      </div>
    </section>
  );
}
