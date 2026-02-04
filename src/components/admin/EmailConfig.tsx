import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { EmailService } from "@/utils/emailService";
import { Mail, Send, CheckCircle, AlertCircle, Settings } from "lucide-react";

const EmailConfig = () => {
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<'unconfigured' | 'configured' | 'tested'>('unconfigured');

  // Check if email is configured
  const isEmailConfigured = () => {
    const resendKey = import.meta.env.VITE_RESEND_API_KEY;
    const sendgridKey = import.meta.env.VITE_SENDGRID_API_KEY;
    const mailgunKey = import.meta.env.VITE_MAILGUN_API_KEY;
    const postmarkKey = import.meta.env.VITE_POSTMARK_API_KEY;
    
    return !!(resendKey || sendgridKey || mailgunKey || postmarkKey);
  };

  const getConfiguredProvider = () => {
    if (import.meta.env.VITE_RESEND_API_KEY) return 'Resend';
    if (import.meta.env.VITE_SENDGRID_API_KEY) return 'SendGrid';
    if (import.meta.env.VITE_MAILGUN_API_KEY) return 'Mailgun';
    if (import.meta.env.VITE_POSTMARK_API_KEY) return 'Postmark';
    return 'None';
  };

  const testEmailConfiguration = async () => {
    if (!testEmail) {
      toast.error("Please enter a test email address");
      return;
    }

    setIsTestingEmail(true);
    
    try {
      const result = await EmailService.sendWelcomeEmail(testEmail, { isTest: true });
      
      if (result.success) {
        setEmailStatus('tested');
        toast.success("Test email sent successfully! Check your inbox.");
      } else {
        toast.error(`Test email failed: ${result.message}`);
      }
    } catch (error) {
      toast.error("Email test failed. Check your configuration.");
      console.error('Email test error:', error);
    } finally {
      setIsTestingEmail(false);
    }
  };

  const getStatusBadge = () => {
    if (!isEmailConfigured()) {
      return <Badge variant="destructive">Not Configured</Badge>;
    }
    
    switch (emailStatus) {
      case 'configured':
        return <Badge variant="secondary">Configured</Badge>;
      case 'tested':
        return <Badge variant="default">Tested & Working</Badge>;
      default:
        return <Badge variant="secondary">Configured</Badge>;
    }
  };

  const getStatusIcon = () => {
    if (!isEmailConfigured()) {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
    
    return emailStatus === 'tested' 
      ? <CheckCircle className="w-5 h-5 text-green-500" />
      : <Settings className="w-5 h-5 text-yellow-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5" />
            <div>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>
                Configure email notifications for waitlist signups
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!isEmailConfigured() ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Email Not Configured
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
              To send welcome emails to waitlist subscribers, you need to configure a professional email service.
            </p>
            
            <div className="space-y-4">
              <h5 className="font-medium text-yellow-800 dark:text-yellow-200">
                Recommended Email Services:
              </h5>
              
              <div className="grid gap-3 text-sm">
                <div className="bg-yellow-100 dark:bg-yellow-800 p-3 rounded">
                  <div className="font-medium">🚀 Resend (Recommended)</div>
                  <div className="text-xs text-yellow-700 dark:text-yellow-300">
                    Modern, developer-friendly • 3,000 emails/month free • <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="underline">resend.com</a>
                  </div>
                </div>
                
                <div className="bg-yellow-100 dark:bg-yellow-800 p-3 rounded">
                  <div className="font-medium">📧 SendGrid</div>
                  <div className="text-xs text-yellow-700 dark:text-yellow-300">
                    Enterprise standard • 100 emails/day free • <a href="https://sendgrid.com" target="_blank" rel="noopener noreferrer" className="underline">sendgrid.com</a>
                  </div>
                </div>
                
                <div className="bg-yellow-100 dark:bg-yellow-800 p-3 rounded">
                  <div className="font-medium">🔧 Mailgun</div>
                  <div className="text-xs text-yellow-700 dark:text-yellow-300">
                    Developer favorite • 5,000 emails/month free • <a href="https://mailgun.com" target="_blank" rel="noopener noreferrer" className="underline">mailgun.com</a>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <h6 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  Quick Setup (Resend):
                </h6>
                <ol className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-decimal list-inside">
                  <li>Sign up at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="underline">resend.com</a></li>
                  <li>Get your API key from the dashboard</li>
                  <li>Add to your <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">.env.local</code> file:</li>
                </ol>
                
                <div className="bg-yellow-100 dark:bg-yellow-800 p-3 rounded text-xs font-mono mt-2">
                  VITE_RESEND_API_KEY=re_xxxxxxxxxx<br/>
                  VITE_FROM_EMAIL=hello@yourdomain.com<br/>
                  VITE_FROM_NAME=Your Team Name
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                ✅ Email Service Configured ({getConfiguredProvider()})
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                {getConfiguredProvider()} is configured and ready to send welcome emails to new waitlist subscribers.
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="test-email">Test Email Configuration</Label>
              <div className="flex gap-2">
                <Input
                  id="test-email"
                  type="email"
                  placeholder="your-email@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={testEmailConfiguration}
                  disabled={isTestingEmail || !testEmail}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isTestingEmail ? "Sending..." : "Test"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Send a test welcome email to verify your configuration is working.
              </p>
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Email Features</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>✅ Automatic welcome emails for new subscribers</li>
            <li>✅ Professional HTML email templates</li>
            <li>✅ Fallback to plain text for compatibility</li>
            <li>✅ Graceful error handling (signup still works if email fails)</li>
            <li>✅ Multiple professional providers (Resend, SendGrid, Mailgun, Postmark)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailConfig;