# Professional Email Setup Guide for SatsGate

This guide covers setting up professional email services for your waitlist welcome emails.

## Recommended Email Services

### 1. Resend (Recommended) ⭐

**Why Resend?**
- Created by the Vercel team
- Modern, developer-friendly API
- Excellent deliverability
- Great documentation
- Free tier: 3,000 emails/month

**Setup Steps:**
1. Go to [resend.com](https://resend.com/)
2. Sign up with your email
3. Verify your domain (or use their test domain for development)
4. Get your API key from the dashboard
5. Add to `.env.local`:
```env
VITE_RESEND_API_KEY=re_xxxxxxxxxx
VITE_FROM_EMAIL=hello@yourdomain.com
VITE_FROM_NAME=SatsGate Team
```

**Pricing:**
- Free: 3,000 emails/month
- Pro: $20/month for 50,000 emails

### 2. SendGrid (Enterprise Standard)

**Why SendGrid?**
- Industry standard (owned by Twilio)
- Advanced analytics and tracking
- High deliverability rates
- Extensive documentation

**Setup Steps:**
1. Go to [sendgrid.com](https://sendgrid.com/)
2. Create account and verify email
3. Complete sender authentication
4. Create API key with "Mail Send" permissions
5. Add to `.env.local`:
```env
VITE_SENDGRID_API_KEY=SG.xxxxxxxxxx
VITE_FROM_EMAIL=hello@yourdomain.com
VITE_FROM_NAME=SatsGate Team
```

**Pricing:**
- Free: 100 emails/day
- Essentials: $19.95/month for 50,000 emails

### 3. Mailgun (Developer Favorite)

**Why Mailgun?**
- Powerful API with advanced features
- Great for developers
- Reliable delivery
- Good free tier

**Setup Steps:**
1. Go to [mailgun.com](https://mailgun.com/)
2. Sign up and verify your account
3. Add and verify your domain
4. Get API key from dashboard
5. Add to `.env.local`:
```env
VITE_MAILGUN_API_KEY=key-xxxxxxxxxx
VITE_MAILGUN_DOMAIN=mg.yourdomain.com
VITE_FROM_EMAIL=hello@yourdomain.com
VITE_FROM_NAME=SatsGate Team
```

**Pricing:**
- Free: 5,000 emails/month for 3 months
- Foundation: $35/month for 50,000 emails

### 4. Postmark (Transactional Focus)

**Why Postmark?**
- Specialized in transactional emails
- Excellent deliverability
- Fast delivery times
- Clean, simple API

**Setup Steps:**
1. Go to [postmarkapp.com](https://postmarkapp.com/)
2. Create account and server
3. Verify your domain
4. Get server API token
5. Add to `.env.local`:
```env
VITE_POSTMARK_API_KEY=xxxxxxxxxx
VITE_FROM_EMAIL=hello@yourdomain.com
VITE_FROM_NAME=SatsGate Team
```

**Pricing:**
- Free: 100 emails/month
- Starter: $15/month for 10,000 emails

## Quick Comparison

| Service | Free Tier | Best For | Setup Difficulty |
|---------|-----------|----------|------------------|
| **Resend** | 3,000/month | Modern apps | Easy ⭐ |
| **SendGrid** | 100/day | Enterprise | Medium |
| **Mailgun** | 5,000/month | Developers | Medium |
| **Postmark** | 100/month | Transactional | Easy |

## Domain Setup (Important!)

For production, you'll need to:

1. **Verify your domain** with your chosen provider
2. **Set up SPF record**: Add to DNS
   ```
   v=spf1 include:_spf.youremailprovider.com ~all
   ```
3. **Set up DKIM**: Your provider will give you DKIM records
4. **Set up DMARC**: Add to DNS
   ```
   v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
   ```

## Testing Your Setup

1. Add your email configuration to `.env.local`
2. Restart your development server: `npm run dev`
3. Go to `/admin` (password: `satsgate2024`)
4. Click "Email Settings" tab
5. Enter your email and click "Test"
6. Check your inbox for the test email

## Production Considerations

### Security
- Never expose API keys in client-side code
- Use environment variables properly
- Consider rate limiting

### Deliverability
- Always verify your domain
- Set up proper DNS records (SPF, DKIM, DMARC)
- Monitor bounce rates
- Use double opt-in for better reputation

### Compliance
- Include unsubscribe links
- Add physical address in footer
- Follow GDPR/CAN-SPAM regulations
- Implement proper consent tracking

## Troubleshooting

### Common Issues

**Emails not sending:**
- Check API key is correct
- Verify domain is authenticated
- Check browser console for errors

**Emails going to spam:**
- Set up SPF, DKIM, DMARC records
- Verify sender domain
- Check email content for spam triggers

**Rate limiting:**
- Check your plan limits
- Implement proper error handling
- Consider upgrading plan

### Error Messages

**"Domain not verified":**
- Complete domain verification in your provider dashboard
- Wait for DNS propagation (up to 24 hours)

**"Invalid API key":**
- Double-check the API key
- Ensure it has proper permissions
- Regenerate if necessary

## Backend Integration (Recommended for Production)

For production applications, move email sending to your backend:

```javascript
// Example Express.js endpoint
app.post('/api/send-welcome-email', async (req, res) => {
  const { email } = req.body;
  
  try {
    // Using Resend as example
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    await resend.emails.send({
      from: 'SatsGate Team <hello@satsgate.com>',
      to: email,
      subject: '🚀 Welcome to SatsGate!',
      html: welcomeEmailTemplate,
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

This approach is more secure and allows for better error handling and monitoring.