# Escrow Deposit Issue - Diagnosis & Fix

## The Problem

When you try to deposit to an escrow, it fails on the Stacks blockchain. Here's why:

### Root Cause

1. **Contract Not Deployed**: The contract address in `.env` (`ST3XJC356F2NYYBT4JBEYW5KWYHVRHEZ1YDZG65KT.escrow`) may not be deployed yet
2. **Escrow ID Mismatch**: We're using timestamp-based IDs locally, but the blockchain uses sequential IDs (1, 2, 3...)
3. **Transaction Not Confirmed**: Creating an escrow takes 10-15 minutes to confirm on testnet

## How to Fix

### Step 1: Verify Contract Deployment

Check if your contract is deployed:

```bash
# Visit this URL (replace with your address):
https://explorer.stacks.co/address/ST3XJC356F2NYYBT4JBEYW5KWYHVRHEZ1YDZG65KT?chain=testnet
```

If you don't see the `escrow` contract listed, you need to deploy it first (see DEPLOY_NOW.md).

### Step 2: Check Escrow Creation Transaction

After creating an escrow:

1. Check your wallet for the transaction ID
2. Visit: `https://explorer.stacks.co/txid/YOUR_TX_ID?chain=testnet`
3. Wait for status to change from "Pending" to "Success"
4. Look for the return value - this is your actual escrow ID (e.g., `u1`, `u2`, etc.)

### Step 3: Use the Correct Escrow ID

The escrow ID from the blockchain (e.g., `1`) must match what you use when depositing.

## Current Workaround

The app now:
- Saves escrows to localStorage with temporary IDs
- Shows them on your dashboard
- Warns that transactions take 10-15 minutes

## Proper Solution (TODO)

To fix this properly, we need to:

1. **Parse Transaction Results**: Extract the actual escrow ID from the blockchain response
2. **Poll for Confirmation**: Check transaction status and update localStorage when confirmed
3. **Sync with Contract**: Fetch escrow data from the blockchain, not just localStorage

### Code Changes Needed

```typescript
// In contractInteraction.ts
export async function createEscrow(...) {
  const result = await openContractCall(options);
  
  // Wait for transaction to be mined
  const txId = result.txId;
  const escrowId = await pollForEscrowId(txId);
  
  return { txId, escrowId };
}

// New function to poll for transaction result
async function pollForEscrowId(txId: string): Promise<number> {
  // Poll Stacks API until transaction is confirmed
  // Parse the return value to get escrow ID
  // Return the actual escrow ID
}
```

## Testing Checklist

Before testing deposits:

- [ ] Contract is deployed and visible on explorer
- [ ] You have testnet STX (get from faucet)
- [ ] Escrow creation transaction is confirmed (not pending)
- [ ] You know the actual escrow ID from the blockchain
- [ ] You're using the correct escrow ID when depositing

## Quick Test

1. Create an escrow
2. Wait 15 minutes
3. Check transaction on explorer
4. Note the escrow ID (should be `u1` for first escrow)
5. Try depositing using that ID directly in the contract call

## Need Help?

Common errors:

- **"Escrow not found"**: The escrow ID doesn't exist on-chain yet
- **"Invalid status"**: Escrow already funded or cancelled
- **"Deadline passed"**: The block deadline has been reached
- **"Not authorized"**: You're not the designated buyer (if one was specified)

Check the Stacks Explorer for detailed error messages in failed transactions.
