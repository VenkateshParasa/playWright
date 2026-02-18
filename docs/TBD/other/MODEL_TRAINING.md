# Model Training Guide

## Prerequisites

### System Requirements

- Python 3.9+
- Node.js 18+
- MongoDB 6.0+
- 8GB RAM minimum (16GB recommended for training)
- 10GB free disk space

### Python Dependencies

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

**requirements.txt:**
```
numpy==1.24.3
pandas==2.0.3
scikit-learn==1.3.0
lightgbm==4.0.0
joblib==1.3.2
matplotlib==3.7.2
seaborn==0.12.2
shap==0.42.1
pymongo==4.4.1
python-dotenv==1.0.0
```

## Data Collection

### 1. Extract Training Data

```bash
# Run data extraction script
python scripts/collect_training_data.py
```

**Script:** `/scripts/collect_training_data.py`

```python
import os
import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# Connect to MongoDB
client = MongoClient(os.getenv('MONGODB_URI'))
db = client['learning_platform']

def collect_user_progress():
    """Collect user progress data."""
    progress = db.user_progress.find({})
    return pd.DataFrame(list(progress))

def collect_card_data():
    """Collect flashcard data."""
    cards = db.cards.find({'isActive': True})
    return pd.DataFrame(list(cards))

def create_training_dataset():
    """Create complete training dataset."""
    # Get data
    progress_df = collect_user_progress()
    cards_df = collect_card_data()

    # Merge and process
    # ... (feature engineering)

    # Save
    dataset.to_csv('data/training_data.csv', index=False)
    print(f'Saved {len(dataset)} training samples')

if __name__ == '__main__':
    create_training_dataset()
```

### 2. Data Validation

```python
# Validate collected data
python scripts/validate_data.py
```

Check for:
- Missing values
- Outliers
- Data distribution
- Class imbalance

## Feature Engineering

### Extract Features

```python
def extract_user_features(user_id, progress, cards):
    """Extract features for a single user."""
    features = {}

    # Basic metrics
    features['total_xp'] = progress.get('totalXP', 0)
    features['current_level'] = progress.get('currentLevel', 1)
    features['lessons_completed'] = progress.get('lessonsCompleted', 0)

    # Performance metrics
    user_cards = [c for c in cards if c['userId'] == user_id]
    if user_cards:
        features['avg_success_rate'] = np.mean([c['successRate'] for c in user_cards])
        features['retention_rate'] = len([c for c in user_cards if c['successRate'] >= 70]) / len(user_cards)
    else:
        features['avg_success_rate'] = 0
        features['retention_rate'] = 0

    # Study patterns
    sessions = progress.get('studySessions', [])
    if sessions:
        features['avg_session_duration'] = np.mean([s['duration'] for s in sessions])
        features['study_consistency'] = len(sessions) / max((datetime.now() - progress['createdAt']).days, 1)
    else:
        features['avg_session_duration'] = 0
        features['study_consistency'] = 0

    return features
```

### Feature Scaling

```python
from sklearn.preprocessing import StandardScaler

# Fit scaler on training data
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)

# Save scaler for inference
import joblib
joblib.dump(scaler, 'ml-models/scaler.pkl')
```

## Model Training

### 1. Performance Prediction Model

**Script:** `/scripts/train_performance_model.py`

```python
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from lightgbm import LGBMRegressor
import joblib

# Load data
data = pd.read_csv('data/training_data.csv')
X = data.drop(['user_id', 'quiz_score'], axis=1)
y = data['quiz_score']

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
model = LGBMRegressor(
    n_estimators=100,
    max_depth=6,
    learning_rate=0.1,
    num_leaves=31,
    random_state=42
)

# Cross-validation
cv_scores = cross_val_score(
    model, X_train, y_train,
    cv=5, scoring='neg_mean_squared_error'
)
print(f'CV RMSE: {np.sqrt(-cv_scores.mean()):.2f} (+/- {np.sqrt(cv_scores.std() * 2):.2f})')

# Train final model
model.fit(X_train, y_train)

# Evaluate
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

print(f'Test MAE: {mae:.2f}')
print(f'Test RMSE: {rmse:.2f}')
print(f'Test R²: {r2:.3f}')

# Save model
joblib.dump(model, 'ml-models/performance_prediction/v1.0/model.pkl')

# Save metadata
import json
metadata = {
    'model_type': 'LGBMRegressor',
    'version': '1.0',
    'features': X.columns.tolist(),
    'metrics': {
        'mae': float(mae),
        'rmse': float(rmse),
        'r2': float(r2)
    },
    'training_date': datetime.now().isoformat()
}

with open('ml-models/performance_prediction/v1.0/metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)
```

### 2. Dropout Risk Classifier

```python
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, roc_auc_score

# Prepare data
X = data[feature_columns]
y = data['at_risk']  # Binary: 1 = at risk, 0 = not at risk

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

# Train
model = LogisticRegression(
    penalty='l2',
    C=1.0,
    solver='lbfgs',
    max_iter=1000,
    random_state=42
)

model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
y_proba = model.predict_proba(X_test)[:, 1]

print(classification_report(y_test, y_pred))
print(f'ROC-AUC: {roc_auc_score(y_test, y_proba):.3f}')

# Save
joblib.dump(model, 'ml-models/dropout_risk/v1.0/model.pkl')
```

### 3. Recommendation Model

```python
from sklearn.decomposition import TruncatedSVD
from scipy.sparse import csr_matrix

# Create user-item matrix
user_item_matrix = create_user_item_matrix(data)

# Matrix Factorization (SVD)
svd = TruncatedSVD(n_components=50, random_state=42)
user_factors = svd.fit_transform(user_item_matrix)
item_factors = svd.components_.T

# Save model
joblib.dump({
    'svd': svd,
    'user_factors': user_factors,
    'item_factors': item_factors
}, 'ml-models/recommendation_model/v1.0/model.pkl')

print(f'Explained variance: {svd.explained_variance_ratio_.sum():.3f}')
```

## Hyperparameter Tuning

### Grid Search

```python
from sklearn.model_selection import GridSearchCV

param_grid = {
    'n_estimators': [50, 100, 200],
    'max_depth': [4, 6, 8],
    'learning_rate': [0.01, 0.1, 0.3],
    'num_leaves': [31, 50, 70]
}

grid_search = GridSearchCV(
    LGBMRegressor(random_state=42),
    param_grid,
    cv=5,
    scoring='neg_mean_squared_error',
    n_jobs=-1,
    verbose=2
)

grid_search.fit(X_train, y_train)

print(f'Best parameters: {grid_search.best_params_}')
print(f'Best score: {-grid_search.best_score_:.2f}')

# Use best model
best_model = grid_search.best_estimator_
```

### Optuna (Bayesian Optimization)

```python
import optuna

def objective(trial):
    params = {
        'n_estimators': trial.suggest_int('n_estimators', 50, 200),
        'max_depth': trial.suggest_int('max_depth', 4, 10),
        'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.3),
        'num_leaves': trial.suggest_int('num_leaves', 20, 80)
    }

    model = LGBMRegressor(**params, random_state=42)
    scores = cross_val_score(model, X_train, y_train, cv=5, scoring='neg_mean_squared_error')
    return -scores.mean()

study = optuna.create_study(direction='minimize')
study.optimize(objective, n_trials=100)

print(f'Best parameters: {study.best_params}')
```

## Model Evaluation

### Performance Metrics

```python
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
    accuracy_score,
    precision_recall_fscore_support,
    roc_auc_score
)

def evaluate_regression_model(y_true, y_pred):
    """Evaluate regression model."""
    return {
        'mae': mean_absolute_error(y_true, y_pred),
        'rmse': np.sqrt(mean_squared_error(y_true, y_pred)),
        'r2': r2_score(y_true, y_pred)
    }

def evaluate_classification_model(y_true, y_pred, y_proba):
    """Evaluate classification model."""
    precision, recall, f1, _ = precision_recall_fscore_support(
        y_true, y_pred, average='binary'
    )

    return {
        'accuracy': accuracy_score(y_true, y_pred),
        'precision': precision,
        'recall': recall,
        'f1': f1,
        'auc': roc_auc_score(y_true, y_proba)
    }
```

### Visualization

```python
import matplotlib.pyplot as plt
import seaborn as sns

# Feature importance
feature_importance = pd.DataFrame({
    'feature': X.columns,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)

plt.figure(figsize=(10, 6))
sns.barplot(data=feature_importance.head(15), x='importance', y='feature')
plt.title('Top 15 Feature Importance')
plt.tight_layout()
plt.savefig('reports/feature_importance.png')

# Prediction vs Actual
plt.figure(figsize=(8, 8))
plt.scatter(y_test, y_pred, alpha=0.5)
plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--', lw=2)
plt.xlabel('Actual')
plt.ylabel('Predicted')
plt.title('Prediction vs Actual')
plt.tight_layout()
plt.savefig('reports/prediction_vs_actual.png')
```

### SHAP Analysis

```python
import shap

# Create explainer
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)

# Summary plot
shap.summary_plot(shap_values, X_test, show=False)
plt.tight_layout()
plt.savefig('reports/shap_summary.png')

# Feature importance
shap.summary_plot(shap_values, X_test, plot_type='bar', show=False)
plt.tight_layout()
plt.savefig('reports/shap_importance.png')
```

## Model Deployment

### Save Models

```python
import joblib
import json
from datetime import datetime

def save_model(model, name, version, metrics, features):
    """Save model with metadata."""
    model_dir = f'ml-models/{name}/v{version}'
    os.makedirs(model_dir, exist_ok=True)

    # Save model
    joblib.dump(model, f'{model_dir}/model.pkl')

    # Save metadata
    metadata = {
        'name': name,
        'version': version,
        'model_type': type(model).__name__,
        'features': features,
        'metrics': metrics,
        'training_date': datetime.now().isoformat()
    }

    with open(f'{model_dir}/metadata.json', 'w') as f:
        json.dump(metadata, f, indent=2)

    print(f'Model saved to {model_dir}')

# Example usage
save_model(
    model=model,
    name='performance_prediction',
    version='1.0',
    metrics={'mae': 8.5, 'rmse': 11.2, 'r2': 0.76},
    features=X.columns.tolist()
)
```

### Version Control

```bash
# Tag model version in git
git tag -a model-v1.0 -m "Performance prediction model v1.0"
git push origin model-v1.0
```

## Monitoring & Retraining

### Track Model Performance

```python
def log_prediction(user_id, prediction, actual, model_version):
    """Log prediction for monitoring."""
    db.model_predictions.insert_one({
        'user_id': user_id,
        'prediction': float(prediction),
        'actual': float(actual) if actual else None,
        'model_version': model_version,
        'timestamp': datetime.now()
    })
```

### Monitor Drift

```python
from scipy import stats

def detect_drift(recent_predictions, baseline_predictions):
    """Detect if model performance has drifted."""
    # Kolmogorov-Smirnov test
    statistic, p_value = stats.ks_2samp(recent_predictions, baseline_predictions)

    if p_value < 0.05:
        print('Warning: Distribution drift detected!')
        return True

    return False
```

### Retraining Schedule

```python
import schedule
import time

def retrain_models():
    """Retrain all models."""
    print('Starting model retraining...')

    # Collect new data
    python scripts/collect_training_data.py

    # Train models
    python scripts/train_performance_model.py
    python scripts/train_dropout_model.py
    python scripts/train_recommendation_model.py

    print('Retraining complete!')

# Schedule weekly retraining
schedule.every().monday.at('02:00').do(retrain_models)

while True:
    schedule.run_pending()
    time.sleep(3600)  # Check every hour
```

## Best Practices

### 1. Data Quality

- Clean missing values appropriately
- Remove outliers (>3 standard deviations)
- Balance classes for classification
- Validate data ranges

### 2. Feature Engineering

- Create domain-specific features
- Use interaction features
- Apply dimensionality reduction if needed
- Normalize/standardize features

### 3. Model Selection

- Start simple (linear models)
- Try ensemble methods (gradient boosting)
- Use cross-validation
- Consider interpretability

### 4. Validation

- Use stratified splits for classification
- Hold out a test set
- Monitor validation curves
- Check for overfitting

### 5. Documentation

- Document all features
- Save model cards
- Version everything
- Track experiments (MLflow, Weights & Biases)

## Troubleshooting

### Common Issues

**1. Poor model performance:**
- Check feature quality
- Try feature engineering
- Tune hyperparameters
- Collect more data

**2. Overfitting:**
- Reduce model complexity
- Add regularization
- Use cross-validation
- Get more training data

**3. Training too slow:**
- Reduce dataset size for testing
- Use sampling
- Optimize hyperparameters
- Use GPU acceleration

## Resources

### Scripts

- `/scripts/train-models.py` - Main training script
- `/scripts/collect_training_data.py` - Data collection
- `/scripts/evaluate-models.py` - Model evaluation
- `/scripts/deploy-models.sh` - Deployment script

### Documentation

- `/docs/ML_MODELS.md` - Model documentation
- `/docs/AI_IMPLEMENTATION.md` - Implementation guide
- `/ml-models/*/model_card.md` - Model cards

### Tools

- Jupyter notebooks in `/notebooks/`
- Training logs in `/logs/training/`
- Model artifacts in `/ml-models/`
