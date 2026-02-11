// Test script for bulk email sending
// Run with: node test-bulk-email.js

import dotenv from 'dotenv';
dotenv.config();

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'super-secret-key-123';

async function testBulkEmail() {
  console.log('🧪 Testing bulk email sending...');
  
  try {
    const response = await fetch('http://localhost:3000/api/send-waitlist-announcement', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADMIN_SECRET}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Bulk email test successful:');
      console.log(`📊 Total recipients: ${result.totalRecipients}`);
      console.log(`✅ Sent successfully: ${result.sentSuccessfully}`);
      console.log(`❌ Failed: ${result.failed}`);
      
      if (result.details) {
        console.log('\n📋 Details:');
        result.details.forEach(detail => {
          const status = detail.success ? '✅' : '❌';
          console.log(`${status} ${detail.email}${detail.error ? ` - ${detail.error}` : ''}`);
        });
      }
    } else {
      console.error('❌ Bulk email test failed:', result);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Test with wrong secret first
async function testSecurity() {
  console.log('🔒 Testing security...');
  
  try {
    const response = await fetch('http://localhost:3000/api/send-waitlist-announcement', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer wrong-secret',
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      console.log('✅ Security test passed - unauthorized access blocked');
    } else {
      console.log('❌ Security test failed - should have been blocked');
    }
    
  } catch (error) {
    console.error('❌ Security test error:', error.message);
  }
}

// Run tests
console.log('🚀 Starting email system tests...\n');
await testSecurity();
console.log('');
await testBulkEmail();