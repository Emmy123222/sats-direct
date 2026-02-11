# SatsGate Platform Overview

## What is SatsGate?

SatsGate is a **Bitcoin-secured escrow platform** built on Stacks blockchain that enables freelancers and creators to get paid safely using **STX tokens**.

## Key Points

### Payment Currency: STX (Stacks Tokens)
- ✅ All payments are made in **STX** (Stacks native token)
- ✅ STX is the currency used for escrow deposits
- ✅ Sellers receive STX when buyers release funds
- ✅ Transaction fees paid in STX

### Bitcoin Security
- The platform is **secured by Bitcoin** through Stacks' Proof of Transfer
- Stacks settles transactions on Bitcoin blockchain
- This provides Bitcoin-level security without using BTC directly

### How It Works

1. **Seller creates escrow** (sets amount in STX)
2. **Buyer deposits STX** into smart contract
3. **Seller delivers work**
4. **Buyer releases STX** to seller

### Why STX and not BTC?

- **Smart Contracts**: Stacks enables programmable Bitcoin through STX
- **Lower Fees**: STX transactions are cheaper than Bitcoin
- **Faster**: ~10 minute block times vs Bitcoin's variable times
- **Bitcoin Security**: Still gets Bitcoin's security through PoX
- **Native Integration**: STX is native to Stacks blockchain

### Wallet Support

- Leather Wallet (STX)
- Xverse Wallet (STX)
- Any Stacks-compatible wallet

### Smart Contracts

Both contracts deployed on Stacks testnet:
- `escrow.clar` - Handles STX escrow logic
- `invoice-registry.clar` - Tracks invoice metadata

### Network

- **Testnet**: For testing with testnet STX
- **Mainnet**: For real STX transactions (coming soon)

## Summary

**SatsGate = Bitcoin-secured + STX payments + Smart contract escrow**

- Payment currency: **STX**
- Security: **Bitcoin** (via Stacks PoX)
- Smart contracts: **Clarity on Stacks**
- Target users: **Freelancers & Creators**
- Value prop: **No chargebacks, trustless escrow**
