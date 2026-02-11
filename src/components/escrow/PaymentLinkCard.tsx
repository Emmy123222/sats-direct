import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface PaymentLinkCardProps {
  escrowId: number;
}

export function PaymentLinkCard({ escrowId }: PaymentLinkCardProps) {
  const [copied, setCopied] = useState(false);
  
  const paymentLink = `${window.location.origin}/pay/${escrowId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(paymentLink);
      setCopied(true);
      toast.success("Payment link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const openLink = () => {
    window.open(paymentLink, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Link</CardTitle>
        <CardDescription>
          Share this link with the buyer to receive payment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={paymentLink}
            readOnly
            className="font-mono text-sm"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={copyToClipboard}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={openLink}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 The buyer will connect their wallet and deposit the funds into escrow. 
            You'll be notified when the payment is received.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
