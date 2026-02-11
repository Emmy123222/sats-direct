/**
 * Discover escrows created by a user by scanning their transaction history
 */

const NETWORK = import.meta.env.VITE_STACKS_NETWORK || 'testnet';
const API_URL = NETWORK === 'mainnet' 
  ? 'https://api.hiro.so' 
  : 'https://api.testnet.hiro.so';

const CONTRACT_ADDRESS = import.meta.env.VITE_ESCROW_CONTRACT_ADDRESS?.split('.')[0] || 'ST3XJC356F2NYYBT4JBEYW5KWYHVRHEZ1YDZG65KT';
const CONTRACT_NAME = 'escrow';

/**
 * Find all escrows created by a user by scanning their transaction history
 */
export async function discoverUserEscrows(userAddress: string): Promise<number[]> {
  try {
    console.log(`[EscrowDiscovery] Scanning transactions for ${userAddress}...`);
    
    // Fetch user's transaction history
    const response = await fetch(
      `${API_URL}/extended/v1/address/${userAddress}/transactions?limit=50`
    );
    
    if (!response.ok) {
      console.error('[EscrowDiscovery] Failed to fetch transactions');
      return [];
    }
    
    const data = await response.json();
    const escrowIds: number[] = [];
    
    // Look for successful create-escrow transactions
    for (const tx of data.results) {
      if (
        tx.tx_type === 'contract_call' &&
        tx.tx_status === 'success' &&
        tx.contract_call?.contract_id === `${CONTRACT_ADDRESS}.${CONTRACT_NAME}` &&
        tx.contract_call?.function_name === 'create-escrow'
      ) {
        // Parse the return value to get escrow ID
        const returnValue = tx.tx_result?.repr;
        if (returnValue) {
          const match = returnValue.match(/\(ok u(\d+)\)/);
          if (match) {
            const escrowId = parseInt(match[1]);
            escrowIds.push(escrowId);
            console.log(`[EscrowDiscovery] Found escrow #${escrowId}`);
          }
        }
      }
    }
    
    console.log(`[EscrowDiscovery] Found ${escrowIds.length} escrows for user`);
    return escrowIds;
    
  } catch (error) {
    console.error('[EscrowDiscovery] Error:', error);
    return [];
  }
}

/**
 * Save discovered escrows to localStorage
 */
export function saveUserEscrows(userAddress: string, escrowIds: number[]): void {
  const storageKey = `my_escrows_${userAddress}`;
  localStorage.setItem(storageKey, JSON.stringify(escrowIds));
  console.log(`[EscrowDiscovery] Saved ${escrowIds.length} escrows to localStorage`);
}

/**
 * Get user's escrows from localStorage
 */
export function getUserEscrows(userAddress: string): number[] {
  const storageKey = `my_escrows_${userAddress}`;
  const saved = localStorage.getItem(storageKey);
  return saved ? JSON.parse(saved) : [];
}

/**
 * Discover and save user's escrows automatically
 */
export async function autoDiscoverEscrows(userAddress: string): Promise<number[]> {
  // Get existing escrows from localStorage
  const existing = getUserEscrows(userAddress);
  
  // Discover new escrows from blockchain
  const discovered = await discoverUserEscrows(userAddress);
  
  // Merge and deduplicate
  const allEscrows = Array.from(new Set([...existing, ...discovered]));
  
  // Save back to localStorage
  if (allEscrows.length > existing.length) {
    saveUserEscrows(userAddress, allEscrows);
    console.log(`[EscrowDiscovery] Added ${allEscrows.length - existing.length} new escrows`);
  }
  
  return allEscrows;
}
