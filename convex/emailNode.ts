'use node';

import { action } from './_generated/server';
import { v } from 'convex/values';
import * as nodemailer from 'nodemailer';

const getEnv = (name: string): string | undefined => {
  const value = process.env[name];
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const parsePort = (value: string | undefined): number => {
  const parsed = Number(value ?? '465');
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 465;
  }
  return parsed;
};

export const sendEmail = action({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
  },
  handler: async (_ctx, args) => {
    const host = getEnv('SMTP_HOST') || 'mail.privateemail.com';
    const port = parsePort(getEnv('SMTP_PORT'));
    const user = getEnv('SMTP_USER');
    const pass = getEnv('SMTP_PASS');
    const fromEmail = getEnv('SMTP_FROM_EMAIL') || user;

    if (!user || !pass || !fromEmail) {
      return {
        success: false,
        skipped: true,
        error: 'SMTP is not configured (missing SMTP_USER, SMTP_PASS, or SMTP_FROM_EMAIL).',
      };
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from: `Nectar <${fromEmail}>`,
      to: [args.to],
      subject: args.subject,
      html: args.html,
    });

    return { success: true, skipped: false };
  },
});
