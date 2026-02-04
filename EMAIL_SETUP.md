# Email Setup Guide

## Quick Setup with Brevo (Free)

Brevo (formerly Sendinblue) is a reliable email service with a generous free tier.

### 1. Create Brevo Account
1. Go to [app.brevo.com](https://app.brevo.com)
2. Sign up for a free account (300 emails/day)
3. Verify your email address

### 2. Get Your API Key
1. In your Brevo dashboard, go to "SMTP & API" → "API Keys"
2. Click "Generate a new API key"
3. Give it a name like "SatsGate Waitlist"
4. Copy the API key (starts with `xkeysib-`)

### 3. Set Up Sender Email
1. Go to "Senders & IP" → "Senders"
2. Add your sender email (e.g., `noreply@satsgate.com`)
3. Verify the email address
4. Or use a verified domain if you have one

### 4. Update Environment Variables
Add these to your `.env` file:

```bash
VITE_BREVO_API_KEY=xkeysib-your-api-key-here
VITE_FROM_EMAIL=noreply@satsgate.com
VITE_FROM_NAME=Emmanuel from SatsGate
```

### 5. Test It!
1. Start your development server: `npm run dev`
2. Go to your waitlist form
3. Enter your email and submit
4. Check your inbox for the welcome email!

## What Happens Now

✅ **User joins waitlist** → Gets welcome email via Brevo  
✅ **You get notified** → Formspree sends you their details  
✅ **Generous free tier** → 300 emails/day (9,000/month)  
✅ **Professional emails** → Better deliverability than free services  
✅ **Easy setup** → Just need API key and sender email  

## Brevo Benefits

- **300 emails/day free** (much more than EmailJS)
- **Better deliverability** (professional email service)
- **No complex setup** (just API key needed)
- **Reliable service** (used by many businesses)
- **Good documentation** (easy to troubleshoot)

## Email Template

The system automatically sends this welcome email:

**Subject:** Thanks for joining the SatsGate waitlist!

**Content:**
- Welcome message
- Explanation of what SatsGate is
- What happens next
- Personal signature from you

The email is professionally formatted with HTML and includes a plain text version for better compatibility.

## Troubleshooting

**Email not sending?**
- Check your API key is correct
- Verify your sender email in Brevo dashboard
- Check browser console for error messages

**Emails going to spam?**
- Use a verified domain in Brevo
- Add SPF/DKIM records (Brevo provides instructions)
- Avoid spam trigger words in content