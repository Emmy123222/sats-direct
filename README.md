# SatsGate - Bitcoin Payment Gateway

A non-custodial Bitcoin payment gateway built on Stacks that enables merchants to accept BTC payments directly to their wallets.

## Features

- **Self-Custodial**: Payments go directly to merchant wallets
- **No KYC**: Start accepting payments immediately
- **Stacks Integration**: Connect with Hiro/Leather wallets
- **Invoice Management**: Create and track payment invoices
- **QR Code Payments**: Easy mobile payments
- **Real-time Monitoring**: Automatic payment detection via mempool.space
- **Blockchain Registry**: Optional invoice metadata on Stacks blockchain

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Wallet**: @stacks/connect (Hiro/Leather support)
- **Payments**: Bitcoin mainnet via mempool.space API
- **Smart Contracts**: Clarity on Stacks blockchain
- **Storage**: Browser localStorage (MVP)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Hiro or Leather wallet extension

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sats-direct
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open http://localhost:8080 in your browser

### Usage

1. **Connect Wallet**: Click "Connect Wallet" and authorize with Hiro/Leather
2. **Create Invoice**: Enter amount and optional memo
3. **Share Payment Link**: Copy the generated invoice URL
4. **Monitor Payments**: Check payment status automatically

## Project Structure

```
sats-direct/
├── src/
│   ├── components/        # React components
│   │   ├── landing/       # Landing page components
│   │   └── ui/           # Reusable UI components
│   ├── contexts/         # React contexts
│   │   └── WalletContext.tsx
│   ├── pages/            # Page components
│   │   ├── Landing.tsx
│   │   ├── Dashboard.tsx
│   │   └── InvoicePage.tsx
│   └── utils/            # Utility functions
│       ├── paymentMonitor.ts
│       └── contractInteraction.ts
├── contracts/            # Clarity smart contracts
│   └── invoice-registry.clar
└── .md/                 # Documentation
    └── plan.md
```

## API Integration

### Payment Monitoring

The app uses mempool.space API to monitor Bitcoin transactions:

- **Endpoint**: `https://mempool.space/api/address/{address}/txs`
- **Purpose**: Check for incoming payments to merchant addresses
- **Frequency**: Every 30 seconds for active invoices

### Wallet Integration

Stacks wallet integration via @stacks/connect:

- **Supported Wallets**: Hiro, Leather
- **Network**: Bitcoin mainnet, Stacks mainnet/testnet
- **Permissions**: Read addresses, sign transactions

## Smart Contract

The invoice registry contract (`contracts/invoice-registry.clar`) provides:

- **Invoice Registration**: Store invoice metadata on-chain
- **Status Updates**: Update payment status
- **Public Verification**: Anyone can verify invoice details
- **Merchant Control**: Only merchants can update their invoices

### Contract Functions

- `register-invoice`: Create new invoice record
- `update-invoice-status`: Mark invoice as paid
- `get-invoice`: Retrieve invoice details
- `invoice-exists`: Check if invoice exists

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

### Environment Variables

Create `.env.local` for local development:

```env
VITE_NETWORK=testnet
VITE_CONTRACT_ADDRESS=your-contract-address
```

## Deployment

### Frontend Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting provider (Vercel, Netlify, etc.)

### Smart Contract Deployment

1. Use Clarinet or Stacks CLI to deploy the contract
2. Update `CONTRACT_ADDRESS` in `src/utils/contractInteraction.ts`

## Security Considerations

- **Private Keys**: Never stored or transmitted
- **Wallet Connection**: Uses secure Stacks Connect protocol
- **Payment Verification**: Cross-references blockchain data
- **CORS**: Configure API endpoints for production

## Limitations (MVP)

- **Storage**: Uses localStorage (not persistent across devices)
- **Scaling**: No backend database
- **Analytics**: Basic transaction tracking only
- **Multi-currency**: Bitcoin only

## Future Enhancements

- Backend API with database
- Multi-signature support
- Lightning Network integration
- Advanced analytics dashboard
- Mobile app
- Webhook notifications

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions or issues:
- Create an issue on GitHub
- Check the documentation in `.md/plan.md`
- Review the smart contract code in `contracts/`