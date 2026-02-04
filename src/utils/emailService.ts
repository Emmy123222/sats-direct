// Email service for sending waitlist confirmation emails
// Supports multiple email providers: EmailJS, Resend, SendGrid

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface EmailConfig {
  provider: 'formspree' | 'resend' | 'sendgrid' | 'mailgun' | 'ses' | 'postmark' | 'custom';
  apiKey?: string;
  formspreeEndpoint?: string;
  fromEmail: string;
  fromName: string;
  region?: string; // For AWS SES
}

export class EmailService {
  private static config: EmailConfig = {
    provider: 'formspree', // Default to Formspree (simplest setup)
    formspreeEndpoint: 'https://formspree.io/f/mdkekqwg',
    fromEmail: import.meta.env.VITE_FROM_EMAIL || 'hello@satsgate.com',
    fromName: import.meta.env.VITE_FROM_NAME || 'Emmanuel Ogheneovo'
  };

  /**
   * Send welcome email to new waitlist subscriber
   */
  static async sendWelcomeEmail(email: string, additionalData: any = {}): Promise<{ success: boolean; message: string }> {
    const template = this.getWelcomeEmailTemplate(additionalData);
    
    try {
      switch (this.config.provider) {
        case 'formspree':
          return await this.sendViaFormspree(email, template);
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
   * Send via Formspree (Simplest setup - no API keys needed!)
   */
  private static async sendViaFormspree(email: string, template: EmailTemplate): Promise<{ success: boolean; message: string }> {
    const endpoint = this.config.formspreeEndpoint || 'https://formspree.io/f/mdkekqwg';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        subject: template.subject,
        message: template.textContent,
        _replyto: email,
        _subject: template.subject,
        'User Email': email,
        'Signup Date': new Date().toLocaleDateString(),
        'Message': template.textContent,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Formspree error: ${error}`);
    }

    return { success: true, message: 'Welcome email sent successfully!' };
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
    const subject = 'Thanks for joining the SatsGate waitlist!';
    
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
        .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 14px; }
        .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
        ul { padding-left: 20px; }
        li { margin-bottom: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">⚡ SatsGate</div>
            <h1>Thanks for joining our waitlist!</h1>
        </div>
        
        <div class="content">
            <p>Hi there,</p>
            
            <p>Thanks for joining the SatsGate waitlist — we're excited to have you early.</p>
            
            <p>SatsGate is a <span class="highlight">non-custodial Bitcoin payment gateway</span> built on Stacks, designed to help small businesses and freelancers accept BTC easily, with full control of their funds and no centralized processors.</p>
            
            <p>You're receiving this email because you signed up for early access.</p>
            
            <p><strong>Here's what happens next:</strong></p>
            <ul>
                <li>We're currently building the MVP</li>
                <li>Early users will get first access to test payments</li>
                <li>You'll receive updates as features roll out</li>
                <li>Your feedback will help shape the product</li>
            </ul>
            
            <p>If you'd like to help us build something truly useful, feel free to reply and tell us:</p>
            <ul>
                <li>What kind of business you run</li>
                <li>How you currently accept payments</li>
                <li>What you'd love to see in a Bitcoin checkout</li>
            </ul>
            
            <p>Thanks for being part of the journey.</p>
            
            <p><strong>Let's build the future of Bitcoin payments — together.</strong></p>
            
            <div class="signature">
                <p>Best,<br>
                <strong>Emmanuel Ogheneovo</strong><br>
                Founder, SatsGate</p>
            </div>
        </div>
        
        <div class="footer">
            <p>Built on Bitcoin. Powered by Stacks.</p>
            <p style="font-size: 12px; color: #999;">
                You received this email because you joined our waitlist at satsgate.com
            </p>
        </div>
    </div>
</body>
</html>`;

    const textContent = `Hi there,

Thanks for joining the SatsGate waitlist — we're excited to have you early.

SatsGate is a non-custodial Bitcoin payment gateway built on Stacks, designed to help small businesses and freelancers accept BTC easily, with full control of their funds and no centralized processors.

You're receiving this email because you signed up for early access.

Here's what happens next:
• We're currently building the MVP 
• Early users will get first access to test payments 
• You'll receive updates as features roll out 
• Your feedback will help shape the product

If you'd like to help us build something truly useful, feel free to reply and tell us:
– What kind of business you run 
– How you currently accept payments 
– What you'd love to see in a Bitcoin checkout

Thanks for being part of the journey.

Let's build the future of Bitcoin payments — together.

Best, 
Emmanuel Ogheneovo 
Founder, SatsGate

---
Built on Bitcoin. Powered by Stacks.
You received this email because you joined our waitlist at satsgate.com`;

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