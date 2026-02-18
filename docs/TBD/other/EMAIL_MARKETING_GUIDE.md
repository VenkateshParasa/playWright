# Email Marketing Guide

## Overview

Comprehensive guide to creating, managing, and optimizing email campaigns for your learning platform.

## Getting Started

### 1. Configure Email Provider

Choose from supported providers:

#### SendGrid Setup

```bash
# Install SendGrid SDK
npm install @sendgrid/mail

# Add to .env
SENDGRID_API_KEY=SG.xxx
EMAIL_FROM=hello@yourplatform.com
EMAIL_FROM_NAME=Your Platform
EMAIL_PROVIDER=sendgrid
```

```typescript
// backend/config/email.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendEmail(options: EmailOptions) {
  await sgMail.send({
    to: options.to,
    from: {
      email: process.env.EMAIL_FROM!,
      name: process.env.EMAIL_FROM_NAME!,
    },
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
}
```

#### Mailgun Setup

```bash
# Install Mailgun SDK
npm install mailgun-js

# Add to .env
MAILGUN_API_KEY=key-xxx
MAILGUN_DOMAIN=mg.yourplatform.com
EMAIL_PROVIDER=mailgun
```

#### Amazon SES Setup

```bash
# Install AWS SDK
npm install aws-sdk

# Add to .env
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-east-1
EMAIL_PROVIDER=ses
```

### 2. Verify Domain

Add DNS records to verify your sending domain:

**SPF Record:**
```
v=spf1 include:sendgrid.net ~all
```

**DKIM Record:**
```
k=rsa; p=MIGfMA0GCSqGSIb3DQEBA...
```

**DMARC Record:**
```
v=DMARC1; p=none; rua=mailto:dmarc@yourplatform.com
```

### 3. Warm Up Domain

Gradually increase sending volume:
- Day 1-3: 50 emails/day
- Day 4-7: 100 emails/day
- Day 8-14: 500 emails/day
- Day 15+: Full volume

## Campaign Types

### 1. Regular Campaigns

One-time broadcasts to your audience.

**Use Cases:**
- Product announcements
- Newsletter
- Special offers
- Event invitations

**Example:**
```typescript
const campaign = {
  name: 'New Course Launch',
  type: 'regular',
  subject: 'Introducing: Advanced Playwright Course',
  fromName: 'Your Platform',
  fromEmail: 'courses@yourplatform.com',
  htmlContent: emailTemplate,
  segmentType: 'segment',
  segments: [
    {
      field: 'interests',
      operator: 'contains',
      value: 'playwright',
    },
  ],
  sendAt: new Date('2024-03-01T10:00:00Z'),
};
```

### 2. Drip Campaigns

Automated sequences triggered by user actions.

**Use Cases:**
- Onboarding series
- Course completion follow-up
- Re-engagement campaigns
- Educational content series

**Example: Welcome Series**
```typescript
const dripCampaign = {
  name: 'Welcome Series',
  type: 'drip',
  triggerType: 'signup',
  emails: [
    {
      delay: 0, // Immediate
      subject: 'Welcome to {{platformName}}!',
      content: welcomeEmailTemplate,
    },
    {
      delay: 1440, // 24 hours
      subject: 'Getting Started Guide',
      content: gettingStartedTemplate,
    },
    {
      delay: 4320, // 3 days
      subject: 'Explore Our Popular Courses',
      content: coursesTemplate,
    },
    {
      delay: 10080, // 7 days
      subject: 'Special Offer Just for You',
      content: offerTemplate,
    },
  ],
  stopConditions: [
    {
      type: 'user_action',
      value: 'course_enrolled',
    },
  ],
};
```

### 3. Triggered Emails

Automated emails sent based on specific events.

**Available Triggers:**
- User signup
- Course enrollment
- Lesson completion
- Quiz passed/failed
- Achievement unlocked
- Subscription renewal
- Payment failed
- Inactivity (7, 14, 30 days)

**Example: Abandoned Cart**
```typescript
const triggeredEmail = {
  name: 'Abandoned Cart Reminder',
  type: 'triggered',
  event: 'cart_abandoned',
  delay: 60, // 1 hour after abandonment
  subject: 'Complete Your Enrollment',
  htmlContent: abandonedCartTemplate,
  conditions: [
    {
      field: 'cart_value',
      operator: 'greater_than',
      value: 0,
    },
  ],
};
```

### 4. Transactional Emails

System-generated emails for user actions.

**Types:**
- Order confirmations
- Password resets
- Email verification
- Payment receipts
- Account notifications

**Best Practices:**
- High priority delivery
- Clear, concise content
- No marketing content
- Immediate sending

## Email Templates

### Template Structure

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>{{emailTitle}}</title>
  <style type="text/css">
    /* Inline styles for email clients */
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: #667eea;
      padding: 20px;
      text-align: center;
    }
    .content {
      padding: 30px 20px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #667eea;
      color: #ffffff;
      text-decoration: none;
      border-radius: 4px;
    }
    .footer {
      background-color: #f5f5f5;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666666;
    }
  </style>
</head>
<body>
  <table class="container" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td class="header">
        <img src="{{logoUrl}}" alt="Logo" height="40" />
      </td>
    </tr>
    <tr>
      <td class="content">
        <h1>{{heading}}</h1>
        <p>Hi {{firstName}},</p>
        {{content}}
        <p>
          <a href="{{ctaUrl}}" class="button">{{ctaText}}</a>
        </p>
      </td>
    </tr>
    <tr>
      <td class="footer">
        <p>{{companyName}} | {{companyAddress}}</p>
        <p><a href="{{unsubscribeUrl}}">Unsubscribe</a> | <a href="{{preferencesUrl}}">Update Preferences</a></p>
      </td>
    </tr>
  </table>
</body>
</html>
```

### Pre-built Templates

**Welcome Email**
```html
<h1>Welcome to Our Platform!</h1>
<p>Hi {{firstName}},</p>
<p>We're thrilled to have you join our community of learners. You're now part of a platform that helps thousands of people master automation testing.</p>
<h3>Here's what you can do next:</h3>
<ul>
  <li>Complete your profile</li>
  <li>Browse our course catalog</li>
  <li>Join our community forum</li>
</ul>
<a href="{{platformUrl}}/courses" class="button">Explore Courses</a>
```

**Course Completion**
```html
<h1>Congratulations, {{firstName}}!</h1>
<p>You've completed <strong>{{courseName}}</strong>!</p>
<p>This is a major achievement. You've gained valuable skills that will help you in your career.</p>
<p>Here's what you earned:</p>
<ul>
  <li>Certificate of Completion</li>
  <li>{{points}} Achievement Points</li>
  <li>{{badge}} Badge</li>
</ul>
<a href="{{certificateUrl}}" class="button">Download Certificate</a>
```

### Template Variables

Available personalization tokens:

**User Data:**
- `{{firstName}}` - User's first name
- `{{lastName}}` - User's last name
- `{{email}}` - User's email
- `{{fullName}}` - Full name

**Course Data:**
- `{{courseName}}` - Course title
- `{{courseUrl}}` - Course link
- `{{progress}}` - Completion percentage
- `{{instructor}}` - Instructor name

**Platform Data:**
- `{{platformName}}` - Platform name
- `{{platformUrl}}` - Homepage URL
- `{{logoUrl}}` - Logo image URL
- `{{supportEmail}}` - Support email

**Dynamic:**
- `{{date}}` - Current date
- `{{year}}` - Current year
- `{{unsubscribeUrl}}` - Unsubscribe link
- `{{preferencesUrl}}` - Preferences link

## Segmentation

### User Attributes

**Demographics:**
```typescript
segments: [
  {
    field: 'country',
    operator: 'equals',
    value: 'United States'
  }
]
```

**Engagement:**
```typescript
segments: [
  {
    field: 'lastLogin',
    operator: 'less_than',
    value: '30 days ago'
  }
]
```

**Course Activity:**
```typescript
segments: [
  {
    field: 'enrolledCourses',
    operator: 'contains',
    value: 'playwright-basics'
  }
]
```

### Complex Segments

**AND Logic:**
```typescript
segments: [
  {
    field: 'role',
    operator: 'equals',
    value: 'student',
    logic: 'AND'
  },
  {
    field: 'coursesCompleted',
    operator: 'greater_than',
    value: 0,
    logic: 'AND'
  }
]
```

**OR Logic:**
```typescript
segments: [
  {
    field: 'interests',
    operator: 'contains',
    value: 'playwright',
    logic: 'OR'
  },
  {
    field: 'interests',
    operator: 'contains',
    value: 'selenium',
    logic: 'OR'
  }
]
```

### Saved Segments

Create reusable segments:

```typescript
const activeStudents = {
  name: 'Active Students',
  segments: [
    { field: 'role', operator: 'equals', value: 'student' },
    { field: 'lastLogin', operator: 'greater_than', value: '7 days ago' },
    { field: 'status', operator: 'equals', value: 'active' }
  ]
};
```

## A/B Testing

### Setting Up Tests

```typescript
const abTest = {
  name: 'Subject Line Test',
  enableABTesting: true,
  variants: [
    {
      name: 'Control',
      subject: 'New Course Available',
      percentage: 50
    },
    {
      name: 'Variant A',
      subject: '🚀 Launch Special: New Course Available',
      percentage: 50
    }
  ],
  abTestDuration: 4, // hours
  successMetric: 'open_rate'
};
```

### What to Test

**Subject Lines:**
- Length (short vs. long)
- Emojis (with vs. without)
- Personalization
- Urgency/scarcity
- Questions vs. statements

**Send Times:**
- Morning vs. afternoon vs. evening
- Weekday vs. weekend
- Time zones

**Content:**
- Image-heavy vs. text-heavy
- Single CTA vs. multiple CTAs
- Formal vs. casual tone
- Long vs. short copy

**From Name:**
- Company name
- Individual person
- Company + person

### Analyzing Results

Wait for statistical significance:
- Minimum 100 opens per variant
- At least 95% confidence level
- Run test for full duration

## Deliverability

### Best Practices

**1. Maintain List Hygiene**
- Remove hard bounces immediately
- Remove inactive subscribers (6+ months)
- Provide easy unsubscribe
- Honor unsubscribe requests immediately

**2. Engagement**
- Send to engaged subscribers more often
- Re-engagement campaigns for inactive users
- Sunset policy for non-engaged

**3. Content Quality**
- Avoid spam trigger words
- Balance text and images
- Include plain text version
- Valid HTML

**4. Authentication**
- Implement SPF
- Configure DKIM
- Set up DMARC
- Monitor reports

**5. Reputation**
- Monitor sender score
- Check blacklists regularly
- Maintain low complaint rate (<0.1%)
- Keep bounce rate low (<5%)

### Spam Trigger Words

Avoid these in subject lines:
- Free, Winner, Prize
- Act now, Limited time
- $$$, !!!
- URGENT, IMPORTANT
- Click here, Buy now

### Testing Deliverability

Use tools:
- Mail Tester (mail-tester.com)
- GlockApps
- Email on Acid
- Litmus

## Analytics

### Key Metrics

**Sent Rate:**
```
Total Sent / Total Recipients × 100
```

**Delivery Rate:**
```
Delivered / Total Sent × 100
Target: >95%
```

**Open Rate:**
```
Unique Opens / Delivered × 100
Target: 15-25%
```

**Click Rate:**
```
Unique Clicks / Delivered × 100
Target: 2-5%
```

**Click-to-Open Rate:**
```
Unique Clicks / Unique Opens × 100
Target: 20-30%
```

**Unsubscribe Rate:**
```
Unsubscribes / Delivered × 100
Target: <0.5%
```

**Bounce Rate:**
```
Bounces / Total Sent × 100
Target: <5%
```

**Conversion Rate:**
```
Conversions / Clicks × 100
```

### Link Tracking

Track individual link performance:

```typescript
{
  "trackedLinks": [
    {
      "url": "https://platform.com/courses/playwright",
      "clicks": 250,
      "uniqueClicks": 180
    },
    {
      "url": "https://platform.com/pricing",
      "clicks": 120,
      "uniqueClicks": 95
    }
  ]
}
```

### Revenue Attribution

Track revenue from campaigns:

```typescript
{
  "campaign": "New Course Launch",
  "conversions": 45,
  "revenue": 6750,
  "roi": 450% // (Revenue - Cost) / Cost × 100
}
```

## Automation

### Workflow Builder

Create automated workflows:

```typescript
const workflow = {
  name: 'Nurture Sequence',
  trigger: {
    event: 'lead_captured',
    source: 'landing_page'
  },
  steps: [
    {
      type: 'wait',
      duration: 0
    },
    {
      type: 'email',
      template: 'welcome-lead',
      subject: 'Thanks for your interest!'
    },
    {
      type: 'wait',
      duration: 1440 // 24 hours
    },
    {
      type: 'condition',
      field: 'email_opened',
      operator: 'equals',
      value: true,
      then: [
        {
          type: 'email',
          template: 'case-study',
          subject: 'See how others succeeded'
        }
      ],
      else: [
        {
          type: 'email',
          template: 'reminder',
          subject: 'Don\'t miss out'
        }
      ]
    }
  ]
};
```

### Common Workflows

**Onboarding:**
1. Welcome email (immediate)
2. Getting started guide (Day 1)
3. Feature highlight (Day 3)
4. Success stories (Day 7)
5. Offer (Day 14)

**Re-engagement:**
1. Identify inactive users (30+ days)
2. "We miss you" email
3. Wait 3 days
4. Special offer email
5. Wait 7 days
6. Last chance email
7. Remove from active list

**Course Completion:**
1. Congratulations email
2. Certificate delivery
3. Survey request (2 days)
4. Next course recommendation (7 days)
5. Referral request (14 days)

## Compliance

### CAN-SPAM Act (US)

Requirements:
- Accurate "From" information
- Non-deceptive subject lines
- Identify message as ad
- Include physical address
- Honor opt-out requests within 10 days
- Monitor third-party senders

### GDPR (EU)

Requirements:
- Explicit consent to receive emails
- Clear explanation of data usage
- Easy access to data
- Right to be forgotten
- Data protection measures

### Best Practices

**Consent:**
- Double opt-in for new subscribers
- Clear explanation at signup
- Document consent timestamp
- Separate consent for different types

**Unsubscribe:**
- One-click unsubscribe
- No login required
- Process immediately
- Confirmation message
- Option to adjust preferences

## Troubleshooting

### Low Open Rates

**Possible Causes:**
- Poor subject lines
- Wrong send time
- List fatigue
- Spam folder delivery
- Inactive subscribers

**Solutions:**
- A/B test subject lines
- Test different send times
- Clean list regularly
- Improve sender reputation
- Re-engagement campaign

### Low Click Rates

**Possible Causes:**
- Unclear CTA
- Too many CTAs
- Content not relevant
- Poor mobile experience

**Solutions:**
- Single, clear CTA
- Above the fold placement
- Segment better
- Mobile optimization
- Personalization

### High Unsubscribe Rate

**Possible Causes:**
- Too frequent
- Irrelevant content
- Unexpected emails
- Poor experience

**Solutions:**
- Reduce frequency
- Better segmentation
- Set expectations
- Preference center
- Quality over quantity

## Support

For email marketing support:
- Email: email-support@platform.com
- Documentation: docs.platform.com/email-marketing
- Community: community.platform.com/email-marketing
