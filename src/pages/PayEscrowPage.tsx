import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EscrowStatusBadge } from '@/components/escrow/EscrowStatusBadge';
import { toast } from 'sonner';
import { ArrowLeft, Shield, Clock, User } from 'lucide-react';

export default function PayEscrowPage() {
  const { escrowId } = useParams<{ escrowId: string }>();
  const { isConnected, address, connectWallet } = useWallet();
  const navigate = useNavigate();
  
  const [escrow, setEscrow] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    loadEscrow();
  }, [escrowId]);

  const loadEscrow = async () => {
    try {
      setIsLoading(true);
      
      console.log(`[PayEscrowPage] Loading escrow #${escrowId}`);
      
      // Try to fetch from blockchain first
      try {
        console.log('[PayEscrowPage] Attempting blockchain fetch...');
        const { getEscrow } = await import('@/utils/contractInteraction');
        const contractData = await getEscrow(parseInt(escrowId!));
        
        console.log('[PayEscrowPage] Blockchain response:', contractData);
        
        // Parse the blockchain response
        const escrowData = parseEscrowData(contractData, escrowId!);
        
        console.log('[PayEscrowPage] Parsed escrow data:', escrowData);
        
        if (escrowData) {
          console.log('[PayEscrowPage] ✅ Escrow loaded from blockchain');
          setEscrow(escrowData);
          setIsLoading(false);
          return;
        } else {
          console.log('[PayEscrowPage] ⚠️ parseEscrowData returned null');
        }
      } catch (blockchainError) {
        console.error('[PayEscrowPage] Blockchain fetch failed:', blockchainError);
      }
      
      // Fallback to localStorage
      console.log('[PayEscrowPage] Trying localStorage...');
      const savedEscrows = localStorage.getItem('satsgate_escrows');
      if (savedEscrows) {
        const escrows = JSON.parse(savedEscrows);
        console.log('[PayEscrowPage] Found escrows in localStorage:', escrows.length);
        const found = escrows.find((e: any) => e.id === escrowId);
        
        if (found) {
          console.log('[PayEscrowPage] ✅ Found in localStorage:', found);
          // Convert localStorage format to contract format
          const escrowData = {
            escrowId: found.id,
            seller: found.seller,
            buyer: found.buyer,
            amount: Math.floor(found.amount * 1000000), // Convert to microSTX
            status: found.status === 'created' ? 0 : found.status === 'funded' ? 1 : 2,
            deadline: found.deadline,
            description: found.description,
            createdAt: found.createdAt
          };
          
          setEscrow(escrowData);
          setIsLoading(false);
          return;
        } else {
          console.log('[PayEscrowPage] ❌ Not found in localStorage (looking for ID:', escrowId, ')');
        }
      } else {
        console.log('[PayEscrowPage] No escrows in localStorage');
      }
      
      console.error('[PayEscrowPage] ❌ Escrow not found anywhere');
      toast.error('Escrow not found in blockchain or localStorage');
      setIsLoading(false);
      
    } catch (error) {
      console.error('[PayEscrowPage] Fatal error:', error);
      toast.error('Failed to load escrow details');
      setIsLoading(false);
    }
  };

  // Helper function to parse blockchain escrow data
  const parseEscrowData = (contractData: any, id: string) => {
    try {
      console.log('[parseEscrowData] Input:', { contractData, id });
      
      // The contract returns an optional tuple
      // If it's 'none', the escrow doesn't exist
      if (!contractData || contractData.result === '0x09') {
        console.log('[parseEscrowData] Result is none or missing');
        return null;
      }

      const result = contractData.result;
      console.log('[parseEscrowData] Result hex:', result.substring(0, 100) + '...');
      
      // Parse the hex data directly (inline parsing)
      const hex = result;
      
      // Extract amount (look for pattern after "amount" field)
      const amountMatch = hex.match(/616d6f756e7401([0-9a-f]{32})/i);
      const amount = amountMatch ? parseInt(amountMatch[1], 16) : 0;
      
      // Extract status (look for pattern after "status" field)
      const statusMatch = hex.match(/73746174757301([0-9a-f]{32})/i);
      const status = statusMatch ? parseInt(statusMatch[1], 16) : 0;
      
      // Extract deadline (look for pattern after "deadline" field)
      const deadlineMatch = hex.match(/646561646c696e6501([0-9a-f]{32})/i);
      const deadline = deadlineMatch ? parseInt(deadlineMatch[1], 16) : 0;
      
      console.log('[parseEscrowData] Parsed values:', { amount, status, deadline });
      
      if (!amount) {
        console.log('[parseEscrowData] Could not parse amount');
        return null;
      }

      const escrowData = {
        escrowId: id,
        seller: 'ST3XJC356F2NYYBT4JBEYW5KWYHVRHEZ1YDZG65KT', // TODO: Parse from result
        buyer: null, // TODO: Parse from result
        amount: amount,
        status: status,
        deadline: deadline,
        description: 'Blockchain Escrow', // TODO: Parse from result
        createdAt: Date.now()
      };
      
      console.log('[parseEscrowData] Final escrow data:', escrowData);
      return escrowData;
    } catch (error) {
      console.error('[parseEscrowData] Error:', error);
      return null;
    }
  };

  const handlePay = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (escrow.status !== 0) {
      toast.error('This escrow has already been funded');
      return;
    }

    setIsPaying(true);

    try {
      // Call smart contract deposit function
      const { depositToEscrow } = await import('@/utils/contractInteraction');
      
      // IMPORTANT: The escrowId must be the actual blockchain escrow ID, not localStorage ID
      // For now, we're using the localStorage ID which won't work with real contract
      // In production, you need to capture the actual escrow ID from create-escrow transaction
      await depositToEscrow(parseInt(escrowId!));
      
      // Update localStorage
      const savedEscrows = localStorage.getItem('satsgate_escrows');
      if (savedEscrows) {
        const escrows = JSON.parse(savedEscrows);
        const updatedEscrows = escrows.map((e: any) => 
          e.id === escrowId ? { ...e, status: 'funded', buyer: address } : e
        );
        localStorage.setItem('satsgate_escrows', JSON.stringify(updatedEscrows));
      }
      
      toast.success('Payment successful! Funds are now in escrow.');
      toast.info('Transaction submitted. It may take 10-15 minutes to confirm on testnet.');
      
      setTimeout(() => {
        navigate(`/escrow/${escrowId}`);
      }, 2000);
      
    } catch (error) {
      console.error('Payment failed:', error);
      toast.error('Payment failed. Please check: 1) You have enough STX 2) Escrow exists on blockchain 3) Deadline has not passed');
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-8">
        <div className="text-center">Loading escrow details...</div>
      </div>
    );
  }

  if (!escrow) {
    return (
      <div className="container max-w-2xl py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Escrow not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatAmount = (amount: number) => {
    return (amount / 1000000).toFixed(2);
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  return (
    <div className="container max-w-2xl py-8">
      <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>

      <div className="space-y-6">
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">Payment Request</CardTitle>
                <CardDescription className="mt-2">
                  Escrow #{escrowId}
                </CardDescription>
              </div>
              <EscrowStatusBadge status={escrow.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Amount to Pay</p>
              <p className="text-4xl font-bold">{formatAmount(escrow.amount)} STX</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Seller</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {formatAddress(escrow.seller)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Description</p>
                  <p className="text-sm text-muted-foreground">
                    {escrow.description}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Deadline</p>
                  <p className="text-sm text-muted-foreground">
                    Block {escrow.deadline}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2">🔒 How Escrow Works</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Your payment is held securely in the smart contract</li>
                <li>Seller completes the work/service</li>
                <li>You approve and release the funds</li>
                <li>Seller receives payment</li>
              </ol>
            </div>

            {!isConnected ? (
              <Button 
                onClick={connectWallet}
                size="lg"
                className="w-full"
              >
                Connect Wallet to Pay
              </Button>
            ) : (
              <Button 
                onClick={handlePay}
                size="lg"
                className="w-full"
                disabled={isPaying || escrow.status !== 0}
              >
                {isPaying ? 'Processing Payment...' : `Pay ${formatAmount(escrow.amount)} STX`}
              </Button>
            )}

            {escrow.status !== 0 && (
              <p className="text-sm text-center text-muted-foreground">
                This escrow has already been funded
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
