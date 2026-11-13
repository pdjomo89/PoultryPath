import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarCheck, CheckCircle2, Clock, Mail, Phone } from 'lucide-react';
import { useMutation } from 'convex/react';
import { SERVICES } from '../data/content';
import { api } from '../../convex/_generated/api';
import { errorMessage, fieldErrors, readHoneypot, type FieldErrors } from '../lib/forms';
import { FormError, Honeypot } from '../components/FormBits';
import { useI18n } from '../i18n';
import PageHero from '../components/PageHero';
import { WhatsAppIcon } from '../components/WhatsApp';
import { PHONE, whatsappUrl } from '../data/site';
import type { Messages } from '../i18n/messages';

/*
 * Option values are stored in English (so your admin inbox reads consistently);
 * only their labels are translated.
 */
type ContactText = Messages['contact'];
const STAGE_VALUES: (keyof ContactText['stages'])[] = [
  'Just an idea', 'Planning / raising funds', 'Farm under construction', 'Running a farm (< 2 years)', 'Established farm (2+ years)',
];
const ANIMAL_VALUES: (keyof ContactText['animalOptions'])[] = [
  'Poultry', 'Pigs', 'Goats', 'Sheep', 'Rabbits', 'Cattle', 'Fish', 'Bees', 'Mixed / several', 'Other', 'Not decided yet',
];
// Stored under the `flock` key so older submissions stay consistent.
const FARM_SIZE_VALUES: (keyof ContactText['farmSizes'])[] = [
  'Backyard / just starting', 'Small commercial', 'Medium commercial', 'Large commercial', 'Not sure yet',
];
const METHOD_VALUES: (keyof ContactText['methods'])[] = ['Phone call', 'WhatsApp', 'Email', 'Video call'];

export default function Contact() {
  const { t, tx, lang } = useI18n();
  const c = t.contact;
  const [params] = useSearchParams();
  const initialService = SERVICES.some((s) => s.id === params.get('service')) ? params.get('service')! : 'startup';

  const [form, setForm] = useState({
    name: '', email: '', phone: '', location: '',
    service: initialService,
    stage: STAGE_VALUES[0] as string,
    animals: ANIMAL_VALUES[0] as string,
    flock: FARM_SIZE_VALUES[4] as string,
    contactMethod: METHOD_VALUES[0] as string,
    message: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const submitConsultation = useMutation(api.forms.submitConsultation);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs: FieldErrors = {};
    if (!form.name.trim()) errs.name = c.errors.name;
    if (!form.email.trim() && !form.phone.trim()) errs.phone = c.errors.phoneOrEmail;
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) errs.email = c.errors.email;
    setErrors(errs);
    setServerError(null);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      await submitConsultation({ ...form, website: readHoneypot(e.currentTarget), lang });
      setSent(true);
    } catch (err) {
      setErrors(fieldErrors(err));
      setServerError(errorMessage(err, t.common));
    } finally {
      setSubmitting(false);
    }
  };

  const method = form.contactMethod as keyof ContactText['methods'];

  return (
    <>
      <PageHero eyebrow={c.eyebrow} title={c.title} lead={c.lead} photo="contact" />

      <section className="section" style={{ paddingTop: 48 }}>
        <div className="container contact-grid">
          <div className="card">
            {sent ? (
              <div>
                <div className="alert alert--success" style={{ marginBottom: 20 }}>
                  <CheckCircle2 /> <span><strong>{c.thanks(form.name.split(' ')[0])}</strong> {c.received}</span>
                </div>
                <p>{c.contactPre} <strong>{c.methodsInSentence[method]}</strong> {c.contactPost}</p>
                <button className="btn btn--secondary" onClick={() => { setSent(false); setForm({ ...form, message: '' }); }}>{c.another}</button>
              </div>
            ) : (
              <form className="form" onSubmit={submit} noValidate style={{ position: 'relative' }}>
                <Honeypot />
                <div className="form-row">
                  <div className="field">
                    <label htmlFor="c-name">{c.fullNameRequired}</label>
                    <input id="c-name" className="input" value={form.name} onChange={set('name')} />
                    {errors.name && <span className="error">{errors.name}</span>}
                  </div>
                  <div className="field">
                    <label htmlFor="c-loc">{t.common.location}</label>
                    <input id="c-loc" className="input" placeholder={c.locationPlaceholder} value={form.location} onChange={set('location')} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="field">
                    <label htmlFor="c-phone">{t.common.phone}</label>
                    <input id="c-phone" className="input" type="tel" value={form.phone} onChange={set('phone')} />
                    {errors.phone && <span className="error">{errors.phone}</span>}
                  </div>
                  <div className="field">
                    <label htmlFor="c-email">{t.common.email}</label>
                    <input id="c-email" className="input" type="email" value={form.email} onChange={set('email')} />
                    {errors.email && <span className="error">{errors.email}</span>}
                  </div>
                </div>
                <div className="form-row">
                  <div className="field">
                    <label htmlFor="c-service">{c.service}</label>
                    <select id="c-service" className="select" value={form.service} onChange={set('service')}>
                      {SERVICES.map((s) => <option key={s.id} value={s.id}>{tx(s.title)}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="c-stage">{c.stage}</label>
                    <select id="c-stage" className="select" value={form.stage} onChange={set('stage')}>
                      {STAGE_VALUES.map((v) => <option key={v} value={v}>{c.stages[v]}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="field">
                    <label htmlFor="c-animals">{c.animals}</label>
                    <select id="c-animals" className="select" value={form.animals} onChange={set('animals')}>
                      {ANIMAL_VALUES.map((v) => <option key={v} value={v}>{c.animalOptions[v]}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="c-flock">{c.farmSize}</label>
                    <select id="c-flock" className="select" value={form.flock} onChange={set('flock')}>
                      {FARM_SIZE_VALUES.map((v) => <option key={v} value={v}>{c.farmSizes[v]}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="field">
                    <label htmlFor="c-method">{c.method}</label>
                    <select id="c-method" className="select" value={form.contactMethod} onChange={set('contactMethod')}>
                      {METHOD_VALUES.map((v) => <option key={v} value={v}>{c.methods[v]}</option>)}
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="c-msg">{c.goals}</label>
                  <textarea id="c-msg" className="textarea" placeholder={c.goalsPlaceholder} value={form.message} onChange={set('message')} />
                </div>
                <FormError message={serverError} />
                <div>
                  <button className="btn btn--primary" type="submit" disabled={submitting}>
                    <CalendarCheck size={18} /> {submitting ? t.common.sending : c.submit}
                  </button>
                </div>
              </form>
            )}
          </div>

          <aside className="card" style={{ background: 'var(--cream)' }}>
            <h3>{c.nextTitle}</h3>
            <ul className="checklist" style={{ marginBottom: 24 }}>
              {[Clock, CalendarCheck, CheckCircle2].map((Icon, i) => (
                <li key={i}><Icon size={20} /> {c.next[i]}</li>
              ))}
            </ul>
            <h4 style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem' }}>{c.direct}</h4>
            <ul className="footer__list" style={{ color: 'var(--ink)' }}>
              <li style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Phone size={16} color="var(--gold-dark)" /> <a href={PHONE.tel}>{PHONE.display}</a></li>
              <li style={{ display: 'flex', gap: 8, alignItems: 'center' }}><WhatsAppIcon size={16} color="var(--gold-dark)" /> <a href={whatsappUrl(t.whatsapp.greeting)} target="_blank" rel="noopener noreferrer">{t.whatsapp.chat}</a></li>
              <li style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Mail size={16} color="var(--gold-dark)" /> <a href="mailto:poultrypathconsult@gmail.com">poultrypathconsult@gmail.com</a></li>
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}
