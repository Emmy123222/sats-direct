# SatsGate Waitlist System

A professional waitlist management system for collecting early user signups with analytics and admin features.

## Features

### User-Facing Features
- ✅ Email validation and duplicate prevention
- ✅ Real-time signup statistics display
- ✅ Mobile-responsive design
- ✅ Success confirmation with social proof
- ✅ Professional error handling

### Admin Features
- ✅ Password-protected admin panel at `/admin`
- ✅ Waitlist statistics (total, today, this week)
- ✅ Export functionality (CSV download)
- ✅ Source tracking and analytics
- ✅ Real-time data updates

### Technical Features
- ✅ Structured data storage with metadata
- ✅ Analytics integration ready
- ✅ Backend API integration ready
- ✅ TypeScript type safety
- ✅ Error handling and fallbacks

## Usage

### For Users
1. Visit the landing page
2. Scroll to "Get early access" section
3. Enter email address
4. Click "Join Waitlist"
5. See confirmation and current signup count

### For Admins
1. Visit `/admin` in your browser
2. Enter admin password: `satsgate2024`
3. View waitlist statistics and entries
4. Export data as CSV for email marketing

## Data Structure

Each waitlist entry contains:
```typescript
interface WaitlistEntry {
  email: string;           // User's email address
  timestamp: string;       // ISO timestamp of signup
  source: string;          // Source of signup (landing_page, newsletter_signup)
  userAgent: string;       // Browser/device information
  referrer: string;        // Referring website or 'direct'
}
```

## Configuration

### Environment Variables
Create `.env.local` file:
```env
# Optional: Backend API endpoint
VITE_WAITLIST_API=https://your-api.com/waitlist

# Optional: Analytics tracking
VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# Optional: Custom admin password
VITE_ADMIN_PASSWORD=your-secure-password
```

### Admin Password
Default password: `satsgate2024`
Change in `src/pages/Admin.tsx` line 13

## Backend Integration

The system is designed to work with or without a backend:

### Local Storage Only (Current)
- Stores data in browser localStorage
- Works offline
- Data persists across sessions
- Perfect for MVP/testing

### With Backend API
- Set `VITE_WAITLIST_API` environment variable
- Implements automatic fallback to localStorage
- See `src/utils/apiClient.ts` for API structure

### Required API Endpoints
```
POST /api/waitlist
- Add email to waitlist
- Body: { email, source, userAgent, referrer, timestamp }

GET /api/waitlist/check?email=user@example.com
- Check if email exists
- Returns: { exists: boolean }

GET /api/waitlist/stats
- Get statistics
- Returns: { total, today, thisWeek }

GET /api/waitlist/export
- Export data (admin only)
- Requires: Authorization header
```

## Analytics Integration

### Google Analytics 4
Automatically tracks `waitlist_signup` events when GA4 is configured.

### Custom Analytics
Supports custom analytics platforms via `window.analytics.track()`.

### Event Data
```javascript
{
  event: 'waitlist_signup',
  email: 'user@example.com',
  source: 'landing_page',
  timestamp: '2024-02-04T08:00:00.000Z'
}
```

## Email Marketing Integration

### Export Data
1. Go to `/admin`
2. Click "Export CSV"
3. Import into your email marketing platform

### Supported Platforms
- Mailchimp
- ConvertKit
- Substack
- Any platform that accepts CSV imports

## Security Considerations

### Current Implementation
- Simple password protection for admin panel
- Client-side data storage
- No sensitive data exposure

### Production Recommendations
- Implement proper authentication (JWT, OAuth)
- Use HTTPS for all communications
- Rate limiting for signup endpoints
- Email verification for signups
- GDPR compliance features

## Customization

### Styling
All components use Tailwind CSS classes and can be customized in:
- `src/components/landing/WaitlistForm.tsx`
- `src/components/admin/WaitlistAdmin.tsx`

### Validation
Email validation can be customized in:
- `src/utils/waitlistService.ts` (line 89)

### Success Messages
Customize messages in:
- `WaitlistService.addToWaitlist()` method

## Troubleshooting

### Common Issues

**"Already on waitlist" for new emails**
- Check localStorage: `localStorage.getItem('satsgate_waitlist')`
- Clear if needed: `localStorage.removeItem('satsgate_waitlist')`

**Admin panel not accessible**
- Verify password in `src/pages/Admin.tsx`
- Check browser console for errors

**Export not working**
- Ensure there are waitlist entries
- Check browser's download permissions

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Future Enhancements

- [ ] Email verification system
- [ ] Automated email sequences
- [ ] A/B testing for signup forms
- [ ] Advanced analytics dashboard
- [ ] GDPR compliance features
- [ ] Multi-language support
- [ ] Social media integration
- [ ] Referral tracking system