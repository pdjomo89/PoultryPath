/// <reference types="vite/client" />
import { convexTest } from 'convex-test';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, internal } from './_generated/api';
import schema from './schema';
import { formatEmail } from './emailFormat';

const modules = import.meta.glob('./**/!(*.test).ts');
const PASSWORD = 'test-password-123';

const consultation = { name: 'Ama Mensah', phone: '+233 20 000 0000', service: 'startup', animals: 'Goats', message: 'Starting a 50-doe goat farm' };
const job = {
  title: 'Farm Attendant', farm: 'Test Farm', location: 'Kumasi', type: 'Full-time' as const,
  experience: 'No experience' as const, trainingProvided: true, animals: ['Pigs', 'Goats', 'Pigs'] as ('Pigs' | 'Goats')[], description: 'Daily care',
  requirements: ['Punctual', '  '], contact: 'owner@testfarm.example',
};

/** Error payload thrown by a ConvexError in a mutation. */
async function errorData(p: Promise<unknown>) {
  try {
    await p;
  } catch (err) {
    return JSON.parse((err as Error).message) as { message: string; fields?: Record<string, string> };
  }
  throw new Error('Expected the call to fail');
}

let t: ReturnType<typeof convexTest>;
beforeEach(() => {
  // Fake timers keep scheduled email actions from running in the background.
  vi.useFakeTimers();
  vi.stubEnv('ADMIN_PASSWORD', PASSWORD);
  t = convexTest(schema, modules);
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

const all = () => t.run((ctx) => ctx.db.query('submissions').collect());
const signIn = async () => {
  const r = await t.mutation(api.admin.login, { password: PASSWORD });
  if (!r.ok) throw new Error(r.error);
  return r.token;
};

describe('public forms', () => {
  it('stores a consultation and schedules an email', async () => {
    await t.mutation(api.forms.submitConsultation, consultation);
    const [row] = await all();
    expect(row).toMatchObject({ type: 'consultation', status: 'new', data: { name: 'Ama Mensah', email: '', animals: 'Goats' } });
    const scheduled = await t.run((ctx) => ctx.db.system.query('_scheduled_functions').collect());
    expect(scheduled).toHaveLength(1);
    expect(scheduled[0].name).toContain('notify');
  });

  it('requires a phone number or email', async () => {
    const err = await errorData(t.mutation(api.forms.submitConsultation, { ...consultation, phone: '' }));
    expect(err.fields?.phone).toBeTruthy();
    expect(await all()).toHaveLength(0);
  });

  it('reports every invalid field at once', async () => {
    const err = await errorData(t.mutation(api.forms.submitApplication, {
      jobId: 'x', jobTitle: 'X', name: ' ', phone: '1', experience: 'Experienced', email: 'not-an-email',
    }));
    expect(Object.keys(err.fields ?? {}).sort()).toEqual(['email', 'name']);
  });

  it('silently drops honeypot submissions', async () => {
    const r = await t.mutation(api.forms.submitConsultation, { ...consultation, website: 'http://spam.example' });
    expect(r.ok).toBe(true);
    expect(await all()).toHaveLength(0);
  });

  it('caps submissions per form to stop floods', async () => {
    await t.run((ctx) => ctx.db.insert('rateLimits', { key: 'form:enrolment', windowStart: Date.now(), count: 100 }));
    const err = await errorData(t.mutation(api.forms.submitEnrolment, { courseId: 'intro', courseTitle: 'Foundations', name: 'Kofi', phone: '123' }));
    expect(err.message).toMatch(/try again/);
  });
});

describe('job moderation', () => {
  it('lists jobs only after approval, without the employer contact', async () => {
    await t.mutation(api.forms.submitJob, job);
    expect(await t.query(api.jobs.listApproved, {})).toHaveLength(0);

    const token = await signIn();
    const [row] = await all();
    expect(row.status).toBe('pending');
    expect(row.data.requirements).toEqual(['Punctual']);
    await t.mutation(api.admin.setStatus, { token, id: row._id, status: 'approved' });

    const jobs = await t.query(api.jobs.listApproved, {});
    expect(jobs).toHaveLength(1);
    expect(jobs[0]).toMatchObject({ id: `job-${row._id}`, title: 'Farm Attendant', animals: ['Pigs', 'Goats'] });
    expect(jobs[0]).not.toHaveProperty('contact');
  });

  it('rejects statuses that do not fit the type', async () => {
    await t.mutation(api.forms.submitJob, job);
    const token = await signIn();
    const [row] = await all();
    const err = await errorData(t.mutation(api.admin.setStatus, { token, id: row._id, status: 'handled' }));
    expect(err.message).toMatch(/pending, approved, rejected/);
  });
});

describe('admin', () => {
  it('rejects wrong passwords and invalid sessions', async () => {
    expect(await t.mutation(api.admin.login, { password: 'wrong' })).toEqual({ ok: false, error: 'Wrong password.' });
    expect(await t.query(api.admin.list, { token: 'bogus' })).toBeNull();
    await t.mutation(api.forms.submitJob, job);
    const [row] = await all();
    const err = await errorData(t.mutation(api.admin.remove, { token: 'bogus', id: row._id }));
    expect(err.message).toMatch(/sign in/);
  });

  it('locks out after 10 failed attempts, even with the right password', async () => {
    for (let i = 0; i < 10; i++) await t.mutation(api.admin.login, { password: 'wrong' });
    const r = await t.mutation(api.admin.login, { password: PASSWORD });
    expect(r.ok).toBe(false);
    expect(!r.ok && r.error).toMatch(/Too many/);
  });

  it('expires sessions and signs out', async () => {
    const token = await signIn();
    expect(await t.query(api.admin.list, { token })).toEqual([]);
    vi.advanceTimersByTime(13 * 60 * 60_000);
    expect(await t.query(api.admin.list, { token })).toBeNull();

    const token2 = await signIn();
    await t.mutation(api.admin.logout, { token: token2 });
    expect(await t.query(api.admin.list, { token: token2 })).toBeNull();
  });

  it('is disabled when no password is configured', async () => {
    vi.stubEnv('ADMIN_PASSWORD', '');
    const r = await t.mutation(api.admin.login, { password: '' });
    expect(!r.ok && r.error).toMatch(/disabled/);
  });

  it('lists newest first, updates and deletes', async () => {
    await t.mutation(api.forms.submitConsultation, consultation);
    vi.advanceTimersByTime(1000);
    await t.mutation(api.forms.submitEnrolment, { courseId: 'intro', courseTitle: 'Foundations', name: 'Kofi', phone: '123' });
    const token = await signIn();

    const items = (await t.query(api.admin.list, { token }))!;
    expect(items.map((i) => i.type)).toEqual(['enrolment', 'consultation']);

    await t.mutation(api.admin.setStatus, { token, id: items[0].id, status: 'handled' });
    await t.mutation(api.admin.remove, { token, id: items[1].id });
    const after = (await t.query(api.admin.list, { token }))!;
    expect(after).toHaveLength(1);
    expect(after[0].status).toBe('handled');
  });

  it('cleanup removes expired sessions', async () => {
    await signIn();
    vi.advanceTimersByTime(13 * 60 * 60_000);
    await t.mutation(internal.admin.cleanup, {});
    expect(await t.run((ctx) => ctx.db.query('adminSessions').collect())).toHaveLength(0);
  });
});

describe('notification email', () => {
  it('formats a readable subject and body with reply-to', () => {
    const email = formatEmail(
      { type: 'consultation', submittedAt: Date.UTC(2026, 10, 12), data: { name: 'Ama', email: 'ama@example.com', contactMethod: 'WhatsApp' } },
      'https://poultrypath.example/admin',
    );
    expect(email.subject).toBe('New consultation request — Ama');
    expect(email.text).toContain('Preferred contact: WhatsApp');
    expect(email.text).toContain('https://poultrypath.example/admin');
    expect(email.replyTo).toBe('ama@example.com');
  });
});

describe('languages', () => {
  it('returns validation messages in French when asked', async () => {
    const err = await errorData(t.mutation(api.forms.submitConsultation, { ...consultation, name: ' ', phone: '', lang: 'fr' }));
    expect(err.message).toBe('Veuillez vérifier les champs signalés.');
    expect(err.fields?.name).toBe('Nom : champ obligatoire.');
    expect(err.fields?.phone).toBe('Veuillez indiquer un numéro de téléphone ou un e-mail.');
  });

  it('defaults to English and records the visitor language on each submission', async () => {
    const err = await errorData(t.mutation(api.forms.submitEnrolment, { courseId: 'x', courseTitle: 'X', name: '', phone: '1' }));
    expect(err.fields?.name).toBe('Name is required.');

    await t.mutation(api.forms.submitConsultation, { ...consultation, lang: 'fr' });
    await t.mutation(api.forms.submitConsultation, consultation);
    const languages = (await all()).map((s) => s.data.language).sort();
    expect(languages).toEqual(['English', 'French']);
  });
});
