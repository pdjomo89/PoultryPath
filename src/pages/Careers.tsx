import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Briefcase, CheckCircle2, GraduationCap, MapPin, PawPrint, Plus, Search } from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { ANIMALS, SHOW_SAMPLE_JOBS, sampleJobs, type ExperienceLevel, type Job, type JobAnimal, type JobType } from '../data/content';
import { api } from '../../convex/_generated/api';
import { errorMessage, readHoneypot } from '../lib/forms';
import { FormError, Honeypot } from '../components/FormBits';
import Modal from '../components/Modal';
import { useI18n } from '../i18n';
import PageHero from '../components/PageHero';

const EXPERIENCE: ExperienceLevel[] = ['No experience', 'Entry level', 'Experienced'];
const TYPES: JobType[] = ['Full-time', 'Part-time', 'Internship', 'Contract'];

const EMPTY_JOB = {
  title: '', farm: '', location: '', type: 'Full-time' as JobType, experience: 'No experience' as ExperienceLevel,
  trainingProvided: true, animals: [] as JobAnimal[], description: '', requirements: '', contact: '',
};
const EMPTY_APP = { name: '', phone: '', email: '', experience: 'No experience' as ExperienceLevel, message: '' };

export default function Careers() {
  const { t, lang, locale } = useI18n();
  const c = t.careers;
  const [params, setParams] = useSearchParams();
  const postedJobs: Job[] | undefined = useQuery(api.jobs.listApproved);
  const submitApplication = useMutation(api.forms.submitApplication);
  const submitJobPost = useMutation(api.forms.submitJob);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [experience, setExperience] = useState<'' | ExperienceLevel>('');
  const [type, setType] = useState<'' | JobType>('');
  const [animal, setAnimal] = useState<'' | JobAnimal>('');
  const [trainingOnly, setTrainingOnly] = useState(false);

  const [applyFor, setApplyFor] = useState<Job | null>(null);
  const [app, setApp] = useState(EMPTY_APP);
  const [appSent, setAppSent] = useState(false);

  const posting = params.get('post') === '1';
  const [job, setJob] = useState(EMPTY_JOB);
  const [jobSent, setJobSent] = useState(false);

  // Employer posts are shown as written; sample jobs follow the page language.
  const jobs = useMemo(() => {
    const q = query.trim().toLocaleLowerCase(locale);
    return [...(postedJobs ?? []), ...(SHOW_SAMPLE_JOBS ? sampleJobs(lang) : [])].filter(
      (j) =>
        (!q || `${j.title} ${j.farm} ${j.location} ${j.description}`.toLocaleLowerCase(locale).includes(q)) &&
        (!experience || j.experience === experience) &&
        (!type || j.type === type) &&
        (!animal || j.animals.includes(animal)) &&
        (!trainingOnly || j.trainingProvided),
    );
  }, [postedJobs, lang, locale, query, experience, type, animal, trainingOnly]);

  const closeApply = () => { setApplyFor(null); setApp(EMPTY_APP); setAppSent(false); setError(null); };
  const closePost = () => { setParams({}, { replace: true }); setJob(EMPTY_JOB); setJobSent(false); setError(null); };

  /** Shared submit flow: loading state, error message, success flag. */
  const send = async (fn: () => Promise<unknown>, onDone: () => void) => {
    setSubmitting(true);
    setError(null);
    try {
      await fn();
      onDone();
    } catch (err) {
      setError(errorMessage(err, t.common));
    } finally {
      setSubmitting(false);
    }
  };

  const submitApp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!applyFor) return;
    const payload = { jobId: applyFor.id, jobTitle: `${applyFor.title} — ${applyFor.farm}`, ...app };
    const website = readHoneypot(e.currentTarget);
    void send(() => submitApplication({ ...payload, website, lang }), () => setAppSent(true));
  };

  const toggleJobAnimal = (a: JobAnimal) => {
    setError(null);
    setJob((j) => ({ ...j, animals: j.animals.includes(a) ? j.animals.filter((x) => x !== a) : [...j.animals, a] }));
  };

  const submitJob = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (job.animals.length === 0) {
      setError(c.animalsRequired);
      return;
    }
    const payload = { ...job, requirements: job.requirements.split('\n').map((r) => r.trim()).filter(Boolean) };
    const website = readHoneypot(e.currentTarget);
    void send(() => submitJobPost({ ...payload, website, lang }), () => setJobSent(true));
  };

  return (
    <>
      <PageHero eyebrow={c.eyebrow} title={c.title} lead={c.lead} photo="jobs">
        <div className="hero__actions">
          <Link to="/careers?post=1" className="btn btn--secondary"><Plus size={18} /> {c.postJob}</Link>
          <Link to="/training" className="btn btn--outline"><GraduationCap size={18} /> {c.getTraining}</Link>
        </div>
      </PageHero>

      <section className="section" style={{ paddingTop: 48 }}>
        <div className="container">
          <div className="toolbar">
            <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 320 }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--muted)' }} />
              <input className="input" style={{ paddingLeft: 38 }} placeholder={c.search} aria-label={c.searchLabel} value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <select className="select" aria-label={c.animalLabel} value={animal} onChange={(e) => setAnimal(e.target.value as JobAnimal | '')}>
              <option value="">{c.anyAnimal}</option>
              {ANIMALS.map((a) => <option key={a} value={a}>{t.training.animals[a]}</option>)}
            </select>
            <select className="select" aria-label={c.experienceLabel} value={experience} onChange={(e) => setExperience(e.target.value as ExperienceLevel | '')}>
              <option value="">{c.anyExperience}</option>
              {EXPERIENCE.map((x) => <option key={x} value={x}>{c.experience[x]}</option>)}
            </select>
            <select className="select" aria-label={c.typeLabel} value={type} onChange={(e) => setType(e.target.value as JobType | '')}>
              <option value="">{c.anyType}</option>
              {TYPES.map((x) => <option key={x} value={x}>{c.types[x]}</option>)}
            </select>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 500 }}>
              <input type="checkbox" checked={trainingOnly} onChange={(e) => setTrainingOnly(e.target.checked)} style={{ accentColor: 'var(--forest)' }} />
              {c.trainingProvided}
            </label>
          </div>

          <p className="muted" style={{ fontSize: '0.9rem' }}>{c.found(jobs.length)}</p>

          {jobs.length === 0 ? (
            <div className="empty card">{c.none}</div>
          ) : (
            <div className="grid grid--2">
              {jobs.map((j) => (
                <article className="card card--hover" key={j.id}>
                  <div className="tags">
                    <span className={`tag ${j.experience === 'No experience' ? 'tag--gold' : ''}`}>{c.experience[j.experience]}</span>
                    <span className="tag">{c.types[j.type]}</span>
                    {j.trainingProvided && <span className="tag"><GraduationCap size={12} /> {c.trainingProvided}</span>}
                  </div>
                  <h3 style={{ marginBottom: 4 }}>{j.title}</h3>
                  {j.animals.length > 0 && (
                    <div className="job-animals">
                      <PawPrint size={14} /> {j.animals.map((a) => t.training.animals[a]).join(' · ')}
                    </div>
                  )}
                  <div className="muted" style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: '0.9rem', marginBottom: 10 }}>
                    <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}><Briefcase size={14} /> {j.farm}</span>
                    <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}><MapPin size={14} /> {j.location}</span>
                  </div>
                  <p>{j.description}</p>
                  {j.requirements.length > 0 && (
                    <ul className="feature-list">
                      {j.requirements.map((r) => <li key={r}><CheckCircle2 size={16} /> {r}</li>)}
                    </ul>
                  )}
                  <div className="card__foot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <small className="muted">{c.posted(new Date(j.postedAt).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }))}</small>
                    <button className="btn btn--primary btn--sm" onClick={() => setApplyFor(j)}>{c.apply}</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {applyFor && (
        <Modal title={appSent ? c.appSent : c.applyTitle(applyFor.title)} onClose={closeApply}>
          {appSent ? (
            <>
              <div className="alert alert--success">
                <CheckCircle2 /> <span>{c.appThanks(app.name.split(' ')[0])} <strong>{applyFor.title}</strong> {c.appReceived}</span>
              </div>
              {app.experience === 'No experience' && (
                <p style={{ marginTop: 16 }}>{c.tipPre}<Link to="/training">{c.tipLink}</Link>{c.tipPost}</p>
              )}
              <button className="btn btn--secondary" style={{ marginTop: 12 }} onClick={closeApply}>{t.common.done}</button>
            </>
          ) : (
            <form className="form" onSubmit={submitApp} style={{ position: 'relative' }}>
              <Honeypot />
              <div className="field">
                <label htmlFor="ap-name">{t.common.fullName}</label>
                <input id="ap-name" className="input" required value={app.name} onChange={(e) => setApp({ ...app, name: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="ap-phone">{t.common.phone}</label>
                  <input id="ap-phone" className="input" type="tel" required value={app.phone} onChange={(e) => setApp({ ...app, phone: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="ap-email">{t.common.emailOptional}</label>
                  <input id="ap-email" className="input" type="email" value={app.email} onChange={(e) => setApp({ ...app, email: e.target.value })} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="ap-exp">{c.yourExperience}</label>
                <select id="ap-exp" className="select" value={app.experience} onChange={(e) => setApp({ ...app, experience: e.target.value as ExperienceLevel })}>
                  {EXPERIENCE.map((x) => <option key={x} value={x}>{c.experience[x]}</option>)}
                </select>
                <small>{c.newHint}</small>
              </div>
              <div className="field">
                <label htmlFor="ap-msg">{c.why}</label>
                <textarea id="ap-msg" className="textarea" value={app.message} onChange={(e) => setApp({ ...app, message: e.target.value })} />
              </div>
              <FormError message={error} />
              <button className="btn btn--primary" type="submit" disabled={submitting}>{submitting ? t.common.sending : c.submitApp}</button>
            </form>
          )}
        </Modal>
      )}

      {posting && (
        <Modal title={jobSent ? c.jobSent : c.postTitle} onClose={closePost}>
          {jobSent ? (
            <>
              <div className="alert alert--success">
                <CheckCircle2 /> <span>{c.jobThanks} <strong>{job.title}</strong> {c.jobThanksPost}</span>
              </div>
              <button className="btn btn--secondary" style={{ marginTop: 20 }} onClick={closePost}>{c.viewJobs}</button>
            </>
          ) : (
            <form className="form" onSubmit={submitJob} style={{ position: 'relative' }}>
              <Honeypot />
              <div className="field">
                <label htmlFor="jb-title">{c.jobTitle}</label>
                <input id="jb-title" className="input" required value={job.title} onChange={(e) => setJob({ ...job, title: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="jb-farm">{c.farm}</label>
                  <input id="jb-farm" className="input" required value={job.farm} onChange={(e) => setJob({ ...job, farm: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="jb-loc">{t.common.location}</label>
                  <input id="jb-loc" className="input" required value={job.location} onChange={(e) => setJob({ ...job, location: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="jb-type">{c.jobType}</label>
                  <select id="jb-type" className="select" value={job.type} onChange={(e) => setJob({ ...job, type: e.target.value as JobType })}>
                    {TYPES.map((x) => <option key={x} value={x}>{c.types[x]}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="jb-exp">{c.expRequired}</label>
                  <select id="jb-exp" className="select" value={job.experience} onChange={(e) => setJob({ ...job, experience: e.target.value as ExperienceLevel })}>
                    {EXPERIENCE.map((x) => <option key={x} value={x}>{c.experience[x]}</option>)}
                  </select>
                </div>
              </div>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="checkbox" checked={job.trainingProvided} onChange={(e) => setJob({ ...job, trainingProvided: e.target.checked })} style={{ accentColor: 'var(--forest)' }} />
                {c.weTrain}
              </label>
              <fieldset className="field choice-group">
                <legend>{c.animalsField}</legend>
                <div className="choice-chips">
                  {ANIMALS.map((a) => (
                    <label key={a} className={`choice-chip ${job.animals.includes(a) ? 'checked' : ''}`}>
                      <input type="checkbox" checked={job.animals.includes(a)} onChange={() => toggleJobAnimal(a)} />
                      {t.training.animals[a]}
                    </label>
                  ))}
                </div>
                <small>{c.animalsHint}</small>
              </fieldset>
              <div className="field">
                <label htmlFor="jb-desc">{c.description}</label>
                <textarea id="jb-desc" className="textarea" required value={job.description} onChange={(e) => setJob({ ...job, description: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="jb-req">{c.requirements}</label>
                <textarea id="jb-req" className="textarea" placeholder={c.onePerLine} value={job.requirements} onChange={(e) => setJob({ ...job, requirements: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="jb-contact">{c.contact}</label>
                <input id="jb-contact" className="input" required value={job.contact} onChange={(e) => setJob({ ...job, contact: e.target.value })} />
                <small>{c.contactHint}</small>
              </div>
              <FormError message={error} />
              <button className="btn btn--primary" type="submit" disabled={submitting}>{submitting ? t.common.sending : c.submitJob}</button>
            </form>
          )}
        </Modal>
      )}
    </>
  );
}
