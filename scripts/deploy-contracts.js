import transactions from '@stacks/transactions';
import { STACKS_TESTNET, STACKS_MAINNET, TransactionVersion } from '@stacks/network';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const { makeContractDeploy, broadcastTransaction, AnchorMode, getAddressFromPrivateKey } = transactions;

// Load .env.local
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const NETWORK = process.env.STACKS_NETWORK || 'testnet';
const PRIVATE_KEY = process.env.STACKS_PRIVATE_KEY;

if (!PRIVATE_KEY) {
  console.error('Error: STACKS_PRIVATE_KEY environment variable is required');
  console.error('Create a .env.local file with your private key');
  process.exit(1);
}

const network = NETWORK === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;

// Get deployer address
const deployerAddress = getAddressFromPrivateKey(PRIVATE_KEY, network);

async function deployContract(contractName, contractFile) {
  console.log(`\nDeploying ${contractName}...`);
  
  try {
    const contractPath = path.join(__dirname, '..', 'contracts', contractFile);
    const codeBody = fs.readFileSync(contractPath, 'utf8');
    
    const txOptions = {
      contractName,
      codeBody,
      senderKey: PRIVATE_KEY,
      network,
      anchorMode: AnchorMode.Any,
    };
    
    const transaction = await makeContractDeploy(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, network);
    
    if (broadcastResponse.error) {
      console.error(`Error deploying ${contractName}:`, broadcastResponse);
      return null;
    }
    
    console.log(`✓ ${contractName} deployed successfully!`);
    console.log(`  Transaction ID: ${broadcastResponse.txid}`);
    console.log(`  Explorer: https://explorer.stacks.co/txid/${broadcastResponse.txid}?chain=${NETWORK}`);
    console.log(`  Contract Address: ${deployerAddress}.${contractName}`);
    
    return broadcastResponse.txid;
  } catch (error) {
    console.error(`Error deploying ${contractName}:`, error);
    return null;
  }
}

async function main() {
  console.log('=================================');
  console.log('SatsGate Contract Deployment');
  console.log('=================================');
  console.log(`Network: ${NETWORK}`);
  console.log(`Network URL: ${network.coreApiUrl}`);
  console.log(`Deployer Address: ${deployerAddress}`);
  console.log('\n⚠️  Make sure you have testnet STX!');
  console.log(`Get testnet STX: https://explorer.stacks.co/sandbox/faucet?chain=testnet`);
  console.log(`Enter address: ${deployerAddress}\n`);
  
  // Wait for user confirmation
  console.log('Starting deployment in 5 seconds... (Press Ctrl+C to cancel)');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Deploy contracts
  const escrowTxId = await deployContract('escrow', 'escrow.clar');
  
  // Wait a bit before deploying the next contract
  if (escrowTxId) {
    console.log('\nWaiting 30 seconds before deploying next contract...');
    await new Promise(resolve => setTimeout(resolve, 30000));
  }
  
  const invoiceTxId = await deployContract('invoice-registry', 'invoice-registry.clar');
  
  console.log('\n=================================');
  console.log('Deployment Summary');
  console.log('=================================');
  console.log(`Escrow Contract: ${escrowTxId ? '✓ Deployed' : '✗ Failed'}`);
  console.log(`Invoice Registry: ${invoiceTxId ? '✓ Deployed' : '✗ Failed'}`);
  
  if (escrowTxId && invoiceTxId) {
    console.log('\n✓ All contracts deployed successfully!');
    console.log('\nAdd these to your .env file:');
    console.log(`VITE_ESCROW_CONTRACT_ADDRESS=${deployerAddress}.escrow`);
    console.log(`VITE_INVOICE_CONTRACT_ADDRESS=${deployerAddress}.invoice-registry`);
    console.log(`VITE_STACKS_NETWORK=testnet`);
    console.log('\nNext steps:');
    console.log('1. Wait for transactions to confirm (usually 10-20 minutes)');
    console.log('2. Update your .env file with the contract addresses above');
    console.log('3. Test the contracts using the Stacks Explorer');
  }
}

main().catch(console.error);
