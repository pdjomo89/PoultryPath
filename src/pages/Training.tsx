import { useState } from 'react';
import { CheckCircle2, Clock, MapPin, PawPrint, Users } from 'lucide-react';
import { useMutation } from 'convex/react';
import { ANIMALS, COURSES, OTHER_ANIMALS, type Course, type Level } from '../data/content';
import { api } from '../../convex/_generated/api';
import { errorMessage, readHoneypot } from '../lib/forms';
import { FormError, Honeypot } from '../components/FormBits';
import Modal from '../components/Modal';
import CtaBand from '../components/CtaBand';
import { useI18n } from '../i18n';
import PageHero from '../components/PageHero';

const LEVELS: Level[] = ['Beginner', 'Intermediate', 'Advanced'];
type AnimalFilter = (typeof ANIMALS)[number] | 'All animals';

/** Pseudo-course used when someone asks for training on an animal we don't list. */
const CUSTOM_REQUEST_ID = 'custom-request';

export default function Training() {
  const { t, tx, lang } = useI18n();
  const tr = t.training;
  const [level, setLevel] = useState<'' | Level>('');
  const [animal, setAnimal] = useState<AnimalFilter>('All animals');
  const [enrolling, setEnrolling] = useState<Course | typeof CUSTOM_REQUEST_ID | null>(null);
  const [otherAnimal, setOtherAnimal] = useState('');
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitEnrolment = useMutation(api.forms.submitEnrolment);

  const courses = COURSES.filter(
    (c) =>
      (!level || c.level === level) &&
      (animal === 'All animals' || c.animal === animal || c.animal === 'All animals'),
  );
  const isCustom = enrolling === CUSTOM_REQUEST_ID;
  const course = isCustom ? null : enrolling;

  const close = () => {
    setEnrolling(null);
    setSent(false);
    setError(null);
    setForm({ name: '', phone: '', email: '' });
    setOtherAnimal('');
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!enrolling) return;
    setSubmitting(true);
    setError(null);
    try {
      // Course names are stored in English so the admin inbox reads consistently;
      // the submission also records the visitor's language.
      const courseId = course ? course.id : CUSTOM_REQUEST_ID;
      const courseTitle = course ? course.title.en : `Training request: ${otherAnimal.trim()}`;
      await submitEnrolment({ courseId, courseTitle, ...form, website: readHoneypot(e.currentTarget), lang });
      setSent(true);
    } catch (err) {
      setError(errorMessage(err, t.common));
    } finally {
      setSubmitting(false);
    }
  };

  const modalTitle = sent ? tr.onList : course ? tr.registerTitle(tx(course.title)) : tr.requestTitle;

  return (
    <>
      <PageHero eyebrow={tr.eyebrow} title={tr.title} lead={tr.lead} photo="training" />

      <section className="section" style={{ paddingTop: 48 }}>
        <div className="container">
          <div className="toolbar">
            <div className="segmented" role="tablist" aria-label={tr.filterAnimal}>
              {(['All animals', ...ANIMALS] as AnimalFilter[]).map((a) => (
                <button key={a} role="tab" aria-selected={animal === a} className={animal === a ? 'active' : ''} onClick={() => setAnimal(a)}>
                  {tr.animals[a]}
                </button>
              ))}
            </div>
            <label className="visually-hidden" htmlFor="level-filter">{tr.level}</label>
            <select id="level-filter" className="select" value={level} onChange={(e) => setLevel(e.target.value as '' | Level)}>
              <option value="">{tr.allLevels}</option>
              {LEVELS.map((l) => <option key={l} value={l}>{tr.levels[l]}</option>)}
            </select>
          </div>
          {courses.length === 0 && <div className="card empty" style={{ marginBottom: 24 }}>{tr.empty}</div>}
          <div className="grid grid--3">
            {courses.map((c) => (
              <article className="card card--hover" key={c.id}>
                <div className="tags">
                  <span className="tag tag--gold"><PawPrint size={12} /> {tr.animals[c.animal]}</span>
                  <span className="tag">{tr.levels[c.level]}</span>
                  <span className="tag">{tr.formats[c.format]}</span>
                </div>
                <h3>{tx(c.title)}</h3>
                <p>{tx(c.description)}</p>
                <ul className="feature-list">
                  <li><Clock size={16} /> {tx(c.duration)}</li>
                  <li><Users size={16} /> {tx(c.audience)}</li>
                  <li><MapPin size={16} /> {tr.where[c.format]}</li>
                </ul>
                <details style={{ margin: '8px 0 4px', fontSize: '0.93rem' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--forest)' }}>{tr.learn}</summary>
                  <ul className="feature-list" style={{ marginTop: 10 }}>
                    {tx(c.modules).map((m) => <li key={m}><CheckCircle2 size={16} /> {m}</li>)}
                  </ul>
                </details>
                <div className="card__foot">
                  <button className="btn btn--primary btn--sm" onClick={() => setEnrolling(c)}>{tr.register}</button>
                </div>
              </article>
            ))}
            <article className="card card--hover" style={{ background: 'var(--cream)' }}>
              <div className="icon-badge"><PawPrint size={26} /></div>
              <h3>{tr.otherTitle}</h3>
              <p>{tr.otherText(tx(OTHER_ANIMALS).join(', '))}</p>
              <div className="card__foot">
                <button className="btn btn--secondary btn--sm" onClick={() => setEnrolling(CUSTOM_REQUEST_ID)}>{tr.requestCourse}</button>
              </div>
            </article>
          </div>
        </div>
      </section>

      <CtaBand title={tr.ctaTitle} text={tr.ctaText} />

      {enrolling && (
        <Modal title={modalTitle} onClose={close}>
          {sent ? (
            <>
              <div className="alert alert--success">
                <CheckCircle2 />
                <span>
                  {tr.thanks(form.name.split(' ')[0])}{' '}
                  {course
                    ? <>{tr.nextIntake} <strong>{tx(course.title)}</strong>.</>
                    : <>{tr.requestAbout} <strong>{otherAnimal.trim()}</strong>.</>}
                </span>
              </div>
              <button className="btn btn--secondary" style={{ marginTop: 20 }} onClick={close}>{t.common.done}</button>
            </>
          ) : (
            <form className="form" onSubmit={submit} style={{ position: 'relative' }}>
              <Honeypot />
              {isCustom && (
                <div className="field">
                  <label htmlFor="en-animal">{tr.whichAnimal}</label>
                  <input id="en-animal" className="input" required maxLength={80} placeholder={tr.whichAnimalPlaceholder} value={otherAnimal} onChange={(e) => setOtherAnimal(e.target.value)} />
                </div>
              )}
              <div className="field">
                <label htmlFor="en-name">{t.common.fullName}</label>
                <input id="en-name" className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="en-phone">{t.common.phone}</label>
                  <input id="en-phone" className="input" type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="en-email">{t.common.emailOptional}</label>
                  <input id="en-email" className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <FormError message={error} />
              <button className="btn btn--primary" type="submit" disabled={submitting}>
                {submitting ? t.common.sending : isCustom ? tr.requestCourse : tr.register}
              </button>
            </form>
          )}
        </Modal>
      )}
    </>
  );
}
