// Bitcoin payment monitoring utilities using mempool.space API

export interface Transaction {
  txid: string;
  value: number;
  confirmed: boolean;
  confirmations: number;
}

export class PaymentMonitor {
  private static readonly MEMPOOL_API = 'https://mempool.space/api';
  
  /**
   * Check for payments to a specific Bitcoin address
   */
  static async checkPayments(address: string, expectedAmount?: number): Promise<Transaction[]> {
    try {
      const response = await fetch(`${this.MEMPOOL_API}/address/${address}/txs`);
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const transactions = await response.json();
      const currentBlockHeight = await this.getCurrentBlockHeight();
      
      const relevantTransactions = transactions
        .filter((tx: any) => {
          // Find outputs to our address
          const relevantOutputs = tx.vout.filter((output: any) => 
            output.scriptpubkey_address === address
          );
          
          return relevantOutputs.length > 0;
        })
        .map((tx: any) => {
          const relevantOutputs = tx.vout.filter((output: any) => 
            output.scriptpubkey_address === address
          );
          
          const totalValue = relevantOutputs.reduce((sum: number, output: any) => 
            sum + output.value, 0
          );
          
          return {
            txid: tx.txid,
            value: totalValue / 100000000, // Convert satoshis to BTC
            confirmed: tx.status.confirmed,
            confirmations: tx.status.block_height ? 
              currentBlockHeight - tx.status.block_height + 1 : 0
          };
        })
        .filter((tx: Transaction) => {
          // If expected amount is specified, filter by amount
          if (expectedAmount) {
            return Math.abs(tx.value - expectedAmount) < 0.00000001; // Account for floating point precision
          }
          return true;
        });
        
      return relevantTransactions;
    } catch (error) {
      console.error('Error checking payments:', error);
      return [];
    }
  }
  
  /**
   * Get current Bitcoin block height
   */
  static async getCurrentBlockHeight(): Promise<number> {
    try {
      const response = await fetch(`${this.MEMPOOL_API}/blocks/tip/height`);
      if (!response.ok) {
        throw new Error('Failed to fetch block height');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching block height:', error);
      return 0;
    }
  }
  
  /**
   * Monitor payments for an invoice
   */
  static async monitorInvoice(
    address: string, 
    amount: number, 
    onPaymentDetected: (transaction: Transaction) => void,
    intervalMs: number = 30000 // Check every 30 seconds
  ): Promise<() => void> {
    const checkPayment = async () => {
      const payments = await this.checkPayments(address, amount);
      const confirmedPayments = payments.filter(tx => tx.confirmed);
      
      if (confirmedPayments.length > 0) {
        onPaymentDetected(confirmedPayments[0]);
        return true; // Stop monitoring
      }
      return false;
    };
    
    // Initial check
    if (await checkPayment()) {
      return () => {}; // Return empty cleanup function
    }
    
    // Set up interval
    const intervalId = setInterval(async () => {
      if (await checkPayment()) {
        clearInterval(intervalId);
      }
    }, intervalMs);
    
    // Return cleanup function
    return () => clearInterval(intervalId);
  }
}

/**
 * Generate a Bitcoin payment URI
 */
export function generateBitcoinURI(address: string, amount?: number, label?: string): string {
  let uri = `bitcoin:${address}`;
  const params = new URLSearchParams();
  
  if (amount) {
    params.append('amount', amount.toString());
  }
  
  if (label) {
    params.append('label', label);
  }
  
  if (params.toString()) {
    uri += `?${params.toString()}`;
  }
  
  return uri;
}

/**
 * Format Bitcoin amount for display
 */
export function formatBitcoinAmount(amount: number, decimals: number = 8): string {
  return amount.toFixed(decimals).replace(/\.?0+$/, '');
}