import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { Eye, EyeOff, Newspaper, Pencil, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { errorMessage, fieldErrors, isUnauthorized, type FieldErrors } from '../lib/forms';
import { FormError } from '../components/FormBits';

const EMPTY = { titleEn: '', summaryEn: '', bodyEn: '', titleFr: '', summaryFr: '', bodyFr: '' };
type Draft = typeof EMPTY;

const dateTime = (at: number) => new Date(at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && <small>{hint}</small>}
      {error && <span className="error">{error}</span>}
    </div>
  );
}

function Editor({ token, id, initial, onDone, onUnauthorized }: {
  token: string;
  id?: Id<'news'>;
  initial: Draft;
  onDone: () => void;
  onUnauthorized: (msg: string) => void;
}) {
  const save = useMutation(api.news.save);
  const [draft, setDraft] = useState(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDraft((d) => ({ ...d, [k]: e.target.value }));
    setErrors((errs) => ({ ...errs, [k]: '' }));
  };

  const submit = async (publish: boolean) => {
    setBusy(true);
    setError(null);
    setErrors({});
    try {
      await save({ token, id, publish, ...draft });
      onDone();
    } catch (err) {
      if (isUnauthorized(err)) return onUnauthorized(errorMessage(err));
      setErrors(fieldErrors(err));
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const lang = (code: 'En' | 'Fr', name: string, required: boolean) => {
    const k = (f: 'title' | 'summary' | 'body') => `${f}${code}` as keyof Draft;
    return (
      <fieldset>
        <legend>{name}{required ? '' : ' (optional)'}</legend>
        <Field id={k('title')} label="Title" error={errors[k('title')]}>
          <input id={k('title')} className="input" maxLength={150} required={required} value={draft[k('title')]} onChange={set(k('title'))} />
        </Field>
        <Field id={k('summary')} label="Summary (optional)" hint="One or two sentences for the news list. Left empty, the start of the article is used." error={errors[k('summary')]}>
          <textarea id={k('summary')} className="textarea" style={{ minHeight: 80 }} maxLength={300} value={draft[k('summary')]} onChange={set(k('summary'))} />
        </Field>
        <Field id={k('body')} label="Article" hint="Plain text. Leave a blank line between paragraphs." error={errors[k('body')]}>
          <textarea id={k('body')} className="textarea textarea--long" required={required} value={draft[k('body')]} onChange={set(k('body'))} />
        </Field>
      </fieldset>
    );
  };

  return (
    <form className="card news-editor" onSubmit={(e) => { e.preventDefault(); void submit(true); }}>
      <h2 style={{ fontSize: '1.4rem', margin: 0 }}>{id ? 'Edit article' : 'New article'}</h2>
      <p className="muted" style={{ margin: 0 }}>
        English is required. Without a French version, French visitors see the English article with a short note.
      </p>
      <div className="news-editor__langs">
        {lang('En', 'English', true)}
        {lang('Fr', 'French', false)}
      </div>
      <FormError message={error} />
      <div className="admin-item__actions" style={{ marginTop: 0 }}>
        <button className="btn btn--secondary btn--sm" type="submit" disabled={busy}><Eye size={16} /> {busy ? 'Saving…' : 'Save & publish'}</button>
        <button className="btn btn--outline btn--sm" type="button" disabled={busy} onClick={() => void submit(false)}>Save as draft</button>
        <span style={{ flex: 1 }} />
        <button className="btn btn--outline btn--sm" type="button" disabled={busy} onClick={onDone}>Cancel</button>
      </div>
    </form>
  );
}

/** News tab of the admin page: write, edit, publish, unpublish and delete articles. */
export default function AdminNews({ token, onUnauthorized }: { token: string; onUnauthorized: (msg: string) => void }) {
  const articles = useQuery(api.news.adminList, { token });
  const setPublished = useMutation(api.news.setPublished);
  const remove = useMutation(api.news.remove);
  const [editing, setEditing] = useState<{ id?: Id<'news'>; initial: Draft } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Id<'news'> | null>(null);
  const [busyId, setBusyId] = useState<Id<'news'> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const act = async (id: Id<'news'>, fn: () => Promise<unknown>) => {
    setBusyId(id);
    setError(null);
    try { await fn(); } catch (err) {
      if (isUnauthorized(err)) onUnauthorized(errorMessage(err));
      else setError(errorMessage(err));
    } finally { setBusyId(null); }
  };

  if (editing) {
    return <Editor token={token} id={editing.id} initial={editing.initial} onDone={() => setEditing(null)} onUnauthorized={onUnauthorized} />;
  }

  return (
    <>
      <div className="toolbar" style={{ justifyContent: 'space-between' }}>
        <p className="muted" style={{ margin: 0 }}>
          Published articles appear on the <Link to="/news">News page</Link> straight away.
        </p>
        <button className="btn btn--secondary btn--sm" onClick={() => setEditing({ initial: EMPTY })}><Plus size={16} /> New article</button>
      </div>
      <FormError message={error} />
      {articles === undefined ? (
        <p className="muted">Loading…</p>
      ) : !articles || articles.length === 0 ? (
        <div className="card empty">
          <Newspaper size={40} style={{ margin: '0 auto 12px', color: 'var(--gold-dark)' }} />
          No articles yet. Click <strong>New article</strong> to write the first one.
        </div>
      ) : (
        <div className="grid" style={{ marginTop: 8 }}>
          {articles.map((a) => {
            const busy = busyId === a.id;
            const published = a.status === 'published';
            return (
              <article className="card admin-item" key={a.id}>
                <header className="admin-item__head">
                  <div>
                    <h3 style={{ marginBottom: 2 }}>{a.titleEn}</h3>
                    <div className="muted" style={{ fontSize: '0.9rem' }}>{a.titleFr || 'No French version'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`tag ${published ? '' : 'tag--muted'}`}>{published ? 'published' : 'draft'}</span>
                    <div className="muted" style={{ fontSize: '0.8rem', marginTop: 4 }}>
                      {a.publishedAt ? `Published ${dateTime(a.publishedAt)}` : `Saved ${dateTime(a.updatedAt)}`}
                    </div>
                  </div>
                </header>
                <div className="admin-item__actions">
                  <button className="btn btn--outline btn--sm" disabled={busy}
                    onClick={() => setEditing({ id: a.id, initial: { titleEn: a.titleEn, summaryEn: a.summaryEn, bodyEn: a.bodyEn, titleFr: a.titleFr, summaryFr: a.summaryFr, bodyFr: a.bodyFr } })}>
                    <Pencil size={16} /> Edit
                  </button>
                  {published ? (
                    <>
                      <Link className="btn btn--outline btn--sm" to={`/news/${a.id}`}>View</Link>
                      <button className="btn btn--outline btn--sm" disabled={busy} onClick={() => act(a.id, () => setPublished({ token, id: a.id, published: false }))}><EyeOff size={16} /> Unpublish</button>
                    </>
                  ) : (
                    <button className="btn btn--secondary btn--sm" disabled={busy} onClick={() => act(a.id, () => setPublished({ token, id: a.id, published: true }))}><Eye size={16} /> Publish</button>
                  )}
                  <span style={{ flex: 1 }} />
                  {confirmDelete === a.id ? (
                    <>
                      <span className="muted" style={{ fontSize: '0.88rem' }}>Delete permanently?</span>
                      <button className="btn btn--danger btn--sm" disabled={busy} onClick={() => act(a.id, () => remove({ token, id: a.id }))}>Delete</button>
                      <button className="btn btn--outline btn--sm" onClick={() => setConfirmDelete(null)}>Cancel</button>
                    </>
                  ) : (
                    <button className="icon-btn" aria-label="Delete" title="Delete" onClick={() => setConfirmDelete(a.id)}><Trash2 size={18} /></button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
