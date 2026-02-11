# Quick Deploy Guide - Easiest Method

## Deploy Using Stacks Explorer (No CLI Required!)

This is the simplest way to deploy your contracts. Takes about 5 minutes.

### Step 1: Get Testnet STX (Free!)

1. Go to: https://explorer.stacks.co/sandbox/faucet?chain=testnet
2. Connect your Leather or Xverse wallet
3. Click "Request STX" - you'll get 500 testnet STX instantly

### Step 2: Deploy Escrow Contract

1. Go to: https://explorer.stacks.co/sandbox/deploy?chain=testnet
2. Connect your wallet (same one you used for the faucet)
3. Fill in the form:
   - **Contract Name**: `escrow`
   - **Contract Code**: Copy everything from `contracts/escrow.clar` and paste it
4. Click "Deploy Contract"
5. Confirm in your wallet popup
6. Wait 10-15 minutes for confirmation
7. **SAVE THE CONTRACT ADDRESS** - it will be `<your-stacks-address>.escrow`

### Step 3: Deploy Invoice Registry Contract

1. Stay on the same page: https://explorer.stacks.co/sandbox/deploy?chain=testnet
2. Fill in the form:
   - **Contract Name**: `invoice-registry`
   - **Contract Code**: Copy everything from `contracts/invoice-registry.clar` and paste it
3. Click "Deploy Contract"
4. Confirm in your wallet popup
5. Wait 10-15 minutes for confirmation
6. **SAVE THE CONTRACT ADDRESS** - it will be `<your-stacks-address>.invoice-registry`

### Step 4: Update Your App

1. Open your `.env` file
2. Add these lines (replace with your actual addresses):
   ```
   VITE_ESCROW_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.escrow
   VITE_INVOICE_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.invoice-registry
   VITE_STACKS_NETWORK=testnet
   ```
3. Restart your dev server: `npm run dev`

### Step 5: Test Your Contracts

1. Go to your deployed contract on explorer:
   - `https://explorer.stacks.co/txid/<your-contract-address>?chain=testnet`
2. Click on "Functions" tab
3. Try calling `create-escrow` with test data:
   - amount: `1000000` (1 STX in micro-STX)
   - deadline: `1000` (blocks from now)
   - description: `"Test escrow"`
   - buyer: `none`

## That's It!

Your contracts are now live on Stacks testnet! 🎉

You can now:
- Create escrows from your app
- Test the full payment flow
- Share your app with others to test

## Need Help?

- Check transaction status: https://explorer.stacks.co/transactions?chain=testnet
- Stacks Discord: https://discord.gg/stacks
- Documentation: https://docs.stacks.co
