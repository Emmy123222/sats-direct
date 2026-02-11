# Project Organization

This document explains the organization of the SatsGate project.

## 📁 Directory Structure

```
sats-direct/
├── api/                    # Serverless functions (Vercel/Netlify)
│   ├── waitlist.js        # Waitlist signup endpoint
│   └── send-waitlist-announcement.js
│
├── contracts/              # Clarity smart contracts
│   ├── escrow.clar        # Main escrow contract
│   └── invoice-registry.clar
│
├── deployments/            # Contract deployment artifacts
│   └── default.testnet-plan.yaml
│
├── docs/                   # 📚 All documentation (YOU ARE HERE)
│   ├── README.md          # Documentation index
│   ├── QUICK_START.md     # Quick start guide
│   ├── DEPLOYMENT.md      # Deployment guide
│   ├── PLATFORM_OVERVIEW.md
│   ├── FEATURES_COMPLETE.md
│   └── ... (all .md files)
│
├── public/                 # Static assets
│   └── favicon.ico
│
├── scripts/                # 🔧 Utility scripts
│   ├── README.md          # Scripts documentation
│   ├── test/              # Test scripts
│   │   ├── test-escrow.js
│   │   ├── check-escrow-status.js
│   │   └── show-escrow-details.js
│   ├── deploy-contracts.js
│   ├── check-contracts.js
│   └── generate-private-key.js
│
├── settings/               # Clarinet configuration
│   ├── Devnet.toml
│   ├── Testnet.toml
│   └── Mainnet.toml
│
├── src/                    # 💻 Source code
│   ├── components/        # React components
│   │   ├── ui/           # UI components (shadcn)
│   │   ├── landing/      # Landing page components
│   │   └── escrow/       # Escrow-specific components
│   ├── contexts/         # React contexts
│   │   └── WalletContext.tsx
│   ├── pages/            # Page components
│   │   ├── Landing.tsx
│   │   ├── Dashboard.tsx
│   │   ├── CreateEscrowPage.tsx
│   │   ├── PayEscrowPage.tsx
│   │   └── EscrowDetailsPage.tsx
│   ├── utils/            # Utility functions
│   │   ├── contractInteraction.ts
│   │   ├── escrowDiscovery.ts
│   │   ├── transactionPoller.ts
│   │   └── clarityParser.ts
│   └── App.tsx           # Main app component
│
├── .env                    # Environment variables (not in git)
├── .env.example            # Example environment variables
├── package.json            # Dependencies and scripts
├── README.md               # Main project README
└── vite.config.ts          # Vite configuration
```

## 📚 Documentation Location

All documentation files (`.md`) are now in the `docs/` folder:

- **Before**: Scattered in root directory
- **After**: Organized in `docs/` folder

## 🔧 Scripts Location

All utility scripts (`.js`) are now in the `scripts/` folder:

- **Test scripts**: `scripts/test/`
- **Deployment scripts**: `scripts/`
- **Email scripts**: `scripts/`

## 🎯 Key Files

### Configuration
- `.env` - Environment variables (API keys, contract addresses)
- `package.json` - Dependencies and npm scripts
- `vite.config.ts` - Build configuration
- `Clarinet.toml` - Smart contract configuration

### Entry Points
- `index.html` - HTML entry point
- `src/App.tsx` - React app entry point
- `src/main.tsx` - React DOM render

### Smart Contracts
- `contracts/escrow.clar` - Main escrow logic
- `contracts/invoice-registry.clar` - Invoice tracking

## 📖 How to Navigate

1. **Start here**: [README.md](../README.md) in root
2. **Quick start**: [docs/QUICK_START.md](./QUICK_START.md)
3. **Deploy**: [docs/DEPLOYMENT.md](./DEPLOYMENT.md)
4. **Test**: [scripts/README.md](../scripts/README.md)
5. **Troubleshoot**: [docs/DEPOSIT_ISSUE_EXPLAINED.md](./DEPOSIT_ISSUE_EXPLAINED.md)

## 🚀 Common Tasks

### Development
```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
```

### Testing
```bash
node scripts/test/test-escrow.js           # Test escrows
node scripts/test/check-escrow-status.js 1 # Check escrow #1
```

### Deployment
```bash
node scripts/deploy-contracts.js  # Deploy contracts
node scripts/check-contracts.js   # Verify deployment
```

## 📝 Notes

- All documentation is in Markdown format
- Scripts are organized by purpose (test, deploy, email)
- Source code follows React + TypeScript best practices
- Smart contracts use Clarity language

## 🔗 Quick Links

- [Main README](../README.md)
- [Documentation Index](./README.md)
- [Scripts Documentation](../scripts/README.md)
- [Platform Overview](./PLATFORM_OVERVIEW.md)
