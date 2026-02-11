#!/usr/bin/env node

/**
 * Check escrow status to debug mark-complete failures
 * Usage: node check-escrow-status.js [escrowId]
 */

const CONTRACT_ADDRESS = 'ST3XJC356F2NYYBT4JBEYW5KWYHVRHEZ1YDZG65KT';
const CONTRACT_NAME = 'escrow';
const NETWORK = 'testnet';

const escrowId = process.argv[2] || '1';

async function checkStatus() {
  console.log(`\n🔍 Checking Escrow #${escrowId} Status...\n`);
  
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: CONTRACT_ADDRESS,
          arguments: [clarityUint],
        }),
      }
    );

    if (!response.ok) {
      console.log(`❌ HTTP Error ${response.status}`);
      return;
    }

    const data = await response.json();
    
    if (data.result === '0x09') {
      console.log(`❌ Escrow #${escrowId} does not exist\n`);
      return;
    }

    const hex = data.result;
    
    // Extract status
    const statusMatch = hex.match(/73746174757301([0-9a-f]{32})/i);
    if (statusMatch) {
      const statusNum = parseInt(statusMatch[1], 16);
      const statusNames = {
        0: 'Created (not funded yet)',
        1: 'Funded (ready for mark-complete)',
        2: 'Completed (ready for release-funds)',
        3: 'Released (escrow finished)',
        4: 'Cancelled'
      };
      
      console.log(`📊 Current Status: ${statusNum} - ${statusNames[statusNum] || 'Unknown'}`);
      
      if (statusNum === 0) {
        console.log('\n⚠️  PROBLEM: Escrow is not funded yet!');
        console.log('   Solution: Buyer must deposit STX first using /pay/' + escrowId);
      } else if (statusNum === 1) {
        console.log('\n✅ Escrow is funded! Seller can mark-complete.');
      } else if (statusNum === 2) {
        console.log('\n✅ Work is marked complete! Buyer can release-funds.');
      } else if (statusNum === 3) {
        console.log('\n✅ Escrow completed! Funds released to seller.');
      }
    }
    
    // Extract amount
    const amountMatch = hex.match(/616d6f756e7401([0-9a-f]{32})/i);
    if (amountMatch) {
      const amount = parseInt(amountMatch[1], 16);
      console.log(`💰 Amount: ${amount} microSTX (${(amount / 1000000).toFixed(2)} STX)`);
    }
    
    // Extract deadline
    const deadlineMatch = hex.match(/646561646c696e6501([0-9a-f]{32})/i);
    if (deadlineMatch) {
      const deadline = parseInt(deadlineMatch[1], 16);
      console.log(`⏰ Deadline: Block ${deadline}`);
    }
    
    console.log('\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkStatus();
