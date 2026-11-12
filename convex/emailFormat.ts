import type { Doc } from './_generated/dataModel';

const TITLES: Record<Doc<'submissions'>['type'], string> = {
  consultation: 'New consultation request',
  application: 'New job application',
  enrolment: 'New course registration',
  job: 'New job post awaiting approval',
};

const LABELS: Record<string, string> = {
  contactMethod: 'Preferred contact',
  flock: 'Farm size',
  jobTitle: 'Job',
  courseTitle: 'Course',
  trainingProvided: 'Training provided',
};

const humanize = (key: string) =>
  LABELS[key] ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

function formatValue(v: unknown): string {
  if (Array.isArray(v)) return v.length ? v.map((x) => `\n  - ${x}`).join('') : '—';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  return v === '' || v == null ? '—' : String(v);
}

/** Plain-text notification email for a new submission. */
export function formatEmail(s: Pick<Doc<'submissions'>, 'type' | 'data' | 'submittedAt'>, adminUrl?: string) {
  const d = (s.data ?? {}) as Record<string, unknown>;
  const who = String(d.name ?? d.farm ?? '');
  const subject = `${TITLES[s.type]}${who ? ` — ${who}` : ''}`;
  const lines = Object.entries(d)
    .filter(([k]) => !k.endsWith('Id'))
    .map(([k, v]) => `${humanize(k)}: ${formatValue(v)}`);
  const text = [
    `${TITLES[s.type]} received ${new Date(s.submittedAt).toUTCString()}`,
    '',
    ...lines,
    '',
    adminUrl ? `Review it in the admin inbox: ${adminUrl}` : '',
  ].join('\n');
  return { subject, text, replyTo: typeof d.email === 'string' && d.email ? d.email : undefined };
}
