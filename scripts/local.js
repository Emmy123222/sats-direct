// Simple backend API for waitlist management with custom email handling
// Handles email sending through your own system (no third-party services)

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// File to store waitlist entries
const WAITLIST_FILE = path.join(process.cwd(), 'waitlist-entries.json');

// Initialize waitlist file if it doesn't exist
if (!fs.existsSync(WAITLIST_FILE)) {
  fs.writeFileSync(WAITLIST_FILE, JSON.stringify([], null, 2));
}

// Helper function to read waitlist entries
function readWaitlistEntries() {
  try {
    const data = fs.readFileSync(WAITLIST_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading waitlist file:', error);
    return [];
  }
}

// Helper function to write waitlist entries
function writeWaitlistEntries(entries) {
  try {
    fs.writeFileSync(WAITLIST_FILE, JSON.stringify(entries, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing waitlist file:', error);
    return false;
  }
}

// Custom email handler - you can implement your own email logic here
async function handleWelcomeEmail(email) {
  console.log('📧 Processing welcome email for:', email);
  
  // TODO: Implement your own email sending logic here
  // This could be:
  // - Your own SMTP server
  // - A queue system for batch processing
  // - Integration with your existing email infrastructure
  // - Or any other email solution you prefer
  
  // For now, just log the email details
  console.log('� Email conitent prepared for:', email);
  console.log('📧 Subject: Welcome to SatsGate - Bitcoin payments on Stacks!');
  console.log('📧 Template: Professional welcome email with Stacks branding');
  
  // Simulate email processing
  return { 
    success: true, 
    message: 'Email processed by your custom system',
    emailId: 'custom-' + Date.now()
  };
}

// Waitlist signup handler with custom email processing
async function waitlistSignupHandler(req, res) {
  try {
    const { email, additionalData = {} } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    console.log('📝 New waitlist signup:', email);

    // Read existing entries
    const entries = readWaitlistEntries();
    
    // Check if email already exists
    const existingEntry = entries.find(entry => entry.email.toLowerCase() === email.toLowerCase());
    if (existingEntry) {
      console.log('⚠️  Email already exists:', email);
      return res.status(200).json({ 
        success: true, 
        message: 'You\'re already on the waitlist!',
        alreadyExists: true
      });
    }

    // Create new entry
    const newEntry = {
      email: email.toLowerCase().trim(),
      timestamp: new Date().toISOString(),
      signupDate: new Date().toLocaleDateString(),
      source: additionalData.source || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      additionalData: additionalData
    };

    // Add to entries
    entries.push(newEntry);

    // Save to file
    if (writeWaitlistEntries(entries)) {
      console.log('✅ Waitlist entry saved:', email);
      console.log('📊 Total entries:', entries.length);
      
      // Process welcome email through your custom system
      const emailResult = await handleWelcomeEmail(email);
      
      return res.status(200).json({ 
        success: true, 
        message: 'Welcome to the waitlist! We\'ll be in touch soon.',
        entryId: entries.length,
        totalEntries: entries.length,
        emailProcessed: emailResult.success,
        emailId: emailResult.emailId
      });
    } else {
      return res.status(500).json({ error: 'Failed to save waitlist entry' });
    }

  } catch (error) {
    console.error('❌ Waitlist signup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Get waitlist stats (optional - for admin)
async function getWaitlistStats(req, res) {
  try {
    const entries = readWaitlistEntries();
    const today = new Date().toLocaleDateString();
    const todayEntries = entries.filter(entry => entry.signupDate === today);
    
    return res.status(200).json({
      total: entries.length,
      today: todayEntries.length,
      latest: entries.slice(-5).reverse() // Last 5 entries
    });
  } catch (error) {
    console.error('❌ Stats error:', error);
    return res.status(500).json({ error: 'Failed to get stats' });
  }
}

// API routes
app.post('/api/waitlist', waitlistSignupHandler);
app.get('/api/waitlist/stats', getWaitlistStats);

// Health check
app.get('/api/health', (req, res) => {
  const entries = readWaitlistEntries();
  res.json({ 
    status: 'OK', 
    message: 'Waitlist backend is running',
    totalEntries: entries.length
  });
});

// Start server
app.listen(PORT, () => {
  const entries = readWaitlistEntries();
  console.log(`🚀 Waitlist backend running on http://localhost:${PORT}`);
  console.log(`📝 Waitlist API available at http://localhost:${PORT}/api/waitlist`);
  console.log(`📊 Stats API available at http://localhost:${PORT}/api/waitlist/stats`);
  console.log(`🔍 Health check at http://localhost:${PORT}/api/health`);
  console.log(`📋 Current entries: ${entries.length}`);
  console.log(`📧 Email system: Custom (no third-party services)`);
});