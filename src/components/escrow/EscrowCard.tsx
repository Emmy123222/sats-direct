import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EscrowStatusBadge } from "./EscrowStatusBadge";

interface EscrowCardProps {
  escrowId: number;
  seller: string;
  buyer?: string;
  amount: number;
  status: number;
  deadline: number;
  description: string;
  userRole: 'seller' | 'buyer' | 'none';
}

export function EscrowCard({
  escrowId,
  seller,
  buyer,
  amount,
  status,
  deadline,
  description,
  userRole
}: EscrowCardProps) {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatAmount = (amount: number) => {
    return (amount / 1000000).toFixed(2); // Convert microSTX to STX
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Escrow #{escrowId}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          <EscrowStatusBadge status={status} />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Amount</span>
          <span className="font-bold text-lg">{formatAmount(amount)} STX</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Seller</span>
          <span className="text-sm font-mono">{formatAddress(seller)}</span>
        </div>
        
        {buyer && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Buyer</span>
            <span className="text-sm font-mono">{formatAddress(buyer)}</span>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Deadline</span>
          <span className="text-sm">Block {deadline}</span>
        </div>
        
        {userRole !== 'none' && (
          <Badge variant="outline" className="mt-2">
            You are the {userRole}
          </Badge>
        )}
      </CardContent>
      
      <CardFooter>
        <Link to={`/escrow/${escrowId}`} className="w-full">
          <Button className="w-full">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
