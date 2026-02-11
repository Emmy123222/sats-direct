/**
 * Transaction polling utility to wait for blockchain confirmation
 * and extract return values from transactions
 */

const NETWORK = import.meta.env.VITE_STACKS_NETWORK || 'testnet';
const API_URL = NETWORK === 'mainnet' 
  ? 'https://api.hiro.so' 
  : 'https://api.testnet.hiro.so';

export interface TransactionResult {
  success: boolean;
  txId: string;
  returnValue?: any;
  error?: string;
}

/**
 * Poll for transaction confirmation and extract return value
 */
export async function waitForTransaction(
  txId: string,
  maxAttempts: number = 30,
  intervalMs: number = 10000
): Promise<TransactionResult> {
  console.log(`[TransactionPoller] Waiting for transaction: ${txId}`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(`${API_URL}/extended/v1/tx/${txId}`);
      
      if (!response.ok) {
        console.log(`[TransactionPoller] Attempt ${attempt}/${maxAttempts}: Transaction not found yet`);
        await sleep(intervalMs);
        continue;
      }

      const data = await response.json();
      console.log(`[TransactionPoller] Attempt ${attempt}/${maxAttempts}: Status = ${data.tx_status}`);

      if (data.tx_status === 'success') {
        // Transaction confirmed successfully
        const returnValue = parseReturnValue(data);
        console.log(`[TransactionPoller] ✅ Transaction confirmed! Return value:`, returnValue);
        
        return {
          success: true,
          txId,
          returnValue
        };
      } else if (data.tx_status === 'abort_by_response' || data.tx_status === 'abort_by_post_condition') {
        // Transaction failed
        console.error(`[TransactionPoller] ❌ Transaction failed:`, data.tx_result);
        return {
          success: false,
          txId,
          error: data.tx_result?.repr || 'Transaction failed'
        };
      }

      // Still pending, wait and try again
      await sleep(intervalMs);
      
    } catch (error) {
      console.error(`[TransactionPoller] Error on attempt ${attempt}:`, error);
      await sleep(intervalMs);
    }
  }

  // Timeout
  console.error(`[TransactionPoller] ⏱️ Timeout waiting for transaction after ${maxAttempts} attempts`);
  return {
    success: false,
    txId,
    error: 'Transaction confirmation timeout'
  };
}

/**
 * Parse the return value from a transaction
 */
function parseReturnValue(txData: any): any {
  try {
    if (!txData.tx_result?.repr) {
      return null;
    }

    const repr = txData.tx_result.repr;
    console.log('[TransactionPoller] Parsing return value:', repr);

    // Parse (ok uX) format for escrow ID
    const okMatch = repr.match(/\(ok u(\d+)\)/);
    if (okMatch) {
      const escrowId = parseInt(okMatch[1]);
      console.log('[TransactionPoller] Extracted escrow ID:', escrowId);
      return { escrowId };
    }

    // Parse (ok true) format
    if (repr.includes('(ok true)')) {
      return { success: true };
    }

    return { raw: repr };
  } catch (error) {
    console.error('[TransactionPoller] Error parsing return value:', error);
    return null;
  }
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Start polling in background and call callback when done
 */
export function pollTransactionInBackground(
  txId: string,
  onComplete: (result: TransactionResult) => void,
  onProgress?: (attempt: number, maxAttempts: number) => void
): void {
  const maxAttempts = 30; // 5 minutes with 10s intervals
  const intervalMs = 10000;

  let attempt = 0;
  const poll = async () => {
    attempt++;
    if (onProgress) {
      onProgress(attempt, maxAttempts);
    }

    const result = await waitForTransaction(txId, 1, 0);
    
    if (result.success || result.error || attempt >= maxAttempts) {
      onComplete(result);
    } else {
      setTimeout(poll, intervalMs);
    }
  };

  poll();
}
