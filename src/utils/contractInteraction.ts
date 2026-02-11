import { openContractCall } from '@stacks/connect';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';
import {
  uintCV,
  stringUtf8CV,
  someCV,
  noneCV,
  standardPrincipalCV,
  PostConditionMode,
} from '@stacks/transactions';

const CONTRACT_ADDRESS = import.meta.env.VITE_ESCROW_CONTRACT_ADDRESS || 'ST3XJC356F2NYYBT4JBEYW5KWYHVRHEZ1YDZG65KT.escrow';
const NETWORK = import.meta.env.VITE_STACKS_NETWORK || 'testnet';

const getNetwork = () => {
  return NETWORK === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;
};

const [contractAddress, contractName] = CONTRACT_ADDRESS.split('.');

/**
 * Create a new escrow
 */
export async function createEscrow(
  amount: number, // in microSTX
  deadline: number, // block height
  description: string,
  buyerAddress?: string
) {
  const functionArgs = [
    uintCV(amount),
    uintCV(deadline),
    stringUtf8CV(description),
    buyerAddress ? someCV(standardPrincipalCV(buyerAddress)) : noneCV(),
  ];

  const options = {
    network: getNetwork(),
    anchorMode: 1,
    contractAddress,
    contractName,
    functionName: 'create-escrow',
    functionArgs,
    postConditionMode: PostConditionMode.Allow,
    onFinish: (data: any) => {
      console.log('Escrow created:', data);
      return data;
    },
    onCancel: () => {
      console.log('Transaction cancelled');
    },
  };

  return await openContractCall(options);
}

/**
 * Deposit funds into escrow (buyer)
 * Note: Uses Allow mode because the contract handles the STX transfer internally
 */
export async function depositToEscrow(escrowId: number) {
  const functionArgs = [uintCV(escrowId)];

  const options = {
    network: getNetwork(),
    anchorMode: 1,
    contractAddress,
    contractName,
    functionName: 'deposit',
    functionArgs,
    postConditionMode: PostConditionMode.Allow, // Allow because contract does stx-transfer
    onFinish: (data: any) => {
      console.log('Deposit successful:', data);
      return data;
    },
    onCancel: () => {
      console.log('Transaction cancelled');
      throw new Error('Transaction cancelled by user');
    },
  };

  return await openContractCall(options);
}

/**
 * Mark work as complete (seller)
 */
export async function markComplete(escrowId: number) {
  const functionArgs = [uintCV(escrowId)];

  const options = {
    network: getNetwork(),
    anchorMode: 1,
    contractAddress,
    contractName,
    functionName: 'mark-complete',
    functionArgs,
    postConditionMode: PostConditionMode.Allow,
    onFinish: (data: any) => {
      console.log('Marked complete:', data);
      return data;
    },
    onCancel: () => {
      console.log('Transaction cancelled');
    },
  };

  return await openContractCall(options);
}

/**
 * Release funds to seller (buyer)
 */
export async function releaseFunds(escrowId: number) {
  const functionArgs = [uintCV(escrowId)];

  const options = {
    network: getNetwork(),
    anchorMode: 1,
    contractAddress,
    contractName,
    functionName: 'release-funds',
    functionArgs,
    postConditionMode: PostConditionMode.Allow,
    onFinish: (data: any) => {
      console.log('Funds released:', data);
      return data;
    },
    onCancel: () => {
      console.log('Transaction cancelled');
    },
  };

  return await openContractCall(options);
}

/**
 * Cancel escrow (seller)
 */
export async function cancelEscrow(escrowId: number) {
  const functionArgs = [uintCV(escrowId)];

  const options = {
    network: getNetwork(),
    anchorMode: 1,
    contractAddress,
    contractName,
    functionName: 'cancel-escrow',
    functionArgs,
    postConditionMode: PostConditionMode.Allow,
    onFinish: (data: any) => {
      console.log('Escrow cancelled:', data);
      return data;
    },
    onCancel: () => {
      console.log('Transaction cancelled');
    },
  };

  return await openContractCall(options);
}

/**
 * Get escrow details from contract
 */
export async function getEscrow(escrowId: number) {
  try {
    const apiUrl = NETWORK === 'mainnet' 
      ? 'https://api.hiro.so' 
      : 'https://api.testnet.hiro.so';
    
    // Format as Clarity uint: 0x01 (type) + 16 bytes (value in hex)
    const valueHex = escrowId.toString(16).padStart(32, '0');
    const clarityUint = `0x01${valueHex}`;
    
    console.log(`Fetching escrow #${escrowId} with argument: ${clarityUint}`);
    
    const response = await fetch(
      `${apiUrl}/v2/contracts/call-read/${contractAddress}/${contractName}/get-escrow`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: contractAddress,
          arguments: [clarityUint],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Failed to fetch escrow: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Escrow data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching escrow:', error);
    throw error;
  }
}
