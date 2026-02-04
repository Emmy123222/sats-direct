import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowLeft, Wallet } from "lucide-react";
import BitcoinIcon from "@/components/icons/BitcoinIcon";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <BitcoinIcon size={32} className="text-primary" />
            <span className="text-xl font-bold">SatsGate</span>
          </Link>
          
          <Button className="glow-orange">
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </Button>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="border-dashed">
            <CardHeader>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
              <CardDescription className="text-base">
                Connect your Hiro or Leather wallet to start accepting Bitcoin payments.
                Your funds go directly to your wallet — we never touch them.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button size="lg" className="glow-orange">
                <Wallet className="w-4 h-4 mr-2" />
                Connect Hiro / Leather Wallet
              </Button>
              
              <p className="text-sm text-muted-foreground">
                Don't have a wallet?{" "}
                <a 
                  href="https://wallet.hiro.so/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Get Hiro Wallet
                </a>
              </p>
            </CardContent>
          </Card>
          
          <Button variant="ghost" className="mt-8" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
