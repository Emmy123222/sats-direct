// Email service for sending waitlist confirmation emails
// Supports multiple email providers: EmailJS, Resend, SendGrid

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface EmailConfig {
  provider: 'resend' | 'sendgrid' | 'mailgun' | 'ses' | 'postmark' | 'custom';
  apiKey?: string;
  fromEmail: string;
  fromName: string;
  region?: string; // For AWS SES
}

export class EmailService {
  private static config: EmailConfig = {
    provider: 'resend', // Default to Resend (modern, developer-friendly)
    apiKey: import.meta.env.VITE_RESEND_API_KEY,
    fromEmail: import.meta.env.VITE_FROM_EMAIL || 'hello@satsgate.com',
    fromName: import.meta.env.VITE_FROM_NAME || 'SatsGate Team'
  };

  /**
   * Send welcome email to new waitlist subscriber
   */
  static async sendWelcomeEmail(email: string, additionalData: any = {}): Promise<{ success: boolean; message: string }> {
    const template = this.getWelcomeEmailTemplate(additionalData);
    
    try {
      switch (this.config.provider) {
        case 'resend':
          return await this.sendViaResend(email, template);
        case 'sendgrid':
          return await this.sendViaSendGrid(email, template);
        case 'mailgun':
          return await this.sendViaMailgun(email, template);
        case 'ses':
          return await this.sendViaAmazonSES(email, template);
        case 'postmark':
          return await this.sendViaPostmark(email, template);
        case 'custom':
          return await this.sendViaCustomAPI(email, template);
        default:
          throw new Error('No email provider configured');
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to send email' 
      };
    }
  }

  /**
   * Send via Mailgun (Developer favorite)
   */
  private static async sendViaMailgun(email: string, template: EmailTemplate): Promise<{ success: boolean; message: string }> {
    if (!this.config.apiKey) {
      throw new Error('Mailgun API key missing');
    }

    const domain = import.meta.env.VITE_MAILGUN_DOMAIN;
    if (!domain) {
      throw new Error('Mailgun domain missing');
    }

    const formData = new FormData();
    formData.append('from', `${this.config.fromName} <${this.config.fromEmail}>`);
    formData.append('to', email);
    formData.append('subject', template.subject);
    formData.append('html', template.htmlContent);
    formData.append('text', template.textContent);

    const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${this.config.apiKey}`)}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Mailgun error: ${error.message}`);
    }

    return { success: true, message: 'Welcome email sent successfully!' };
  }

  /**
   * Send via Amazon SES
   */
  private static async sendViaAmazonSES(email: string, template: EmailTemplate): Promise<{ success: boolean; message: string }> {
    if (!this.config.apiKey) {
      throw new Error('AWS credentials missing');
    }

    const region = this.config.region || 'us-east-1';
    const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
    const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('AWS credentials not configured');
    }

    // Note: This is a simplified example. In production, use AWS SDK
    const sesEndpoint = `https://email.${region}.amazonaws.com/`;
    
    const params = {
      Source: `${this.config.fromName} <${this.config.fromEmail}>`,
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: template.subject },
        Body: {
          Html: { Data: template.htmlContent },
          Text: { Data: template.textContent }
        }
      }
    };

    // This would require proper AWS signature v4 signing
    // For production, use AWS SDK or backend service
    throw new Error('AWS SES requires backend implementation for security');
  }

  /**
   * Send via Postmark
   */
  private static async sendViaPostmark(email: string, template: EmailTemplate): Promise<{ success: boolean; message: string }> {
    if (!this.config.apiKey) {
      throw new Error('Postmark API key missing');
    }

    const response = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': this.config.apiKey,
      },
      body: JSON.stringify({
        From: `${this.config.fromName} <${this.config.fromEmail}>`,
        To: email,
        Subject: template.subject,
        HtmlBody: template.htmlContent,
        TextBody: template.textContent,
        MessageStream: 'outbound'
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Postmark error: ${error.Message}`);
    }

    return { success: true, message: 'Welcome email sent successfully!' };
  }

  /**
   * Send via Resend (modern email API)
   */
  private static async sendViaResend(email: string, template: EmailTemplate): Promise<{ success: boolean; message: string }> {
    if (!this.config.apiKey) {
      throw new Error('Resend API key missing');
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: [email],
        subject: template.subject,
        html: template.htmlContent,
        text: template.textContent,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Resend error: ${error.message}`);
    }

    return { success: true, message: 'Welcome email sent successfully!' };
  }

  /**
   * Send via SendGrid
   */
  private static async sendViaSendGrid(email: string, template: EmailTemplate): Promise<{ success: boolean; message: string }> {
    if (!this.config.apiKey) {
      throw new Error('SendGrid API key missing');
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email }],
          subject: template.subject,
        }],
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName,
        },
        content: [
          {
            type: 'text/plain',
            value: template.textContent,
          },
          {
            type: 'text/html',
            value: template.htmlContent,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`SendGrid error: ${error.errors?.[0]?.message || 'Unknown error'}`);
    }

    return { success: true, message: 'Welcome email sent successfully!' };
  }

  /**
   * Send via custom API endpoint
   */
  private static async sendViaCustomAPI(email: string, template: EmailTemplate): Promise<{ success: boolean; message: string }> {
    const apiEndpoint = import.meta.env.VITE_EMAIL_API_ENDPOINT;
    
    if (!apiEndpoint) {
      throw new Error('Custom email API endpoint not configured');
    }

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        to: email,
        from: this.config.fromEmail,
        fromName: this.config.fromName,
        subject: template.subject,
        html: template.htmlContent,
        text: template.textContent,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Custom API error: ${error.message}`);
    }

    return { success: true, message: 'Welcome email sent successfully!' };
  }

  /**
   * Generate welcome email template
   */
  private static getWelcomeEmailTemplate(data: any = {}): EmailTemplate {
    const subject = '🚀 Welcome to SatsGate - You\'re on the list!';
    
    const htmlContent = `
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
        .content { padding: 40px 30px; }
        .highlight { background: #F7931A; color: white; padding: 2px 8px; border-radius: 4px; font-weight: bold; }
        .cta-button { display: inline-block; background: #F7931A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 14px; }
        .social-links { margin: 20px 0; }
        .social-links a { color: #F7931A; text-decoration: none; margin: 0 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">⚡ SatsGate</div>
            <h1>Welcome to the Future of Bitcoin Payments!</h1>
        </div>
        
        <div class="content">
            <h2>🎉 You're officially on the waitlist!</h2>
            
            <p>Thank you for joining the SatsGate early access program. You're now part of an exclusive group of forward-thinking individuals who believe in the power of <span class="highlight">self-custodial Bitcoin payments</span>.</p>
            
            <h3>What's SatsGate?</h3>
            <p>SatsGate is the simplest way for merchants to accept Bitcoin payments directly to their wallets. No middlemen, no KYC, no chargebacks - just pure Bitcoin.</p>
            
            <ul>
                <li>✅ <strong>Self-Custody:</strong> Your keys, your coins</li>
                <li>✅ <strong>No KYC:</strong> Start accepting payments in minutes</li>
                <li>✅ <strong>Instant Settlement:</strong> Bitcoin transactions confirm on-chain</li>
                <li>✅ <strong>No Chargebacks:</strong> Final payments, no disputes</li>
            </ul>
            
            <h3>What happens next?</h3>
            <p>We're putting the finishing touches on SatsGate and will be launching soon. As a waitlist member, you'll be among the first to:</p>
            
            <ul>
                <li>🚀 Get early access to the platform</li>
                <li>📧 Receive launch notifications</li>
                <li>🎁 Enjoy special early-adopter benefits</li>
                <li>💬 Provide feedback that shapes the product</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://satsgate.com/dashboard" class="cta-button">Explore the Dashboard</a>
            </div>
            
            <p>In the meantime, feel free to connect your wallet and explore our demo dashboard. It's fully functional and gives you a preview of what's coming!</p>
            
            <p>Questions? Just reply to this email - we read every message.</p>
            
            <p>Stay sovereign,<br>
            <strong>The SatsGate Team</strong></p>
        </div>
        
        <div class="footer">
            <div class="social-links">
                <a href="https://twitter.com/satsgate">Twitter</a> |
                <a href="https://github.com/satsgate">GitHub</a> |
                <a href="https://satsgate.com">Website</a>
            </div>
            
            <p>Built on Bitcoin. Powered by Stacks.</p>
            <p style="font-size: 12px; color: #999;">
                You received this email because you joined our waitlist at satsgate.com<br>
                <a href="#" style="color: #999;">Unsubscribe</a> | <a href="#" style="color: #999;">Update preferences</a>
            </p>
        </div>
    </div>
</body>
</html>`;

    const textContent = `
🚀 Welcome to SatsGate - You're on the list!

Thank you for joining the SatsGate early access program! You're now part of an exclusive group of forward-thinking individuals who believe in the power of self-custodial Bitcoin payments.

What's SatsGate?
SatsGate is the simplest way for merchants to accept Bitcoin payments directly to their wallets. No middlemen, no KYC, no chargebacks - just pure Bitcoin.

✅ Self-Custody: Your keys, your coins
✅ No KYC: Start accepting payments in minutes  
✅ Instant Settlement: Bitcoin transactions confirm on-chain
✅ No Chargebacks: Final payments, no disputes

What happens next?
We're putting the finishing touches on SatsGate and will be launching soon. As a waitlist member, you'll be among the first to:

🚀 Get early access to the platform
📧 Receive launch notifications
🎁 Enjoy special early-adopter benefits
💬 Provide feedback that shapes the product

In the meantime, feel free to connect your wallet and explore our demo dashboard at https://satsgate.com/dashboard

Questions? Just reply to this email - we read every message.

Stay sovereign,
The SatsGate Team

---
Built on Bitcoin. Powered by Stacks.
You received this email because you joined our waitlist at satsgate.com
`;

    return { subject, htmlContent, textContent };
  }

  /**
   * Update email configuration
   */
  static updateConfig(newConfig: Partial<EmailConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Test email configuration
   */
  static async testConfiguration(): Promise<{ success: boolean; message: string }> {
    try {
      // Send a test email to the configured from address
      return await this.sendWelcomeEmail(this.config.fromEmail, { isTest: true });
    } catch (error) {
      return { 
        success: false, 
        message: `Configuration test failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}