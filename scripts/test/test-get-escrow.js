#!/usr/bin/env node

/**
 * Test the getEscrow API call directly
 */

const CONTRACT_ADDRESS = 'ST3XJC356F2NYYBT4JBEYW5KWYHVRHEZ1YDZG65KT';
const CONTRACT_NAME = 'escrow';
const NETWORK = 'testnet';
const escrowId = 1;

async function testGetEscrow() {
  console.log(`\n🧪 Testing getEscrow(${escrowId})...\n`);
  
  const apiUrl = NETWORK === 'mainnet' 
    ? 'https://api.hiro.so' 
    : 'https://api.testnet.hiro.so';

  // Format as Clarity uint: 0x01 (type) + 16 bytes (value in hex)
  const valueHex = escrowId.toString(16).padStart(32, '0');
  const clarityUint = `0x01${valueHex}`;
  
  console.log(`📋 Contract: ${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
  console.log(`🔢 Escrow ID: ${escrowId}`);
  console.log(`🔤 Clarity Uint: ${clarityUint}`);
  console.log(`🌐 API URL: ${apiUrl}/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/get-escrow\n`);

  try {
    const requestBody = {
      sender: CONTRACT_ADDRESS,
      arguments: [clarityUint],
    };
    
    console.log('📤 Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('');
    
    const response = await fetch(
      `${apiUrl}/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/get-escrow`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    console.log(`📥 Response Status: ${response.status} ${response.statusText}\n`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error Response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ Success! Response Data:');
    console.log(JSON.stringify(data, null, 2));
    console.log('');
    
    if (data.result === '0x09') {
      console.log('⚠️  Result is "none" - escrow not found');
    } else {
      console.log('✅ Escrow data found!');
      console.log(`📊 Result hex: ${data.result.substring(0, 100)}...`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

testGetEscrow();
