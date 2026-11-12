import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { LANGS, useI18n } from '../i18n';

/** The PoultryPath logo (includes the name and tagline), on a white card so it reads on dark green. */
export function Brand({ size = 'nav' }: { size?: 'nav' | 'footer' }) {
  const { t } = useI18n();
  return (
    <Link to="/" className={`brand brand--${size}`} aria-label={t.brand.home}>
      <picture>
        <source srcSet="/logo.webp" type="image/webp" />
        <img src="/logo.png" alt={t.brand.logoAlt} width={520} height={303} />
      </picture>
    </Link>
  );
}

export function LanguageToggle() {
  const { lang, setLang, t } = useI18n();
  return (
    <div className="lang-toggle" role="group" aria-label={t.nav.language}>
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={lang === l}
          className={lang === l ? 'active' : ''}
          onClick={() => setLang(l)}
          title={l === 'en' ? 'English' : 'Français'}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { t } = useI18n();

  useEffect(() => setOpen(false), [pathname]);

  const links = [
    { to: '/services', label: t.nav.services },
    { to: '/start-a-farm', label: t.nav.startFarm },
    { to: '/calculator', label: t.nav.calculator },
    { to: '/training', label: t.nav.training },
    { to: '/careers', label: t.nav.jobs },
  ];

  return (
    <header className="nav">
      <nav className="container nav__inner" aria-label="Main">
        <Brand />
        <div id="nav-menu" className={`nav__menu ${open ? 'open' : ''}`}>
          <ul className="nav__links">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to}>{l.label}</NavLink>
              </li>
            ))}
            <li>
              <Link to="/contact" className="btn btn--primary btn--sm nav__cta">
                {t.nav.book}
              </Link>
            </li>
          </ul>
        </div>
        <div className="nav__end">
          <LanguageToggle />
          <button
            className="nav__toggle"
            aria-expanded={open}
            aria-controls="nav-menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X /> : <Menu />}
            <span className="visually-hidden">{t.nav.toggleMenu}</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
