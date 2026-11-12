'use node';

import nodemailer from 'nodemailer';
import { v } from 'convex/values';
import { internalAction } from './_generated/server';
import { internal } from './_generated/api';
import { formatEmail } from './emailFormat';

/**
 * Emails a new submission to the business owner. Configure with
 * `npx convex env set NAME value` — see .env.example for the variables.
 * Without SMTP settings it only logs (visible in the Convex dashboard).
 * Failures are logged, never surfaced to the visitor: the submission is
 * already saved and visible in the admin inbox.
 */
export const send = internalAction({
  args: { id: v.id('submissions') },
  handler: async (ctx, { id }) => {
    const submission = await ctx.runQuery(internal.forms.get, { id });
    if (!submission) return;

    const env = process.env;
    const siteUrl = env.SITE_URL?.replace(/\/$/, '');
    const { subject, text, replyTo } = formatEmail(submission, siteUrl ? `${siteUrl}/admin` : undefined);

    if (!env.SMTP_HOST || !env.NOTIFY_EMAIL) {
      console.log(`[notify] SMTP_HOST / NOTIFY_EMAIL not set — not emailed: ${subject}`);
      return;
    }

    const port = Number(env.SMTP_PORT ?? 587);
    const transport = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port,
      secure: env.SMTP_SECURE ? env.SMTP_SECURE === 'true' : port === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    });
    try {
      await transport.sendMail({
        from: env.SMTP_FROM ?? env.SMTP_USER ?? env.NOTIFY_EMAIL,
        to: env.NOTIFY_EMAIL,
        subject,
        text,
        replyTo,
      });
    } catch (err) {
      console.error(`[notify] Failed to email submission ${id}:`, err);
    }
  },
});
