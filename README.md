# SatsGate - Bitcoin-Secured Escrow Platform

> **Get paid safely. No chargebacks. No middlemen.**

SatsGate is a Bitcoin-secured escrow and payment platform built on Stacks that enables freelancers, creators, and digital sellers to transact safely without chargebacks or centralized control.

## 📚 Documentation & Scripts

- **Documentation**: All `.md` files are in [`docs/`](./docs/) - [View Index](./docs/README.md)
- **Scripts**: All utility scripts are in [`scripts/`](./scripts/) - [View Index](./scripts/README.md)
- **Project Structure**: See [docs/PROJECT_ORGANIZATION.md](./docs/PROJECT_ORGANIZATION.md)

## 🎯 What Problem We're Solving

Today's payment landscape is broken for digital workers:
- ❌ Freelancers get scammed
- ❌ Buyers fear paying upfront  
- ❌ Payment processors charge high fees (3-5%)
- ❌ Chargebacks hurt honest sellers
- ❌ Cross-border payments are slow or restricted
- ❌ No simple, Bitcoin-native escrow for everyday work

## 💡 Our Solution

SatsGate provides trustless escrow powered by Bitcoin and Stacks smart contracts.

### For Sellers (Freelancers, Creators)
1. ✅ Create payment links with escrow protection
2. ✅ Set amount and delivery deadline
3. ✅ Funds locked in smart contract until delivery
4. ✅ No chargebacks - payments are final

### For Buyers
1. ✅ Pay using STX tokens
2. ✅ Funds secured in trustless smart contract
3. ✅ Release payment after delivery confirmation
4. ✅ Full transparency on-chain

### The Platform
- 🔐 **Non-custodial** - you control your keys
- ₿ **Bitcoin-secured** via Stacks Proof of Transfer
- 📜 **Smart contract escrow** - trustless automation
- 🔍 **Transparent** - all transactions on-chain
- 🚫 **No middleman** - peer-to-peer escrow
- ⭐ **Reputation system** - build trust over time

## 🛠 Tech Stack

- **Blockchain**: Stacks (Bitcoin Layer 2)
- **Smart Contracts**: Clarity
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Wallet**: Leather/Xverse integration
- **Payments**: STX tokens

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Leather or Xverse wallet extension

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/sats-direct.git
cd sats-direct

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup

Create a `.env` file:

```env
# Deployed Smart Contracts
VITE_ESCROW_CONTRACT_ADDRESS=ST3XJC356F2NYYBT4JBEYW5KWYHVRHEZ1YDZG65KT.escrow
VITE_INVOICE_CONTRACT_ADDRESS=ST3XJC356F2NYYBT4JBEYW5KWYHVRHEZ1YDZG65KT.invoice-registry
VITE_STACKS_NETWORK=testnet
```

## 📝 Smart Contracts

### Escrow Contract (`escrow.clar`)
Handles the core escrow logic:
- Create escrow with amount and deadline
- Deposit funds (buyer)
- Mark work complete (seller)
- Release funds (buyer)
- Cancel/refund logic

### Invoice Registry (`invoice-registry.clar`)
Tracks invoice metadata on-chain:
- Register invoices
- Update status
- Query invoice details

## 🎮 How It Works

1. **Seller creates escrow**
   - Sets amount, deadline, and description
   - Gets shareable payment link

2. **Buyer deposits funds**
   - Connects wallet
   - Deposits STX into smart contract
   - Funds locked until conditions met

3. **Seller delivers work**
   - Marks escrow as complete
   - Buyer notified to review

4. **Buyer releases payment**
   - Reviews work
   - Releases funds from contract to seller
   - Transaction complete

## 🌟 Key Features

- ✅ **Trustless Escrow** - Smart contracts enforce rules
- ✅ **No Chargebacks** - Blockchain payments are final
- ✅ **Global Access** - Anyone with a Stacks wallet
- ✅ **Low Fees** - Only blockchain transaction fees
- ✅ **Fast Settlement** - ~10 minute block times
- ✅ **Transparent** - All transactions verifiable on-chain

## 🎯 Who It's For

- 💼 **Freelancers** - Developers, designers, writers
- 🎨 **Creators** - Digital artists, content creators
- 📦 **Digital Sellers** - Ebook authors, course creators
- 🌍 **Remote Workers** - Anyone doing online work globally

## 🔒 Security

- Non-custodial architecture
- Open-source smart contracts
- Auditable on Stacks blockchain
- No private keys stored
- Wallet-based authentication

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md)
- [Quick Deploy](./QUICK_DEPLOY.md)
- [Smart Contract Docs](./contracts/)

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Stacks Explorer](https://explorer.stacks.co/?chain=testnet)
- [Stacks Documentation](https://docs.stacks.co)
- [Clarity Language](https://docs.stacks.co/clarity)

---

**Built with ₿ on Stacks**
