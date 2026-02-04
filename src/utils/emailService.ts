// Email service for sending welcome emails to users and notifications to creator
// Uses Brevo (formerly Sendinblue) for user emails and Formspree for creator notifications

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export class EmailService {
  /**
   * Send welcome email to user AND notification to creator
   */
  static async sendWelcomeEmail(email: string, additionalData: any = {}): Promise<{ success: boolean; message: string }> {
    console.log('📧 Sending welcome email to user and notification to creator...');
    
    try {
      // 1. Send welcome email to the user via Brevo
      const userEmailResult = await this.sendWelcomeViaBrevo(email, additionalData);
      
      // 2. Send notification to you via Formspree (so you know someone signed up)
      try {
        await fetch('https://formspree.io/f/mdkekqwg', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            subject: 'New SatsGate Waitlist Signup',
            message: `New user joined the waitlist: ${email}`,
            'User Email': email,
            'Signup Date': new Date().toLocaleDateString(),
            'Timestamp': new Date().toISOString(),
            ...additionalData
          }),
        });
        console.log('✅ Notification sent to creator');
      } catch (notificationError) {
        console.warn('Failed to send notification to creator:', notificationError);
        // Don't fail the whole process if notification fails
      }
      
      return userEmailResult;
      
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return { 
        success: false, 
        message: 'Failed to send welcome email. Please try again.' 
      };
    }
  }

  /**
   * Send welcome email via Brevo (formerly Sendinblue)
   */
  private static async sendWelcomeViaBrevo(email: string, data: any = {}): Promise<{ success: boolean; message: string }> {
    const apiKey = import.meta.env.VITE_BREVO_API_KEY;
    const fromEmail = import.meta.env.VITE_FROM_EMAIL || 'noreply@satsgate.com';
    const fromName = import.meta.env.VITE_FROM_NAME || 'Emmanuel from SatsGate';
    
    if (!apiKey) {
      console.warn('Brevo API key not configured, using fallback message');
      return { 
        success: true, 
        message: 'Welcome to the waitlist! We\'ll be in touch soon.' 
      };
    }

    try {
      const template = this.getWelcomeEmailTemplate(data);
      
      const payload = {
        sender: {
          name: fromName,
          email: fromEmail
        },
        to: [
          {
            email: email,
            name: email.split('@')[0] // Use part before @ as name
          }
        ],
        subject: template.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent
      };

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': apiKey
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Brevo API error:', errorText);
        
        let errorMessage = 'Failed to send email';
        try {
          const error = JSON.parse(errorText);
          errorMessage = error.message || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(`Brevo error: ${errorMessage}`);
      }

      const result = await response.json();
      console.log('✅ Welcome email sent via Brevo:', result.messageId);
      
      return { 
        success: true, 
        message: 'Welcome to the waitlist! Check your email for a welcome message.' 
      };
      
    } catch (error) {
      console.error('Brevo error:', error);
      return { 
        success: false, 
        message: 'Welcome to the waitlist! (Email delivery may be delayed)' 
      };
    }
  }

  /**
   * Generate welcome email template (for reference)
   */
  static getWelcomeEmailTemplate(data: any = {}): EmailTemplate {
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
            
            <p><strong>Here's what happens next:</strong></p>
            <ul>
                <li>We're currently building the MVP</li>
                <li>Early users will get first access to test payments</li>
                <li>You'll receive updates as features roll out</li>
                <li>Your feedback will help shape the product</li>
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
        </div>
    </div>
</body>
</html>`;

    const textContent = `Hi there,

Thanks for joining the SatsGate waitlist — we're excited to have you early.

SatsGate is a non-custodial Bitcoin payment gateway built on Stacks, designed to help small businesses and freelancers accept BTC easily, with full control of their funds and no centralized processors.

Here's what happens next:
• We're currently building the MVP 
• Early users will get first access to test payments 
• You'll receive updates as features roll out 
• Your feedback will help shape the product

Thanks for being part of the journey.

Let's build the future of Bitcoin payments — together.

Best, 
Emmanuel Ogheneovo 
Founder, SatsGate

---
Built on Bitcoin. Powered by Stacks.`;

    return { subject, htmlContent, textContent };
  }
}