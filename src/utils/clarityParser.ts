/**
 * Utility functions to parse Clarity values from blockchain responses
 */

/**
 * Parse a Clarity uint value
 * Format: 0x01 + 16 bytes (32 hex chars)
 */
export function parseUint(hex: string): number {
  if (!hex || hex === '0x09') return 0; // 0x09 is 'none'
  
  // Remove 0x prefix and type byte (01)
  const valueHex = hex.replace('0x01', '');
  // Take last 32 chars (16 bytes)
  const cleanHex = valueHex.slice(-32);
  return parseInt(cleanHex, 16);
}

/**
 * Parse a Clarity string-utf8 value
 * Format: 0x0d + length (4 bytes) + utf8 bytes
 */
export function parseString(hex: string): string {
  if (!hex || hex === '0x09') return '';
  
  try {
    // Remove 0x prefix and type byte (0d)
    let data = hex.replace('0x0d', '');
    
    // Get length (next 8 hex chars = 4 bytes)
    const lengthHex = data.slice(0, 8);
    const length = parseInt(lengthHex, 16);
    
    // Get string bytes
    const stringHex = data.slice(8, 8 + length * 2);
    
    // Convert hex to string
    let str = '';
    for (let i = 0; i < stringHex.length; i += 2) {
      str += String.fromCharCode(parseInt(stringHex.substr(i, 2), 16));
    }
    
    return str;
  } catch (error) {
    console.error('Error parsing string:', error);
    return '';
  }
}

/**
 * Parse a Clarity principal (address)
 * Format: 0x05 (standard) or 0x06 (contract) + version + hash
 */
export function parsePrincipal(hex: string): string {
  if (!hex || hex === '0x09') return '';
  
  try {
    // This is simplified - proper parsing requires @stacks/transactions
    // For now, return a placeholder
    return 'ST...'; // TODO: Implement proper principal parsing
  } catch (error) {
    console.error('Error parsing principal:', error);
    return '';
  }
}

/**
 * Parse a Clarity optional value
 * Format: 0x09 (none) or 0x0a (some) + inner value
 */
export function parseOptional<T>(hex: string, parser: (hex: string) => T): T | null {
  if (!hex || hex === '0x09') return null; // none
  
  if (hex.startsWith('0x0a')) {
    // some - parse inner value
    const innerHex = '0x' + hex.slice(4);
    return parser(innerHex);
  }
  
  return null;
}

/**
 * Parse a Clarity tuple (map/object)
 * Format: 0x0c + field count (4 bytes) + fields
 */
export function parseTuple(hex: string): Record<string, any> {
  if (!hex || hex === '0x09') return {};
  
  try {
    // This is complex - for now return empty object
    // Proper implementation requires parsing each field
    return {};
  } catch (error) {
    console.error('Error parsing tuple:', error);
    return {};
  }
}

/**
 * Parse escrow data from blockchain response
 */
export function parseEscrowFromHex(hex: string): any {
  try {
    // The response is a tuple with these fields:
    // - seller: principal
    // - buyer: optional principal
    // - amount: uint
    // - status: uint
    // - deadline: uint
    // - description: string-utf8
    // - created-at: uint
    // - funded-at: optional uint
    // - completed-at: optional uint
    
    // For now, we'll do basic parsing
    // In production, use @stacks/transactions cvToValue()
    
    // Extract amount (look for pattern after "amount" field)
    const amountMatch = hex.match(/616d6f756e7401([0-9a-f]{32})/i);
    const amount = amountMatch ? parseInt(amountMatch[1], 16) : 0;
    
    // Extract status (look for pattern after "status" field)
    const statusMatch = hex.match(/73746174757301([0-9a-f]{32})/i);
    const status = statusMatch ? parseInt(statusMatch[1], 16) : 0;
    
    // Extract deadline (look for pattern after "deadline" field)
    const deadlineMatch = hex.match(/646561646c696e6501([0-9a-f]{32})/i);
    const deadline = deadlineMatch ? parseInt(deadlineMatch[1], 16) : 0;
    
    return {
      amount,
      status,
      deadline,
      // Other fields would need more complex parsing
    };
  } catch (error) {
    console.error('Error parsing escrow hex:', error);
    return null;
  }
}
