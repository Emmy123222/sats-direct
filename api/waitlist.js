// Vercel serverless function for waitlist management
// Uses nodemailer with SMTP for reliable email delivery

import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests for signup
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, additionalData = {} } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    console.log('📝 New waitlist signup:', email);

    // Create entry data
    const entry = {
      email: email.toLowerCase().trim(),
      timestamp: new Date().toISOString(),
      signupDate: new Date().toLocaleDateString(),
      source: additionalData.source || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      additionalData: additionalData
    };

    // TODO: Save to database (Supabase, MongoDB, etc.)
    console.log('✅ Waitlist entry (would be saved to DB):', entry);

    // Send welcome email via SMTP
    const emailResult = await sendWelcomeEmail(email);
    
    if (emailResult.success) {
      return res.status(200).json({ 
        success: true, 
        message: 'Welcome to the waitlist! Check your email for a welcome message.',
        note: 'Entry recorded and welcome email sent',
        emailSent: true,
        emailId: emailResult.messageId
      });
    } else {
      return res.status(200).json({ 
        success: true, 
        message: 'Welcome to the waitlist! We\'ll be in touch soon.',
        note: 'Entry recorded (email may be delayed)',
        emailSent: false,
        emailError: emailResult.error
      });
    }

  } catch (error) {
    console.error('❌ Waitlist signup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function sendWelcomeEmail(email) {
  // Check if SMTP is configured
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️  SMTP not configured - email not sent');
    return { success: false, error: 'SMTP not configured' };
  }

  try {
    console.log('📤 Sending welcome email via SMTP to:', email);
    
    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Welcome to SatsGate - Bitcoin payments on Stacks!',
      text: getWelcomeTextEmail(),
      html: getWelcomeHTMLEmail(),
    });

    console.log('✅ Welcome email sent via SMTP:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ SMTP email error:', error);
    return { success: false, error: error.message };
  }
}

function getWelcomeTextEmail() {
  return `Hi there,

Thanks for joining the SatsGate waitlist — you're early to something special.

SatsGate is a non-custodial Bitcoin payment gateway built on the Stacks blockchain. We help small businesses and freelancers accept Bitcoin payments with full control of their funds — no centralized processors, no middlemen.

Why Stacks makes this powerful:
• Smart contracts for Bitcoin - Programmable payments using real BTC
• True self-custody - Your keys, your Bitcoin, always  
• Transparent invoicing - All payment records on-chain
• No KYC required - Accept payments without giving up privacy
• Lower fees - Skip traditional payment processor fees

What happens next:
• We're building the MVP on Stacks testnet
• Early users get first access to test Bitcoin payments  
• You'll receive updates as we add features
• Your feedback helps us build the best Bitcoin checkout experience

If you'd like to help shape the product, reply and tell us:
- What kind of business you run
- How you currently accept payments  
- What Bitcoin payment features matter most to you

Thanks for being part of this journey to make Bitcoin payments accessible for everyone.

Let's build the future of Bitcoin commerce — on Stacks.

Best, 
Emmanuel Ogheneovo 
Founder, SatsGate

---
🟠 Built on Bitcoin. ⚡ Powered by Stacks.`;
}

function getWelcomeHTMLEmail() {
  return `
<div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #f7931a; font-size: 28px; margin-bottom: 10px;">⚡ SatsGate</h1>
    <div style="background: #5546FF; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block;">Built on Stacks</div>
  </div>
  
  <h2 style="color: #f7931a;">Hi there,</h2>
  <p>Thanks for joining the SatsGate waitlist — you're early to something special.</p>
  
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #5546FF;">
    <p><strong>What is SatsGate?</strong></p>
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
  
  <p>If you'd like to help shape the product, reply and tell us:</p>
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