# Certificate System Guide

## Overview

Comprehensive digital certificate generation and verification system with blockchain support and Open Badges integration.

## Certificate Generation

### Basic Certificate

```typescript
POST /api/certificates/generate
{
  "certificateType": "course_completion",
  "courseId": "course-123",
  "recipientName": "John Doe",
  "recipientEmail": "john@example.com",
  "courseName": "Introduction to Playwright",
  "instructorName": "Jane Smith",
  "instructorTitle": "Senior Instructor",
  "score": 95,
  "creditsEarned": 3,
  "duration": "40 hours",
  "skillsAcquired": ["Playwright", "Test Automation", "CI/CD"]
}

Response:
{
  "certificateId": "CERT-2024-ABC123",
  "verificationUrl": "https://example.com/verify/CERT-2024-ABC123",
  "pdfUrl": "/certificates/CERT-2024-ABC123.pdf",
  "qrCode": "data:image/png;base64..."
}
```

### Certificate Types

- `course_completion`: Course completion certificates
- `achievement`: Special achievement recognition
- `skill_mastery`: Skill proficiency certification
- `exam_pass`: Examination pass certificates
- `participation`: Event/workshop participation
- `custom`: Custom certificates

### Blockchain Certificate

```typescript
POST /api/certificates/generate/blockchain
{
  ...certificateData,
  "network": "polygon" // ethereum, polygon, binance
}

Response:
{
  "certificateId": "CERT-2024-ABC123",
  "blockchain": {
    "transactionHash": "0x1234...",
    "network": "polygon",
    "contractAddress": "0xabcd...",
    "tokenId": "CERT-2024-ABC123"
  }
}
```

### Open Badge

```typescript
POST /api/certificates/generate/badge
{
  ...certificateData,
  "badgeClass": "https://example.com/badges/playwright-expert"
}

Response:
{
  "certificateId": "CERT-2024-ABC123",
  "badgeUrl": "https://example.com/badges/CERT-2024-ABC123",
  "assertion": {
    "@context": "https://w3id.org/openbadges/v2",
    "type": "Assertion",
    "id": "https://example.com/badges/CERT-2024-ABC123/assertion",
    "badge": "https://example.com/badges/playwright-expert"
  }
}
```

## Certificate Templates

### Template Structure

```typescript
{
  "name": "Professional Template",
  "design": {
    "layout": "landscape", // or "portrait"
    "background": "#FFFFFF",
    "logo": "/logos/company-logo.png",
    "fonts": {
      "title": "Helvetica-Bold",
      "body": "Helvetica"
    },
    "colors": {
      "primary": "#4A90E2",
      "secondary": "#50C878",
      "text": "#333333"
    }
  },
  "fields": {
    "recipientName": { "x": 100, "y": 200, "size": 28 },
    "courseName": { "x": 100, "y": 280, "size": 22 },
    "completionDate": { "x": 100, "y": 350, "size": 14 },
    "certificateId": { "x": 100, "y": 500, "size": 10 }
  }
}
```

### Get Templates

```typescript
GET /api/certificates/templates

Response:
[
  {
    "id": "default",
    "name": "Default Template",
    "preview": "/templates/default-preview.png"
  },
  {
    "id": "modern",
    "name": "Modern Template",
    "preview": "/templates/modern-preview.png"
  }
]
```

## Certificate Verification

### Verify by ID

```typescript
GET /api/certificates/verify/:certificateId

Response:
{
  "valid": true,
  "certificate": {
    "certificateId": "CERT-2024-ABC123",
    "recipientName": "John Doe",
    "title": "Certificate of Completion",
    "issueDate": "2024-01-15",
    "expiryDate": null,
    "status": "issued"
  }
}
```

### Verification Features

1. **Digital Signature**: RSA-2048 signature verification
2. **QR Code**: Quick mobile verification
3. **Blockchain**: Immutable blockchain record
4. **Status Check**: Real-time revocation status

### Public Verification Page

```
https://example.com/verify/CERT-2024-ABC123
```

Shows:
- Certificate authenticity
- Recipient details
- Issue date
- Expiry date (if applicable)
- Verification status
- QR code

## Certificate Management

### Get User Certificates

```typescript
GET /api/certificates/my-certificates?status=issued&type=course_completion

Response:
{
  "certificates": [
    {
      "id": "cert-id-1",
      "certificateId": "CERT-2024-ABC123",
      "title": "Introduction to Playwright",
      "issueDate": "2024-01-15",
      "status": "issued"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

### Download Certificate

```typescript
GET /api/certificates/:id/download

Response:
{
  "downloadUrl": "/downloads/CERT-2024-ABC123.pdf"
}
```

### Share Certificate

```typescript
POST /api/certificates/:id/share
{
  "public": true,
  "linkedIn": true,
  "twitter": false,
  "facebook": false
}
```

### Revoke Certificate (Admin)

```typescript
POST /api/certificates/:id/revoke
{
  "reason": "Fraudulent submission detected"
}
```

## Open Badges Integration

### Badge Class Definition

```json
{
  "@context": "https://w3id.org/openbadges/v2",
  "type": "BadgeClass",
  "id": "https://example.com/badges/playwright-expert",
  "name": "Playwright Expert",
  "description": "Demonstrates expert-level knowledge of Playwright",
  "image": "https://example.com/badges/playwright-expert.png",
  "criteria": {
    "narrative": "Complete advanced Playwright course with score above 90%"
  },
  "issuer": "https://example.com/issuer",
  "tags": ["playwright", "testing", "automation"]
}
```

### Badge Assertion

```typescript
GET /api/certificates/:certificateId/badge/assertion

Response:
{
  "@context": "https://w3id.org/openbadges/v2",
  "type": "Assertion",
  "id": "https://example.com/badges/CERT-2024-ABC123/assertion",
  "recipient": {
    "type": "email",
    "identity": "sha256$abc123...",
    "hashed": true
  },
  "badge": "https://example.com/badges/playwright-expert",
  "verification": {
    "type": "hosted"
  },
  "issuedOn": "2024-01-15T10:30:00Z",
  "expires": "2026-01-15T10:30:00Z"
}
```

### Add to Badge Backpack

Users can add badges to:
- [Mozilla Backpack](https://backpack.openbadges.org/)
- [Badgr](https://badgr.com/)
- [Credly](https://www.credly.com/)

## Blockchain Integration

### Supported Networks

1. **Ethereum**: Mainnet and testnets
2. **Polygon**: Low-cost, fast transactions
3. **Binance Smart Chain**: Alternative option

### Smart Contract

```solidity
// Simplified certificate contract
contract CertificateRegistry {
    struct Certificate {
        string certificateId;
        address recipient;
        uint256 issueDate;
        bool revoked;
    }

    mapping(string => Certificate) public certificates;

    function issueCertificate(string memory _id, address _recipient) external {
        certificates[_id] = Certificate(_id, _recipient, block.timestamp, false);
    }

    function verifyCertificate(string memory _id) external view returns (bool) {
        return certificates[_id].issueDate > 0 && !certificates[_id].revoked;
    }
}
```

### Verify on Blockchain

```typescript
GET /api/certificates/:id/blockchain-verify

Response:
{
  "onChain": true,
  "transactionHash": "0x1234...",
  "blockNumber": 12345678,
  "network": "polygon",
  "verified": true
}
```

## Certificate Expiry

### Set Expiry

```typescript
POST /api/certificates/generate
{
  ...certificateData,
  "expiryDate": "2026-01-15" // 2 years from now
}
```

### Renewal Process

```typescript
POST /api/certificates/:id/renew
{
  "newExpiryDate": "2028-01-15",
  "requiresReassessment": false
}
```

### Expired Certificate Handling

- Status automatically updates to `expired`
- Verification shows expiry status
- Renewal notification sent before expiry

## Analytics

### Certificate Statistics

```typescript
GET /api/certificates/stats?userId=user-123

Response:
{
  "total": 10,
  "issued": 8,
  "revoked": 1,
  "expired": 1,
  "byType": {
    "course_completion": 6,
    "achievement": 2,
    "skill_mastery": 2
  }
}
```

### Platform Statistics (Admin)

```typescript
GET /api/admin/certificates/stats

Response:
{
  "totalIssued": 5000,
  "thisMonth": 250,
  "averageScore": 87,
  "blockchainCertificates": 1200,
  "openBadges": 800,
  "topCourses": [...]
}
```

## UI Components

### Certificate Viewer

```tsx
import CertificateViewer from './pages/certificates/CertificateViewer';

<CertificateViewer certificateId="CERT-2024-ABC123" />
```

### Certificate Gallery

```tsx
<CertificateGallery userId={currentUser.id} />
```

### Verification Widget

```tsx
<CertificateVerification />
```

## Best Practices

1. **Security**
   - Use strong digital signatures
   - Implement rate limiting on verification
   - Store private keys securely

2. **Design**
   - Professional appearance
   - Clear typography
   - High-quality PDFs (300 DPI)

3. **Verification**
   - Multiple verification methods
   - QR codes for mobile
   - Public verification page

4. **Blockchain**
   - Use testnets for development
   - Batch transactions to reduce costs
   - Implement error handling

5. **Accessibility**
   - Screen reader compatible
   - Alternative text for images
   - Keyboard navigation

## Troubleshooting

### PDF Generation Issues
- Check PDFKit version
- Verify font files exist
- Ensure sufficient disk space

### Blockchain Errors
- Check network connectivity
- Verify gas fees
- Ensure wallet has funds

### Verification Failures
- Check certificate status
- Verify digital signature
- Confirm not revoked

## Resources

- [Open Badges Specification](https://openbadges.org/)
- [PDFKit Documentation](https://pdfkit.org/)
- [QR Code Library](https://github.com/soldair/node-qrcode)
- [Web3.js Documentation](https://web3js.readthedocs.io/)
