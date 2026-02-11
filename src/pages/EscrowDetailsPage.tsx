import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EscrowStatusBadge } from '@/components/escrow/EscrowStatusBadge';
import { TransactionTimeline } from '@/components/escrow/TransactionTimeline';
import { PaymentLinkCard } from '@/components/escrow/PaymentLinkCard';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

export default function EscrowDetailsPage() {
  const { escrowId } = useParams<{ escrowId: string }>();
  const { address } = useWallet();
  
  const [escrow, setEscrow] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadEscrow();
  }, [escrowId]);

  const loadEscrow = async () => {
    try {
      setIsLoading(true);
      
      // Try to fetch from blockchain first
      try {
        const { getEscrow } = await import('@/utils/contractInteraction');
        const contractData = await getEscrow(parseInt(escrowId!));
        
        // Parse the blockchain response
        const escrowData = parseEscrowData(contractData, escrowId!);
        
        if (escrowData) {
          setEscrow(escrowData);
          setIsLoading(false);
          return;
        }
      } catch (blockchainError) {
        console.log('Could not fetch from blockchain, trying localStorage...', blockchainError);
      }
      
      // Fallback to localStorage
      const savedEscrows = localStorage.getItem('satsgate_escrows');
      if (savedEscrows) {
        const escrows = JSON.parse(savedEscrows);
        const found = escrows.find((e: any) => e.id === escrowId);
        
        if (found) {
          // Convert localStorage format to contract format
          const escrowData = {
            escrowId: found.id,
            seller: found.seller,
            buyer: found.buyer,
            amount: Math.floor(found.amount * 1000000), // Convert to microSTX
            status: found.status === 'created' ? 0 : found.status === 'funded' ? 1 : 2,
            deadline: found.deadline,
            description: found.description,
            createdAt: found.createdAt,
            fundedAt: found.fundedAt || null,
            completedAt: found.completedAt || null
          };
          
          setEscrow(escrowData);
          setIsLoading(false);
          return;
        }
      }
      
      toast.error('Escrow not found in blockchain or localStorage');
      setIsLoading(false);
      
    } catch (error) {
      console.error('Failed to load escrow:', error);
      toast.error('Failed to load escrow details');
      setIsLoading(false);
    }
  };

  // Helper function to parse blockchain escrow data
  const parseEscrowData = (contractData: any, id: string) => {
    try {
      // The contract returns an optional tuple
      // If it's 'none', the escrow doesn't exist
      if (!contractData || contractData.result === '0x09') {
        return null;
      }

      const result = contractData.result;
      
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
      
      if (!amount) return null;

      return {
        escrowId: id,
        seller: 'ST3XJC356F2NYYBT4JBEYW5KWYHVRHEZ1YDZG65KT', // TODO: Parse from result
        buyer: null, // TODO: Parse from result
        amount: amount,
        status: status,
        deadline: deadline,
        description: 'Blockchain Escrow', // TODO: Parse from result
        createdAt: deadline || Date.now(),
        fundedAt: null,
        completedAt: null
      };
    } catch (error) {
      console.error('Error parsing escrow data:', error);
      return null;
    }
  };

  const handleMarkComplete = async () => {
    setIsProcessing(true);
    try {
      const { markComplete } = await import('@/utils/contractInteraction');
      await markComplete(parseInt(escrowId!));
      toast.success('Work marked as complete! Check your wallet for confirmation.');
      setTimeout(() => loadEscrow(), 2000);
    } catch (error) {
      console.error('Failed to mark complete:', error);
      toast.error('Failed to mark complete');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReleaseFunds = async () => {
    setIsProcessing(true);
    try {
      const { releaseFunds } = await import('@/utils/contractInteraction');
      await releaseFunds(parseInt(escrowId!));
      toast.success('Funds released to seller! Check your wallet for confirmation.');
      setTimeout(() => loadEscrow(), 2000);
    } catch (error) {
      console.error('Failed to release funds:', error);
      toast.error('Failed to release funds');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    setIsProcessing(true);
    try {
      const { cancelEscrow } = await import('@/utils/contractInteraction');
      await cancelEscrow(parseInt(escrowId!));
      toast.success('Escrow cancelled. Check your wallet for confirmation.');
      setTimeout(() => loadEscrow(), 2000);
    } catch (error) {
      console.error('Failed to cancel escrow:', error);
      toast.error('Failed to cancel escrow');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <div className="container py-8">Loading...</div>;
  }

  if (!escrow) {
    return <div className="container py-8">Escrow not found</div>;
  }

  const formatAmount = (amount: number) => (amount / 1000000).toFixed(2);
  const formatAddress = (addr: string) => `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  
  const isSeller = address === escrow.seller;
  const isBuyer = address === escrow.buyer;
  const userRole = isSeller ? 'seller' : isBuyer ? 'buyer' : 'none';

  const timelineEvents = [
    {
      title: 'Escrow Created',
      description: `Seller created the escrow for ${formatAmount(escrow.amount)} STX`,
      timestamp: escrow.createdAt,
      completed: true
    },
    {
      title: 'Funds Deposited',
      description: 'Buyer deposited funds into escrow',
      timestamp: escrow.fundedAt,
      completed: escrow.status >= 1
    },
    {
      title: 'Work Completed',
      description: 'Seller marked work as complete',
      timestamp: escrow.completedAt,
      completed: escrow.status >= 2
    },
    {
      title: 'Funds Released',
      description: 'Buyer approved and released funds to seller',
      completed: escrow.status >= 3
    }
  ];

  return (
    <div className="container max-w-4xl py-8">
      <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">Escrow #{escrowId}</CardTitle>
                <CardDescription className="mt-2">{escrow.description}</CardDescription>
              </div>
              <EscrowStatusBadge status={escrow.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-2xl font-bold">{formatAmount(escrow.amount)} STX</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Seller</p>
                <p className="text-sm font-mono">{formatAddress(escrow.seller)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Buyer</p>
                <p className="text-sm font-mono">
                  {escrow.buyer ? formatAddress(escrow.buyer) : 'Not funded yet'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deadline</p>
                <p className="text-sm">Block {escrow.deadline}</p>
              </div>
            </div>

            {userRole !== 'none' && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm font-medium">
                  You are the <span className="text-primary">{userRole}</span> in this escrow
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {isSeller && escrow.status === 0 && (
          <PaymentLinkCard escrowId={parseInt(escrowId!)} />
        )}

        <Card>
          <CardHeader>
            <CardTitle>Transaction Timeline</CardTitle>
            <CardDescription>Track the progress of this escrow</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionTimeline events={timelineEvents} />
          </CardContent>
        </Card>

        {isSeller && escrow.status === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Seller Actions</CardTitle>
              <CardDescription>Mark the work as complete when finished</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleMarkComplete}
                disabled={isProcessing}
                className="w-full"
              >
                Mark Work as Complete
              </Button>
            </CardContent>
          </Card>
        )}

        {isBuyer && escrow.status === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Buyer Actions</CardTitle>
              <CardDescription>Review the work and release funds if satisfied</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleReleaseFunds}
                disabled={isProcessing}
                className="w-full"
              >
                Approve & Release Funds
              </Button>
            </CardContent>
          </Card>
        )}

        {isSeller && escrow.status === 0 && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Cancel Escrow</CardTitle>
              <CardDescription>Cancel this escrow if no longer needed</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleCancel}
                disabled={isProcessing}
                variant="destructive"
                className="w-full"
              >
                Cancel Escrow
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
