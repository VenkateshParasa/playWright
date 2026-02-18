# AI Implementation Guide

## Architecture Overview

The AI system is built with a modular architecture separating concerns:

```
Backend (Node.js/TypeScript)
├── Services Layer (/services/ai/)
│   ├── recommendationEngine.ts    # Content recommendations
│   ├── adaptiveLearning.ts        # Learning path optimization
│   ├── performancePrediction.ts   # Outcome predictions
│   ├── codeAnalysis.ts            # Code review
│   ├── nlpService.ts              # NLP features
│   ├── chatbot.ts                 # AI assistant
│   └── patternAnalysis.ts         # Behavior analysis
│
├── ML Layer (/ml/)
│   ├── preprocessing.ts           # Feature engineering
│   ├── inference.ts               # Model predictions
│   └── models/                    # Trained model files
│
└── API Layer (/routes/ai/)
    └── index.ts                   # REST endpoints

Frontend (React/TypeScript)
├── Components (/components/ai/)
│   ├── RecommendationsPanel.tsx
│   ├── AdaptiveLearningPath.tsx
│   ├── AICodeReview.tsx
│   ├── ChatbotWidget.tsx
│   ├── SmartSearch.tsx
│   └── PerformancePredictions.tsx
│
└── State (/stores/)
    └── aiStore.ts                 # Zustand store
```

## Backend Implementation

### 1. Recommendation Engine

**File:** `/backend/src/services/ai/recommendationEngine.ts`

**Key Classes:**
```typescript
export class RecommendationEngine {
  static async getRecommendations(
    userId: string,
    contentType?: string,
    limit?: number
  ): Promise<Recommendation[]>

  static async recommendNextLesson(
    userId: string
  ): Promise<Recommendation[]>

  static async recommendFlashcardsToReview(
    userId: string,
    limit?: number
  ): Promise<any[]>
}
```

**Algorithm:**
1. Build user profile from progress data
2. Get candidate content
3. Score each candidate using multi-factor algorithm
4. Sort by score and return top N

**Scoring Factors:**
- Category preference (weight: 0.3)
- Difficulty matching (weight: 0.25)
- Weak area targeting (weight: 0.25)
- Content popularity (weight: 0.1)
- Recency bias (weight: 0.1)

### 2. Adaptive Learning Service

**File:** `/backend/src/services/ai/adaptiveLearning.ts`

**Key Methods:**
```typescript
export class AdaptiveLearningService {
  static async generateLearningPath(
    userId: string
  ): Promise<LearningPath>

  static async analyzePerformance(
    userId: string
  ): Promise<PerformanceAnalysis>

  static async adjustCurriculum(
    userId: string
  ): Promise<CurriculumAdjustment>
}
```

**Performance Analysis:**
```typescript
interface PerformanceAnalysis {
  overallScore: number;           // 0-100
  categoryScores: Map<string, number>;
  weakCategories: string[];       // < 60%
  strongCategories: string[];     // > 85%
  learningEfficiency: number;     // XP per hour
  retentionRate: number;          // % retained
  consistencyScore: number;       // Low variance = high
}
```

**Path Generation:**
1. Analyze current performance
2. Identify prerequisites met/not met
3. Find skippable content (already mastered)
4. Add remediation for weak areas
5. Suggest optimal pace and difficulty

### 3. Performance Prediction

**File:** `/backend/src/services/ai/performancePrediction.ts`

**Prediction Types:**
```typescript
// Quiz score prediction
static async predictQuizScore(
  userId: string,
  quizId: string
): Promise<QuizScorePrediction>

// Completion time estimation
static async predictCompletionTime(
  userId: string,
  topicId: string
): Promise<CompletionTimePrediction>

// Dropout risk assessment
static async assessDropoutRisk(
  userId: string
): Promise<AtRiskAnalysis>
```

**Feature Extraction:**
```typescript
const features = {
  avgSuccessRate: metrics.avgSuccessRate,
  recentPerformance: metrics.recentPerformance,
  categoryFamiliarity: metrics.categoryScores.get(category),
  studyTimeInCategory: metrics.studyTimeByCategory.get(category),
  retentionRate: metrics.retentionRate,
  learningVelocity: metrics.learningVelocity,
};
```

**Prediction Model:**
```typescript
// Simplified linear model
const score =
  features.avgSuccessRate * 0.30 +
  features.recentPerformance * 0.25 +
  features.categoryFamiliarity * 0.20 +
  features.retentionRate * 0.15 +
  features.learningVelocity * 0.10;
```

### 4. Code Analysis

**File:** `/backend/src/services/ai/codeAnalysis.ts`

**Analysis Pipeline:**
```typescript
static async analyzeCode(
  code: string,
  language: string,
  exerciseId?: string
): Promise<CodeAnalysisResult> {
  // 1. Calculate metrics
  const metrics = this.calculateMetrics(code);

  // 2. Detect issues
  const issues = this.detectIssues(code, language);

  // 3. Generate suggestions
  const suggestions = this.generateSuggestions(code, language, issues);

  // 4. Check best practices
  const bestPractices = this.checkBestPractices(code, language);

  // 5. Compare with ideal (if available)
  const comparison = await this.compareWithIdeal(code, idealSolution);

  // 6. Calculate quality score
  const quality = this.calculateQualityScore(metrics, issues, bestPractices);

  return { quality, issues, suggestions, bestPractices, comparison, metrics };
}
```

**Pattern Matching:**
```typescript
// Detect missing await
if (/\.(click|fill|type|goto)\(/.test(code) && !/await/.test(code)) {
  issues.push({
    type: 'error',
    message: 'Missing await keyword',
    severity: 'high',
    line: findLineNumber(code, pattern)
  });
}
```

### 5. NLP Service

**File:** `/backend/src/services/ai/nlpService.ts`

**Semantic Search:**
```typescript
static async semanticSearch(
  query: string,
  contentTypes?: string[],
  limit?: number
): Promise<SemanticSearchResult[]> {
  // 1. Preprocess query
  const processedQuery = this.preprocessQuery(query);

  // 2. Get searchable content
  const content = await this.getAllSearchableContent(contentTypes);

  // 3. Calculate relevance (TF-IDF)
  const scored = content.map(item => ({
    ...item,
    relevanceScore: this.calculateRelevance(processedQuery, item.content),
    highlights: this.extractHighlights(processedQuery, item.content)
  }));

  // 4. Sort and return top results
  return scored
    .filter(item => item.relevanceScore > 0.1)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit);
}
```

**TF-IDF Calculation:**
```typescript
private static calculateRelevance(query: string, content: string): number {
  const queryWords = query.toLowerCase().split(/\s+/);
  const contentLower = content.toLowerCase();

  let score = 0;
  queryWords.forEach(word => {
    const count = (contentLower.match(new RegExp(word, 'g')) || []).length;
    const tf = count / contentLower.length;
    const idf = Math.log(totalDocuments / documentsContaining(word));
    score += tf * idf;
  });

  return score;
}
```

### 6. Chatbot Service

**File:** `/backend/src/services/ai/chatbot.ts`

**Intent Detection:**
```typescript
private static detectIntent(message: string): { type: string; confidence: number } {
  const patterns = {
    question: [/what|how|why|when|where/i, /\?$/],
    help: [/help|guide|how do i/i],
    hint: [/hint|clue|stuck/i],
    explanation: [/explain|what is|tell me about/i],
    navigation: [/go to|navigate|show/i],
  };

  for (const [intent, regexps] of Object.entries(patterns)) {
    for (const regex of regexps) {
      if (regex.test(message)) {
        return { type: intent, confidence: 80 };
      }
    }
  }

  return { type: 'general', confidence: 50 };
}
```

### 7. Pattern Analysis

**File:** `/backend/src/services/ai/patternAnalysis.ts`

**Optimal Time Detection:**
```typescript
static identifyOptimalStudyTime(sessions: StudySession[]): {
  hour: number;
  dayOfWeek: number;
  confidence: number;
} {
  // Group by hour and calculate average quality
  const hourPerformance = new Map<number, number[]>();

  sessions.forEach(session => {
    const hour = new Date(session.date).getHours();
    if (!hourPerformance.has(hour)) {
      hourPerformance.set(hour, []);
    }
    hourPerformance.get(hour)?.push(session.quality);
  });

  // Find hour with highest average quality
  let bestHour = 18;
  let bestScore = 0;

  hourPerformance.forEach((qualities, hour) => {
    const avg = qualities.reduce((sum, q) => sum + q, 0) / qualities.length;
    if (avg > bestScore) {
      bestScore = avg;
      bestHour = hour;
    }
  });

  return { hour: bestHour, dayOfWeek: bestDay, confidence: sessions.length * 5 };
}
```

## Frontend Implementation

### AI Store

**File:** `/frontend/src/stores/aiStore.ts`

**State Structure:**
```typescript
interface AIState {
  recommendations: Recommendation[];
  learningPath: LearningPath | null;
  quizPredictions: Map<string, PerformancePrediction>;
  codeAnalysis: CodeAnalysisResult | null;
  chatMessages: ChatMessage[];
  learningPatterns: LearningPattern | null;
  // ... loading states

  // Actions
  fetchRecommendations: () => Promise<void>;
  fetchLearningPath: () => Promise<void>;
  predictQuizScore: (quizId: string) => Promise<void>;
  analyzeCode: (code: string, language: string) => Promise<void>;
  sendChatMessage: (message: string) => Promise<void>;
  // ... more actions
}
```

**API Integration:**
```typescript
fetchRecommendations: async (type?: string, limit?: number) => {
  set({ loadingRecommendations: true });
  try {
    const response = await fetch(`${API_BASE}/ai/recommendations?type=${type}`, {
      credentials: 'include',
    });
    const data = await response.json();
    set({ recommendations: data.recommendations });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
  } finally {
    set({ loadingRecommendations: false });
  }
}
```

### Component Integration

**Example: Using Recommendations**
```typescript
import { useAIStore } from '../../stores/aiStore';

export const MyComponent: React.FC = () => {
  const { recommendations, fetchRecommendations } = useAIStore();

  useEffect(() => {
    fetchRecommendations('lesson', 5);
  }, []);

  return (
    <div>
      {recommendations.map(rec => (
        <RecommendationCard key={rec.item.id} recommendation={rec} />
      ))}
    </div>
  );
};
```

## API Endpoints

### Routes Structure

**File:** `/backend/src/routes/ai/index.ts`

All AI endpoints are prefixed with `/api/ai/`

**Recommendations:**
- `GET /api/ai/recommendations` - General recommendations
- `GET /api/ai/recommendations/next-lesson` - Next lesson
- `GET /api/ai/recommendations/flashcards` - Priority flashcards

**Adaptive Learning:**
- `GET /api/ai/adaptive/learning-path` - Learning path
- `GET /api/ai/adaptive/performance-analysis` - Performance analysis
- `GET /api/ai/adaptive/curriculum-adjustment` - Curriculum adjustment

**Predictions:**
- `GET /api/ai/predict/quiz-score/:quizId` - Quiz score prediction
- `GET /api/ai/predict/completion-time/:topicId` - Completion time
- `GET /api/ai/predict/dropout-risk` - Dropout risk
- `GET /api/ai/predict/learning-efficiency` - Efficiency metrics

**Code Analysis:**
- `POST /api/ai/code-analysis` - Analyze code

**NLP:**
- `POST /api/ai/search/semantic` - Semantic search
- `POST /api/ai/qa/answer` - Question answering
- `POST /api/ai/content/summarize` - Content summary

**Chatbot:**
- `POST /api/ai/chat` - Send message
- `GET /api/ai/chat/history` - Get history
- `DELETE /api/ai/chat/history` - Clear history

**Patterns:**
- `GET /api/ai/patterns/analysis` - Learning patterns
- `GET /api/ai/patterns/recommendations` - Study recommendations

### Authentication

All AI endpoints require authentication:

```typescript
router.get('/recommendations', async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // ... handle request
});
```

### Error Handling

```typescript
try {
  const result = await AIService.process(data);
  res.json({ result });
} catch (error: any) {
  console.error('AI Service Error:', error);
  res.status(500).json({
    error: error.message,
    fallback: getFallbackResponse()
  });
}
```

## Data Flow

### Recommendation Flow

```
User Action
    ↓
Frontend Component (RecommendationsPanel)
    ↓
AI Store (fetchRecommendations)
    ↓
API Request (GET /api/ai/recommendations)
    ↓
Route Handler
    ↓
RecommendationEngine Service
    ↓
Database (UserProgress, Cards)
    ↓
Algorithm Processing
    ↓
Recommendations Generated
    ↓
API Response
    ↓
Store Updated
    ↓
Component Re-renders
```

### Code Analysis Flow

```
User Submits Code
    ↓
Frontend (AICodeReview component)
    ↓
AI Store (analyzeCode)
    ↓
API Request (POST /api/ai/code-analysis)
    ↓
CodeAnalysisService
    ├─→ Calculate Metrics
    ├─→ Detect Issues
    ├─→ Generate Suggestions
    ├─→ Check Best Practices
    └─→ Compare with Ideal
    ↓
Analysis Result
    ↓
API Response
    ↓
Component Displays Results
```

## Performance Optimization

### Caching Strategy

```typescript
// In-memory cache for recommendations
const recommendationCache = new Map<string, {
  data: Recommendation[];
  timestamp: number;
}>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

static async getRecommendations(userId: string) {
  const cached = recommendationCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const recommendations = await this.computeRecommendations(userId);
  recommendationCache.set(userId, {
    data: recommendations,
    timestamp: Date.now()
  });

  return recommendations;
}
```

### Async Processing

For heavy computations, use background jobs:

```typescript
// Queue heavy analysis
await analysisQueue.add('code-analysis', {
  userId,
  code,
  language
});

// Return immediately with job ID
res.json({ jobId, status: 'processing' });
```

### Database Optimization

Index frequently queried fields:

```typescript
// Card model indexes
CardSchema.index({ userId: 1, state: 1, dueDate: 1 });
CardSchema.index({ userId: 1, category: 1, state: 1 });
```

## Testing

### Unit Tests

```typescript
// tests/ai/recommendationEngine.test.ts
describe('RecommendationEngine', () => {
  it('should recommend next lesson based on prerequisites', async () => {
    const userId = 'test-user';
    const recommendations = await RecommendationEngine.recommendNextLesson(userId);

    expect(recommendations).toHaveLength(1);
    expect(recommendations[0].item.type).toBe('lesson');
  });
});
```

### Integration Tests

```typescript
// tests/ai/api.test.ts
describe('AI API', () => {
  it('should return recommendations', async () => {
    const response = await request(app)
      .get('/api/ai/recommendations')
      .set('Cookie', authCookie);

    expect(response.status).toBe(200);
    expect(response.body.recommendations).toBeInstanceOf(Array);
  });
});
```

## Deployment

### Environment Setup

```bash
# .env
AI_FEATURES_ENABLED=true
ML_MODEL_PATH=/app/ml-models
RECOMMENDATION_CACHE_TTL=300000
```

### Model Deployment

```bash
# Deploy models to production
./scripts/deploy-models.sh production

# Verify deployment
curl https://api.platform.com/api/ai/health
```

### Monitoring

```typescript
// Track AI feature usage
aiMetrics.track('recommendation_generated', {
  userId,
  contentType,
  count: recommendations.length,
  duration: Date.now() - startTime
});
```

## Troubleshooting

### Common Issues

**1. Recommendations not appearing:**
- Check if user has sufficient activity data
- Verify AI features enabled in user settings
- Check API response in browser console

**2. Code analysis timeout:**
- Reduce code size
- Increase timeout limit
- Use async processing

**3. Chatbot not responding:**
- Verify API configuration
- Check rate limits
- Review error logs

## Best Practices

1. **Always provide fallbacks:** Don't break UX if AI fails
2. **Cache aggressively:** AI computations are expensive
3. **Monitor performance:** Track latency and accuracy
4. **A/B test changes:** Validate improvements with data
5. **Document algorithms:** Make AI decisions explainable
6. **Handle edge cases:** Users with no data, new accounts, etc.

## Future Improvements

- Implement TensorFlow.js for client-side ML
- Add real-time learning path updates
- Integrate external LLM APIs (OpenAI, etc.)
- Build model retraining pipeline
- Add explainable AI visualizations
- Implement federated learning for privacy
