import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Wallet, Info } from "lucide-react";

/**
 * Component to show links to actual blockchain escrows
 * This is a temporary solution until we implement proper escrow ID capture
 */
export function BlockchainEscrowLinks() {
  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader>
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <CardTitle className="text-blue-900">Available Escrows on Blockchain</CardTitle>
            <CardDescription className="text-blue-700">
              Click to view or fund any escrow
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-blue-800">
          These escrows are live on the Stacks blockchain and ready for deposits:
        </p>
        
        <div className="grid gap-2">
          <Button variant="default" size="sm" asChild className="justify-start">
            <Link to="/pay/1">
              <Wallet className="w-4 h-4 mr-2" />
              Fund Escrow #1 (100 STX)
            </Link>
          </Button>
          
          <Button variant="default" size="sm" asChild className="justify-start">
            <Link to="/pay/2">
              <Wallet className="w-4 h-4 mr-2" />
              Fund Escrow #2 (400 STX)
            </Link>
          </Button>
          
          <Button variant="default" size="sm" asChild className="justify-start">
            <Link to="/pay/3">
              <Wallet className="w-4 h-4 mr-2" />
              Fund Escrow #3 (100 STX)
            </Link>
          </Button>
        </div>

        <div className="pt-2 border-t border-blue-200">
          <p className="text-xs text-blue-700">
            💡 Tip: These are real blockchain escrows. Click "Fund Escrow" to deposit STX and start the escrow process.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
