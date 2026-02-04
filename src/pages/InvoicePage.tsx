import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle, Clock, ExternalLink } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
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

const InvoicePage = () => {
  const { invoiceId } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Load invoice from localStorage
    const savedInvoices = localStorage.getItem('satsgate_invoices');
    if (savedInvoices) {
      const invoices: Invoice[] = JSON.parse(savedInvoices);
      const foundInvoice = invoices.find(inv => inv.id === invoiceId);
      setInvoice(foundInvoice || null);
    }
  }, [invoiceId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const checkPayment = async () => {
    if (!invoice) return;
    
    setIsChecking(true);
    
    try {
      // Use real payment monitoring
      const { PaymentMonitor } = await import('@/utils/paymentMonitor');
      const payments = await PaymentMonitor.checkPayments(invoice.btcAddress, invoice.amount);
      
      if (payments.length > 0 && payments[0].confirmed) {
        const updatedInvoice = { ...invoice, status: 'paid' as const };
        setInvoice(updatedInvoice);
        
        // Update localStorage
        const savedInvoices = localStorage.getItem('satsgate_invoices');
        if (savedInvoices) {
          const invoices: Invoice[] = JSON.parse(savedInvoices);
          const updatedInvoices = invoices.map(inv => 
            inv.id === invoiceId ? updatedInvoice : inv
          );
          localStorage.setItem('satsgate_invoices', JSON.stringify(updatedInvoices));
        }
        
        toast.success("Payment confirmed!");
      } else if (payments.length > 0 && !payments[0].confirmed) {
        toast.info(`Payment detected! Waiting for confirmation (${payments[0].confirmations}/6)`);
      } else {
        toast.info("No payment detected yet");
      }
    } catch (error) {
      console.error('Error checking payment:', error);
      toast.error("Error checking payment status");
    } finally {
      setIsChecking(false);
    }
  };

  if (!invoice) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="max-w-md mx-auto">
            <CardContent className="py-12 text-center">
              <h2 className="text-xl font-semibold mb-2">Invoice not found</h2>
              <p className="text-muted-foreground mb-4">
                The invoice you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild>
                <Link to="/">Go Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Main content */}
      <main className="container px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <CardTitle className="text-2xl">Payment Invoice</CardTitle>
                <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                  {invoice.status === 'paid' ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Paid
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </>
                  )}
                </Badge>
              </div>
              
              <div className="text-4xl font-bold mb-2">
                {invoice.amount} BTC
              </div>
              
              {invoice.memo && (
                <p className="text-muted-foreground">{invoice.memo}</p>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              {invoice.status === 'pending' ? (
                <>
                  {/* QR Code */}
                  <div className="flex justify-center">
                    <div className="p-4 bg-white rounded-lg">
                      <QRCodeSVG
                        value={`bitcoin:${invoice.btcAddress}?amount=${invoice.amount}${invoice.memo ? `&label=${encodeURIComponent(invoice.memo)}` : ''}`}
                        size={200}
                        level="M"
                        includeMargin={true}
                      />
                    </div>
                  </div>

                  {/* Payment Instructions */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Bitcoin Address
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 p-2 bg-secondary rounded text-sm font-mono break-all">
                          {invoice.btcAddress}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(invoice.btcAddress)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Amount
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 p-2 bg-secondary rounded text-sm font-mono">
                          {invoice.amount} BTC
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(invoice.amount.toString())}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Payment Instructions */}
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">How to pay:</h3>
                    <ol className="text-sm text-muted-foreground space-y-1">
                      <li>1. Scan the QR code with your Bitcoin wallet</li>
                      <li>2. Or copy the address and amount manually</li>
                      <li>3. Send the exact amount to complete payment</li>
                      <li>4. Payment will be confirmed automatically</li>
                    </ol>
                  </div>

                  {/* Check Payment Button */}
                  <Button 
                    onClick={checkPayment} 
                    disabled={isChecking}
                    className="w-full"
                  >
                    {isChecking ? "Checking..." : "Check Payment Status"}
                  </Button>
                </>
              ) : (
                /* Payment Confirmed */
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Payment Confirmed!</h3>
                  <p className="text-muted-foreground mb-4">
                    Your Bitcoin payment has been successfully received and confirmed on the blockchain.
                  </p>
                  <Button variant="outline" asChild>
                    <a 
                      href={`https://mempool.space/address/${invoice.btcAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on Blockchain
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </div>
              )}

              {/* Invoice Details */}
              <div className="border-t pt-4 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Invoice ID:</span>
                  <span className="font-mono">#{invoice.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span>{new Date(invoice.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default InvoicePage;