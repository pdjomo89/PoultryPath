import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { Check, Inbox, LogOut, RotateCcw, Trash2, X } from 'lucide-react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { errorMessage, isUnauthorized } from '../lib/forms';
import { FormError } from '../components/FormBits';

type SubmissionType = 'consultation' | 'application' | 'enrolment' | 'job';

interface Submission {
  id: Id<'submissions'>;
  type: SubmissionType;
  status: string;
  data: Record<string, unknown>;
  submittedAt: number;
}

const TABS: { type: SubmissionType; label: string; open: string }[] = [
  { type: 'consultation', label: 'Consultations', open: 'new' },
  { type: 'application', label: 'Job applications', open: 'new' },
  { type: 'enrolment', label: 'Course registrations', open: 'new' },
  { type: 'job', label: 'Job posts', open: 'pending' },
];

const SERVICE_NAMES: Record<string, string> = {
  startup: 'Business Start-Up', management: 'Farm Management', training: 'Training & Mentorship',
  hiring: 'Hiring & Workforce', profitability: 'Profitability Planning', investors: 'Investor & Expansion',
};

const LABELS: Record<string, string> = {
  contactMethod: 'Preferred contact', flock: 'Farm size', jobTitle: 'Job', courseTitle: 'Course',
  trainingProvided: 'Training provided',
};
const humanize = (k: string) => LABELS[k] ?? k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

const TOKEN_KEY = 'poultryfarm:admin';
const readToken = () => { try { return sessionStorage.getItem(TOKEN_KEY) ?? ''; } catch { return ''; } };
const writeToken = (t: string) => { try { t ? sessionStorage.setItem(TOKEN_KEY, t) : sessionStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ } };

function Value({ k, v }: { k: string; v: unknown }) {
  if (Array.isArray(v)) return v.length ? <ul style={{ margin: 0, paddingLeft: 18 }}>{v.map((x) => <li key={String(x)}>{String(x)}</li>)}</ul> : <>—</>;
  if (typeof v === 'boolean') return <>{v ? 'Yes' : 'No'}</>;
  const s = v == null || v === '' ? '—' : String(v);
  if (k === 'email' && s !== '—') return <a href={`mailto:${s}`}>{s}</a>;
  if (k === 'phone' && s !== '—') return <a href={`tel:${s.replace(/\s/g, '')}`}>{s}</a>;
  if (k === 'service') return <>{SERVICE_NAMES[s] ?? s}</>;
  return <span style={{ whiteSpace: 'pre-wrap' }}>{s}</span>;
}

function SubmissionCard({ s, onStatus, onDelete, busy }: {
  s: Submission; busy: boolean;
  onStatus: (status: string) => void; onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const title = String(s.data.name ?? s.data.title ?? `#${s.id}`);
  const subtitle = String(s.data.jobTitle ?? s.data.courseTitle ?? s.data.farm ?? (s.data.service ? SERVICE_NAMES[String(s.data.service)] : '') ?? '');
  const statusTag = { new: 'tag--gold', pending: 'tag--gold', approved: '', handled: '', rejected: 'tag--muted' }[s.status] ?? '';

  return (
    <article className="card admin-item">
      <header className="admin-item__head">
        <div>
          <h3 style={{ marginBottom: 2 }}>{title}</h3>
          {subtitle && <div className="muted" style={{ fontSize: '0.9rem' }}>{subtitle}</div>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className={`tag ${statusTag}`}>{s.status}</span>
          <div className="muted" style={{ fontSize: '0.8rem', marginTop: 4 }}>
            {new Date(s.submittedAt).toLocaleString()}
          </div>
        </div>
      </header>
      <dl className="admin-item__data">
        {Object.entries(s.data)
          .filter(([k]) => !['name', 'title', 'jobId', 'courseId'].includes(k))
          .map(([k, v]) => (
            <div key={k}><dt>{humanize(k)}</dt><dd><Value k={k} v={v} /></dd></div>
          ))}
      </dl>
      <div className="admin-item__actions">
        {s.type === 'job' ? (
          <>
            {s.status !== 'approved' && <button className="btn btn--secondary btn--sm" disabled={busy} onClick={() => onStatus('approved')}><Check size={16} /> Approve & publish</button>}
            {s.status !== 'rejected' && <button className="btn btn--outline btn--sm" disabled={busy} onClick={() => onStatus('rejected')}><X size={16} /> {s.status === 'approved' ? 'Unpublish' : 'Reject'}</button>}
          </>
        ) : s.status === 'new' ? (
          <button className="btn btn--secondary btn--sm" disabled={busy} onClick={() => onStatus('handled')}><Check size={16} /> Mark handled</button>
        ) : (
          <button className="btn btn--outline btn--sm" disabled={busy} onClick={() => onStatus('new')}><RotateCcw size={16} /> Reopen</button>
        )}
        <span style={{ flex: 1 }} />
        {confirmDelete ? (
          <>
            <span className="muted" style={{ fontSize: '0.88rem' }}>Delete permanently?</span>
            <button className="btn btn--danger btn--sm" disabled={busy} onClick={onDelete}>Delete</button>
            <button className="btn btn--outline btn--sm" onClick={() => setConfirmDelete(false)}>Cancel</button>
          </>
        ) : (
          <button className="icon-btn" aria-label="Delete" title="Delete" onClick={() => setConfirmDelete(true)}><Trash2 size={18} /></button>
        )}
      </div>
    </article>
  );
}

export default function Admin() {
  const [token, setToken] = useState(readToken);
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<SubmissionType>('consultation');
  const [showClosed, setShowClosed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [busyId, setBusyId] = useState<Id<'submissions'> | null>(null);

  const loginMutation = useMutation(api.admin.login);
  const logoutMutation = useMutation(api.admin.logout);
  const setStatusMutation = useMutation(api.admin.setStatus);
  const removeMutation = useMutation(api.admin.remove);

  // Live query: new submissions appear without refreshing. null = session invalid/expired.
  const items = useQuery(api.admin.list, token ? { token } : 'skip');

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  const signOut = useCallback((msg: string | null = null) => {
    writeToken('');
    setToken('');
    setError(msg);
  }, []);

  useEffect(() => {
    if (token && items === null) signOut('Your session has expired — please sign in again.');
  }, [token, items, signOut]);

  const handleError = (err: unknown) => (isUnauthorized(err) ? signOut(errorMessage(err)) : setError(errorMessage(err)));

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigningIn(true);
    setError(null);
    try {
      const result = await loginMutation({ password });
      if (result.ok) {
        writeToken(result.token);
        setToken(result.token);
        setPassword('');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSigningIn(false);
    }
  };

  const logout = () => {
    void logoutMutation({ token }).catch(() => {});
    signOut();
  };

  const act = async (id: Id<'submissions'>, fn: () => Promise<unknown>) => {
    setBusyId(id);
    setError(null);
    try { await fn(); } catch (err) { handleError(err); } finally { setBusyId(null); }
  };

  const current = TABS.find((t) => t.type === tab)!;
  const openCounts = useMemo(() => Object.fromEntries(
    TABS.map((t) => [t.type, items?.filter((s) => s.type === t.type && s.status === t.open).length ?? 0]),
  ), [items]);
  const visible = (items ?? []).filter((s) => s.type === tab && (showClosed || s.status === current.open));

  if (!token || !items) {
    const loading = !!token && items === undefined;
    return (
      <section className="page-hero" style={{ minHeight: '60vh' }}>
        <div className="container" style={{ maxWidth: 440 }}>
          <span className="eyebrow">Admin</span>
          <h1 style={{ fontSize: '2rem' }}>Submissions inbox</h1>
          {loading ? <p className="muted">Loading…</p> : (
            <form className="card form" onSubmit={login}>
              <div className="field">
                <label htmlFor="admin-pw">Admin password</label>
                <input id="admin-pw" className="input" type="password" autoComplete="current-password" required autoFocus value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <FormError message={error} />
              <button className="btn btn--primary" type="submit" disabled={signingIn}>{signingIn ? 'Checking…' : 'Sign in'}</button>
            </form>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="section" style={{ paddingTop: 40 }}>
      <div className="container">
        <div className="admin-head">
          <div>
            <span className="eyebrow">Admin</span>
            <h1 style={{ fontSize: '2rem', marginBottom: 0 }}>Submissions inbox</h1>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span className="muted" style={{ fontSize: '0.85rem' }}>● Live</span>
            <button className="btn btn--outline btn--sm" onClick={logout}><LogOut size={16} /> Sign out</button>
          </div>
        </div>

        <div className="toolbar" style={{ marginTop: 24 }}>
          <div className="segmented" role="tablist" aria-label="Submission type">
            {TABS.map((t) => (
              <button key={t.type} role="tab" aria-selected={tab === t.type} className={tab === t.type ? 'active' : ''} onClick={() => setTab(t.type)}>
                {t.label}{openCounts[t.type] ? <span className="count">{openCounts[t.type]}</span> : null}
              </button>
            ))}
          </div>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 500 }}>
            <input type="checkbox" checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} style={{ accentColor: 'var(--forest)' }} />
            Show {tab === 'job' ? 'approved & rejected' : 'handled'}
          </label>
        </div>

        <FormError message={error} />

        {visible.length === 0 ? (
          <div className="card empty">
            <Inbox size={40} style={{ margin: '0 auto 12px', color: 'var(--gold-dark)' }} />
            {showClosed ? 'Nothing here yet.' : `No ${current.open} ${current.label.toLowerCase()} — you’re all caught up.`}
          </div>
        ) : (
          <div className="grid" style={{ marginTop: 8 }}>
            {visible.map((s) => (
              <SubmissionCard key={s.id} s={s} busy={busyId === s.id} onStatus={(status) => act(s.id, () => setStatusMutation({ token, id: s.id, status }))}
                onDelete={() => act(s.id, () => removeMutation({ token, id: s.id }))} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
