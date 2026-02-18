# Comprehensive Folder Structure Documentation

**Version:** 1.0.0
**Last Updated:** 2026-02-17
**Platform:** Playwright & Selenium Learning Platform

---

## Table of Contents

1. [Overview](#overview)
2. [Root Directory Structure](#root-directory-structure)
3. [Backend Structure](#backend-structure)
4. [Frontend Structure](#frontend-structure)
5. [Infrastructure Structure](#infrastructure-structure)
6. [Documentation Structure](#documentation-structure)
7. [Organization Principles](#organization-principles)
8. [File Naming Conventions](#file-naming-conventions)
9. [Barrel Exports Strategy](#barrel-exports-strategy)
10. [Path Aliases](#path-aliases)

---

## Overview

This document defines the complete folder structure for the Playwright & Selenium Learning Platform, a comprehensive e-learning platform with 500+ files organized across 8 implementation phases covering 48 features.

### Key Statistics
- **Total Files:** 600+
- **Backend Files:** 248 TypeScript files
- **Frontend Files:** 352 TypeScript/React files
- **Documentation Files:** 233+ Markdown files
- **Implementation Phases:** 8
- **Features Implemented:** 48

---

## Root Directory Structure

```
/playWright/
├── backend/                    # Node.js/Express backend API
├── frontend/                   # React PWA application
├── infrastructure/             # DevOps & deployment configs
├── docs/                       # Comprehensive documentation
├── tests/                      # E2E and integration tests
├── scripts/                    # Automation scripts
├── k8s/                        # Kubernetes configurations
├── monitoring/                 # Monitoring & observability
├── workers/                    # Background job workers
├── integrations/               # Third-party integrations
├── ml-models/                  # Machine learning models
├── mobile/                     # Mobile app (React Native)
├── playwright-runner/          # Playwright learning examples
├── selenium-java/              # Selenium Java examples
├── sdks/                       # Client SDKs (JS, Python, PHP)
├── openapi/                    # OpenAPI specifications
├── postman/                    # Postman collections
├── docker/                     # Docker configurations
├── config/                     # Shared configuration files
└── .github/                    # GitHub workflows & actions
```

### Purpose of Each Root Directory

| Directory | Purpose | Key Contents |
|-----------|---------|--------------|
| `backend/` | Server-side application logic | API routes, controllers, services, models |
| `frontend/` | Client-side React application | Components, pages, stores, hooks |
| `infrastructure/` | Infrastructure as Code | Terraform, K8s configs, deployment scripts |
| `docs/` | Documentation hub | User guides, API docs, architecture diagrams |
| `tests/` | Cross-platform testing | E2E tests, integration tests, accessibility tests |
| `scripts/` | Automation utilities | Setup, deployment, data migration scripts |
| `k8s/` | Kubernetes resources | Deployments, services, configmaps, secrets |
| `monitoring/` | Observability stack | Grafana dashboards, Prometheus rules |
| `workers/` | Background job processors | Email workers, video processing, analytics |
| `integrations/` | External service integrations | Slack, Discord, Zapier, enterprise systems |
| `ml-models/` | AI/ML models | Recommendation, content analysis, NLP models |
| `mobile/` | Mobile application | React Native iOS/Android app |

---

## Backend Structure

### Complete Backend Directory Tree

```
backend/
├── src/
│   ├── config/                           # Configuration files
│   │   ├── database.ts                   # Database configuration
│   │   ├── redis.ts                      # Redis configuration
│   │   ├── email.ts                      # Email service config
│   │   ├── storage.ts                    # File storage config
│   │   ├── ai.ts                         # AI service config
│   │   ├── payment.ts                    # Payment gateway config
│   │   ├── monitoring.ts                 # Monitoring config
│   │   └── index.ts                      # Barrel export
│   │
│   ├── models/                           # Mongoose data models (organized by domain)
│   │   ├── user/                         # User domain models
│   │   │   ├── User.ts                   # User model
│   │   │   ├── UserProfile.ts            # User profile
│   │   │   ├── UserSettings.ts           # User preferences
│   │   │   ├── UserProgress.ts           # Learning progress
│   │   │   ├── CommunityProfile.ts       # Community profile
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── learning/                     # Learning domain models
│   │   │   ├── Lesson.ts                 # Lesson model
│   │   │   ├── Course.ts                 # Course model
│   │   │   ├── Module.ts                 # Module model
│   │   │   ├── Exercise.ts               # Exercise model
│   │   │   ├── Quiz.ts                   # Quiz model
│   │   │   ├── Question.ts               # Question model
│   │   │   ├── Submission.ts             # Exercise submission
│   │   │   ├── Asset.ts                  # Learning asset
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── flashcards/                   # Flashcard/SRS domain models
│   │   │   ├── Card.ts                   # Flashcard model
│   │   │   ├── Deck.ts                   # Deck model
│   │   │   ├── Flashcard.ts              # Flashcard content
│   │   │   ├── Review.ts                 # Review session
│   │   │   ├── ReviewHistory.ts          # Review history
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── gamification/                 # Gamification domain models
│   │   │   ├── Achievement.ts            # Achievement model
│   │   │   ├── Badge.ts                  # Badge model
│   │   │   ├── Leaderboard.ts            # Leaderboard model
│   │   │   ├── XPTransaction.ts          # XP transaction
│   │   │   ├── Streak.ts                 # Streak tracking
│   │   │   ├── Competition.ts            # Competition model
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── enterprise/                   # Enterprise domain models
│   │   │   ├── Organization.ts           # Organization model
│   │   │   ├── Team.ts                   # Team model
│   │   │   ├── License.ts                # License model
│   │   │   ├── ApiKey.ts                 # API key model
│   │   │   ├── Tenant.ts                 # Multi-tenant model
│   │   │   ├── ComplianceLog.ts          # Compliance logging
│   │   │   ├── AuditLog.ts               # Audit trail
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── commerce/                     # E-commerce domain models
│   │   │   ├── Subscription.ts           # Subscription model
│   │   │   ├── Payment.ts                # Payment model
│   │   │   ├── Invoice.ts                # Invoice model
│   │   │   ├── Coupon.ts                 # Coupon model
│   │   │   ├── Transaction.ts            # Transaction model
│   │   │   ├── Affiliate.ts              # Affiliate model
│   │   │   ├── InstructorPayout.ts       # Instructor payout
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── community/                    # Community domain models
│   │   │   ├── Post.ts                   # Forum post model
│   │   │   ├── Comment.ts                # Comment model
│   │   │   ├── Discussion.ts             # Discussion thread
│   │   │   ├── StudyGroup.ts             # Study group
│   │   │   ├── Mentorship.ts             # Mentorship model
│   │   │   ├── Message.ts                # Direct message
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── content/                      # Content domain models
│   │   │   ├── Video.ts                  # Video model
│   │   │   ├── Certificate.ts            # Certificate model
│   │   │   ├── LandingPage.ts            # Landing page
│   │   │   ├── EmailCampaign.ts          # Email campaign
│   │   │   ├── ContentVersion.ts         # Content versioning
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── analytics/                    # Analytics domain models
│   │   │   ├── Event.ts                  # Analytics event
│   │   │   ├── CustomReport.ts           # Custom report
│   │   │   ├── Dashboard.ts              # Dashboard config
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   └── index.ts                      # Master barrel export
│   │
│   ├── controllers/                      # Request handlers (organized by domain)
│   │   ├── auth/                         # Authentication controllers
│   │   │   ├── authController.ts         # Auth operations
│   │   │   ├── passwordController.ts     # Password management
│   │   │   ├── sessionController.ts      # Session management
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── learning/                     # Learning controllers
│   │   │   ├── lessonController.ts       # Lesson CRUD
│   │   │   ├── courseController.ts       # Course CRUD
│   │   │   ├── exerciseController.ts     # Exercise CRUD
│   │   │   ├── quizController.ts         # Quiz CRUD
│   │   │   ├── submissionController.ts   # Submission handling
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── gamification/                 # Gamification controllers
│   │   │   ├── achievementController.ts  # Achievement logic
│   │   │   ├── leaderboardController.ts  # Leaderboard logic
│   │   │   ├── competitionController.ts  # Competition logic
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── admin/                        # Admin controllers
│   │   │   ├── userManagementController.ts
│   │   │   ├── contentManagementController.ts
│   │   │   ├── analyticsController.ts
│   │   │   ├── systemController.ts
│   │   │   ├── complianceController.ts
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── api/                          # Public API controllers
│   │   │   ├── webhookController.ts      # Webhook handlers
│   │   │   ├── publicApiController.ts    # Public API endpoints
│   │   │   ├── integrationController.ts  # Integration endpoints
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── marketing/                    # Marketing controllers
│   │   │   ├── landingPageController.ts  # Landing pages
│   │   │   ├── leadController.ts         # Lead management
│   │   │   ├── campaignController.ts     # Campaign management
│   │   │   ├── affiliateController.ts    # Affiliate program
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── community/                    # Community controllers
│   │   │   ├── forumController.ts        # Forum operations
│   │   │   ├── mentorshipController.ts   # Mentorship matching
│   │   │   ├── studyGroupController.ts   # Study groups
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── video/                        # Video controllers
│   │   │   ├── videoController.ts        # Video management
│   │   │   ├── liveSessionController.ts  # Live sessions
│   │   │   ├── streamController.ts       # Streaming logic
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── ai/                           # AI controllers
│   │   │   ├── aiAssistantController.ts  # AI assistant
│   │   │   ├── contentGenerationController.ts
│   │   │   ├── recommendationController.ts
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── analytics/                    # Analytics controllers
│   │   │   ├── analyticsController.ts    # Analytics queries
│   │   │   ├── reportController.ts       # Report generation
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── playground/                   # Code playground controllers
│   │   │   ├── playgroundController.ts   # Playground operations
│   │   │   ├── executionController.ts    # Code execution
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── studio/                       # Content studio controllers
│   │   │   ├── studioController.ts       # Studio operations
│   │   │   ├── assetController.ts        # Asset management
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── monetization/                 # Monetization controllers
│   │   │   ├── subscriptionController.ts # Subscriptions
│   │   │   ├── paymentController.ts      # Payments
│   │   │   ├── invoiceController.ts      # Invoicing
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── live/                         # Live learning controllers
│   │   │   ├── liveSessionController.ts  # Live sessions
│   │   │   ├── webinarController.ts      # Webinars
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── certificates/                 # Certificate controllers
│   │   │   ├── certificateController.ts  # Certificate generation
│   │   │   ├── verificationController.ts # Certificate verification
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── integrations/                 # Integration controllers
│   │   │   ├── ssoController.ts          # SSO integration
│   │   │   ├── ltiController.ts          # LTI integration
│   │   │   ├── scormController.ts        # SCORM integration
│   │   │   ├── enterpriseController.ts   # Enterprise integrations
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── compliance/                   # Compliance controllers
│   │   │   ├── gdprController.ts         # GDPR compliance
│   │   │   ├── accessibilityController.ts
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   └── index.ts                      # Master barrel export
│   │
│   ├── services/                         # Business logic (organized by domain)
│   │   ├── auth/                         # Authentication services
│   │   │   ├── authService.ts            # Auth business logic
│   │   │   ├── jwtService.ts             # JWT operations
│   │   │   ├── sessionService.ts         # Session management
│   │   │   ├── passwordService.ts        # Password hashing/reset
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── ai/                           # AI services
│   │   │   ├── openaiService.ts          # OpenAI integration
│   │   │   ├── contentAnalysisService.ts # Content analysis
│   │   │   ├── recommendationEngine.ts   # Recommendation system
│   │   │   ├── chatbotService.ts         # AI chatbot
│   │   │   ├── codeReviewService.ts      # AI code review
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── learning/                     # Learning services
│   │   │   ├── lessonService.ts          # Lesson business logic
│   │   │   ├── courseService.ts          # Course management
│   │   │   ├── progressService.ts        # Progress tracking
│   │   │   ├── enrollmentService.ts      # Enrollment logic
│   │   │   ├── gradingService.ts         # Auto-grading
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── gamification/                 # Gamification services
│   │   │   ├── achievementService.ts     # Achievement engine
│   │   │   ├── leaderboardService.ts     # Leaderboard logic
│   │   │   ├── xpService.ts              # XP calculation
│   │   │   ├── streakService.ts          # Streak tracking
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── video/                        # Video services
│   │   │   ├── videoProcessingService.ts # Video processing
│   │   │   ├── transcriptionService.ts   # Video transcription
│   │   │   ├── streamingService.ts       # Live streaming
│   │   │   ├── cdnService.ts             # CDN management
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── payment/                      # Payment services
│   │   │   ├── stripeService.ts          # Stripe integration
│   │   │   ├── paypalService.ts          # PayPal integration
│   │   │   ├── subscriptionService.ts    # Subscription logic
│   │   │   ├── invoiceService.ts         # Invoice generation
│   │   │   ├── payoutService.ts          # Instructor payouts
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── integration/                  # Integration services
│   │   │   ├── ssoService.ts             # SSO integration
│   │   │   ├── ltiService.ts             # LTI integration
│   │   │   ├── scormService.ts           # SCORM integration
│   │   │   ├── webhookService.ts         # Webhook handling
│   │   │   ├── slackService.ts           # Slack integration
│   │   │   ├── teamsService.ts           # MS Teams integration
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── monitoring/                   # Monitoring services
│   │   │   ├── metricsService.ts         # Metrics collection
│   │   │   ├── loggingService.ts         # Logging service
│   │   │   ├── alertService.ts           # Alert management
│   │   │   ├── healthCheckService.ts     # Health checks
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── analytics/                    # Analytics services
│   │   │   ├── analyticsService.ts       # Analytics engine
│   │   │   ├── reportingService.ts       # Report generation
│   │   │   ├── insightsService.ts        # AI insights
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── email/                        # Email services
│   │   │   ├── emailService.ts           # Email sending
│   │   │   ├── templateService.ts        # Email templates
│   │   │   ├── campaignService.ts        # Email campaigns
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── storage/                      # Storage services
│   │   │   ├── s3Service.ts              # S3 storage
│   │   │   ├── fileService.ts            # File management
│   │   │   ├── imageService.ts           # Image processing
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── cache/                        # Caching services
│   │   │   ├── redisService.ts           # Redis operations
│   │   │   ├── cacheManager.ts           # Cache management
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── queue/                        # Queue services
│   │   │   ├── queueService.ts           # Queue management
│   │   │   ├── jobProcessor.ts           # Job processing
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── search/                       # Search services
│   │   │   ├── searchService.ts          # Search engine
│   │   │   ├── indexingService.ts        # Search indexing
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── notification/                 # Notification services
│   │   │   ├── notificationService.ts    # Notification logic
│   │   │   ├── pushService.ts            # Push notifications
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── compliance/                   # Compliance services
│   │   │   ├── gdprService.ts            # GDPR compliance
│   │   │   ├── auditService.ts           # Audit logging
│   │   │   ├── dataRetentionService.ts   # Data retention
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── playground/                   # Playground services
│   │   │   ├── codeExecutionService.ts   # Code execution
│   │   │   ├── sandboxService.ts         # Sandbox management
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── mentorship/                   # Mentorship services
│   │   │   ├── matchingService.ts        # Mentor matching
│   │   │   ├── sessionService.ts         # Session management
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── live/                         # Live learning services
│   │   │   ├── liveService.ts            # Live session logic
│   │   │   ├── recordingService.ts       # Recording management
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── certificates/                 # Certificate services
│   │   │   ├── certificateService.ts     # Certificate generation
│   │   │   ├── blockchainService.ts      # Blockchain verification
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── sync/                         # Sync services
│   │   │   ├── syncService.ts            # Data sync
│   │   │   ├── conflictService.ts        # Conflict resolution
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── distributed/                  # Distributed services
│   │   │   ├── lockService.ts            # Distributed locking
│   │   │   ├── rateLimitService.ts       # Rate limiting
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── marketing/                    # Marketing services
│   │   │   ├── leadService.ts            # Lead management
│   │   │   ├── campaignService.ts        # Campaign management
│   │   │   ├── affiliateService.ts       # Affiliate program
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── monetization/                 # Monetization services
│   │   │   ├── pricingService.ts         # Pricing logic
│   │   │   ├── couponService.ts          # Coupon management
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── webhooks/                     # Webhook services
│   │   │   ├── webhookService.ts         # Webhook management
│   │   │   ├── deliveryService.ts        # Webhook delivery
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── xapi/                         # xAPI services
│   │   │   ├── xapiService.ts            # xAPI integration
│   │   │   ├── statementService.ts       # Statement handling
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── lti/                          # LTI services
│   │   │   ├── ltiService.ts             # LTI integration
│   │   │   ├── launchService.ts          # LTI launch
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── scorm/                        # SCORM services
│   │   │   ├── scormService.ts           # SCORM integration
│   │   │   ├── packageService.ts         # Package handling
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── sso/                          # SSO services
│   │   │   ├── samlService.ts            # SAML SSO
│   │   │   ├── oauthService.ts           # OAuth SSO
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   └── index.ts                      # Master barrel export
│   │
│   ├── middleware/                       # Express middleware
│   │   ├── auth.ts                       # Authentication middleware
│   │   ├── rbac.ts                       # Role-based access control
│   │   ├── validation.ts                 # Request validation
│   │   ├── errorHandler.ts               # Error handling
│   │   ├── requestLogger.ts              # Request logging
│   │   ├── rateLimit.ts                  # Rate limiting
│   │   ├── cors.ts                       # CORS configuration
│   │   ├── compression.ts                # Response compression
│   │   ├── security.ts                   # Security headers
│   │   ├── sanitization.ts               # Input sanitization
│   │   ├── fileUpload.ts                 # File upload handling
│   │   ├── apiKey.ts                     # API key validation
│   │   ├── tenant.ts                     # Multi-tenant middleware
│   │   └── index.ts                      # Barrel export
│   │
│   ├── routes/                           # Route definitions
│   │   ├── v1/                           # API v1 routes
│   │   │   ├── auth.ts                   # Auth routes
│   │   │   ├── users.ts                  # User routes
│   │   │   ├── lessons.ts                # Lesson routes
│   │   │   ├── courses.ts                # Course routes
│   │   │   ├── exercises.ts              # Exercise routes
│   │   │   ├── quizzes.ts                # Quiz routes
│   │   │   ├── flashcards.ts             # Flashcard routes
│   │   │   ├── progress.ts               # Progress routes
│   │   │   ├── achievements.ts           # Achievement routes
│   │   │   ├── certificates.ts           # Certificate routes
│   │   │   ├── payments.ts               # Payment routes
│   │   │   ├── subscriptions.ts          # Subscription routes
│   │   │   ├── videos.ts                 # Video routes
│   │   │   ├── live.ts                   # Live session routes
│   │   │   ├── community.ts              # Community routes
│   │   │   ├── mentorship.ts             # Mentorship routes
│   │   │   ├── analytics.ts              # Analytics routes
│   │   │   ├── playground.ts             # Playground routes
│   │   │   ├── studio.ts                 # Studio routes
│   │   │   └── index.ts                  # Route aggregator
│   │   │
│   │   ├── api/                          # Public API routes
│   │   │   ├── webhooks.ts               # Webhook endpoints
│   │   │   ├── public.ts                 # Public API endpoints
│   │   │   ├── integrations.ts           # Integration endpoints
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── admin/                        # Admin routes
│   │   │   ├── users.ts                  # User management
│   │   │   ├── content.ts                # Content management
│   │   │   ├── analytics.ts              # Admin analytics
│   │   │   ├── system.ts                 # System management
│   │   │   ├── compliance.ts             # Compliance management
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── ai/                           # AI routes
│   │   │   ├── assistant.ts              # AI assistant
│   │   │   ├── recommendations.ts        # Recommendations
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── gamification/                 # Gamification routes
│   │   │   ├── achievements.ts           # Achievements
│   │   │   ├── leaderboard.ts            # Leaderboard
│   │   │   ├── competitions.ts           # Competitions
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── community/                    # Community routes
│   │   │   ├── forum.ts                  # Forum
│   │   │   ├── studyGroups.ts            # Study groups
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   └── index.ts                      # Master route aggregator
│   │
│   ├── utils/                            # Utility functions
│   │   ├── logger.ts                     # Logging utility
│   │   ├── validation.ts                 # Validation helpers
│   │   ├── encryption.ts                 # Encryption utilities
│   │   ├── dateUtils.ts                  # Date utilities
│   │   ├── stringUtils.ts                # String utilities
│   │   ├── arrayUtils.ts                 # Array utilities
│   │   ├── objectUtils.ts                # Object utilities
│   │   ├── fileUtils.ts                  # File utilities
│   │   ├── urlUtils.ts                   # URL utilities
│   │   ├── errorUtils.ts                 # Error utilities
│   │   ├── asyncUtils.ts                 # Async utilities
│   │   ├── paginationUtils.ts            # Pagination helpers
│   │   ├── sortUtils.ts                  # Sorting helpers
│   │   ├── filterUtils.ts                # Filtering helpers
│   │   └── index.ts                      # Barrel export
│   │
│   ├── workers/                          # Background workers
│   │   ├── emailWorker.ts                # Email queue worker
│   │   ├── videoWorker.ts                # Video processing worker
│   │   ├── analyticsWorker.ts            # Analytics worker
│   │   ├── notificationWorker.ts         # Notification worker
│   │   ├── reportWorker.ts               # Report generation worker
│   │   └── index.ts                      # Barrel export
│   │
│   ├── types/                            # TypeScript type definitions
│   │   ├── express.d.ts                  # Express extensions
│   │   ├── models.ts                     # Model types
│   │   ├── api.ts                        # API types
│   │   ├── auth.ts                       # Auth types
│   │   ├── learning.ts                   # Learning types
│   │   ├── gamification.ts               # Gamification types
│   │   ├── payment.ts                    # Payment types
│   │   ├── analytics.ts                  # Analytics types
│   │   ├── integration.ts                # Integration types
│   │   └── index.ts                      # Barrel export
│   │
│   ├── integrations/                     # External integrations
│   │   ├── slack/                        # Slack integration
│   │   │   ├── slackClient.ts
│   │   │   ├── eventHandlers.ts
│   │   │   └── index.ts
│   │   ├── teams/                        # MS Teams integration
│   │   │   ├── teamsClient.ts
│   │   │   └── index.ts
│   │   ├── zoom/                         # Zoom integration
│   │   │   ├── zoomClient.ts
│   │   │   └── index.ts
│   │   ├── google/                       # Google Workspace
│   │   │   ├── googleClient.ts
│   │   │   └── index.ts
│   │   ├── microsoft365/                 # Microsoft 365
│   │   │   ├── msClient.ts
│   │   │   └── index.ts
│   │   ├── salesforce/                   # Salesforce
│   │   │   ├── salesforceClient.ts
│   │   │   └── index.ts
│   │   ├── workday/                      # Workday
│   │   │   ├── workdayClient.ts
│   │   │   └── index.ts
│   │   ├── sap/                          # SAP
│   │   │   ├── sapClient.ts
│   │   │   └── index.ts
│   │   └── index.ts                      # Barrel export
│   │
│   ├── ml/                               # Machine learning
│   │   ├── models/                       # ML models
│   │   │   ├── recommendationModel.ts
│   │   │   ├── contentAnalysisModel.ts
│   │   │   └── index.ts
│   │   ├── training/                     # Model training
│   │   │   ├── dataPreparation.ts
│   │   │   ├── training.ts
│   │   │   └── index.ts
│   │   └── index.ts                      # Barrel export
│   │
│   ├── data/                             # Seed data & fixtures
│   │   ├── seeds/                        # Database seeds
│   │   │   ├── users.ts
│   │   │   ├── lessons.ts
│   │   │   └── index.ts
│   │   └── fixtures/                     # Test fixtures
│   │       └── index.ts
│   │
│   ├── __tests__/                        # Backend tests
│   │   ├── unit/                         # Unit tests
│   │   ├── integration/                  # Integration tests
│   │   └── admin/                        # Admin tests
│   │
│   ├── server.ts                         # Express server setup
│   ├── app.ts                            # Express app configuration
│   └── index.ts                          # Entry point
│
├── package.json                          # Dependencies
├── tsconfig.json                         # TypeScript configuration
├── .env.example                          # Environment variables template
├── .eslintrc.json                        # ESLint configuration
├── .prettierrc                           # Prettier configuration
└── jest.config.js                        # Jest configuration
```

### Backend Organization Principles

1. **Domain-Driven Design**: Models, controllers, and services are organized by business domain
2. **Separation of Concerns**: Clear separation between routes, controllers, services, and models
3. **Barrel Exports**: Each major folder has an index.ts for clean imports
4. **Type Safety**: Dedicated types folder for all TypeScript definitions
5. **Scalability**: Easy to add new domains without restructuring

---

## Frontend Structure

### Complete Frontend Directory Tree

```
frontend/
├── src/
│   ├── pages/                            # Page components (one per route)
│   │   ├── auth/                         # Authentication pages
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   ├── ResetPasswordPage.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── dashboard/                    # Dashboard pages
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── StudentDashboard.tsx
│   │   │   ├── InstructorDashboard.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── lessons/                      # Lesson pages
│   │   │   ├── LessonListPage.tsx
│   │   │   ├── LessonDetailPage.tsx
│   │   │   ├── LessonPlayerPage.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── quizzes/                      # Quiz pages
│   │   │   ├── QuizListPage.tsx
│   │   │   ├── QuizTakePage.tsx
│   │   │   ├── QuizResultsPage.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── flashcards/                   # Flashcard pages
│   │   │   ├── FlashcardListPage.tsx
│   │   │   ├── ReviewSessionPage.tsx
│   │   │   ├── DeckManagementPage.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── exercises/                    # Exercise pages
│   │   │   ├── ExerciseListPage.tsx
│   │   │   ├── ExercisePage.tsx
│   │   │   ├── SubmissionHistoryPage.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── gamification/                 # Gamification pages
│   │   │   ├── AchievementsPage.tsx
│   │   │   ├── LeaderboardPage.tsx
│   │   │   ├── CompetitionsPage.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── community/                    # Community pages
│   │   │   ├── ForumPage.tsx
│   │   │   ├── ThreadPage.tsx
│   │   │   ├── StudyGroupsPage.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── admin/                        # Admin pages
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── UserManagementPage.tsx
│   │   │   ├── ContentManagementPage.tsx
│   │   │   ├── AnalyticsPage.tsx
│   │   │   ├── CompliancePage.tsx
│   │   │   ├── IntegrationsPage.tsx
│   │   │   ├── SuperAdminPage.tsx
│   │   │   ├── Tenants/
│   │   │   │   ├── TenantListPage.tsx
│   │   │   │   └── TenantDetailPage.tsx
│   │   │   ├── Revenue/
│   │   │   │   ├── RevenueDashboard.tsx
│   │   │   │   └── PayoutsPage.tsx
│   │   │   ├── Compliance/
│   │   │   │   ├── GDPRPage.tsx
│   │   │   │   └── AuditLogPage.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── studio/                       # Content Studio pages
│   │   │   ├── Dashboard/
│   │   │   │   └── StudioDashboard.tsx
│   │   │   ├── CourseBuilder/
│   │   │   │   └── CourseBuilder.tsx
│   │   │   ├── LessonEditor/
│   │   │   │   └── LessonEditor.tsx
│   │   │   ├── QuizBuilder/
│   │   │   │   └── QuizBuilder.tsx
│   │   │   ├── VideoEditor/
│   │   │   │   └── VideoEditor.tsx
│   │   │   ├── AssetLibrary/
│   │   │   │   └── AssetLibrary.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── analytics/                    # Analytics pages
│   │   │   ├── AnalyticsOverview.tsx
│   │   │   ├── LearningAnalytics.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── playground/                   # Code Playground pages
│   │   │   ├── PlaygroundPage.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── live/                         # Live Learning pages
│   │   │   ├── LiveSessionsPage.tsx
│   │   │   ├── LiveSessionPage.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── mentorship/                   # Mentorship pages
│   │   │   ├── MentorListPage.tsx
│   │   │   ├── MentorshipSessionPage.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── certificates/                 # Certificate pages
│   │   │   ├── CertificatesPage.tsx
│   │   │   ├── CertificateViewPage.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── pricing/                      # Pricing pages
│   │   │   ├── PricingPage.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── checkout/                     # Checkout pages
│   │   │   ├── CheckoutPage.tsx
│   │   │   ├── SuccessPage.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── instructor/                   # Instructor pages
│   │   │   ├── InstructorDashboard.tsx
│   │   │   ├── CoursesPage.tsx
│   │   │   ├── EarningsPage.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── marketing/                    # Marketing pages
│   │   │   ├── LandingPages/
│   │   │   │   ├── HomePage.tsx
│   │   │   │   ├── FeaturesPage.tsx
│   │   │   │   └── AboutPage.tsx
│   │   │   ├── BlogPage.tsx
│   │   │   ├── AffiliatePage.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── compliance/                   # Compliance pages
│   │   │   ├── PrivacyPolicyPage.tsx
│   │   │   ├── TermsOfServicePage.tsx
│   │   │   ├── AccessibilityPage.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── public/                       # Public pages
│   │   │   ├── HomePage.tsx
│   │   │   ├── AboutPage.tsx
│   │   │   ├── ContactPage.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── settings/                     # Settings pages
│   │   │   ├── SettingsPage.tsx
│   │   │   ├── ProfileSettings.tsx
│   │   │   ├── AccountSettings.tsx
│   │   │   ├── NotificationSettings.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   └── index.ts                      # Master barrel export
│   │
│   ├── components/                       # Reusable components
│   │   ├── common/                       # Shared/common components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── LoadingState.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── layout/                       # Layout components
│   │   │   ├── Layout.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Breadcrumbs.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── ui/                           # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── radio.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── toast.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── ai/                           # AI components
│   │   │   ├── AIAssistant.tsx
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── CodeReview.tsx
│   │   │   ├── Recommendations.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── gamification/                 # Gamification components
│   │   │   ├── AchievementBadge.tsx
│   │   │   ├── XPBar.tsx
│   │   │   ├── StreakCounter.tsx
│   │   │   ├── Leaderboard.tsx
│   │   │   ├── LevelBadge.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── analytics/                    # Analytics components
│   │   │   ├── AnalyticsDashboard.tsx
│   │   │   ├── ProgressChart.tsx
│   │   │   ├── TimelineChart.tsx
│   │   │   ├── EngagementMetrics.tsx
│   │   │   ├── Charts/
│   │   │   │   ├── LineChart.tsx
│   │   │   │   ├── BarChart.tsx
│   │   │   │   ├── PieChart.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── video/                        # Video components
│   │   │   ├── VideoPlayer.tsx
│   │   │   ├── VideoUploader.tsx
│   │   │   ├── VideoEditor.tsx
│   │   │   ├── LiveStream.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── lessons/                      # Lesson components
│   │   │   ├── LessonCard.tsx
│   │   │   ├── LessonPlayer.tsx
│   │   │   ├── LessonContent.tsx
│   │   │   ├── TableOfContents.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── flashcards/                   # Flashcard components
│   │   │   ├── FlashCard.tsx
│   │   │   ├── CardDeck.tsx
│   │   │   ├── ReviewSession.tsx
│   │   │   ├── QualityButtons.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── exercises/                    # Exercise components
│   │   │   ├── CodeEditor.tsx
│   │   │   ├── TestRunner.tsx
│   │   │   ├── TestResults.tsx
│   │   │   ├── Console.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── quiz/                         # Quiz components
│   │   │   ├── QuizPlayer.tsx
│   │   │   ├── Question.tsx
│   │   │   ├── MultipleChoice.tsx
│   │   │   ├── CodeQuestion.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── dashboard/                    # Dashboard components
│   │   │   ├── WelcomeCard.tsx
│   │   │   ├── ProgressCard.tsx
│   │   │   ├── StreakCard.tsx
│   │   │   ├── QuickActions.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── progress/                     # Progress components
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── ProgressCircle.tsx
│   │   │   ├── ProgressTimeline.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── notifications/                # Notification components
│   │   │   ├── NotificationCenter.tsx
│   │   │   ├── NotificationItem.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── search/                       # Search components
│   │   │   ├── GlobalSearch.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── SearchResults.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── settings/                     # Settings components
│   │   │   ├── ThemeToggle.tsx
│   │   │   ├── LanguageSelector.tsx
│   │   │   ├── SettingsForm.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── community/                    # Community components
│   │   │   ├── ForumPost.tsx
│   │   │   ├── Comment.tsx
│   │   │   ├── UserCard.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── admin/                        # Admin components
│   │   │   ├── UserTable.tsx
│   │   │   ├── ContentEditor.tsx
│   │   │   ├── AnalyticsWidget.tsx
│   │   │   ├── analytics/
│   │   │   │   ├── charts/
│   │   │   │   │   ├── RevenueChart.tsx
│   │   │   │   │   └── UserGrowthChart.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── code/                         # Code components
│   │   │   ├── CodeBlock.tsx
│   │   │   ├── CodePlayground.tsx
│   │   │   ├── SyntaxHighlighter.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── playground/                   # Playground components
│   │   │   ├── PlaygroundEditor.tsx
│   │   │   ├── PlaygroundConsole.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── achievements/                 # Achievement components
│   │   │   ├── AchievementCard.tsx
│   │   │   ├── AchievementGrid.tsx
│   │   │   ├── UnlockAnimation.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── accessibility/                # Accessibility components
│   │   │   ├── SkipLinks.tsx
│   │   │   ├── ScreenReaderOnly.tsx
│   │   │   ├── FocusTrap.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   ├── routes/                       # Route components
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── PublicRoute.tsx
│   │   │   ├── RoleRoute.tsx
│   │   │   └── index.ts                  # Barrel export
│   │   │
│   │   └── index.ts                      # Master barrel export
│   │
│   ├── stores/                           # State management (Zustand)
│   │   ├── authStore.ts                  # Authentication state
│   │   ├── userStore.ts                  # User state
│   │   ├── progressStore.ts              # Progress tracking state
│   │   ├── srsStore.ts                   # SRS state
│   │   ├── lessonStore.ts                # Lesson state
│   │   ├── quizStore.ts                  # Quiz state
│   │   ├── exerciseStore.ts              # Exercise state
│   │   ├── settingsStore.ts              # Settings state
│   │   ├── uiStore.ts                    # UI state
│   │   ├── notificationStore.ts          # Notification state
│   │   ├── communityStore.ts             # Community state
│   │   ├── gamificationStore.ts          # Gamification state
│   │   ├── analyticsStore.ts             # Analytics state
│   │   ├── playgroundStore.ts            # Playground state
│   │   ├── cartStore.ts                  # Shopping cart state
│   │   └── index.ts                      # Barrel export
│   │
│   ├── hooks/                            # Custom React hooks
│   │   ├── useAuth.ts                    # Authentication hook
│   │   ├── useUser.ts                    # User data hook
│   │   ├── useProgress.ts                # Progress tracking hook
│   │   ├── useSRS.ts                     # SRS hook
│   │   ├── useLesson.ts                  # Lesson hook
│   │   ├── useQuiz.ts                    # Quiz hook
│   │   ├── useExercise.ts                # Exercise hook
│   │   ├── useLocalStorage.ts            # Local storage hook
│   │   ├── useSessionStorage.ts          # Session storage hook
│   │   ├── useDebounce.ts                # Debounce hook
│   │   ├── useThrottle.ts                # Throttle hook
│   │   ├── useMediaQuery.ts              # Media query hook
│   │   ├── useIntersectionObserver.ts    # Intersection observer hook
│   │   ├── useOfflineSync.ts             # Offline sync hook
│   │   ├── useWebSocket.ts               # WebSocket hook
│   │   ├── useNotifications.ts           # Notifications hook
│   │   ├── useAnalytics.ts               # Analytics hook
│   │   ├── useKeyboard.ts                # Keyboard shortcuts hook
│   │   ├── useClipboard.ts               # Clipboard hook
│   │   ├── useFileUpload.ts              # File upload hook
│   │   ├── useInfiniteScroll.ts          # Infinite scroll hook
│   │   ├── usePagination.ts              # Pagination hook
│   │   └── index.ts                      # Barrel export
│   │
│   ├── services/                         # API service layer
│   │   ├── api.ts                        # Base API client
│   │   ├── authService.ts                # Auth API calls
│   │   ├── userService.ts                # User API calls
│   │   ├── lessonService.ts              # Lesson API calls
│   │   ├── courseService.ts              # Course API calls
│   │   ├── quizService.ts                # Quiz API calls
│   │   ├── exerciseService.ts            # Exercise API calls
│   │   ├── flashcardService.ts           # Flashcard API calls
│   │   ├── progressService.ts            # Progress API calls
│   │   ├── achievementService.ts         # Achievement API calls
│   │   ├── certificateService.ts         # Certificate API calls
│   │   ├── paymentService.ts             # Payment API calls
│   │   ├── subscriptionService.ts        # Subscription API calls
│   │   ├── communityService.ts           # Community API calls
│   │   ├── mentorshipService.ts          # Mentorship API calls
│   │   ├── analyticsService.ts           # Analytics API calls
│   │   ├── playgroundService.ts          # Playground API calls
│   │   ├── videoService.ts               # Video API calls
│   │   ├── liveService.ts                # Live session API calls
│   │   ├── aiService.ts                  # AI API calls
│   │   └── index.ts                      # Barrel export
│   │
│   ├── utils/                            # Utility functions
│   │   ├── date.ts                       # Date utilities
│   │   ├── string.ts                     # String utilities
│   │   ├── array.ts                      # Array utilities
│   │   ├── object.ts                     # Object utilities
│   │   ├── validation.ts                 # Validation utilities
│   │   ├── formatting.ts                 # Formatting utilities
│   │   ├── localStorage.ts               # Local storage utilities
│   │   ├── sessionStorage.ts             # Session storage utilities
│   │   ├── url.ts                        # URL utilities
│   │   ├── file.ts                       # File utilities
│   │   ├── image.ts                      # Image utilities
│   │   ├── cn.ts                         # Class name utility
│   │   ├── constants.ts                  # Constants
│   │   ├── optimization/                 # Optimization utilities
│   │   │   ├── lazyLoad.ts
│   │   │   ├── imageOptimization.ts
│   │   │   └── index.ts
│   │   ├── security/                     # Security utilities
│   │   │   ├── sanitization.ts
│   │   │   ├── encryption.ts
│   │   │   └── index.ts
│   │   └── index.ts                      # Barrel export
│   │
│   ├── types/                            # TypeScript type definitions
│   │   ├── user.ts                       # User types
│   │   ├── lesson.ts                     # Lesson types
│   │   ├── course.ts                     # Course types
│   │   ├── quiz.ts                       # Quiz types
│   │   ├── exercise.ts                   # Exercise types
│   │   ├── flashcard.ts                  # Flashcard types
│   │   ├── srs.ts                        # SRS types
│   │   ├── achievement.ts                # Achievement types
│   │   ├── progress.ts                   # Progress types
│   │   ├── payment.ts                    # Payment types
│   │   ├── api.ts                        # API types
│   │   ├── common.ts                     # Common types
│   │   ├── analytics.ts                  # Analytics types
│   │   ├── community.ts                  # Community types
│   │   └── index.ts                      # Barrel export
│   │
│   ├── constants/                        # Constants and configuration
│   │   ├── routes.ts                     # Route constants
│   │   ├── apiEndpoints.ts               # API endpoint constants
│   │   ├── validation.ts                 # Validation constants
│   │   ├── config.ts                     # App configuration
│   │   ├── features.ts                   # Feature flags
│   │   └── index.ts                      # Barrel export
│   │
│   ├── lib/                              # Library code
│   │   ├── srs/                          # SRS implementation
│   │   │   ├── sm2Algorithm.ts
│   │   │   ├── scheduler.ts
│   │   │   ├── types.ts
│   │   │   ├── __tests__/
│   │   │   │   └── sm2.test.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── db/                           # IndexedDB
│   │   │   ├── schema.ts
│   │   │   ├── operations.ts
│   │   │   ├── sync.ts
│   │   │   ├── __tests__/
│   │   │   │   └── db.test.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── api/                          # API client
│   │   │   ├── client.ts
│   │   │   ├── interceptors.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── sync/                         # Offline sync
│   │   │   ├── syncManager.ts
│   │   │   ├── conflictResolver.ts
│   │   │   ├── queue.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── analytics/                    # Analytics
│   │   │   ├── tracker.ts
│   │   │   ├── events.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── gamification/                 # Gamification engine
│   │   │   ├── achievementEngine.ts
│   │   │   ├── xpCalculator.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── notifications/                # Notifications
│   │   │   ├── pushNotifications.ts
│   │   │   ├── manager.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── progress/                     # Progress tracking
│   │   │   ├── tracker.ts
│   │   │   ├── calculator.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── search/                       # Search
│   │   │   ├── searchEngine.ts
│   │   │   ├── indexer.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── validation/                   # Validation
│   │   │   ├── schemas.ts
│   │   │   ├── validators.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── cards/                        # Card management
│   │   │   ├── cardManager.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── codeExecution/                # Code execution
│   │   │   ├── executor.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── achievements/                 # Achievements
│   │   │   ├── achievementManager.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── store/                        # Store utilities
│   │   │   ├── middleware.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── query/                        # React Query utilities
│   │   │   ├── client.ts
│   │   │   ├── keys.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── types/                        # Library types
│   │   │   └── index.ts
│   │   │
│   │   └── utils/                        # Library utilities
│   │       └── index.ts
│   │
│   ├── data/                             # Static data & content
│   │   ├── curriculum/                   # Curriculum data
│   │   │   ├── 30-day/
│   │   │   │   ├── week1/
│   │   │   │   ├── week2/
│   │   │   │   ├── week3/
│   │   │   │   └── week4/
│   │   │   └── 60-day/
│   │   │       └── ...
│   │   │
│   │   ├── lessons/                      # Lesson content
│   │   │   └── ...
│   │   │
│   │   ├── flashcards/                   # Flashcard data
│   │   │   └── ...
│   │   │
│   │   ├── exercises/                    # Exercise data
│   │   │   └── ...
│   │   │
│   │   └── index.ts                      # Barrel export
│   │
│   ├── styles/                           # Global styles
│   │   ├── globals.css                   # Global CSS
│   │   ├── themes.css                    # Theme variables
│   │   ├── animations.css                # Animations
│   │   └── utilities.css                 # Utility classes
│   │
│   ├── routes/                           # Route configuration
│   │   ├── routes.tsx                    # Route definitions
│   │   ├── index.ts                      # Route exports
│   │   └── lazy.tsx                      # Lazy-loaded routes
│   │
│   ├── locales/                          # Internationalization
│   │   ├── en/                           # English
│   │   │   ├── common.json
│   │   │   ├── dashboard.json
│   │   │   └── ...
│   │   ├── es/                           # Spanish
│   │   ├── fr/                           # French
│   │   ├── de/                           # German
│   │   ├── ja/                           # Japanese
│   │   ├── zh/                           # Chinese
│   │   ├── ar/                           # Arabic
│   │   ├── he/                           # Hebrew
│   │   └── index.ts                      # Barrel export
│   │
│   ├── i18n/                             # i18n configuration
│   │   ├── config.ts                     # i18n config
│   │   └── index.ts                      # i18n setup
│   │
│   ├── examples/                         # Example/demo code
│   │   └── ...
│   │
│   ├── App.tsx                           # Root component
│   ├── main.tsx                          # Entry point
│   └── vite-env.d.ts                     # Vite types
│
├── public/                               # Static assets
│   ├── manifest.json                     # PWA manifest
│   ├── robots.txt                        # Robots file
│   ├── favicon.ico                       # Favicon
│   ├── icons/                            # PWA icons
│   ├── images/                           # Static images
│   └── fonts/                            # Custom fonts
│
├── tests/                                # Tests
│   ├── unit/                             # Unit tests
│   ├── integration/                      # Integration tests
│   ├── e2e/                              # E2E tests
│   └── accessibility/                    # Accessibility tests
│
├── package.json                          # Dependencies
├── tsconfig.json                         # TypeScript config
├── vite.config.ts                        # Vite config
├── tailwind.config.js                    # Tailwind config
├── postcss.config.js                     # PostCSS config
├── .eslintrc.json                        # ESLint config
├── .prettierrc                           # Prettier config
└── vitest.config.ts                      # Vitest config
```

### Frontend Organization Principles

1. **Feature-Based Pages**: Each route has its own page in `/pages`
2. **Component Reusability**: Shared components in `/components`, domain-specific in subfolders
3. **State Colocation**: Stores organized by feature domain
4. **Service Layer**: All API calls abstracted in `/services`
5. **Type Safety**: Comprehensive type definitions in `/types`
6. **Clean Imports**: Barrel exports for all major folders

---

## Infrastructure Structure

```
infrastructure/
├── docker/                               # Docker configurations
│   ├── development/                      # Development environment
│   │   ├── Dockerfile
│   │   ├── docker-compose.yml
│   │   └── .env.example
│   ├── production/                       # Production environment
│   │   ├── Dockerfile.backend
│   │   ├── Dockerfile.frontend
│   │   ├── Dockerfile.workers
│   │   ├── docker-compose.prod.yml
│   │   └── nginx.conf
│   └── sandbox/                          # Code execution sandbox
│       ├── Dockerfile.sandbox
│       └── security-config.yml
│
├── kubernetes/                           # Kubernetes configurations
│   ├── base/                             # Base configurations
│   │   ├── namespace.yaml
│   │   ├── resourcequota.yaml
│   │   └── networkpolicy.yaml
│   ├── overlays/                         # Kustomize overlays
│   │   ├── development/
│   │   │   ├── kustomization.yaml
│   │   │   └── patches/
│   │   ├── staging/
│   │   │   ├── kustomization.yaml
│   │   │   └── patches/
│   │   └── production/
│   │       ├── kustomization.yaml
│   │       └── patches/
│   └── monitoring/                       # Monitoring configs
│       ├── prometheus/
│       ├── grafana/
│       └── jaeger/
│
├── terraform/                            # Infrastructure as Code
│   ├── modules/                          # Reusable modules
│   │   ├── vpc/
│   │   ├── eks/
│   │   ├── rds/
│   │   ├── elasticache/
│   │   ├── s3/
│   │   └── cloudfront/
│   ├── environments/                     # Environment configs
│   │   ├── development/
│   │   ├── staging/
│   │   └── production/
│   ├── main.tf                           # Main config
│   ├── variables.tf                      # Variables
│   ├── outputs.tf                        # Outputs
│   └── backend.tf                        # State backend
│
├── scripts/                              # Infrastructure scripts
│   ├── setup-cluster.sh                  # K8s cluster setup
│   ├── deploy.sh                         # Deployment script
│   ├── rollback.sh                       # Rollback script
│   ├── backup.sh                         # Backup script
│   ├── restore.sh                        # Restore script
│   └── migrate.sh                        # Migration script
│
└── monitoring/                           # Monitoring configurations
    ├── prometheus/                       # Prometheus configs
    │   ├── prometheus.yml
    │   ├── alerts/
    │   └── rules/
    ├── grafana/                          # Grafana configs
    │   ├── dashboards/
    │   └── datasources/
    └── jaeger/                           # Jaeger configs
        └── jaeger-config.yml
```

---

## Documentation Structure

```
docs/
├── user/                                 # User-facing documentation
│   ├── getting-started/
│   │   ├── README.md                     # Getting started guide
│   │   ├── installation.md               # Installation instructions
│   │   └── quickstart.md                 # Quick start guide
│   ├── features/
│   │   ├── lessons.md                    # Lessons guide
│   │   ├── flashcards.md                 # Flashcards guide
│   │   ├── quizzes.md                    # Quizzes guide
│   │   ├── exercises.md                  # Exercises guide
│   │   ├── achievements.md               # Achievements guide
│   │   └── ...
│   └── guides/
│       ├── study-tips.md                 # Study tips
│       ├── best-practices.md             # Best practices
│       └── ...
│
├── developer/                            # Developer documentation
│   ├── setup/
│   │   ├── local-development.md          # Local setup
│   │   ├── environment-setup.md          # Environment setup
│   │   └── tooling.md                    # Development tools
│   ├── architecture/
│   │   ├── overview.md                   # Architecture overview
│   │   ├── backend.md                    # Backend architecture
│   │   ├── frontend.md                   # Frontend architecture
│   │   ├── database.md                   # Database design
│   │   └── diagrams/                     # Architecture diagrams
│   ├── api/
│   │   ├── reference.md                  # API reference
│   │   ├── authentication.md             # Auth API
│   │   ├── endpoints.md                  # All endpoints
│   │   └── webhooks.md                   # Webhooks
│   └── contributing/
│       ├── guidelines.md                 # Contribution guidelines
│       ├── code-style.md                 # Code style guide
│       ├── pr-process.md                 # PR process
│       └── testing.md                    # Testing guide
│
├── admin/                                # Admin documentation
│   ├── user-management.md                # User management
│   ├── content-management.md             # Content management
│   ├── analytics.md                      # Analytics guide
│   └── system-administration.md          # System admin
│
├── deployment/                           # Deployment guides
│   ├── production-deployment.md          # Production deployment
│   ├── staging-deployment.md             # Staging deployment
│   ├── docker-deployment.md              # Docker deployment
│   ├── kubernetes-deployment.md          # K8s deployment
│   └── monitoring-setup.md               # Monitoring setup
│
├── compliance/                           # Compliance documentation
│   ├── gdpr.md                           # GDPR compliance
│   ├── accessibility.md                  # Accessibility compliance
│   ├── security.md                       # Security documentation
│   └── privacy-policy.md                 # Privacy policy
│
├── integrations/                         # Integration guides
│   ├── slack.md                          # Slack integration
│   ├── teams.md                          # MS Teams integration
│   ├── sso.md                            # SSO integration
│   ├── lti.md                            # LTI integration
│   └── ...
│
└── README.md                             # Documentation index
```

---

## Organization Principles

### 1. Domain-Driven Organization
- Files are grouped by business domain rather than technical type
- Each domain is self-contained with its own models, controllers, and services
- Easier to understand and maintain domain logic

### 2. Separation of Concerns
- Clear boundaries between layers (routes → controllers → services → models)
- Each layer has a specific responsibility
- Prevents tight coupling and improves testability

### 3. Scalability
- Easy to add new domains without restructuring
- Horizontal scaling through domain separation
- Clear patterns for growth

### 4. Discoverability
- Intuitive folder names that reflect their purpose
- Consistent naming across the project
- Barrel exports for clean imports

### 5. Maintainability
- Related files are colocated
- Clear file naming conventions
- Comprehensive documentation

---

## File Naming Conventions

### Backend Files

| Type | Convention | Example |
|------|------------|---------|
| Models | PascalCase | `User.ts`, `Lesson.ts` |
| Controllers | camelCase + Controller | `userController.ts`, `lessonController.ts` |
| Services | camelCase + Service | `authService.ts`, `emailService.ts` |
| Routes | camelCase | `auth.ts`, `lessons.ts` |
| Middleware | camelCase | `auth.ts`, `validation.ts` |
| Utils | camelCase | `dateUtils.ts`, `stringUtils.ts` |
| Types | camelCase + .d.ts | `express.d.ts`, `models.ts` |
| Config | camelCase | `database.ts`, `redis.ts` |
| Tests | name.test.ts | `auth.test.ts`, `user.test.ts` |

### Frontend Files

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `Button.tsx`, `UserCard.tsx` |
| Pages | PascalCase + Page | `DashboardPage.tsx`, `LoginPage.tsx` |
| Hooks | camelCase + use prefix | `useAuth.ts`, `useDebounce.ts` |
| Stores | camelCase + Store | `authStore.ts`, `userStore.ts` |
| Services | camelCase + Service | `apiService.ts`, `authService.ts` |
| Utils | camelCase | `date.ts`, `validation.ts` |
| Types | camelCase | `user.ts`, `lesson.ts` |
| Constants | camelCase | `routes.ts`, `config.ts` |
| Styles | kebab-case | `globals.css`, `themes.css` |
| Tests | name.test.tsx | `Button.test.tsx`, `useAuth.test.ts` |

### General Rules

1. **Be Descriptive**: File names should clearly indicate their purpose
2. **Be Consistent**: Follow the same pattern across similar files
3. **Avoid Abbreviations**: Use full words unless commonly understood (e.g., `api`, `db`)
4. **Use Singular**: Model names should be singular (`User.ts` not `Users.ts`)
5. **Group Related Files**: Use folders to group related functionality

---

## Barrel Exports Strategy

### What are Barrel Exports?

Barrel exports use `index.ts` files to re-export all exports from a folder, simplifying imports.

### Benefits

1. **Cleaner Imports**: `import { User, Lesson } from '@/models'` instead of multiple import lines
2. **Encapsulation**: Internal file structure changes don't affect consumers
3. **Easier Refactoring**: Can reorganize without breaking imports
4. **Better IDE Support**: Autocomplete works better with barrel exports

### Implementation Pattern

**Example: `/backend/src/models/user/index.ts`**
```typescript
export { User } from './User';
export { UserProfile } from './UserProfile';
export { UserSettings } from './UserSettings';
export { UserProgress } from './UserProgress';
export type * from './types';
```

**Example: `/frontend/src/components/index.ts`**
```typescript
export * from './common';
export * from './layout';
export * from './ui';
export * from './ai';
export * from './gamification';
```

### Where to Use Barrel Exports

- ✅ Major folders (models, controllers, services, components)
- ✅ Domain folders (auth, learning, gamification)
- ✅ Utility folders (utils, hooks, types)
- ❌ Small folders with 1-2 files
- ❌ Configuration files

---

## Path Aliases

### TypeScript Path Mapping

Configure in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/pages/*": ["src/pages/*"],
      "@/stores/*": ["src/stores/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/services/*": ["src/services/*"],
      "@/utils/*": ["src/utils/*"],
      "@/types/*": ["src/types/*"],
      "@/lib/*": ["src/lib/*"],
      "@/constants/*": ["src/constants/*"],
      "@/styles/*": ["src/styles/*"]
    }
  }
}
```

### Benefits

1. **No Relative Imports**: `import { Button } from '@/components'` instead of `../../../components`
2. **Easier Refactoring**: Moving files doesn't break imports
3. **Better Readability**: Clear where imports come from
4. **IDE Support**: Better autocomplete and navigation

---

## Migration Checklist

- [ ] Review current file locations
- [ ] Create new folder structure
- [ ] Set up barrel exports
- [ ] Configure path aliases
- [ ] Update import statements
- [ ] Run tests to verify
- [ ] Update documentation
- [ ] Deploy to staging
- [ ] Monitor for issues
- [ ] Deploy to production

---

## Conclusion

This folder structure is designed for:
- **Scalability**: Easy to add new features and domains
- **Maintainability**: Clear organization makes code easy to find and update
- **Developer Experience**: Intuitive structure with helpful conventions
- **Best Practices**: Industry-standard patterns and organization

Follow this structure for a clean, professional, and maintainable codebase.
