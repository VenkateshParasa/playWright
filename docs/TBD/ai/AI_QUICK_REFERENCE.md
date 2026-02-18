# AI Content & Grading Quick Reference

## 🚀 Quick Start

### Grade Code
```bash
curl -X POST http://localhost:3000/api/ai/grade/code \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function test() { return true; }",
    "language": "javascript",
    "exerciseId": "ex-123",
    "testCases": [{"id":"1","input":"","expectedOutput":"true","weight":1}]
  }'
```

### Generate Quiz
```bash
curl -X POST http://localhost:3000/api/ai/content/quiz/generate \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Playwright is a testing framework...",
    "options": {
      "questionCount": 5,
      "difficulty": "medium",
      "includeMultipleChoice": true
    }
  }'
```

### Get Tutoring Hint
```bash
curl -X POST http://localhost:3000/api/ai/tutoring/hint \
  -H "Content-Type: application/json" \
  -d '{
    "exerciseId": "ex-123",
    "attempts": 2
  }'
```

## 📁 File Locations

**Backend Services:**
- `/backend/src/services/ai/codeGradingService.ts`
- `/backend/src/services/ai/contentGenerationService.ts`
- `/backend/src/services/ai/essayGradingService.ts`
- `/backend/src/services/ai/tutoringService.ts`
- `/backend/src/services/ai/plagiarismDetection.ts`

**Controllers:**
- `/backend/src/controllers/ai/gradingController.ts`
- `/backend/src/controllers/ai/contentGenController.ts`
- `/backend/src/controllers/ai/tutoringController.ts`

**Frontend:**
- `/frontend/src/components/ai/CodeGradingResults.tsx`
- `/frontend/src/components/ai/AIContentGenerator.tsx`
- `/frontend/src/components/ai/TutoringAssistant.tsx`
- `/frontend/src/pages/instructor/AIAssistant.tsx`

**Worker:**
- `/workers/codeExecutor.ts`

**Types:**
- `/backend/src/types/ai.ts`

## ⚙️ Configuration

### Environment Variables
```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4
OPENAI_TEMPERATURE=0.7

# Execution Limits
CODE_EXECUTION_TIMEOUT=5000
CODE_MEMORY_LIMIT=128

# Plagiarism Detection
PLAGIARISM_THRESHOLD=0.7
SIMILARITY_WINDOW_SIZE=5
```

### Service Configuration
```typescript
// Configure AI provider
contentGenerationService.configure({
  provider: 'openai',
  model: 'gpt-4',
  temperature: 0.7,
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure grading weights
const config = {
  weights: {
    tests: 0.6,
    style: 0.15,
    security: 0.15,
    performance: 0.1,
  },
};
```

## 🎯 Key Features by Category

### Code Grading
- ✅ Multi-language support (JS/TS/Python/Java)
- ✅ Automated test execution
- ✅ Style checking
- ✅ Security analysis
- ✅ Performance metrics
- ✅ Plagiarism detection

### Content Generation
- ✅ Quiz questions (MC, T/F, short answer)
- ✅ Flashcards
- ✅ Coding exercises
- ✅ Summaries
- ✅ Concept explanations
- ✅ Auto-tagging

### Essay Grading
- ✅ Rubric-based scoring
- ✅ Key concept detection
- ✅ Grammar analysis
- ✅ Readability scoring
- ✅ Plagiarism detection

### Tutoring
- ✅ Progressive hints (5 levels)
- ✅ Debugging help
- ✅ Concept explanations
- ✅ Learning paths
- ✅ Study plans
- ✅ Real-time assistance

## 📊 API Endpoints Summary

### Grading (10 endpoints)
```
POST /api/ai/grade/code
POST /api/ai/grade/essay
POST /api/ai/grade/essay/batch
POST /api/ai/grade/regrade/:id
GET  /api/ai/grade/history/:userId
GET  /api/ai/grade/stats/:exerciseId
POST /api/ai/grade/rubric/generate
POST /api/ai/grade/review/request
GET  /api/ai/grade/review/pending
POST /api/ai/grade/review/submit
```

### Content Generation (13 endpoints)
```
POST /api/ai/content/quiz/generate
POST /api/ai/content/flashcards/generate
POST /api/ai/content/exercise/generate
POST /api/ai/content/exercise/variations
POST /api/ai/content/summary/generate
POST /api/ai/content/explanation/generate
POST /api/ai/content/code/generate
POST /api/ai/content/tags/generate
POST /api/ai/content/prerequisites/detect
POST /api/ai/content/difficulty/estimate
POST /api/ai/content/objectives/extract
POST /api/ai/content/quality/analyze
POST /api/ai/content/bulk/generate
```

### Tutoring (12 endpoints)
```
POST /api/ai/tutoring/assist
POST /api/ai/tutoring/hint
POST /api/ai/tutoring/debug
POST /api/ai/tutoring/explain
GET  /api/ai/tutoring/learning-path/:userId
GET  /api/ai/tutoring/learning-style/:userId
POST /api/ai/tutoring/study-plan
POST /api/ai/tutoring/realtime-assist
POST /api/ai/tutoring/assistant/ask
GET  /api/ai/tutoring/faq
POST /api/ai/tutoring/resources/recommend
POST /api/ai/tutoring/session/track
```

## 🔒 Security Checklist

- [x] Docker sandboxing for code execution
- [x] Network isolation (--network=none)
- [x] Resource limits (CPU, memory)
- [x] Timeout protection
- [x] Input sanitization
- [x] Output validation
- [x] API key protection
- [x] Rate limiting
- [x] Authentication required
- [x] Audit logging

## 📈 Performance Tips

1. **Enable Caching**: Cache grading results and generated content
2. **Parallel Processing**: Grade multiple submissions concurrently
3. **Background Jobs**: Queue large batches
4. **Model Selection**: Use GPT-3.5 for simple tasks, GPT-4 for complex
5. **Batch Requests**: Combine similar requests

## 🐛 Common Issues

**Issue**: Code execution timeout
**Solution**: Increase `CODE_EXECUTION_TIMEOUT` or optimize test cases

**Issue**: AI generation fails
**Solution**: Check `OPENAI_API_KEY` and quota limits

**Issue**: High plagiarism false positives
**Solution**: Adjust `PLAGIARISM_THRESHOLD` (default: 0.7)

**Issue**: Slow grading performance
**Solution**: Enable Redis caching and parallel processing

## 📚 Documentation Links

- Full Implementation Summary: `/AI_CONTENT_IMPLEMENTATION_SUMMARY.md`
- Content Generation Guide: `/docs/AI_CONTENT_GENERATION.md`
- Automated Grading Guide: `/docs/AUTOMATED_GRADING.md`
- Intelligent Tutoring Guide: `/docs/INTELLIGENT_TUTORING.md`

## 🧪 Testing

```bash
# Run all AI service tests
npm test src/services/ai/

# Test specific service
npm test src/services/ai/codeGradingService.test.ts

# E2E tests
npm run test:e2e -- tests/ai/
```

## 📞 Support

**Issues**: Check `/docs/TROUBLESHOOTING.md`
**Logs**: `/var/log/ai-service/`
**Monitoring**: `/admin/ai-metrics`
**API Docs**: `/api-docs`

---

**Version**: 1.0.0
**Last Updated**: February 17, 2026
**Status**: Production Ready ✅
