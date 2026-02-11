import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Shield, Zap } from 'lucide-react';

export default function ConnectPage() {
  const { isConnected, connectWallet, address } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected && address) {
      // Redirect to dashboard if already connected
      navigate('/dashboard');
    }
  }, [isConnected, address, navigate]);

  const handleConnect = async () => {
    try {
      await connectWallet();
      // Navigation will happen via useEffect
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold font-display">Connect Your Wallet</h1>
          <p className="text-xl text-muted-foreground">
            Start using SatsGate to create secure STX escrow payments
          </p>
        </div>

        <Card className="border-2">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>Connect with Leather or Xverse</CardTitle>
            <CardDescription>
              Connect your Stacks wallet to access the escrow platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button 
              onClick={handleConnect}
              size="lg"
              className="w-full"
            >
              <Wallet className="mr-2 h-5 w-5" />
              Connect Wallet
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-medium">Secure</h3>
                <p className="text-sm text-muted-foreground">
                  Non-custodial escrow on Stacks
                </p>
              </div>

              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-medium">Fast</h3>
                <p className="text-sm text-muted-foreground">
                  Quick setup and payments
                </p>
              </div>

              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-medium">Your Keys</h3>
                <p className="text-sm text-muted-foreground">
                  You control your STX
                </p>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Don't have a wallet?</strong> Download{' '}
                <a 
                  href="https://leather.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Leather
                </a>
                {' '}or{' '}
                <a 
                  href="https://xverse.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Xverse
                </a>
                {' '}to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
