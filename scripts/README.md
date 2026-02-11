# Scripts

Utility scripts for development, testing, and deployment.

## 📁 Folder Structure

```
scripts/
├── test/                      # Test scripts
│   ├── test-escrow.js        # Test escrow contract
│   ├── test-get-escrow.js    # Test getEscrow function
│   ├── check-escrow-status.js # Check escrow status
│   └── show-escrow-details.js # Show detailed escrow info
├── deploy-contracts.js        # Deploy smart contracts
├── check-contracts.js         # Check contract deployment
├── generate-private-key.js    # Generate Stacks private key
└── send-announcement-local.js # Send email announcements
```

## 🧪 Test Scripts

### Check All Escrows
```bash
node scripts/test/test-escrow.js
```
Shows all escrows on the blockchain with their IDs and status.

### Check Specific Escrow
```bash
node scripts/test/check-escrow-status.js 1
```
Shows detailed status of escrow #1.

### Show Escrow Details
```bash
node scripts/test/show-escrow-details.js 1
```
Shows full details including amount, deadline, and description.

### Test getEscrow Function
```bash
node scripts/test/test-get-escrow.js
```
Tests the getEscrow API call directly.

## 🚀 Deployment Scripts

### Deploy Contracts
```bash
node scripts/deploy-contracts.js
```
Deploys smart contracts to testnet/mainnet.

### Check Deployment
```bash
node scripts/check-contracts.js
```
Verifies contracts are deployed correctly.

### Generate Private Key
```bash
node scripts/generate-private-key.js
```
Generates a new Stacks private key for deployment.

## 📧 Email Scripts

### Send Announcement
```bash
node scripts/send-announcement-local.js
```
Sends email announcement to waitlist subscribers.

## 💡 Tips

- Run test scripts from the project root: `node scripts/test/test-escrow.js`
- Check `.env` file for correct contract addresses
- Use testnet for testing before mainnet deployment
