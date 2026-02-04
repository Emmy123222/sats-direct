import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckCircle, Mail, Users } from "lucide-react";
import { WaitlistService } from "@/utils/waitlistService";

export const WaitlistForm = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [waitlistStats, setWaitlistStats] = useState(WaitlistService.getWaitlistStats());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      const result = await WaitlistService.addToWaitlist(email);
      
      if (result.success) {
        setIsSubmitted(true);
        setWaitlistStats(WaitlistService.getWaitlistStats());
        toast.success(result.message);
        
        // Clear form
        setEmail("");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Waitlist submission error:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setIsSubmitted(false);
    setEmail("");
  };

  if (isSubmitted) {
    return (
      <section id="waitlist" className="py-20 border-t border-border">
        <div className="container px-4">
          <div className="max-w-xl mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-bold font-display mb-4">You're on the list!</h2>
            <p className="text-muted-foreground mb-6">
              Welcome to the SatsGate waitlist! We'll notify you as soon as we launch. 
              In the meantime, you can connect your wallet to explore the dashboard.
            </p>
            
            {/* Waitlist Stats */}
            <div className="bg-secondary/50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>You're one of {waitlistStats.total} early adopters!</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={handleTryAgain}>
                Add Another Email
              </Button>
              <Button asChild>
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('nav')?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  Explore Dashboard
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="waitlist" className="py-20 border-t border-border">
      <div className="container px-4">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold font-display mb-4">Get early access</h2>
          <p className="text-muted-foreground mb-8">
            Join the waitlist to be first in line when we launch. 
            We're building the future of Bitcoin payments.
          </p>
          
          {/* Waitlist Stats */}
          {waitlistStats.total > 0 && (
            <div className="bg-secondary/50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{waitlistStats.total} people already joined</span>
                {waitlistStats.today > 0 && (
                  <span className="text-primary">• {waitlistStats.today} today</span>
                )}
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="satoshi@bitcoin.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-12 bg-secondary border-border"
              disabled={isLoading}
              required
            />
            <Button 
              type="submit" 
              size="lg"
              className="h-12 px-8"
              disabled={isLoading || !email.trim()}
            >
              {isLoading ? "Joining..." : "Join Waitlist"}
            </Button>
          </form>
          
          <div className="mt-6 space-y-2">
            <p className="text-sm text-muted-foreground">
              No spam. Just Bitcoin updates and launch notifications.
            </p>
            <p className="text-xs text-muted-foreground">
              By joining, you agree to receive updates about SatsGate. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WaitlistForm;
