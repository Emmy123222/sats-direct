// API client for backend integration
// This can be used when you want to connect to a real backend

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export class ApiClient {
  private static readonly BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  
  /**
   * Generic API request method
   */
  private static async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Request failed',
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Waitlist endpoints
   */
  static async addToWaitlist(email: string, metadata: any = {}) {
    return this.request('/waitlist', {
      method: 'POST',
      body: JSON.stringify({ email, ...metadata }),
    });
  }

  static async checkWaitlistEmail(email: string) {
    return this.request(`/waitlist/check?email=${encodeURIComponent(email)}`);
  }

  static async getWaitlistStats() {
    return this.request('/waitlist/stats');
  }

  static async exportWaitlist(adminKey: string) {
    return this.request('/waitlist/export', {
      headers: {
        'Authorization': `Bearer ${adminKey}`,
      },
    });
  }

  /**
   * Newsletter endpoints
   */
  static async subscribeNewsletter(email: string, preferences: string[] = []) {
    return this.request('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email, preferences }),
    });
  }

  /**
   * Analytics endpoints
   */
  static async trackEvent(event: string, properties: any = {}) {
    return this.request('/analytics/track', {
      method: 'POST',
      body: JSON.stringify({ event, properties, timestamp: new Date().toISOString() }),
    });
  }
}

/**
 * Example backend endpoints you might want to implement:
 * 
 * POST /api/waitlist
 * - Add email to waitlist
 * - Body: { email, source, userAgent, referrer, timestamp }
 * 
 * GET /api/waitlist/check?email=user@example.com
 * - Check if email exists in waitlist
 * - Returns: { exists: boolean }
 * 
 * GET /api/waitlist/stats
 * - Get waitlist statistics
 * - Returns: { total, today, thisWeek, thisMonth }
 * 
 * GET /api/waitlist/export
 * - Export waitlist data (admin only)
 * - Requires: Authorization header
 * - Returns: CSV or JSON data
 * 
 * POST /api/newsletter/subscribe
 * - Subscribe to newsletter
 * - Body: { email, preferences }
 * 
 * POST /api/analytics/track
 * - Track custom events
 * - Body: { event, properties, timestamp }
 */