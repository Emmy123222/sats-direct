import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Wallet, Menu, X } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { useState } from "react";
import Logo from "@/components/ui/Logo";

const Navbar = () => {
  const { isConnected, connectWallet, disconnectWallet, btcAddress } = useWallet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <Logo size={32} />
            <span className="text-xl font-bold font-display">SatsGate</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            {isConnected && (
              <Link 
                to="/dashboard" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
            )}
            <a 
              href="#waitlist" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Waitlist
            </a>
          </div>

          {/* Desktop Wallet Connection */}
          <div className="hidden md:flex items-center gap-4">
            {isConnected ? (
              <div className="flex items-center gap-3">
                <div className="text-sm text-muted-foreground">
                  <div className="font-mono text-xs">
                    {btcAddress ? `${btcAddress.slice(0, 6)}...${btcAddress.slice(-4)}` : 'Loading...'}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={disconnectWallet}>
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button onClick={connectWallet}>
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border">
            <div className="flex flex-col gap-4 pt-4">
              <Link 
                to="/" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              {isConnected && (
                <Link 
                  to="/dashboard" 
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              <a 
                href="#waitlist" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
                  setIsMobileMenuOpen(false);
                }}
              >
                Waitlist
              </a>
              
              {/* Mobile Wallet Connection */}
              <div className="pt-2 border-t border-border">
                {isConnected ? (
                  <div className="flex flex-col gap-3">
                    <div className="text-sm text-muted-foreground">
                      <div className="font-mono text-xs">
                        {btcAddress ? `${btcAddress.slice(0, 8)}...${btcAddress.slice(-8)}` : 'Loading...'}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={disconnectWallet}>
                      Disconnect Wallet
                    </Button>
                  </div>
                ) : (
                  <Button onClick={connectWallet} className="w-full">
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;