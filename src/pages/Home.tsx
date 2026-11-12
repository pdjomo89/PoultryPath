import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, CheckCircle2, GraduationCap, Sprout, Users } from 'lucide-react';
import { SERVICES } from '../data/content';
import ServiceCard from '../components/ServiceCard';
import CtaBand from '../components/CtaBand';
import HeroPhoto from '../components/HeroPhoto';
import { useI18n } from '../i18n';

const AUDIENCES = [
  { key: 'entrepreneurs', icon: Sprout, to: '/start-a-farm' },
  { key: 'owners', icon: Calculator, to: '/calculator' },
  { key: 'seekers', icon: Users, to: '/careers' },
] as const;

export default function Home() {
  const { t } = useI18n();
  const h = t.home;
  return (
    <>
      <section className="hero hero-bg">
        <HeroPhoto photo="home" />
        <div className="container">
          <div className="hero-bg__text">
            <span className="eyebrow">{h.eyebrow}</span>
            <h1>{t.brand.tagline}</h1>
            <p className="lead">{h.lead}</p>
            <div className="hero__actions">
              <Link to="/contact" className="btn btn--primary">{h.ctaBook} <ArrowRight size={18} /></Link>
              <Link to="/calculator" className="btn btn--secondary">{h.ctaProfit}</Link>
            </div>
            <div className="hero__stats">
              {h.stats.map((s) => (
                <div className="hero__stat" key={s.label}><strong>{s.value}</strong><span>{s.label}</span></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="hero-features">
        <div className="container">
          <div className="hero-features__head">
            <h2>{h.panelTitle}</h2>
            <Link to="/services" className="btn btn--outline btn--sm">{h.exploreAll} <ArrowRight size={16} /></Link>
          </div>
          <ul className="checklist hero-features__list">
            {h.panelItems.map((item) => (
              <li key={item}><CheckCircle2 size={20} /> {item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="eyebrow">{h.whatEyebrow}</span>
            <h2>{h.whatTitle}</h2>
            <p className="lead">{h.whatLead}</p>
          </div>
          <div className="grid grid--3">
            {SERVICES.map((s) => <ServiceCard key={s.id} service={s} />)}
          </div>
        </div>
      </section>

      <section className="section section--cream">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="eyebrow">{h.howEyebrow}</span>
            <h2>{h.howTitle}</h2>
          </div>
          <div className="steps">
            {h.steps.map((s, i) => (
              <div className="step" key={s.title}>
                <div className="step__num">{i + 1}</div>
                <h3>{s.title}</h3>
                <p className="muted" style={{ margin: 0 }}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="eyebrow">{h.whoEyebrow}</span>
            <h2>{h.whoTitle}</h2>
          </div>
          <div className="grid grid--3">
            {AUDIENCES.map(({ key, icon: Icon, to }) => {
              const a = h.audiences[key];
              return (
                <article className="card card--hover" key={key}>
                  <div className="icon-badge"><Icon size={26} /></div>
                  <h3>{a.title}</h3>
                  <p>{a.text}</p>
                  <div className="card__foot">
                    <Link to={to} className="btn btn--secondary btn--sm">{a.cta} <ArrowRight size={16} /></Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section--soft">
        <div className="container" style={{ display: 'grid', gap: 32, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', alignItems: 'center' }}>
          <div>
            <span className="eyebrow">{h.trainEyebrow}</span>
            <h2>{h.trainTitle}</h2>
            <p className="lead">{h.trainText}</p>
            <div className="hero__actions">
              <Link to="/training" className="btn btn--primary"><GraduationCap size={18} /> {h.viewCourses}</Link>
              <Link to="/careers" className="btn btn--outline">{h.browseJobs}</Link>
            </div>
          </div>
          <div className="card">
            <h3>{h.hiringTitle}</h3>
            <p>{h.hiringText}</p>
            <Link to="/careers?post=1" className="btn btn--secondary">{h.postJob}</Link>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
