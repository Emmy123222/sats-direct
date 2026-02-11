import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AddEscrowPage() {
  const { stxAddress } = useWallet();
  const navigate = useNavigate();
  const [escrowId, setEscrowId] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!escrowId || parseInt(escrowId) <= 0) {
      toast.error('Please enter a valid escrow ID');
      return;
    }

    if (!stxAddress) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsAdding(true);

    try {
      const id = parseInt(escrowId);
      
      // Verify escrow exists on blockchain
      const { getEscrow } = await import('@/utils/contractInteraction');
      const escrowData = await getEscrow(id);
      
      if (!escrowData || escrowData.result === '0x09') {
        toast.error(`Escrow #${id} does not exist on the blockchain`);
        setIsAdding(false);
        return;
      }

      // Add to user's escrow list
      const storageKey = `my_escrows_${stxAddress}`;
      const existing = localStorage.getItem(storageKey);
      const escrowIds: number[] = existing ? JSON.parse(existing) : [];
      
      if (escrowIds.includes(id)) {
        toast.info(`Escrow #${id} is already in your list`);
      } else {
        escrowIds.push(id);
        localStorage.setItem(storageKey, JSON.stringify(escrowIds));
        toast.success(`Escrow #${id} added to your dashboard!`);
      }
      
      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
    } catch (error) {
      console.error('Failed to add escrow:', error);
      toast.error('Failed to add escrow. Please check the ID and try again.');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Add Escrow to Dashboard</CardTitle>
          <CardDescription>
            Enter the blockchain escrow ID to track it on your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="escrowId">Escrow ID</Label>
              <Input
                id="escrowId"
                type="number"
                placeholder="e.g., 4"
                value={escrowId}
                onChange={(e) => setEscrowId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This is the number returned when you created the escrow (e.g., 1, 2, 3, 4)
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm">How to find your Escrow ID:</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Check your wallet transaction history</li>
                <li>Find the "create-escrow" transaction</li>
                <li>Click to view on Stacks Explorer</li>
                <li>Look for the return value: (ok u4) ← the number is your ID</li>
              </ol>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isAdding}
            >
              {isAdding ? 'Adding Escrow...' : 'Add to Dashboard'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
