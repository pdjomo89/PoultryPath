import { Link } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { ROADMAP } from '../data/content';
import { usePersistentState } from '../lib/storage';
import CtaBand from '../components/CtaBand';
import { useI18n } from '../i18n';
import PageHero from '../components/PageHero';

export default function StartFarm() {
  const { t, tx } = useI18n();
  const s = t.startFarm;
  // Progress is keyed by step id + task position, so it survives language switches.
  const [done, setDone] = usePersistentState<Record<string, boolean>>('roadmap', {});
  const total = ROADMAP.reduce((n, step) => n + step.tasks.en.length, 0);
  const completed = Object.values(done).filter(Boolean).length;
  const pctDone = Math.round((completed / total) * 100);

  const toggle = (key: string) => setDone((d) => ({ ...d, [key]: !d[key] }));

  return (
    <>
      <PageHero eyebrow={s.eyebrow} title={s.title} lead={s.lead} photo="start">
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: 6 }}>
              <strong style={{ color: 'var(--forest)' }}>{s.progress(completed, total)}</strong>
              <span className="muted">{pctDone}%</span>
            </div>
            <div className="progress" role="progressbar" aria-valuenow={pctDone} aria-valuemin={0} aria-valuemax={100}>
              <div className="progress__bar" style={{ width: `${pctDone}%` }} />
            </div>
            {completed > 0 && (
              <button className="btn btn--outline btn--sm" style={{ marginTop: 14 }} onClick={() => setDone({})}>
                <RotateCcw size={14} /> {s.reset}
              </button>
            )}
          </div>
      </PageHero>

      <section className="section">
        <div className="container">
          <div className="timeline">
            {ROADMAP.map((step, i) => (
              <div className="timeline__item" key={step.id}>
                <div className="timeline__dot">{i + 1}</div>
                <div className="timeline__body">
                  <div className="timeline__meta">{tx(step.timeframe)}</div>
                  <h3>{tx(step.title)}</h3>
                  <p className="muted">{tx(step.description)}</p>
                  {tx(step.tasks).map((task, n) => {
                    const key = `${step.id}-${n}`;
                    return (
                      <label key={key} className={`timeline__check ${done[key] ? 'done' : ''}`}>
                        <input type="checkbox" checked={!!done[key]} onChange={() => toggle(key)} />
                        <span>{task}</span>
                      </label>
                    );
                  })}
                  {step.id === 'plan' && (
                    <Link to="/calculator" className="btn btn--primary btn--sm" style={{ marginTop: 12 }}>{s.openCalculator}</Link>
                  )}
                  {step.id === 'people' && (
                    <Link to="/careers" className="btn btn--primary btn--sm" style={{ marginTop: 12 }}>{s.goJobs}</Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand title={s.ctaTitle} text={s.ctaText} />
    </>
  );
}
