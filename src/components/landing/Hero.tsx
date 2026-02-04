import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useWallet } from "@/contexts/WalletContext";
import Logo from "@/components/ui/Logo";

export const Hero = () => {
  const { isConnected, connectWallet } = useWallet();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      
      <div className="container relative z-10 px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-8">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Non-custodial Bitcoin payments</span>
          </div>
          
          {/* Main headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display tracking-tight mb-6">
            Accept Bitcoin payments.{" "}
            <span className="text-gradient-orange">Keep your keys.</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            The simplest way to accept BTC payments directly to your wallet. 
            No middlemen. No KYC. No chargebacks. Just Bitcoin.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isConnected ? (
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 font-semibold"
                asChild
              >
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            ) : (
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 font-semibold"
                onClick={connectWallet}
              >
                Connect Wallet
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="lg"
              className="text-lg px-8 py-6"
              onClick={() => {
                document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Join Waitlist
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
