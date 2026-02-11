import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, Send, Users, AlertTriangle } from "lucide-react";

export const AnnouncementSender = () => {
  const [adminSecret, setAdminSecret] = useState("");
  const [subject, setSubject] = useState("Welcome to SatsGate - Bitcoin payments on Stacks!");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const handleSendAnnouncement = async () => {
    if (!adminSecret.trim()) {
      toast.error("Please enter the admin secret");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/send-waitlist-announcement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminSecret}`
        },
        body: JSON.stringify({
          subject: subject,
          customMessage: message
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        setLastResult(result);
        toast.success(`Announcement sent to ${result.sentSuccessfully} subscribers!`);
      } else {
        toast.error(result.error || 'Failed to send announcement');
      }
    } catch (error) {
      console.error('Announcement error:', error);
      toast.error('Failed to send announcement');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Waitlist Announcement Sender
          </CardTitle>
          <CardDescription>
            Send announcements to all waitlist subscribers. Use with caution.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adminSecret">Admin Secret</Label>
            <Input
              id="adminSecret"
              type="password"
              placeholder="Enter admin secret"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject</Label>
            <Input
              id="subject"
              placeholder="Email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Custom Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a custom message to the standard welcome email..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              This will send emails to ALL waitlist subscribers. Make sure you're ready!
            </span>
          </div>

          <Button 
            onClick={handleSendAnnouncement}
            disabled={isLoading || !adminSecret.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>Sending...</>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Announcement
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {lastResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Last Send Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{lastResult.totalRecipients}</div>
                <div className="text-sm text-muted-foreground">Total Recipients</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{lastResult.sentSuccessfully}</div>
                <div className="text-sm text-muted-foreground">Sent Successfully</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{lastResult.failed}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>
            
            {lastResult.failed > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-red-600 mb-2">Failed Emails:</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {lastResult.details
                    .filter((r: any) => !r.success)
                    .map((r: any, i: number) => (
                      <div key={i} className="text-sm text-red-600">
                        {r.email}: {r.error}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};