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
    // Formspree is hardcoded, so it's always configured
    return true;
  };

  const getConfiguredProvider = () => {
    // Check if other providers are configured, otherwise default to Formspree
    if (import.meta.env.VITE_RESEND_API_KEY) return 'Resend';
    if (import.meta.env.VITE_SENDGRID_API_KEY) return 'SendGrid';
    if (import.meta.env.VITE_MAILGUN_API_KEY) return 'Mailgun';
    if (import.meta.env.VITE_POSTMARK_API_KEY) return 'Postmark';
    return 'Formspree (Pre-configured)';
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
          // This will never show since Formspree is pre-configured
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Email Not Configured
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              This shouldn't happen - Formspree is pre-configured!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                ✅ Email Service Ready ({getConfiguredProvider()})
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Formspree is pre-configured with your endpoint: <code className="bg-green-100 dark:bg-green-800 px-1 rounded text-xs">https://formspree.io/f/mdkekqwg</code>
              </p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                Welcome emails will be sent automatically to new waitlist subscribers using your custom message from Emmanuel.
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
            <li>✅ Multiple simple providers (Formspree, Resend, SendGrid, Mailgun, Postmark)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailConfig;