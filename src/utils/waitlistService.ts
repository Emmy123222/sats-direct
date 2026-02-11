// Waitlist service for managing email subscriptions
// Emails are handled entirely by the backend API

export interface WaitlistEntry {
  email: string;
  timestamp: string;
  source: string;
  userAgent: string;
  referrer: string;
}

export class WaitlistService {
  private static readonly STORAGE_KEY = 'satsgate_waitlist';
  private static readonly API_ENDPOINT = import.meta.env.VITE_WAITLIST_API || null;

  /**
   * Add email to waitlist - simplified to use backend only
   */
  static async addToWaitlist(email: string): Promise<{ success: boolean; message: string }> {
    // Validate email
    if (!this.isValidEmail(email)) {
      return { success: false, message: 'Please enter a valid email address' };
    }

    // Check if already exists
    if (await this.isEmailInWaitlist(email)) {
      return { success: false, message: 'You\'re already on the waitlist!' };
    }

    const entry: WaitlistEntry = {
      email: email.toLowerCase().trim(),
      timestamp: new Date().toISOString(),
      source: 'landing_page',
      userAgent: navigator.userAgent,
      referrer: document.referrer || 'direct'
    };

    try {
      // Store locally first
      await this.storeLocally(entry);
      
      // Send to backend API (no email services)
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const waitlistApiUrl = isDevelopment ? 'http://localhost:3001/api/waitlist' : '/api/waitlist';
      
      console.log('📝 Submitting to waitlist backend...');
      
      const backendResponse = await fetch(waitlistApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: entry.email,
          additionalData: {
            source: entry.source,
            signupDate: new Date(entry.timestamp).toLocaleDateString(),
            timestamp: entry.timestamp,
            userAgent: entry.userAgent,
            referrer: entry.referrer
          }
        })
      });

      if (backendResponse.ok) {
        const result = await backendResponse.json();
        console.log('✅ Waitlist signup successful:', result);
        
        // Send to analytics if available
        this.trackWaitlistSignup(entry);
        
        return { 
          success: true, 
          message: result.message || 'Welcome to the waitlist! We\'ll be in touch soon.' 
        };
      } else {
        const error = await backendResponse.json();
        console.warn('Backend API error:', error);
        
        // Still consider signup successful and store locally
        this.trackWaitlistSignup(entry);
        return { 
          success: true, 
          message: 'Welcome to the waitlist! We\'ll be in touch soon.' 
        };
      }
      
    } catch (error) {
      console.error('Error adding to waitlist:', error);
      
      // Fallback to local storage only
      try {
        await this.storeLocally(entry);
        this.trackWaitlistSignup(entry);
        return { 
          success: true, 
          message: 'Welcome to the waitlist! We\'ll be in touch soon.' 
        };
      } catch (localError) {
        console.error('Local storage failed:', localError);
        return { success: false, message: 'Something went wrong. Please try again.' };
      }
    }
  }

  /**
   * Check if email is already in waitlist
   */
  static async isEmailInWaitlist(email: string): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();
    
    try {
      // Check API first if available
      if (this.API_ENDPOINT) {
        const response = await fetch(`${this.API_ENDPOINT}/check?email=${encodeURIComponent(normalizedEmail)}`);
        if (response.ok) {
          const result = await response.json();
          return result.exists;
        }
      }
      
      // Check local storage
      const localEntries = this.getLocalEntriesPrivate();
      return localEntries.some(entry => entry.email === normalizedEmail);
    } catch (error) {
      console.error('Error checking waitlist:', error);
      
      // Fallback to local check only
      const localEntries = this.getLocalEntriesPrivate();
      return localEntries.some(entry => entry.email === normalizedEmail);
    }
  }

  /**
   * Get waitlist statistics (for display purposes)
   */
  static getWaitlistStats(): { total: number; today: number; thisWeek: number } {
    const entries = this.getLocalEntriesPrivate();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      total: entries.length,
      today: entries.filter(entry => new Date(entry.timestamp) >= today).length,
      thisWeek: entries.filter(entry => new Date(entry.timestamp) >= weekAgo).length
    };
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  /**
   * Store entry locally
   */
  private static async storeLocally(entry: WaitlistEntry): Promise<void> {
    try {
      const existingEntries = this.getLocalEntriesPrivate();
      existingEntries.push(entry);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingEntries));
    } catch (error) {
      throw new Error('Failed to store locally');
    }
  }

  /**
   * Get local entries (public method)
   */
  static getLocalEntries(): WaitlistEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading local waitlist:', error);
      return [];
    }
  }

  /**
   * Get local entries (private method for internal use)
   */
  private static getLocalEntriesPrivate(): WaitlistEntry[] {
    return this.getLocalEntries();
  }

  /**
   * Track waitlist signup for analytics
   */
  private static trackWaitlistSignup(entry: WaitlistEntry): void {
    try {
      // Google Analytics 4
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'waitlist_signup', {
          event_category: 'engagement',
          event_label: 'landing_page',
          value: 1
        });
      }

      // Custom analytics
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('Waitlist Signup', {
          email: entry.email,
          source: entry.source,
          timestamp: entry.timestamp
        });
      }

      console.log('Waitlist signup tracked:', { email: entry.email, source: entry.source });
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  }
}

/**
 * Newsletter subscription (separate from waitlist)
 */
export class NewsletterService {
  static async subscribe(email: string, preferences: string[] = []): Promise<{ success: boolean; message: string }> {
    // This would integrate with your email service provider
    // For now, we'll add to waitlist with newsletter flag
    
    try {
      const existingEntries = WaitlistService.getLocalEntries();
      const entry: WaitlistEntry = {
        email: email.toLowerCase().trim(),
        timestamp: new Date().toISOString(),
        source: 'newsletter_signup',
        userAgent: navigator.userAgent,
        referrer: document.referrer || 'direct'
      };
      
      existingEntries.push(entry);
      localStorage.setItem('satsgate_waitlist', JSON.stringify(existingEntries));
      
      return { success: true, message: 'Subscribed to newsletter!' };
    } catch (error) {
      return { success: false, message: 'Failed to subscribe. Please try again.' };
    }
  }
}