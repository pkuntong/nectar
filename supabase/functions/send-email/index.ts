// Follow this setup guide: https://supabase.com/docs/guides/functions
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html, type } = await req.json()

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set')
    }

    if (!to || !subject) {
      throw new Error('Missing required fields: to, subject')
    }

    let emailHtml = html

    // If type is provided, use predefined templates
    if (type === 'welcome') {
      const name = to.split('@')[0]
      emailHtml = `
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
                <h2>Hi ${name},</h2>
                <p>Welcome to Nectar - your AI-powered side hustle generator!</p>
                <p>We're excited to help you discover your next income stream. Get started by exploring personalized opportunities tailored just for you.</p>
                <a href="${req.headers.get('origin')}/dashboard" class="button">Go to Dashboard</a>
                <p>If you have any questions, feel free to reach out to our support team.</p>
                <p>Happy hustling!<br>The Nectar Team</p>
              </div>
            </div>
          </body>
        </html>
      `
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Nectar <onboarding@resend.dev>', // Update with your verified domain
        to: [to],
        subject: subject,
        html: emailHtml,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Resend API error: ${error}`)
    }

    const data = await res.json()

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
