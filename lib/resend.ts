import { Resend } from 'resend';

const resendApiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn('Resend API key not found. Email functionality will be disabled.');
}

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export const sendEmail = async (options: EmailOptions) => {
  if (!resend) {
    throw new Error('Resend is not configured. Please add RESEND_API_KEY to your environment variables.');
  }

  try {
    const { data, error } = await resend.emails.send({
      from: options.from || 'Nectar <onboarding@resend.dev>', // Update with your verified domain
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const sendWelcomeEmail = async (email: string, name?: string) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #F97316 0%, #EA580C 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 30px; background: #EA580C; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Nectar!</h1>
          </div>
          <div class="content">
            <h2>Hi ${name || 'there'},</h2>
            <p>Welcome to Nectar - your AI-powered side hustle generator!</p>
            <p>We're excited to help you discover your next income stream. Get started by exploring personalized opportunities tailored just for you.</p>
            <a href="${typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'}/dashboard" class="button">Go to Dashboard</a>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Happy hustling!<br>The Nectar Team</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to Nectar! 🚀',
    html,
  });
};

export const sendPasswordResetEmail = async (email: string, resetLink: string) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #F97316 0%, #EA580C 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 30px; background: #EA580C; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { color: #666; font-size: 14px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <p>You requested to reset your password for your Nectar account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetLink}" class="button">Reset Password</a>
            <p class="warning">If you didn't request this, you can safely ignore this email. This link will expire in 1 hour.</p>
            <p>Best regards,<br>The Nectar Team</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Reset Your Nectar Password',
    html,
  });
};

