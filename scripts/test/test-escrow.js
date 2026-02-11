#!/usr/bin/env node

/**
 * Test script to check escrow contract status
 * Run with: node test-escrow.js
 */

const CONTRACT_ADDRESS = 'ST3XJC356F2NYYBT4JBEYW5KWYHVRHEZ1YDZG65KT';
const CONTRACT_NAME = 'escrow';
const NETWORK = 'testnet';

async function checkContract() {
  console.log('🔍 Checking Escrow Contract Status...\n');
  
  const apiUrl = NETWORK === 'mainnet' 
    ? 'https://api.hiro.so' 
    : 'https://api.testnet.hiro.so';

  try {
    // Check if contract exists
    console.log(`📋 Contract: ${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
    console.log(`🌐 Network: ${NETWORK}`);
    console.log(`🔗 Explorer: https://explorer.stacks.co/address/${CONTRACT_ADDRESS}?chain=${NETWORK}\n`);

    // Try to read escrow-nonce (total number of escrows created)
    const response = await fetch(
      `${apiUrl}/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/get-escrow-nonce`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: CONTRACT_ADDRESS,
          arguments: [],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.log('❌ Contract NOT deployed yet!');
        console.log('\n📝 To deploy:');
        console.log('   1. cd sats-direct');
        console.log('   2. npm run deploy:testnet');
        console.log('   3. Wait 10-15 minutes for confirmation\n');
        return;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Contract is deployed!\n');
    
    // Parse Clarity uint format: 0x01 (type) + 16 bytes (value)
    // The value is in the last 16 bytes (32 hex chars)
    const resultHex = data.result;
    const valueHex = resultHex.slice(-32); // Last 32 hex chars = 16 bytes
    const nonce = parseInt(valueHex, 16);
    
    console.log(`📊 Total escrows created: ${nonce}`);
    
    if (nonce === 0) {
      console.log('\n💡 No escrows created yet. Create one from the dashboard!');
    } else {
      console.log(`\n📦 Escrow IDs available: 1 to ${nonce}`);
      console.log('\n💡 To test deposit:');
      console.log(`   1. Go to: http://localhost:5173/pay/1`);
      console.log(`   2. Connect wallet and click "Pay"`);
      console.log(`   3. Sign the transaction\n`);
      
      // Try to fetch first escrow details
      for (let i = 1; i <= Math.min(nonce, 3); i++) {
        console.log(`🔍 Checking escrow #${i}...\n`);
        await checkEscrow(i);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. Contract is deployed');
    console.log('   2. You have internet connection');
    console.log('   3. Stacks API is accessible\n');
  }
}

async function checkEscrow(escrowId) {
  const apiUrl = NETWORK === 'mainnet' 
    ? 'https://api.hiro.so' 
    : 'https://api.testnet.hiro.so';

  try {
    // Format as Clarity uint: 0x01 (type) + 16 bytes (value)
    const valueHex = escrowId.toString(16).padStart(32, '0');
    const clarityUint = `0x01${valueHex}`;
    
    const response = await fetch(
      `${apiUrl}/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/get-escrow`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: CONTRACT_ADDRESS,
          arguments: [clarityUint],
        }),
      }
    );

    if (!response.ok) {
      console.log(`⚠️  Could not fetch escrow #${escrowId} (HTTP ${response.status})`);
      return;
    }

    const data = await response.json();
    
    if (data.result.includes('none') || data.result === '0x09') {
      console.log(`⚠️  Escrow #${escrowId} not found (returned none)`);
      return;
    }

    console.log(`✅ Escrow #${escrowId} exists!`);
    console.log(`   Status: ${data.okay ? 'OK' : 'Error'}`);
    console.log(`   Data preview: ${data.result.substring(0, 150)}...`);
    console.log(`\n💡 You can deposit to this escrow at:`);
    console.log(`   http://localhost:5173/pay/${escrowId}\n`);

  } catch (error) {
    console.log(`⚠️  Error fetching escrow #${escrowId}:`, error.message);
  }
}

// Run the check
checkContract();
