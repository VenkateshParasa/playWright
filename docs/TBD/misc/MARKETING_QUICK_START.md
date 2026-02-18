# Marketing Platform - Quick Start Guide

## 5-Minute Setup

### 1. Install Dependencies (2 min)

```bash
# Backend
cd backend
npm install nanoid @sendgrid/mail

# Frontend  
cd ../frontend
npm install grapesjs grapesjs-preset-webpage react-quill recharts
```

### 2. Configure Environment (1 min)

```bash
# Add to backend/.env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your_sendgrid_key
BASE_URL=http://localhost:3000
AFFILIATE_DEFAULT_COMMISSION=20
AFFILIATE_MINIMUM_PAYOUT=50
```

### 3. Start Services (1 min)

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### 4. Test Installation (1 min)

Visit: `http://localhost:3001/marketing/landing-pages`

## Common Use Cases

### Create a Landing Page

```typescript
// POST /api/marketing/landing-pages
{
  "title": "Playwright Course",
  "slug": "playwright-course",
  "type": "course",
  "content": "{}",
  "seo": {
    "title": "Learn Playwright",
    "description": "Master automation"
  }
}
```

### Send Email Campaign

```typescript
// POST /api/marketing/campaigns
{
  "name": "Weekly Newsletter",
  "type": "regular",
  "subject": "This Week in Testing",
  "fromName": "Platform",
  "fromEmail": "hello@platform.com",
  "htmlContent": "<h1>Hello\!</h1>",
  "segmentType": "all"
}
```

### Setup Affiliate

```typescript
// POST /api/marketing/affiliates/apply
{
  "website": "https://myblog.com",
  "bio": "Tech blogger with 10k followers"
}
```

## Key Features at a Glance

### Landing Pages
- **Create**: Marketing > Landing Pages > New
- **Edit**: Visual builder with GrapesJS
- **Publish**: One-click publishing
- **Analytics**: Real-time conversion tracking

### Email Campaigns
- **Create**: Marketing > Campaigns > New
- **Schedule**: Set date/time or send now
- **Track**: Open/click rates automatically
- **Segment**: Target specific user groups

### Affiliates
- **Apply**: Public form at /affiliate-signup
- **Approve**: Admin dashboard
- **Track**: Cookie-based attribution
- **Payout**: Manual or automated

## Essential API Endpoints

### Landing Pages
```
POST   /api/marketing/landing-pages           # Create
GET    /api/marketing/landing-pages           # List
GET    /api/marketing/pages/:slug             # View (public)
POST   /api/marketing/landing-pages/:id/publish
```

### Campaigns
```
POST   /api/marketing/campaigns               # Create
POST   /api/marketing/campaigns/:id/send-now  # Send
GET    /api/marketing/campaigns/:id/analytics # Stats
```

### Affiliates
```
POST   /api/marketing/affiliates/apply        # Apply
GET    /api/marketing/affiliates/track/:code  # Track click
POST   /api/marketing/affiliates/:id/approve  # Approve
```

## Default Configuration

### Email Provider (SendGrid)
- Default sender: `hello@platform.com`
- Default name: `Platform`
- Rate limit: 100 emails/second

### Affiliate Program
- Commission: 20%
- Cookie: 30 days
- Minimum payout: $50
- Payment schedule: Monthly

### Landing Pages
- Default template: Blank
- Mobile responsive: Enabled
- Analytics: Enabled
- SEO: Optimized

## Troubleshooting

### Email not sending?
1. Check API key in .env
2. Verify sender domain
3. Check SendGrid dashboard

### Tracking not working?
1. Verify BASE_URL is set
2. Check cookie settings
3. Clear browser cookies

### Affiliate links broken?
1. Check affiliate code exists
2. Verify affiliate is active
3. Test with different browser

## Performance Tips

### Landing Pages
- Use optimized images
- Minimize custom code
- Enable caching
- Use CDN for assets

### Email Campaigns
- Send during business hours
- Clean list regularly
- Test before sending
- Monitor deliverability

### Affiliates
- Monitor conversion rates
- Provide good materials
- Pay on time
- Regular communication

## Best Practices

### Landing Pages
✅ Single clear CTA
✅ Mobile-first design
✅ A/B test headlines
✅ Social proof included
✅ Fast loading (<3s)

### Email Marketing
✅ Segment your audience
✅ Personalize content
✅ Test subject lines
✅ Mobile-optimized
✅ Clear unsubscribe

### Affiliate Program
✅ Quality over quantity
✅ Timely payouts
✅ Regular updates
✅ Good materials
✅ Monitor for fraud

## Quick Commands

```bash
# Create landing page
curl -X POST http://localhost:3000/api/marketing/landing-pages \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","slug":"test","type":"custom","content":"{}"}'

# Send test email
curl -X POST http://localhost:3000/api/marketing/campaigns/1/send-test \
  -H "Content-Type: application/json" \
  -d '{"testEmails":["test@example.com"]}'

# Track affiliate click
curl http://localhost:3000/api/marketing/affiliates/track/AFF12345
```

## Resources

- Full Guide: `/docs/MARKETING_PLATFORM_GUIDE.md`
- Affiliate Setup: `/docs/AFFILIATE_PROGRAM_SETUP.md`
- Email Guide: `/docs/EMAIL_MARKETING_GUIDE.md`
- Implementation: `/MARKETING_IMPLEMENTATION_SUMMARY.md`

## Support

- Documentation: http://localhost:3001/docs
- API Reference: http://localhost:3000/api/docs
- Community: community.platform.com

## Next Steps

1. ✅ Complete setup above
2. 📝 Create your first landing page
3. 📧 Send your first campaign
4. 🤝 Enable affiliate program
5. 📊 Review analytics

Happy Marketing\! 🚀
