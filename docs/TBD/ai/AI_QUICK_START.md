# AI Features - Quick Start Guide

## 🚀 Quick Setup

### 1. Backend Setup

```bash
cd backend

# Install dependencies (if not already installed)
npm install

# The AI routes are already integrated in server.ts
# No additional packages needed - all AI features use built-in Node.js/TypeScript
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies (if not already installed)
npm install

# AI components use existing dependencies (React, Zustand, TailwindCSS)
# No additional packages needed
```

### 3. Python ML Setup (Optional - for model training)

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install ML dependencies
pip install -r requirements.txt
```

### 4. Environment Variables

Add to your `.env` file:

```bash
# AI Features
AI_FEATURES_ENABLED=true

# Optional: OpenAI API key for enhanced chatbot
OPENAI_API_KEY=your_openai_key_here
```

## 📱 Using AI Features

### In Your Application

#### 1. Add Chatbot Widget

In your main layout component:

```typescript
import { ChatbotWidget } from './components/ai/ChatbotWidget';

function Layout() {
  return (
    <div>
      {/* Your content */}
      <ChatbotWidget />  {/* Floating chat button */}
    </div>
  );
}
```

#### 2. Add Recommendations Panel

In your dashboard:

```typescript
import { RecommendationsPanel } from './components/ai/RecommendationsPanel';

function Dashboard() {
  return (
    <div>
      <h1>My Dashboard</h1>
      <RecommendationsPanel />
    </div>
  );
}
```

#### 3. Add Learning Path

In your progress/learning page:

```typescript
import { AdaptiveLearningPath } from './components/ai/AdaptiveLearningPath';

function LearningPath() {
  return (
    <div>
      <h1>My Learning Journey</h1>
      <AdaptiveLearningPath />
    </div>
  );
}
```

#### 4. Add Code Review

In your exercise/coding page:

```typescript
import { AICodeReview } from './components/ai/AICodeReview';

function Exercise() {
  const [code, setCode] = useState('');

  return (
    <div>
      <MonacoEditor value={code} onChange={setCode} />
      <AICodeReview code={code} language="typescript" exerciseId="ex-1" />
    </div>
  );
}
```

#### 5. Add Smart Search

In your search page:

```typescript
import { SmartSearch } from './components/ai/SmartSearch';

function SearchPage() {
  return (
    <div>
      <h1>Search</h1>
      <SmartSearch />
    </div>
  );
}
```

## 🧪 Testing AI Features

### 1. Test Recommendations

```bash
# Start backend and frontend
cd backend && npm run dev
cd frontend && npm run dev

# Navigate to dashboard
# You should see recommended content
```

### 2. Test Chatbot

```bash
# Click the chat button in bottom-right
# Try asking:
- "How do I use Playwright locators?"
- "What should I learn next?"
- "Give me a hint"
```

### 3. Test Code Analysis

```bash
# Go to any exercise
# Write some code
# See real-time AI feedback below the editor
```

## 🔧 Training ML Models (Optional)

If you want to train custom models with your data:

```bash
# Ensure MongoDB is running with data
# Activate Python virtual environment
source venv/bin/activate

# Run training script
python scripts/train-models.py

# Models will be saved in ml-models/
```

## 📊 API Endpoints

Test AI endpoints with curl:

```bash
# Get recommendations
curl -X GET http://localhost:5000/api/ai/recommendations \
  -H "Cookie: token=your_jwt_token"

# Analyze code
curl -X POST http://localhost:5000/api/ai/code-analysis \
  -H "Content-Type: application/json" \
  -d '{"code":"const page = await browser.newPage();","language":"javascript"}'

# Semantic search
curl -X POST http://localhost:5000/api/ai/search/semantic \
  -H "Content-Type: application/json" \
  -d '{"query":"How to use locators?","limit":5}'

# Chat
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: token=your_jwt_token" \
  -d '{"message":"How do I get started?"}'
```

## ⚙️ Configuration

### Enable/Disable Features

Users can control AI features in Settings:

```typescript
// In user settings
settings: {
  ai: {
    recommendations: true,      // Content recommendations
    adaptiveLearning: true,     // Dynamic learning paths
    codeAnalysis: true,         // Automated code review
    chatbot: true,              // AI assistant
    allowDataCollection: true   // Data for ML training
  }
}
```

### Feature Flags

In your environment:

```bash
# Disable specific features
AI_RECOMMENDATIONS_ENABLED=true
AI_CODE_ANALYSIS_ENABLED=true
AI_CHATBOT_ENABLED=true
AI_PREDICTIONS_ENABLED=true
```

## 📈 Monitoring

### Check AI Feature Health

```bash
# Health check
curl http://localhost:5000/health

# View AI metrics (if implemented)
curl http://localhost:5000/api/ai/metrics
```

### View Logs

```bash
# Backend logs
cd backend
npm run dev  # Watch for AI-related logs

# Look for:
✓ AI routes loaded
✓ Recommendations generated
✓ Code analysis completed
```

## 🐛 Troubleshooting

### Recommendations Not Showing

**Issue:** Empty recommendations panel

**Solutions:**
1. Ensure user has completed some activities
2. Check if AI features are enabled in user settings
3. Verify backend AI routes are mounted
4. Check browser console for API errors

```bash
# Test endpoint directly
curl http://localhost:5000/api/ai/recommendations
```

### Chatbot Not Responding

**Issue:** Chatbot messages not sending

**Solutions:**
1. Check authentication (user must be logged in)
2. Verify API endpoint is accessible
3. Check browser console for errors
4. Ensure backend is running

```typescript
// Debug in browser console
fetch('/api/ai/chat', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  credentials: 'include',
  body: JSON.stringify({message: 'test'})
}).then(r => r.json()).then(console.log)
```

### Code Analysis Slow

**Issue:** Code analysis takes too long

**Solutions:**
1. Reduce code size (limit to <1000 lines)
2. Implement client-side caching
3. Use debouncing for real-time analysis

```typescript
// Add debouncing
import { debounce } from 'lodash';

const analyzeCodeDebounced = debounce(async (code) => {
  await analyzeCode(code, 'typescript');
}, 1000);
```

### ML Models Not Loading

**Issue:** Model prediction errors

**Solutions:**
1. Ensure models are trained and saved
2. Check model file paths
3. Verify Python dependencies installed
4. Run training script

```bash
# Train models
python scripts/train-models.py

# Check model files exist
ls -la ml-models/*/v*/model.pkl
```

## 📚 Documentation

- **User Guide:** `/docs/AI_FEATURES.md`
- **ML Models:** `/docs/ML_MODELS.md`
- **Implementation:** `/docs/AI_IMPLEMENTATION.md`
- **Training:** `/docs/MODEL_TRAINING.md`

## 🎯 Next Steps

1. **Customize Recommendations:** Adjust scoring weights in `recommendationEngine.ts`
2. **Add More Patterns:** Extend pattern detection in `patternAnalysis.ts`
3. **Enhance Chatbot:** Add more intents and responses in `chatbot.ts`
4. **Train Custom Models:** Use your data with `train-models.py`
5. **Add Analytics:** Track AI feature usage and effectiveness

## 💡 Tips

- **Start Simple:** Enable one feature at a time
- **Monitor Usage:** Track which AI features users engage with most
- **Collect Feedback:** Ask users about AI recommendations
- **Iterate:** Continuously improve based on data
- **A/B Test:** Compare AI vs non-AI experiences

## 🆘 Support

- Check documentation in `/docs/`
- Review implementation in `/backend/src/services/ai/`
- Test with provided examples
- File issues on GitHub

## ✅ Checklist

- [ ] Backend running with AI routes
- [ ] Frontend components imported
- [ ] Environment variables set
- [ ] Test recommendations endpoint
- [ ] Test chatbot widget
- [ ] Test code analysis
- [ ] (Optional) Train ML models
- [ ] Monitor performance
- [ ] Gather user feedback

---

**Ready to use AI features!** 🎉

Start with the chatbot widget - it's the easiest way to see AI in action. Then gradually add other components as needed.
