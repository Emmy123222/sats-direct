// Run this script locally to generate your private key from your seed phrase
// Usage: node scripts/generate-private-key.js "your seed phrase here"

import { generateWallet } from '@stacks/wallet-sdk';

const seedPhrase = process.argv.slice(2).join(' ');

if (!seedPhrase) {
  console.error('Usage: node scripts/generate-private-key.js "your seed phrase"');
  process.exit(1);
}

async function generateKeys() {
  try {
    console.log('\nGenerating wallet from seed phrase...\n');
    
    const wallet = await generateWallet({
      secretKey: seedPhrase,
      password: '',
    });

    const account = wallet.accounts[0];

    console.log('=================================');
    console.log('Wallet Information');
    console.log('=================================');
    console.log('\nPrivate Key:', account.stxPrivateKey);
    console.log('\n⚠️  KEEP YOUR PRIVATE KEY SAFE!');
    console.log('Add it to your .env.local file (never commit this file)');
    console.log('=================================\n');
    
    console.log('Next steps:');
    console.log('1. Create .env.local file with:');
    console.log('   STACKS_NETWORK=testnet');
    console.log('   STACKS_PRIVATE_KEY=' + account.stxPrivateKey);
    console.log('\n2. Get testnet STX: https://explorer.stacks.co/sandbox/faucet?chain=testnet');
    console.log('3. Deploy: npm run deploy:contracts\n');
  } catch (error) {
    console.error('Error generating wallet:', error.message);
    console.error(error);
  }
}

generateKeys();
