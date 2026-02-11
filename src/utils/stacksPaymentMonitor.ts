// Stacks payment monitoring utilities using Stacks API

export interface StacksTransaction {
  tx_id: string;
  tx_status: string;
  tx_type: string;
  sender_address: string;
  recipient_address?: string;
  amount?: string;
  token_transfer?: {
    recipient_address: string;
    amount: string;
  };
  block_height: number;
  burn_block_time: number;
  canonical: boolean;
}

export class StacksPaymentMonitor {
  private static readonly TESTNET_API = 'https://api.testnet.hiro.so';
  private static readonly MAINNET_API = 'https://api.hiro.so';
  
  /**
   * Get the API URL based on environment
   */
  private static getApiUrl(): string {
    const network = import.meta.env.VITE_STACKS_NETWORK || 'testnet';
    return network === 'mainnet' ? this.MAINNET_API : this.TESTNET_API;
  }
  
  /**
   * Check for STX payments to a specific address
   */
  static async checkPayments(address: string, expectedAmount?: number): Promise<StacksTransaction[]> {
    try {
      const apiUrl = this.getApiUrl();
      const url = `${apiUrl}/extended/v1/address/${address}/transactions?limit=50`;
      
      console.log('Fetching transactions from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      const transactions: StacksTransaction[] = data.results || [];
      
      // Filter for STX transfers to this address
      const payments = transactions.filter(tx => {
        console.log('Checking transaction:', {
          type: tx.tx_type,
          status: tx.tx_status,
          sender: tx.sender_address,
          recipient: tx.recipient_address,
          amount: tx.amount
        });
        
        if (tx.tx_type !== 'token_transfer') return false;
        
        // Check if this address is the recipient
        // Handle both direct recipient and token_transfer events
        const isRecipient = tx.recipient_address === address || 
                           (tx.token_transfer && tx.token_transfer.recipient_address === address);
        
        if (!isRecipient) return false;
        
        // If expected amount is provided, check if it matches (with some tolerance)
        if (expectedAmount) {
          const txAmount = tx.amount || tx.token_transfer?.amount || '0';
          const amountMicroSTX = parseFloat(txAmount);
          const expectedMicroSTX = expectedAmount * 1000000;
          const tolerance = 1; // 1 microSTX tolerance
          
          const amountMatches = Math.abs(amountMicroSTX - expectedMicroSTX) <= tolerance;
          console.log('Amount check:', {
            received: amountMicroSTX,
            expected: expectedMicroSTX,
            matches: amountMatches
          });
          
          return amountMatches;
        }
        
        return true;
      });
      
      console.log('Filtered payments:', payments);
      return payments;
    } catch (error) {
      console.error('Error checking Stacks payments:', error);
      throw error;
    }
  }
  
  /**
   * Get account balance
   */
  static async getBalance(address: string): Promise<number> {
    try {
      const apiUrl = this.getApiUrl();
      const response = await fetch(
        `${apiUrl}/extended/v1/address/${address}/balances`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch balance: ${response.statusText}`);
      }
      
      const data = await response.json();
      const microSTX = parseFloat(data.stx.balance || '0');
      return microSTX / 1000000; // Convert to STX
    } catch (error) {
      console.error('Error fetching balance:', error);
      return 0;
    }
  }
  
  /**
   * Get transaction details
   */
  static async getTransaction(txId: string): Promise<StacksTransaction | null> {
    try {
      const apiUrl = this.getApiUrl();
      const response = await fetch(
        `${apiUrl}/extended/v1/tx/${txId}`
      );
      
      if (!response.ok) {
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return null;
    }
  }
  
  /**
   * Monitor for new payments (polling)
   */
  static async monitorPayments(
    address: string,
    expectedAmount: number,
    onPaymentReceived: (tx: StacksTransaction) => void,
    intervalMs: number = 10000
  ): Promise<() => void> {
    let isMonitoring = true;
    let lastCheckedTxId: string | null = null;
    
    const checkForPayments = async () => {
      if (!isMonitoring) return;
      
      try {
        const payments = await this.checkPayments(address, expectedAmount);
        
        // Check for new payments
        for (const payment of payments) {
          if (payment.tx_id !== lastCheckedTxId) {
            lastCheckedTxId = payment.tx_id;
            onPaymentReceived(payment);
            break; // Only notify about the most recent payment
          }
        }
      } catch (error) {
        console.error('Error monitoring payments:', error);
      }
      
      if (isMonitoring) {
        setTimeout(checkForPayments, intervalMs);
      }
    };
    
    // Start monitoring
    checkForPayments();
    
    // Return stop function
    return () => {
      isMonitoring = false;
    };
  }
}

/**
 * Format STX amount for display
 */
export function formatSTXAmount(microSTX: number | string, decimals: number = 6): string {
  const amount = typeof microSTX === 'string' ? parseFloat(microSTX) : microSTX;
  const stx = amount / 1000000;
  return stx.toFixed(decimals).replace(/\.?0+$/, '');
}

/**
 * Convert STX to microSTX
 */
export function toMicroSTX(stx: number): number {
  return Math.floor(stx * 1000000);
}

/**
 * Convert microSTX to STX
 */
export function fromMicroSTX(microSTX: number | string): number {
  const amount = typeof microSTX === 'string' ? parseFloat(microSTX) : microSTX;
  return amount / 1000000;
}
