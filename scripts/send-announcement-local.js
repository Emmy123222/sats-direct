// Local script for sending waitlist announcements during development
// Run with: node send-announcement-local.js

import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function sendAnnouncementLocal() {
  try {
    console.log('🚀 Starting local announcement send...');

    // 1. Read waitlist entries
    const waitlistFile = path.join(process.cwd(), 'waitlist-entries.json');
    let waitlist = [];
    
    try {
      const data = fs.readFileSync(waitlistFile, 'utf8');
      waitlist = JSON.parse(data);
    } catch (error) {
      console.error('❌ Error reading waitlist file:', error);
      return;
    }

    if (!waitlist?.length) {
      console.log('⚠️  Waitlist is empty – nothing to send');
      return;
    }

    const emails = waitlist.map(entry => entry.email.trim().toLowerCase());
    console.log(`📧 Preparing to send announcement to ${emails.length} subscribers`);

    // 2. Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      pool: true,
      maxConnections: 3,
      rateDelta: 1000,
    });

    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection verified');

    // 3. Send emails with progress tracking
    const results = [];
    let sentCount = 0;

    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      
      try {
        const info = await transporter.sendMail({
          from: `${process.env.FROM_NAME} <${process.env.SMTP_USER}>`,
          to: email,
          subject: "Welcome to SatsGate - Bitcoin payments on Stacks!",
          text: getPlainTextEmail(),
          html: getHTMLEmail(),
        });

        results.push({ email, success: true, messageId: info.messageId });
        sentCount++;
        
        console.log(`✅ [${i + 1}/${emails.length}] Sent to ${email}`);

        // Delay to avoid rate limits
        if (i < emails.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1200));
        }
      } catch (sendErr) {
        console.error(`❌ [${i + 1}/${emails.length}] Failed to send to ${email}:`, sendErr.message);
        results.push({ email, success: false, error: sendErr.message });
      }
    }

    // 4. Summary
    console.log('\n📊 ANNOUNCEMENT SUMMARY:');
    console.log(`Total recipients: ${emails.length}`);
    console.log(`Sent successfully: ${sentCount}`);
    console.log(`Failed: ${results.filter(r => !r.success).length}`);
    
    const failed = results.filter(r => !r.success);
    if (failed.length > 0) {
      console.log('\n❌ Failed emails:');
      failed.forEach(f => console.log(`  - ${f.email}: ${f.error}`));
    }

    console.log('\n🎉 Announcement sending completed!');

  } catch (error) {
    console.error('❌ Announcement error:', error);
  }
}

function getPlainTextEmail() {
  return `Hi there,

Thanks for joining the SatsGate waitlist — you're early to something special.

WHAT IS SATSGATE?
SatsGate is a non-custodial Bitcoin payment gateway built on the Stacks blockchain. We help small businesses and freelancers accept Bitcoin payments with full control of their funds — no centralized processors, no middlemen.

WHY STACKS MAKES THIS POWERFUL:
• Smart contracts for Bitcoin - Programmable payments using real BTC
• True self-custody - Your keys, your Bitcoin, always
• Transparent invoicing - All payment records on-chain
• No KYC required - Accept payments without giving up privacy
• Lower fees - Skip traditional payment processor fees

WHAT HAPPENS NEXT:
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
🟠 Built on Bitcoin. ⚡ Powered by Stacks.

You received this email because you joined our waitlist. Unsubscribe anytime.`;
}

function getHTMLEmail() {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to SatsGate</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: white; padding: 40px 30px; text-align: center; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; color: #F7931A; }
        .stacks-badge { background: #5546FF; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-top: 10px; display: inline-block; }
        .content { padding: 40px 30px; }
        .highlight { background: #F7931A; color: white; padding: 2px 8px; border-radius: 4px; font-weight: bold; }
        .stacks-highlight { background: #5546FF; color: white; padding: 2px 8px; border-radius: 4px; font-weight: bold; }
        .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 14px; }
        .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
        .feature-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #5546FF; }
        ul { padding-left: 20px; }
        li { margin-bottom: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">⚡ SatsGate</div>
            <div class="stacks-badge">Built on Stacks</div>
            <h1>Welcome to the future of Bitcoin payments!</h1>
        </div>
        
        <div class="content">
            <p>Hi there,</p>
            
            <p>Thanks for joining the SatsGate waitlist — you're early to something special.</p>
            
            <div class="feature-box">
                <p><strong>What is SatsGate?</strong></p>
                <p>SatsGate is a <span class="highlight">non-custodial Bitcoin payment gateway</span> built on the <span class="stacks-highlight">Stacks blockchain</span>. We help small businesses and freelancers accept Bitcoin payments with full control of their funds — no centralized processors, no middlemen.</p>
            </div>
            
            <p><strong>Why Stacks makes this powerful:</strong></p>
            <ul>
                <li><strong>Smart contracts for Bitcoin</strong> - Programmable payments using real BTC</li>
                <li><strong>True self-custody</strong> - Your keys, your Bitcoin, always</li>
                <li><strong>Transparent invoicing</strong> - All payment records on-chain</li>
                <li><strong>No KYC required</strong> - Accept payments without giving up privacy</li>
                <li><strong>Lower fees</strong> - Skip traditional payment processor fees</li>
            </ul>
            
            <p><strong>What happens next:</strong></p>
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
            
            <div class="signature">
                <p>Best,<br>
                <strong>Emmanuel Ogheneovo</strong><br>
                Founder, SatsGate</p>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>🟠 Built on Bitcoin. ⚡ Powered by Stacks.</strong></p>
            <p style="font-size: 12px; color: #999;">
                You received this email because you joined our waitlist. Unsubscribe anytime.
            </p>
        </div>
    </div>
</body>
</html>`;
}

// Run the announcement
sendAnnouncementLocal().catch(console.error);