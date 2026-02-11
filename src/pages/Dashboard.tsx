import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowLeft, Wallet, Plus, Copy, ExternalLink } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "sonner";
import Navbar from "@/components/ui/Navbar";

interface Invoice {
  id: string;
  amount: number;
  memo: string;
  status: 'pending' | 'paid';
  createdAt: string;
  stxAddress: string;
}

const Dashboard = () => {
  const { isConnected, connectWallet, stxAddress } = useWallet();
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [balance, setBalance] = useState<number>(0);
  const [escrows, setEscrows] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('satsgate_invoices');
    if (!saved) return [];
    
    try {
      const parsed = JSON.parse(saved);
      // Filter out old invoices with btcAddress instead of stxAddress
      return parsed.filter((inv: any) => inv.stxAddress);
    } catch {
      return [];
    }
  });

  // Fetch balance when wallet is connected
  useEffect(() => {
    if (stxAddress) {
      fetchBalance();
      fetchEscrows();
    }
  }, [stxAddress]);

  // Refresh escrows when component mounts or becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && stxAddress) {
        fetchEscrows();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also refresh when navigating back to this page
    fetchEscrows();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [stxAddress]);

  const fetchBalance = async () => {
    if (!stxAddress) return;
    
    try {
      const { StacksPaymentMonitor } = await import('@/utils/stacksPaymentMonitor');
      const bal = await StacksPaymentMonitor.getBalance(stxAddress);
      setBalance(bal);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchEscrows = async () => {
    if (!stxAddress) return;
    
    try {
      console.log('[Dashboard] Fetching user escrows...');
      
      // Auto-discover escrows from user's transaction history
      const { autoDiscoverEscrows } = await import('@/utils/escrowDiscovery');
      const escrowIds = await autoDiscoverEscrows(stxAddress);
      
      console.log(`[Dashboard] User has ${escrowIds.length} escrows:`, escrowIds);
      
      if (escrowIds.length === 0) {
        setEscrows([]);
        return;
      }
      
      // Fetch each escrow's current data from blockchain
      const { getEscrow } = await import('@/utils/contractInteraction');
      const userEscrows = [];
      
      for (const escrowId of escrowIds) {
        try {
          const escrowData = await getEscrow(escrowId);
          
          if (escrowData && escrowData.result !== '0x09') {
            const hex = escrowData.result;
            
            // Extract amount
            const amountMatch = hex.match(/616d6f756e7401([0-9a-f]{32})/i);
            const amount = amountMatch ? parseInt(amountMatch[1], 16) / 1000000 : 0;
            
            // Extract status
            const statusMatch = hex.match(/73746174757301([0-9a-f]{32})/i);
            const statusNum = statusMatch ? parseInt(statusMatch[1], 16) : 0;
            const statusNames = ['created', 'funded', 'completed', 'released', 'cancelled'];
            const status = statusNames[statusNum] || 'created';
            
            // Extract deadline
            const deadlineMatch = hex.match(/646561646c696e6501([0-9a-f]{32})/i);
            const deadline = deadlineMatch ? parseInt(deadlineMatch[1], 16) : 0;
            
            // Extract description (try to parse from hex)
            const descMatch = hex.match(/6465736372697074696f6e0e([0-9a-f]{8})([0-9a-f]+)/i);
            let description = `Escrow #${escrowId}`;
            if (descMatch) {
              try {
                const length = parseInt(descMatch[1], 16);
                const descHex = descMatch[2].slice(0, length * 2);
                description = '';
                for (let i = 0; i < descHex.length; i += 2) {
                  description += String.fromCharCode(parseInt(descHex.substr(i, 2), 16));
                }
              } catch (e) {
                // Keep default description
              }
            }
            
            userEscrows.push({
              id: escrowId.toString(),
              seller: stxAddress, // User is the seller
              buyer: null,
              amount,
              description,
              deadline,
              status,
              createdAt: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error(`[Dashboard] Error fetching escrow ${escrowId}:`, error);
        }
      }
      
      console.log(`[Dashboard] Loaded ${userEscrows.length} escrows from blockchain`);
      setEscrows(userEscrows);
      
    } catch (error) {
      console.error('[Dashboard] Error fetching escrows:', error);
      setEscrows([]);
    }
  };

  const createInvoice = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!stxAddress) {
      toast.error("Wallet address not loaded. Please reconnect your wallet.");
      return;
    }

    const invoice: Invoice = {
      id: Math.random().toString(36).substr(2, 9),
      amount: parseFloat(amount),
      memo: memo || "",
      status: 'pending',
      createdAt: new Date().toISOString(),
      stxAddress: stxAddress
    };

    const updatedInvoices = [invoice, ...invoices];
    setInvoices(updatedInvoices);
    localStorage.setItem('satsgate_invoices', JSON.stringify(updatedInvoices));
    
    setAmount("");
    setMemo("");
    setShowCreateInvoice(false);
    toast.success("Invoice created successfully!");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const totalReceived = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
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
                  Connect your Leather or Xverse wallet to start accepting STX payments.
                  Your funds go directly to your wallet — we never touch them.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button size="lg" onClick={connectWallet}>
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Leather / Xverse Wallet
                </Button>
                
                <p className="text-sm text-muted-foreground">
                  Don't have a wallet?{" "}
                  <a 
                    href="https://leather.io/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Get Leather Wallet
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
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Main content */}
      <main className="container px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Wallet Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{balance.toFixed(6)} STX</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {invoices.filter(inv => inv.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wallet Address Display */}
        {stxAddress && (
          <Card className="mb-6 bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Your Stacks Address</p>
                  <code className="text-sm font-mono">{stxAddress}</code>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(stxAddress)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Invoice */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Escrows & Invoices</h2>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/create">
                <Plus className="w-4 h-4 mr-2" />
                Create Escrow
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/add-escrow">
                <Plus className="w-4 h-4 mr-2" />
                Add Escrow
              </Link>
            </Button>
            <Button variant="outline" onClick={() => setShowCreateInvoice(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          </div>
        </div>

        {/* Escrows Section */}
        {escrows.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Your Escrows</h3>
            <div className="space-y-4">
              {escrows.map((escrow) => (
                <Card key={escrow.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{escrow.description}</h4>
                          <Badge variant={escrow.status === 'created' ? 'secondary' : 'default'}>
                            {escrow.status}
                          </Badge>
                        </div>
                        <div className="text-lg font-semibold mb-2">
                          {escrow.amount} STX
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>
                            Role: {escrow.seller === stxAddress ? 'Seller' : 'Buyer'}
                            {escrow.seller === stxAddress && escrow.status === 'funded' && (
                              <span className="ml-2 text-orange-600 font-medium">• Action needed: Mark work complete</span>
                            )}
                            {escrow.seller !== stxAddress && escrow.status === 'completed' && (
                              <span className="ml-2 text-orange-600 font-medium">• Action needed: Release funds</span>
                            )}
                          </div>
                          <div>Deadline: Block {escrow.deadline}</div>
                          <div>Created: {new Date(escrow.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/escrow/${escrow.id}`}>
                            View Details
                          </Link>
                        </Button>
                        
                        {/* Buyer: Fund Escrow (status = created) */}
                        {escrow.status === 'created' && (
                          <Button size="sm" asChild>
                            <Link to={`/pay/${escrow.id}`}>
                              Fund Escrow
                            </Link>
                          </Button>
                        )}
                        
                        {/* Seller: Mark Complete (status = funded) */}
                        {escrow.seller === stxAddress && escrow.status === 'funded' && (
                          <Button size="sm" asChild>
                            <Link to={`/escrow/${escrow.id}`}>
                              Mark Complete
                            </Link>
                          </Button>
                        )}
                        
                        {/* Buyer: Release Funds (status = completed) */}
                        {escrow.status === 'completed' && escrow.seller !== stxAddress && (
                          <Button size="sm" asChild>
                            <Link to={`/escrow/${escrow.id}`}>
                              Release Funds
                            </Link>
                          </Button>
                        )}
                        
                        {/* Seller: Share Link (status = created) */}
                        {escrow.seller === stxAddress && escrow.status === 'created' && (
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/pay/${escrow.id}`}>
                              Share Link
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {showCreateInvoice && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Invoice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount (STX)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.000001"
                  placeholder="1.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="memo">Memo (optional)</Label>
                <Textarea
                  id="memo"
                  placeholder="Payment for services..."
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={createInvoice}>
                  Create Invoice
                </Button>
                <Button variant="outline" onClick={() => setShowCreateInvoice(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invoice List */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Your Invoices</h3>
        </div>
        <div className="space-y-4">
          {invoices.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No invoices yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first invoice to start accepting STX payments
                </p>
                <Button onClick={() => setShowCreateInvoice(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Invoice
                </Button>
              </CardContent>
            </Card>
          ) : (
            invoices.map((invoice) => (
              <Card key={invoice.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm text-muted-foreground">
                          #{invoice.id}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          invoice.status === 'paid' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {invoice.status}
                        </span>
                      </div>
                      <div className="text-lg font-semibold mb-1">
                        {invoice.amount} STX
                      </div>
                      {invoice.memo && (
                        <p className="text-muted-foreground text-sm mb-2">{invoice.memo}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(invoice.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(`${window.location.origin}/invoice/${invoice.id}`)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/invoice/${invoice.id}`}>
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
