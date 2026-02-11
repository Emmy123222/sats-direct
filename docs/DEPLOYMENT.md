# Smart Contract Deployment Guide

## Prerequisites

1. **Stacks Wallet with STX**: You need STX tokens to pay for deployment fees
   - Testnet: Get free testnet STX from the [Stacks Testnet Faucet](https://explorer.stacks.co/sandbox/faucet?chain=testnet)
   - Mainnet: You'll need real STX tokens

2. **Your Wallet Private Key**: Export from your Leather/Xverse wallet
   - ⚠️ **NEVER share your private key or commit it to git**

## Deployment Options

### Option 1: Using Stacks Explorer (Recommended for Beginners)

This is the easiest way to deploy contracts without any command-line tools.

1. **Go to Stacks Explorer Sandbox**
   - Testnet: https://explorer.stacks.co/sandbox/deploy?chain=testnet
   - Mainnet: https://explorer.stacks.co/sandbox/deploy?chain=mainnet

2. **Connect Your Wallet**
   - Click "Connect Wallet" and choose Leather or Xverse

3. **Deploy Escrow Contract**
   - Contract Name: `escrow`
   - Copy the contents of `contracts/escrow.clar` into the code editor
   - Click "Deploy Contract"
   - Confirm the transaction in your wallet
   - Wait for confirmation (10-20 minutes)

4. **Deploy Invoice Registry Contract**
   - Contract Name: `invoice-registry`
   - Copy the contents of `contracts/invoice-registry.clar` into the code editor
   - Click "Deploy Contract"
   - Confirm the transaction in your wallet
   - Wait for confirmation (10-20 minutes)

5. **Save Contract Addresses**
   - After deployment, note down your contract addresses
   - Format: `<your-address>.escrow` and `<your-address>.invoice-registry`
   - Update your `.env` file with these addresses

### Option 2: Using Deployment Script

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variables**
   Create a `.env.local` file (never commit this):
   ```bash
   STACKS_NETWORK=testnet  # or mainnet
   STACKS_PRIVATE_KEY=your_private_key_here
   ```

3. **Run Deployment Script**
   ```bash
   npm run deploy:contracts
   ```

4. **Wait for Confirmation**
   - Testnet: ~10-20 minutes
   - Mainnet: ~10-20 minutes
   - Check status on Stacks Explorer

### Option 3: Using Clarinet (For Advanced Users)

1. **Install Clarinet**
   ```bash
   # macOS
   brew install clarinet
   
   # Or download from: https://github.com/hirosystems/clarinet
   ```

2. **Initialize Clarinet Project**
   ```bash
   clarinet integrate
   ```

3. **Deploy to Testnet**
   ```bash
   clarinet deployments generate --testnet
   clarinet deployments apply -p deployments/default.testnet-plan.yaml
   ```

## After Deployment

1. **Update Environment Variables**
   
   Add to your `.env` file:
   ```
   VITE_ESCROW_CONTRACT_ADDRESS=<your-address>.escrow
   VITE_INVOICE_CONTRACT_ADDRESS=<your-address>.invoice-registry
   VITE_STACKS_NETWORK=testnet  # or mainnet
   ```

2. **Verify Deployment**
   
   Visit the Stacks Explorer to verify your contracts:
   - Testnet: `https://explorer.stacks.co/address/<your-address>?chain=testnet`
   - Mainnet: `https://explorer.stacks.co/address/<your-address>?chain=mainnet`

3. **Test Your Contracts**
   
   Use the Stacks Explorer's "Call Function" feature to test:
   - Create an escrow
   - Register an invoice
   - Check contract state

## Deployment Costs

- **Testnet**: Free (use faucet STX)
- **Mainnet**: 
  - Escrow contract: ~0.5-1 STX
  - Invoice Registry: ~0.3-0.5 STX
  - Total: ~1-2 STX

## Troubleshooting

### "Insufficient funds" error
- Make sure you have enough STX in your wallet
- Testnet: Use the faucet to get more
- Mainnet: Purchase STX from an exchange

### "Contract already exists" error
- You've already deployed a contract with this name
- Either use a different contract name or deploy from a different address

### Transaction stuck/pending
- Stacks blocks take ~10 minutes
- Check the mempool: https://explorer.stacks.co/transactions
- If stuck for >1 hour, the transaction may have failed

### Need help?
- Stacks Discord: https://discord.gg/stacks
- Stacks Forum: https://forum.stacks.org
