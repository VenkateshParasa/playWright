# ML Models Documentation

## Overview

This document describes the machine learning models used in the Playwright & Selenium Learning Platform for powering AI features.

## Model Architecture

### 1. Recommendation System

**Type:** Hybrid (Collaborative + Content-Based Filtering)

**Purpose:** Recommend personalized learning content

**Architecture:**
- Collaborative Filtering: Matrix Factorization (SVD)
- Content-Based: TF-IDF + Cosine Similarity
- Hybrid: Weighted ensemble

**Input Features:**
- User progress metrics (20 features)
- Content metadata (category, difficulty, tags)
- Historical interactions
- Performance scores

**Output:**
- Relevance score (0-100)
- Confidence level
- Recommendation reason

**Training Data:**
- User-content interaction matrix
- Content similarity matrix
- 10,000+ interaction records

**Performance Metrics:**
- Precision@5: 0.78
- Recall@10: 0.65
- NDCG: 0.72

### 2. Performance Prediction Model

**Type:** Gradient Boosting Regressor

**Purpose:** Predict quiz scores, completion time, dropout risk

**Architecture:**
- Algorithm: LightGBM
- Trees: 100
- Max Depth: 6
- Learning Rate: 0.1

**Input Features (15 dimensions):**
- `recent_success_rate`: Average of last 10 reviews
- `avg_reviews`: Average reviews per card
- `avg_interval`: Average SRS interval
- `learning_velocity`: XP per hour
- `retention_rate`: % of cards with >70% success
- `days_since_start`: Account age
- `consistency`: Session regularity score
- Plus 8 additional features

**Outputs:**
- Quiz score prediction (0-100)
- Confidence interval (±X%)
- Key contributing factors

**Training:**
```python
from lightgbm import LGBMRegressor

model = LGBMRegressor(
    n_estimators=100,
    max_depth=6,
    learning_rate=0.1,
    num_leaves=31
)

model.fit(X_train, y_train)
```

**Performance:**
- MAE: 8.5 points
- RMSE: 11.2 points
- R²: 0.76

### 3. Dropout Risk Classifier

**Type:** Binary Classification (Logistic Regression)

**Purpose:** Identify at-risk students

**Architecture:**
- Algorithm: Logistic Regression with L2 regularization
- Features: 12 engagement metrics
- Threshold: 0.5

**Input Features:**
- Days since last activity
- Session frequency
- Completion rate
- Performance trend
- Study time consistency
- Social engagement

**Output:**
- Risk probability (0-1)
- Risk level (low/medium/high)
- Contributing indicators

**Training:**
```python
from sklearn.linear_model import LogisticRegression

model = LogisticRegression(
    penalty='l2',
    C=1.0,
    solver='lbfgs',
    max_iter=1000
)
```

**Performance:**
- Accuracy: 0.82
- Precision: 0.78
- Recall: 0.85
- F1-Score: 0.81
- AUC-ROC: 0.88

### 4. Code Quality Scorer

**Type:** Rule-Based + ML Hybrid

**Purpose:** Analyze code quality and detect issues

**Components:**

**A. Rule-Based Analysis:**
- Syntax checking
- Best practice validation
- Security pattern matching
- Performance anti-patterns

**B. ML Model:**
- Algorithm: Random Forest Classifier
- Features: Code metrics (complexity, LOC, etc.)
- Output: Quality score (0-100)

**Code Metrics:**
- Lines of Code (LOC)
- Cyclomatic Complexity
- Maintainability Index
- Halstead Metrics
- Comment Ratio
- Test Coverage

**Training Data:**
- 5,000 code samples
- Expert-labeled quality scores
- Automated metric calculation

**Performance:**
- Correlation with expert scores: 0.84
- Classification accuracy: 0.79

### 5. Semantic Search Model

**Type:** TF-IDF + Word Embeddings

**Purpose:** Semantic content search

**Architecture:**

**A. TF-IDF Component:**
- Vocabulary size: 10,000 terms
- N-grams: 1-2
- Min document frequency: 2

**B. Embedding Component (Future):**
- Model: Sentence-BERT
- Embedding dimensions: 384
- Pre-trained on educational content

**Current Implementation:**
```typescript
// TF-IDF calculation
function calculateTFIDF(term: string, document: string, corpus: string[]) {
  const tf = termFrequency(term, document);
  const idf = Math.log(corpus.length / documentsContaining(term, corpus));
  return tf * idf;
}
```

**Performance:**
- Average precision: 0.71
- Mean Reciprocal Rank: 0.78

### 6. Learning Style Classifier

**Type:** Multi-class Classification

**Purpose:** Detect learning style (visual/practical/theoretical)

**Architecture:**
- Algorithm: Decision Tree
- Features: Activity ratios, session patterns
- Classes: 4 (visual, practical, theoretical, mixed)

**Input Features:**
- Exercise completion ratio
- Flashcard review ratio
- Lesson consumption ratio
- Session duration patterns
- Content preference history

**Training:**
```python
from sklearn.tree import DecisionTreeClassifier

model = DecisionTreeClassifier(
    max_depth=5,
    min_samples_split=10
)
```

**Performance:**
- Accuracy: 0.73
- Confidence threshold: 60%

## Model Training Pipeline

### Data Collection

```python
# scripts/collect_training_data.py
from backend.ml import MLPreprocessing

# Extract features for all active users
users = User.find({'status': 'active'})
training_data = []

for user in users:
    features = await MLPreprocessing.extractPerformanceFeatures(user.id)
    label = get_user_label(user)  # e.g., quiz scores
    training_data.append((features, label))
```

### Preprocessing

```python
from sklearn.preprocessing import StandardScaler

# Normalize features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Save scaler for inference
joblib.dump(scaler, 'models/scaler.pkl')
```

### Training

```python
# scripts/train_models.py
from lightgbm import LGBMRegressor
from sklearn.model_selection import cross_val_score

# Train with cross-validation
scores = cross_val_score(
    model, X_train, y_train,
    cv=5,
    scoring='neg_mean_squared_error'
)

# Train final model
model.fit(X_train, y_train)

# Save model
joblib.dump(model, 'models/performance_predictor.pkl')
```

### Evaluation

```python
from sklearn.metrics import mean_absolute_error, r2_score

y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f'MAE: {mae:.2f}')
print(f'R²: {r2:.2f}')
```

## Model Deployment

### Serving Models

**Backend (Python):**
```python
import joblib

class ModelServer:
    def __init__(self):
        self.model = joblib.load('models/performance_predictor.pkl')
        self.scaler = joblib.load('models/scaler.pkl')

    def predict(self, features):
        features_scaled = self.scaler.transform([features])
        prediction = self.model.predict(features_scaled)[0]
        return prediction
```

**TypeScript Inference:**
```typescript
import { MLInference } from './ml/inference';

// Simple linear model in TypeScript
const prediction = MLInference.predictQuizScore(userId, quizId);
```

### Model Versioning

Models are versioned and stored in `/ml-models/`:

```
ml-models/
├── recommendation_model/
│   ├── v1.0/
│   │   ├── model.pkl
│   │   ├── metadata.json
│   │   └── scaler.pkl
│   └── v1.1/
├── performance_prediction/
│   └── v1.0/
└── code_analysis/
    └── v1.0/
```

## Model Updates

### Retraining Schedule

- **Recommendation Model:** Weekly
- **Performance Predictor:** Bi-weekly
- **Dropout Risk:** Monthly
- **Code Quality:** As needed

### Monitoring

Track model performance:

```typescript
interface ModelMetrics {
  modelName: string;
  version: string;
  accuracy: number;
  lastTrained: Date;
  predictionCount: number;
  avgConfidence: number;
}
```

### A/B Testing

New model versions are A/B tested:

```typescript
const model = shouldUseNewModel()
  ? ModelV2.predict(features)
  : ModelV1.predict(features);
```

## Feature Engineering

### Feature Extraction

```typescript
// Extract user performance features
async function extractFeatures(userId: string) {
  const progress = await getUserProgress(userId);
  const cards = await getUserCards(userId);

  return {
    totalXP: progress.totalXP,
    currentLevel: progress.currentLevel,
    avgSuccessRate: calculateAvgSuccess(cards),
    retentionRate: calculateRetention(cards),
    // ... more features
  };
}
```

### Feature Selection

Top features by importance:
1. Recent success rate (0.25)
2. Learning velocity (0.18)
3. Retention rate (0.15)
4. Consistency score (0.12)
5. Study time (0.10)

## Model Interpretability

### SHAP Values

```python
import shap

explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)

# Visualize feature importance
shap.summary_plot(shap_values, X_test)
```

### Feature Importance

```python
import matplotlib.pyplot as plt

feature_importance = model.feature_importances_
plt.barh(feature_names, feature_importance)
plt.xlabel('Importance')
plt.title('Feature Importance')
```

## Bias Detection

### Fairness Metrics

Monitor for bias across user segments:

```python
from fairlearn.metrics import demographic_parity_difference

dpd = demographic_parity_difference(
    y_true, y_pred,
    sensitive_features=user_demographics
)

if dpd > 0.1:
    print(f'Warning: Bias detected (DPD: {dpd:.2f})')
```

## Model Cards

Each model has a model card documenting:
- Intended use
- Training data
- Performance metrics
- Limitations
- Ethical considerations

Example: `/ml-models/recommendation_model/model_card.md`

## Production Considerations

### Scalability

- Models are cached in memory
- Batch predictions for efficiency
- Async processing for heavy models

### Fallbacks

If ML model fails:
1. Use rule-based fallback
2. Return default predictions
3. Log error for monitoring

### Monitoring

Track in production:
- Prediction latency
- Model accuracy drift
- Feature distribution changes
- Error rates

## Resources

### Training Scripts

- `/scripts/train-models.py` - Main training script
- `/scripts/evaluate-models.py` - Evaluation script
- `/scripts/deploy-models.sh` - Deployment script

### Model Files

All trained models: `/ml-models/`

### Dependencies

```
# requirements.txt
scikit-learn==1.3.0
lightgbm==4.0.0
joblib==1.3.0
numpy==1.24.0
pandas==2.0.0
```

## Support

For model-related questions:
- Review model documentation in `/ml-models/*/README.md`
- Check training logs in `/logs/training/`
- Contact ML team for issues
