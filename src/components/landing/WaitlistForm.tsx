import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckCircle, Mail } from "lucide-react";

export const WaitlistForm = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    // Store in localStorage for MVP
    try {
      const existingEmails = JSON.parse(localStorage.getItem("satsgate_waitlist") || "[]");
      
      if (existingEmails.includes(email)) {
        toast.info("You're already on the waitlist!");
        setIsLoading(false);
        return;
      }
      
      existingEmails.push(email);
      localStorage.setItem("satsgate_waitlist", JSON.stringify(existingEmails));
      
      setIsSubmitted(true);
      toast.success("Welcome to the waitlist!");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <section id="waitlist" className="py-20 border-t border-border">
        <div className="container px-4">
          <div className="max-w-xl mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-3xl font-bold mb-4">You're on the list!</h2>
            <p className="text-muted-foreground">
              We'll notify you when SatsGate is ready. In the meantime, you can connect your wallet to explore the dashboard.
            </p>
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
          <h2 className="text-3xl font-bold mb-4">Get early access</h2>
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
              className="flex-1 h-12 bg-secondary border-border"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="lg"
              className="h-12 px-8 glow-orange"
              disabled={isLoading}
            >
              {isLoading ? "Joining..." : "Join Waitlist"}
            </Button>
          </form>
          
          <p className="text-sm text-muted-foreground mt-4">
            No spam. Just Bitcoin updates.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WaitlistForm;
