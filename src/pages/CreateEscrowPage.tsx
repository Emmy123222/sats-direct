import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AmountInput } from '@/components/escrow/AmountInput';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CreateEscrowPage() {
  const { address } = useWallet();
  const navigate = useNavigate();
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    
    if (!deadline || parseInt(deadline) <= 0) {
      toast.error('Please enter a valid deadline');
      return;
    }

    setIsCreating(true);

    try {
      // Convert amount to microSTX
      const amountMicroSTX = Math.floor(parseFloat(amount) * 1000000);
      const deadlineBlock = parseInt(deadline);
      
      // Show initial toast
      toast.info('Creating escrow... Please sign the transaction in your wallet.');
      
      // Call smart contract create-escrow function
      const { createEscrow } = await import('@/utils/contractInteraction');
      
      // This will open the wallet and return when user signs (or cancels)
      await createEscrow(amountMicroSTX, deadlineBlock, description, buyerAddress || undefined);
      
      // Transaction submitted!
      toast.success('Escrow created! Transaction submitted to blockchain.');
      toast.info('It will appear on your dashboard in 10-15 minutes after confirmation. Check back later!');
      
      // Note: In production, you would:
      // 1. Get the transaction ID from the wallet
      // 2. Poll for confirmation using transactionPoller
      // 3. Extract the escrow ID from the return value
      // 4. Save it to localStorage: my_escrows_{address}
      // For now, user needs to manually note their escrow ID from the transaction
      
      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      
    } catch (error) {
      console.error('Failed to create escrow:', error);
      toast.error('Failed to create escrow. Please check: 1) Contract is deployed 2) You have enough STX for fees 3) Wallet is connected');
    } finally {
      setIsCreating(false);
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
          <CardTitle>Create Payment Link</CardTitle>
          <CardDescription>
            Set up a new escrow and generate a payment link to share with your buyer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-6">
            <AmountInput
              value={amount}
              onChange={setAmount}
              currency="STX"
              label="Payment Amount"
            />

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What is this payment for? (e.g., Website design, Consulting services)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={256}
              />
              <p className="text-xs text-muted-foreground">
                {description.length}/256 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline (Block Height)</Label>
              <Input
                id="deadline"
                type="number"
                placeholder="e.g., 150000"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The buyer must deposit funds before this block height
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyer">Buyer Address (Optional)</Label>
              <Input
                id="buyer"
                type="text"
                placeholder="SP2... (leave empty for any buyer)"
                value={buyerAddress}
                onChange={(e) => setBuyerAddress(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Specify a buyer address to restrict who can pay this escrow
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Summary</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>• You (seller): {address?.slice(0, 10)}...</p>
                <p>• Amount: {amount || '0'} STX</p>
                <p>• Buyer: {buyerAddress || 'Any address'}</p>
                <p>• Deadline: Block {deadline || 'Not set'}</p>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isCreating}
            >
              {isCreating ? 'Creating Escrow...' : 'Create Payment Link'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
