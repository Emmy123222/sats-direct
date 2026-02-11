# Deploy Your Contracts Now - Step by Step

Your contracts are compiled and ready! ✓

## Quick Deploy (5 minutes)

### Step 1: Get Your Stacks Address

First, let's get your Stacks address from your wallet:

```bash
# Run this to generate your address and private key
npm install @stacks/wallet-sdk
node scripts/generate-private-key.js "your seed phrase"
```

This will show you:
- Your testnet address (starts with ST)
- Your mainnet address (starts with SP)
- Your private key

### Step 2: Get Free Testnet STX

1. Go to: https://explorer.stacks.co/sandbox/faucet?chain=testnet
2. Enter your testnet address (the one starting with ST)
3. Click "Request STX"
4. You'll receive 500 testnet STX instantly

### Step 3: Deploy Using Stacks Explorer (Easiest!)

#### Deploy Escrow Contract:

1. Go to: https://explorer.stacks.co/sandbox/deploy?chain=testnet
2. Connect your wallet (Leather or Xverse)
3. Fill in:
   - **Contract Name**: `escrow`
   - **Contract Code**: Copy everything from `contracts/escrow.clar`
4. Click "Deploy Contract"
5. Confirm in your wallet
6. Wait 10-15 minutes
7. **Save the contract address**: `<your-address>.escrow`

#### Deploy Invoice Registry:

1. Same page: https://explorer.stacks.co/sandbox/deploy?chain=testnet
2. Fill in:
   - **Contract Name**: `invoice-registry`
   - **Contract Code**: Copy everything from `contracts/invoice-registry.clar`
3. Click "Deploy Contract"
4. Confirm in your wallet
5. Wait 10-15 minutes
6. **Save the contract address**: `<your-address>.invoice-registry`

### Step 4: Update Your App

Add to your `.env` file:

```env
VITE_ESCROW_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.escrow
VITE_INVOICE_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.invoice-registry
VITE_STACKS_NETWORK=testnet
```

Replace `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM` with your actual address.

### Step 5: Test!

Restart your dev server:
```bash
npm run dev
```

Your contracts are now live on Stacks testnet! 🎉

---

## Alternative: Deploy Using Script

If you prefer command line:

1. Create `.env.local`:
```bash
STACKS_NETWORK=testnet
STACKS_PRIVATE_KEY=your_private_key_here
```

2. Run:
```bash
npm run deploy:contracts
```

---

## Verify Deployment

Check your contracts on explorer:
- https://explorer.stacks.co/address/YOUR_ADDRESS?chain=testnet

You should see both contracts listed there.

## Need Help?

- Check transaction status: https://explorer.stacks.co/transactions?chain=testnet
- Stacks Discord: https://discord.gg/stacks
