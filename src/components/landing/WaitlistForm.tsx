import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckCircle, Mail } from "lucide-react";
import { WaitlistService } from "@/utils/waitlistService";

export const WaitlistForm = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
              Welcome to the SatsGate waitlist! Check your email for a welcome message from Emmanuel. 
              You'll be among the first to know when we launch.
            </p>

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
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="satoshi@bitcoin.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-12 bg-white border-border text-black placeholder:text-gray-500"
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
