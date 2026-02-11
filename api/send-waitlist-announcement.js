// Vercel serverless function for sending bulk waitlist announcements
// Uses nodemailer with external SMTP for reliable delivery

import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // Security: Only allow with secret header
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized – missing or invalid secret' });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Read waitlist entries from JSON file (in production, use a database)
    const waitlistFile = path.join(process.cwd(), 'waitlist-entries.json');
    let waitlist = [];
    
    try {
      const data = fs.readFileSync(waitlistFile, 'utf8');
      waitlist = JSON.parse(data);
    } catch (error) {
      console.error('Error reading waitlist file:', error);
      return res.status(500).json({ error: 'Could not read waitlist data' });
    }

    if (!waitlist?.length) {
      return res.status(200).json({ message: 'Waitlist is empty – nothing to send' });
    }

    const emails = waitlist.map(entry => entry.email.trim().toLowerCase());
    console.log(`Preparing to send announcement to ${emails.length} subscribers`);

    // 2. Nodemailer transporter (external SMTP)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Pool for better performance on bulk
      pool: true,
      maxConnections: 3,
      rateDelta: 1000,
    });

    // Verify connection (fails fast if creds bad)
    await transporter.verify();
    console.log('SMTP connection verified ✅');

    // 3. Send loop with delay to avoid rate limits
    const results = [];
    let sentCount = 0;

    for (const email of emails) {
      try {
        const info = await transporter.sendMail({
          from: process.env.FROM_EMAIL,
          to: email,
          subject: "Welcome to the SatsGate Waitlist – You're Early to Something Special!",
          text: getPlainTextEmail(),
          html: getHTMLEmail(),
        });

        results.push({ email, success: true });
        sentCount++;
        console.log(`Sent to ${email} – Message ID: ${info.messageId}`);

        // Delay ~1-2s to be gentle on SMTP server
        await new Promise(resolve => setTimeout(resolve, 1200));
      } catch (sendErr) {
        console.error(`Failed to send to ${email}:`, sendErr.message);
        results.push({ email, success: false, error: sendErr.message });
      }
    }

    return res.status(200).json({
      success: true,
      totalRecipients: emails.length,
      sentSuccessfully: sentCount,
      failed: results.filter(r => !r.success).length,
      details: results,
    });

  } catch (err) {
    console.error('Bulk announcement error:', err);
    return res.status(500).json({ 
      error: 'Failed to process bulk send', 
      details: err.message 
    });
  }
}

function getPlainTextEmail() {
  return `Hi there,

Thanks for joining the SatsGate waitlist — you're early to something special.

What is SatsGate?
SatsGate is a non-custodial Bitcoin payment gateway built on the Stacks blockchain. We help small businesses and freelancers accept Bitcoin payments with full control of their funds — no centralized processors, no middlemen.

Why Stacks makes this powerful:
- Smart contracts for Bitcoin - Programmable payments using real BTC
- True self-custody - Your keys, your Bitcoin, always
- Transparent invoicing - All payment records on-chain
- No KYC required - Accept payments without giving up privacy
- Lower fees - Skip traditional payment processor fees

What happens next:
- We're building the MVP on Stacks testnet
- Early users get first access to test Bitcoin payments
- You'll receive updates as we add features
- Your feedback helps us build the best Bitcoin checkout experience

If you'd like to help shape the product, reply and tell us:
- What kind of business you run
- How you currently accept payments
- What Bitcoin payment features matter most to you

Thanks for being part of this journey to make Bitcoin payments accessible for everyone.

Let's build the future of Bitcoin commerce — on Stacks.

Best,
Emmanuel Ogheneovo
Founder, SatsGate

Built on Bitcoin. Powered by Stacks.

You received this email because you joined our waitlist. Unsubscribe anytime.`;
}

function getHTMLEmail() {
  return `
<div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #f7931a; font-size: 28px; margin-bottom: 10px;">⚡ SatsGate</h1>
    <div style="background: #5546FF; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block;">Built on Stacks</div>
  </div>
  
  <h2 style="color: #f7931a;">Hi there,</h2>
  <p>Thanks for joining the SatsGate waitlist — you're early to something special.</p>
  
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #5546FF;">
    <h3 style="margin-top: 0;">What is SatsGate?</h3>
    <p>SatsGate is a <span style="background: #F7931A; color: white; padding: 2px 8px; border-radius: 4px; font-weight: bold;">non-custodial Bitcoin payment gateway</span> built on the <span style="background: #5546FF; color: white; padding: 2px 8px; border-radius: 4px; font-weight: bold;">Stacks blockchain</span>. We help small businesses and freelancers accept Bitcoin payments with full control of their funds — no centralized processors, no middlemen.</p>
  </div>
  
  <h3>Why Stacks makes this powerful:</h3>
  <ul>
    <li><strong>Smart contracts for Bitcoin</strong> - Programmable payments using real BTC</li>
    <li><strong>True self-custody</strong> - Your keys, your Bitcoin, always</li>
    <li><strong>Transparent invoicing</strong> - All payment records on-chain</li>
    <li><strong>No KYC required</strong> - Accept payments without giving up privacy</li>
    <li><strong>Lower fees</strong> - Skip traditional payment processor fees</li>
  </ul>
  
  <h3>What happens next:</h3>
  <ul>
    <li>We're building the MVP on Stacks testnet</li>
    <li>Early users get first access to test Bitcoin payments</li>
    <li>You'll receive updates as we add features</li>
    <li>Your feedback helps us build the best Bitcoin checkout experience</li>
  </ul>
  
  <p>If you'd like to help shape the product, <strong>reply</strong> and tell us:</p>
  <ul>
    <li>What kind of business you run</li>
    <li>How you currently accept payments</li>
    <li>What Bitcoin payment features matter most to you</li>
  </ul>
  
  <p>Thanks for being part of this journey to make Bitcoin payments accessible for everyone.</p>
  <p><strong>Let's build the future of Bitcoin commerce — on Stacks.</strong></p>
  
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
    <p>Best,<br>
    <strong>Emmanuel Ogheneovo</strong><br>
    Founder, SatsGate</p>
  </div>
  
  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #777; text-align: center;">
    <p><strong>🟠 Built on Bitcoin. ⚡ Powered by Stacks.</strong></p>
    <p>You received this email because you joined our waitlist. Unsubscribe anytime.</p>
  </div>
</div>`;
}