#!/usr/bin/env node

/**
 * Show detailed escrow information from blockchain
 * Usage: node show-escrow-details.js [escrowId]
 */

const CONTRACT_ADDRESS = 'ST3XJC356F2NYYBT4JBEYW5KWYHVRHEZ1YDZG65KT';
const CONTRACT_NAME = 'escrow';
const NETWORK = 'testnet';

const escrowId = process.argv[2] || '1';

async function showEscrowDetails() {
  console.log(`\n🔍 Fetching Escrow #${escrowId} Details...\n`);
  
  const apiUrl = NETWORK === 'mainnet' 
    ? 'https://api.hiro.so' 
    : 'https://api.testnet.hiro.so';

  try {
    // Format as Clarity uint
    const valueHex = parseInt(escrowId).toString(16).padStart(32, '0');
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
      console.log(`❌ HTTP Error ${response.status}: ${response.statusText}`);
      return;
    }

    const data = await response.json();
    
    if (data.result === '0x09') {
      console.log(`❌ Escrow #${escrowId} does not exist\n`);
      return;
    }

    console.log('✅ Escrow Found!\n');
    console.log('📋 Raw Hex Data:');
    console.log(data.result);
    console.log('\n');

    // Parse the hex data
    const hex = data.result;
    
    // Extract amount
    const amountMatch = hex.match(/616d6f756e7401([0-9a-f]{32})/i);
    if (amountMatch) {
      const amount = parseInt(amountMatch[1], 16);
      console.log(`💰 Amount: ${amount} microSTX (${(amount / 1000000).toFixed(2)} STX)`);
    }
    
    // Extract status
    const statusMatch = hex.match(/73746174757301([0-9a-f]{32})/i);
    if (statusMatch) {
      const status = parseInt(statusMatch[1], 16);
      const statusNames = ['Created', 'Funded', 'Completed', 'Released', 'Cancelled'];
      console.log(`📊 Status: ${status} (${statusNames[status] || 'Unknown'})`);
    }
    
    // Extract deadline
    const deadlineMatch = hex.match(/646561646c696e6501([0-9a-f]{32})/i);
    if (deadlineMatch) {
      const deadline = parseInt(deadlineMatch[1], 16);
      console.log(`⏰ Deadline: Block ${deadline}`);
    }
    
    // Extract created-at
    const createdMatch = hex.match(/63726561746564([0-9a-f]{32})/i);
    if (createdMatch) {
      const created = parseInt(createdMatch[1], 16);
      console.log(`📅 Created At: Block ${created}`);
    }

    console.log('\n💡 To pay this escrow:');
    console.log(`   http://localhost:8080/pay/${escrowId}`);
    console.log('\n🔗 View on Explorer:');
    console.log(`   https://explorer.stacks.co/address/${CONTRACT_ADDRESS}?chain=testnet\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

showEscrowDetails();
