# Compliance & Certification Quick Reference

## Quick Start

### For Developers

```bash
# Install dependencies
npm install

# Run compliance checks
npm run compliance:check

# Start development server with compliance features
npm run dev

# Run tests
npm test
```

### For Administrators

1. **Access Compliance Dashboard**: Navigate to `/admin/compliance`
2. **View Audit Logs**: `/api/compliance/logs`
3. **Generate Reports**: `/api/compliance/report`
4. **Monitor Status**: `/api/compliance/dashboard`

## Key Files Created

### Backend Services
- `backend/src/services/scorm/scormEngine.ts` - SCORM 1.2/2004 support
- `backend/src/services/xapi/lrs.ts` - xAPI Learning Record Store
- `backend/src/services/lti/ltiProvider.ts` - LTI 1.3 provider
- `backend/src/services/compliance/gdprService.ts` - GDPR compliance
- `backend/src/services/certificates/certificateGenerator.ts` - Certificate generation

### Backend Controllers
- `backend/src/controllers/compliance/complianceController.ts` - Compliance API
- `backend/src/controllers/certificates/certificateController.ts` - Certificate API

### Database Models
- `backend/src/models/ComplianceLog.ts` - Immutable audit logs
- `backend/src/models/Certificate.ts` - Digital certificates

### Frontend Pages
- `frontend/src/pages/compliance/Dashboard.tsx` - Compliance monitoring
- `frontend/src/pages/certificates/CertificateViewer.tsx` - Certificate display
- `frontend/src/pages/admin/Compliance/index.tsx` - Admin compliance

### Documentation
- `docs/COMPLIANCE_GUIDE.md` - Main compliance documentation
- `docs/SCORM_IMPLEMENTATION.md` - SCORM integration guide
- `docs/XAPI_GUIDE.md` - xAPI implementation guide
- `docs/LTI_INTEGRATION.md` - LTI 1.3 integration guide
- `docs/GDPR_COMPLIANCE.md` - GDPR requirements & implementation
- `docs/CERTIFICATE_SYSTEM.md` - Certificate management guide
- `docs/SOC2_PREPARATION.md` - SOC 2 audit preparation
- `COMPLIANCE_IMPLEMENTATION_SUMMARY.md` - Complete implementation summary

## API Endpoints Quick Reference

### GDPR Compliance
```typescript
POST   /api/compliance/consent              # Record consent
GET    /api/compliance/consent              # Get user consents
POST   /api/compliance/export               # Request data export
POST   /api/compliance/deletion             # Request data deletion
GET    /api/compliance/privacy-policy       # Get privacy policy
```

### SCORM
```typescript
POST   /api/scorm/import                    # Import SCORM package
POST   /api/scorm/launch                    # Launch SCORM content
POST   /api/scorm/set-value                 # Set SCORM data
GET    /api/scorm/get-value                 # Get SCORM data
```

### xAPI
```typescript
POST   /api/xapi/statements                 # Store xAPI statement
GET    /api/xapi/statements                 # Query statements
GET    /api/xapi/analytics                  # Get analytics
```

### LTI
```typescript
GET    /api/lti/login                       # OIDC login
POST   /api/lti/launch                      # LTI launch
POST   /api/lti/ags/scores                  # Send grades
```

### Certificates
```typescript
POST   /api/certificates/generate           # Generate certificate
GET    /api/certificates/verify/:id         # Verify certificate
GET    /api/certificates/my-certificates    # Get user certificates
```

### Admin/Compliance
```typescript
GET    /api/compliance/dashboard            # Compliance dashboard
GET    /api/compliance/logs                 # Audit logs
GET    /api/compliance/report               # Generate report
GET    /api/compliance/status               # Compliance status
```

## Environment Variables

```bash
# Required
GDPR_ENABLED=true
NODE_ENV=production

# Optional
CERTIFICATE_SIGNING_KEY=/path/to/key.pem
BLOCKCHAIN_ENABLED=true
BLOCKCHAIN_NETWORK=polygon
LTI_PRIVATE_KEY=/path/to/lti-key.pem
SCORM_CONTENT_DIR=/data/scorm
```

## Common Tasks

### Generate a Certificate
```typescript
const certificate = await certificateGenerator.generateCertificate({
  userId: new mongoose.Types.ObjectId(userId),
  certificateType: 'course_completion',
  recipientName: 'John Doe',
  recipientEmail: 'john@example.com',
  courseName: 'Playwright Basics',
  score: 95
});
```

### Import SCORM Package
```typescript
const packageBuffer = await fs.readFile('course.zip');
const scormPackage = await scormEngine.importPackage(packageBuffer, userId);
```

### Store xAPI Statement
```typescript
await lrs.putStatement({
  actor: { name: 'John Doe', mbox: 'mailto:john@example.com' },
  verb: { id: 'http://adlnet.gov/expapi/verbs/completed' },
  object: { id: 'http://example.com/course-101' },
  result: { score: { scaled: 0.95 }, completion: true }
});
```

### Request Data Export (GDPR)
```typescript
const request = await gdprService.requestDataExport(
  userId,
  'json' // format: json, csv, xml
);
```

## Testing

```bash
# Run all tests
npm test

# Run compliance tests only
npm test -- compliance

# Run specific test file
npm test -- certificates.test.ts

# Generate coverage report
npm run test:coverage
```

## Monitoring

### Health Checks
```bash
curl https://api.example.com/health
curl https://api.example.com/health/compliance
```

### Metrics
```bash
curl https://api.example.com/metrics
curl https://api.example.com/metrics/compliance
```

### Logs
```bash
# View compliance logs
tail -f logs/compliance.log

# View SCORM logs
tail -f logs/scorm.log

# View certificate logs
tail -f logs/certificates.log
```

## Troubleshooting

### Certificate Generation Fails
1. Check signing key exists: `ls -l certificate-signing-key.pem`
2. Verify PDFKit installed: `npm list pdfkit`
3. Check disk space: `df -h`

### SCORM Import Error
1. Validate package structure
2. Check imsmanifest.xml exists
3. Review logs: `tail -f logs/scorm.log`

### LTI Launch Failure
1. Verify platform registration
2. Check JWT signature validation
3. Ensure public key URL accessible

### Compliance Log Issues
1. Check database connection
2. Verify ComplianceLog model exists
3. Check write permissions

## Security Checklist

- [ ] HTTPS enabled (TLS 1.3)
- [ ] Multi-factor authentication configured
- [ ] Database encrypted (AES-256)
- [ ] Secrets stored in environment variables
- [ ] Rate limiting enabled
- [ ] CORS configured properly
- [ ] Security headers set
- [ ] Regular backups scheduled
- [ ] Vulnerability scanning enabled
- [ ] Access logs monitored

## Compliance Checklist

- [ ] Privacy policy published
- [ ] Cookie consent banner shown
- [ ] Data retention policy defined
- [ ] Consent management active
- [ ] Data export feature tested
- [ ] Data deletion process verified
- [ ] Audit logs enabled
- [ ] Backup procedures documented
- [ ] Incident response plan ready
- [ ] Staff training completed

## Support Contacts

- **Technical Support**: support@example.com
- **Compliance Team**: compliance@example.com
- **Data Protection Officer**: dpo@example.com
- **Security Team**: security@example.com

## Additional Resources

### Documentation
- [Full Compliance Guide](./docs/COMPLIANCE_GUIDE.md)
- [Implementation Summary](./COMPLIANCE_IMPLEMENTATION_SUMMARY.md)

### External Standards
- [GDPR Official Text](https://gdpr-info.eu/)
- [SCORM Specification](https://adlnet.gov/projects/scorm/)
- [xAPI Specification](https://github.com/adlnet/xAPI-Spec)
- [LTI 1.3 Spec](https://www.imsglobal.org/spec/lti/v1p3/)

### Tools
- [WAVE Accessibility Tool](https://wave.webaim.org/)
- [GDPR Compliance Checker](https://gdpr.eu/)
- [SCORM Cloud](https://cloud.scorm.com/)

---

**Quick Start**: Read [COMPLIANCE_IMPLEMENTATION_SUMMARY.md](./COMPLIANCE_IMPLEMENTATION_SUMMARY.md) for full details.

**Last Updated**: 2024-01-15
