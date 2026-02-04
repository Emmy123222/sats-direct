import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  btcAddress: string;
}

const Dashboard = () => {
  const { isConnected, connectWallet, btcAddress } = useWallet();
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('satsgate_invoices');
    return saved ? JSON.parse(saved) : [];
  });

  const createInvoice = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const invoice: Invoice = {
      id: Math.random().toString(36).substr(2, 9),
      amount: parseFloat(amount),
      memo: memo || "",
      status: 'pending',
      createdAt: new Date().toISOString(),
      btcAddress: btcAddress
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
                  Connect your Hiro or Leather wallet to start accepting Bitcoin payments.
                  Your funds go directly to your wallet — we never touch them.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button size="lg" onClick={connectWallet}>
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Received</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalReceived.toFixed(8)} BTC</div>
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

        {/* Create Invoice */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Invoices</h2>
          <Button onClick={() => setShowCreateInvoice(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
        </div>

        {showCreateInvoice && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Invoice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount (BTC)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.00000001"
                  placeholder="0.001"
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
        <div className="space-y-4">
          {invoices.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No invoices yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first invoice to start accepting Bitcoin payments
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
                        {invoice.amount} BTC
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
