# 📧 Email Setup Guide for Nectar Forge

## Current Contact Email Setup

**Current:** `support@nectarforge.app` (shows in footer)  
**Forwards to:** Your personal email `paudcin@gmail.com`  
**Privacy:** Users never see your personal email

---

## How to Set Up Email Forwarding

You have two options to make `support@nectarforge.app` forward to your personal email:

### Option 1: Vercel Email Forwarding (Recommended - FREE)

If your domain is managed through Vercel:

1. **Go to Vercel Dashboard** → Your Project → Settings → Domains
2. **Click on** `nectarforge.app`
3. **Scroll to** "Email Configuration"
4. **Add Email Forward:**
   - From: `support@nectarforge.app`
   - To: `paudcin@gmail.com`
5. **Save** → Emails will forward automatically!

### Option 2: Cloudflare Email Routing (FREE)

1. **Go to** https://dash.cloudflare.com
2. **Select your domain** `nectarforge.app`
3. **Go to** Email → Email Routing
4. **Enable Email Routing**
5. **Add Route:**
   - Custom address: `support@nectarforge.app`
   - Destination: `paudcin@gmail.com`
6. **Verify your personal email** (they'll send a confirmation)
7. **Done!** All emails to support@ will forward to you

### Option 3: Domain Registrar Email Forwarding

Most domain registrars (GoDaddy, Namecheap, etc.) offer free email forwarding:

1. Log into your domain registrar
2. Find "Email Forwarding" or "Email Management"
3. Add forwarding rule:
   - From: `support@nectarforge.app`
   - To: `paudcin@gmail.com`

---

## How It Works for Users

When a user clicks "Contact" in the footer:
1. Their email client opens (Gmail, Outlook, Apple Mail, etc.)
2. The "To:" field shows: `support@nectarforge.app`
3. They write their message and send
4. Email routes through your forwarder
5. **You receive it at:** `paudcin@gmail.com`
6. **You can reply** - it will come from your Gmail but users won't see it in the footer

**Privacy Protected:** ✅ Your personal email is never shown to users

---

## Alternative: Contact Form (No Email Forwarding Needed)

If you don't want to set up email forwarding, we can create a contact form that sends via Resend API (you already have this set up!).

**Advantages:**
- No email forwarding needed
- Can add anti-spam protection
- Store contact messages in database
- Auto-responder to user

**Want this instead?** Let me know and I can implement a contact form component.

---

## Current Implementation

The footer currently shows:
```
Contact → Opens email client to: support@nectarforge.app
```

**Status:** ✅ Updated to use `support@nectarforge.app` (matches your brand)

**Next Step:** Choose one of the forwarding options above to make it work.

---

## Testing

After setting up forwarding:
1. Send a test email to `support@nectarforge.app`
2. Check if it arrives at `paudcin@gmail.com`
3. Try replying from your Gmail
4. ✅ Works? You're all set!

