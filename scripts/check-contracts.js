import { ClarityType, cvToJSON, serializeCV } from '@stacks/transactions';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple syntax checker for Clarity contracts
function checkClaritySyntax(contractName, code) {
  console.log(`\nChecking ${contractName}...`);
  
  const issues = [];
  
  // Check for balanced parentheses
  let parenCount = 0;
  for (let char of code) {
    if (char === '(') parenCount++;
    if (char === ')') parenCount--;
    if (parenCount < 0) {
      issues.push('Unbalanced parentheses - too many closing parens');
      break;
    }
  }
  if (parenCount > 0) {
    issues.push('Unbalanced parentheses - missing closing parens');
  }
  
  // Check for required elements
  const hasDefinePublic = code.includes('define-public');
  const hasDefineReadOnly = code.includes('define-read-only');
  const hasDefineMap = code.includes('define-map');
  
  if (!hasDefinePublic && !hasDefineReadOnly) {
    issues.push('Warning: No public or read-only functions defined');
  }
  
  // Check for common mistakes
  if (code.includes('define-public (')) {
    issues.push('Syntax error: Space between define-public and opening paren');
  }
  
  if (code.includes('define-read-only (')) {
    issues.push('Syntax error: Space between define-read-only and opening paren');
  }
  
  // Count functions
  const publicFunctions = (code.match(/define-public/g) || []).length;
  const readOnlyFunctions = (code.match(/define-read-only/g) || []).length;
  const maps = (code.match(/define-map/g) || []).length;
  const constants = (code.match(/define-constant/g) || []).length;
  
  console.log(`  Public functions: ${publicFunctions}`);
  console.log(`  Read-only functions: ${readOnlyFunctions}`);
  console.log(`  Data maps: ${maps}`);
  console.log(`  Constants: ${constants}`);
  
  if (issues.length === 0) {
    console.log(`  ✓ ${contractName} looks good!`);
    return true;
  } else {
    console.log(`  ✗ Issues found in ${contractName}:`);
    issues.forEach(issue => console.log(`    - ${issue}`));
    return false;
  }
}

async function main() {
  console.log('=================================');
  console.log('Smart Contract Syntax Check');
  console.log('=================================');
  
  const contractsDir = path.join(__dirname, '..', 'contracts');
  const contracts = [
    { name: 'escrow', file: 'escrow.clar' },
    { name: 'invoice-registry', file: 'invoice-registry.clar' }
  ];
  
  let allValid = true;
  
  for (const contract of contracts) {
    const contractPath = path.join(contractsDir, contract.file);
    
    if (!fs.existsSync(contractPath)) {
      console.log(`\n✗ Contract file not found: ${contract.file}`);
      allValid = false;
      continue;
    }
    
    const code = fs.readFileSync(contractPath, 'utf8');
    const isValid = checkClaritySyntax(contract.name, code);
    
    if (!isValid) {
      allValid = false;
    }
  }
  
  console.log('\n=================================');
  if (allValid) {
    console.log('✓ All contracts passed basic syntax checks!');
    console.log('\nNext steps:');
    console.log('1. Deploy to testnet using Stacks Explorer');
    console.log('2. Or use: npm run deploy:contracts');
    console.log('\nSee QUICK_DEPLOY.md for detailed instructions');
  } else {
    console.log('✗ Some contracts have issues');
    console.log('Please fix the issues before deploying');
  }
  console.log('=================================\n');
  
  console.log('Note: This is a basic syntax check.');
  console.log('For full validation, use Clarinet:');
  console.log('  clarinet check');
  console.log('  clarinet test\n');
}

main().catch(console.error);
