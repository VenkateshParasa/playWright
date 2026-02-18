#!/usr/bin/env python3
"""
AI Model Training Script
Trains all ML models for the learning platform
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from pathlib import Path

# ML libraries
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    mean_absolute_error, mean_squared_error, r2_score,
    accuracy_score, precision_recall_fscore_support, roc_auc_score,
    classification_report
)
from lightgbm import LGBMRegressor
import matplotlib.pyplot as plt
import seaborn as sns

# Database
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment
load_dotenv()

# Configuration
ML_MODELS_DIR = Path('ml-models')
DATA_DIR = Path('data')
REPORTS_DIR = Path('reports')

# Create directories
ML_MODELS_DIR.mkdir(exist_ok=True)
DATA_DIR.mkdir(exist_ok=True)
REPORTS_DIR.mkdir(exist_ok=True)


class ModelTrainer:
    """Base class for model training."""

    def __init__(self, name, version='1.0'):
        self.name = name
        self.version = version
        self.model_dir = ML_MODELS_DIR / name / f'v{version}'
        self.model_dir.mkdir(parents=True, exist_ok=True)

    def save_model(self, model, metrics, features):
        """Save model and metadata."""
        # Save model
        model_path = self.model_dir / 'model.pkl'
        joblib.dump(model, model_path)
        print(f'✓ Model saved to {model_path}')

        # Save metadata
        metadata = {
            'name': self.name,
            'version': self.version,
            'model_type': type(model).__name__,
            'features': features,
            'metrics': metrics,
            'training_date': datetime.now().isoformat()
        }

        metadata_path = self.model_dir / 'metadata.json'
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        print(f'✓ Metadata saved to {metadata_path}')

    def save_scaler(self, scaler):
        """Save feature scaler."""
        scaler_path = self.model_dir / 'scaler.pkl'
        joblib.dump(scaler, scaler_path)
        print(f'✓ Scaler saved to {scaler_path}')


class PerformancePredictionTrainer(ModelTrainer):
    """Train performance prediction model."""

    def __init__(self):
        super().__init__('performance_prediction')

    def load_data(self):
        """Load and prepare training data."""
        print('\n📊 Loading performance prediction data...')

        # Connect to MongoDB
        client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017'))
        db = client['learning_platform']

        # Get user progress
        progress = list(db.user_progress.find({}))
        print(f'  Found {len(progress)} user records')

        # Get flashcards
        cards = list(db.cards.find({'isActive': True}))
        print(f'  Found {len(cards)} active flashcards')

        # Build feature matrix
        data = []
        for user_progress in progress:
            user_id = str(user_progress['userId'])
            user_cards = [c for c in cards if str(c['userId']) == user_id]

            if len(user_cards) < 5:  # Skip users with too few cards
                continue

            features = self._extract_features(user_progress, user_cards)
            data.append(features)

        df = pd.DataFrame(data)
        print(f'  Created dataset with {len(df)} samples')

        return df

    def _extract_features(self, progress, cards):
        """Extract features from user data."""
        features = {}

        # Basic metrics
        features['total_xp'] = progress.get('totalXP', 0)
        features['current_level'] = progress.get('currentLevel', 1)
        features['lessons_completed'] = progress.get('lessonsCompleted', 0)
        features['flashcards_reviewed'] = progress.get('flashcardsReviewed', 0)

        # Performance metrics
        if cards:
            features['avg_success_rate'] = np.mean([c['successRate'] for c in cards])
            features['avg_reviews'] = np.mean([c['totalReviews'] for c in cards])
            features['avg_interval'] = np.mean([c['interval'] for c in cards])
            retained = len([c for c in cards if c['successRate'] >= 70])
            features['retention_rate'] = (retained / len(cards)) * 100
        else:
            features['avg_success_rate'] = 0
            features['avg_reviews'] = 0
            features['avg_interval'] = 0
            features['retention_rate'] = 0

        # Study patterns
        sessions = progress.get('studySessions', [])
        if sessions:
            durations = [s['duration'] for s in sessions]
            features['avg_session_duration'] = np.mean(durations)
            features['total_study_time'] = progress.get('totalStudyTime', 0)

            # Calculate consistency
            if progress.get('createdAt'):
                days_active = (datetime.now() - progress['createdAt']).days
                features['consistency'] = len(sessions) / max(days_active, 1)
            else:
                features['consistency'] = 0
        else:
            features['avg_session_duration'] = 0
            features['total_study_time'] = 0
            features['consistency'] = 0

        # Learning velocity
        if features['total_study_time'] > 0:
            features['learning_velocity'] = features['total_xp'] / (features['total_study_time'] / 60)
        else:
            features['learning_velocity'] = 0

        # Target: Recent success rate (what we're predicting)
        recent_cards = sorted(cards, key=lambda c: c.get('lastReviewed') or c['createdAt'], reverse=True)[:10]
        if recent_cards:
            features['target'] = np.mean([c['successRate'] for c in recent_cards])
        else:
            features['target'] = features['avg_success_rate']

        return features

    def train(self):
        """Train the model."""
        print('\n🚀 Training Performance Prediction Model\n' + '=' * 50)

        # Load data
        df = self.load_data()

        if len(df) < 50:
            print('❌ Not enough data to train (need at least 50 samples)')
            return

        # Prepare features and target
        feature_cols = [c for c in df.columns if c != 'target']
        X = df[feature_cols]
        y = df['target']

        print(f'\n📈 Feature matrix shape: {X.shape}')
        print(f'📈 Target range: [{y.min():.2f}, {y.max():.2f}]')

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        print(f'\n✂️  Train set: {len(X_train)} samples')
        print(f'✂️  Test set: {len(X_test)} samples')

        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)

        # Train model
        print('\n🔧 Training LightGBM model...')
        model = LGBMRegressor(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            num_leaves=31,
            random_state=42,
            verbose=-1
        )

        # Cross-validation
        cv_scores = cross_val_score(
            model, X_train_scaled, y_train,
            cv=5, scoring='neg_mean_squared_error'
        )
        print(f'  CV RMSE: {np.sqrt(-cv_scores.mean()):.2f} (+/- {np.sqrt(cv_scores.std() * 2):.2f})')

        # Train final model
        model.fit(X_train_scaled, y_train)

        # Evaluate
        y_pred = model.predict(X_test_scaled)
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)

        print(f'\n📊 Test Performance:')
        print(f'  MAE:  {mae:.2f}')
        print(f'  RMSE: {rmse:.2f}')
        print(f'  R²:   {r2:.3f}')

        # Save model
        metrics = {'mae': float(mae), 'rmse': float(rmse), 'r2': float(r2)}
        self.save_model(model, metrics, feature_cols.tolist())
        self.save_scaler(scaler)

        # Plot feature importance
        self._plot_feature_importance(model, feature_cols)

        print('\n✅ Performance prediction model trained successfully!')

    def _plot_feature_importance(self, model, features):
        """Plot and save feature importance."""
        importance = pd.DataFrame({
            'feature': features,
            'importance': model.feature_importances_
        }).sort_values('importance', ascending=False)

        plt.figure(figsize=(10, 6))
        sns.barplot(data=importance.head(15), x='importance', y='feature')
        plt.title('Top 15 Feature Importance - Performance Prediction')
        plt.tight_layout()
        plt.savefig(REPORTS_DIR / 'performance_feature_importance.png')
        print(f'  Feature importance plot saved to {REPORTS_DIR}/performance_feature_importance.png')


class DropoutRiskTrainer(ModelTrainer):
    """Train dropout risk classifier."""

    def __init__(self):
        super().__init__('dropout_risk')

    def load_data(self):
        """Load and prepare training data."""
        print('\n📊 Loading dropout risk data...')

        client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017'))
        db = client['learning_platform']

        progress = list(db.user_progress.find({}))
        print(f'  Found {len(progress)} user records')

        data = []
        for user_progress in progress:
            features = self._extract_features(user_progress)
            data.append(features)

        df = pd.DataFrame(data)
        print(f'  Created dataset with {len(df)} samples')

        return df

    def _extract_features(self, progress):
        """Extract features for dropout prediction."""
        features = {}

        # Engagement metrics
        last_activity = progress.get('lastActivityAt')
        if last_activity:
            features['days_since_last_activity'] = (datetime.now() - last_activity).days
        else:
            features['days_since_last_activity'] = 999

        features['current_streak'] = progress.get('streak', {}).get('currentStreak', 0)
        features['lessons_completed'] = progress.get('lessonsCompleted', 0)
        features['total_xp'] = progress.get('totalXP', 0)

        # Calculate completion rate
        features['completion_rate'] = min(100, features['lessons_completed'] * 10)

        # Session metrics
        sessions = progress.get('studySessions', [])
        if sessions:
            recent_sessions = sessions[-7:]  # Last 7 sessions
            features['avg_session_duration'] = np.mean([s['duration'] for s in recent_sessions])
            features['session_count'] = len(sessions)
        else:
            features['avg_session_duration'] = 0
            features['session_count'] = 0

        # Determine at-risk status
        # At risk if: inactive >7 days OR low engagement
        features['at_risk'] = int(
            features['days_since_last_activity'] > 7 or
            features['current_streak'] == 0 or
            features['completion_rate'] < 20
        )

        return features

    def train(self):
        """Train the model."""
        print('\n🚀 Training Dropout Risk Classifier\n' + '=' * 50)

        df = self.load_data()

        if len(df) < 50:
            print('❌ Not enough data to train')
            return

        # Prepare data
        feature_cols = [c for c in df.columns if c != 'at_risk']
        X = df[feature_cols]
        y = df['at_risk']

        print(f'\n📈 Feature matrix shape: {X.shape}')
        print(f'📈 Class distribution: {y.value_counts().to_dict()}')

        # Split (stratified)
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, stratify=y, random_state=42
        )

        # Scale
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)

        # Train
        print('\n🔧 Training Logistic Regression...')
        model = LogisticRegression(
            penalty='l2',
            C=1.0,
            solver='lbfgs',
            max_iter=1000,
            random_state=42
        )

        model.fit(X_train_scaled, y_train)

        # Evaluate
        y_pred = model.predict(X_test_scaled)
        y_proba = model.predict_proba(X_test_scaled)[:, 1]

        accuracy = accuracy_score(y_test, y_pred)
        auc = roc_auc_score(y_test, y_proba)
        precision, recall, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='binary')

        print(f'\n📊 Test Performance:')
        print(f'  Accuracy:  {accuracy:.3f}')
        print(f'  Precision: {precision:.3f}')
        print(f'  Recall:    {recall:.3f}')
        print(f'  F1-Score:  {f1:.3f}')
        print(f'  AUC-ROC:   {auc:.3f}')

        print('\n📋 Classification Report:')
        print(classification_report(y_test, y_pred))

        # Save
        metrics = {
            'accuracy': float(accuracy),
            'precision': float(precision),
            'recall': float(recall),
            'f1': float(f1),
            'auc': float(auc)
        }
        self.save_model(model, metrics, feature_cols.tolist())
        self.save_scaler(scaler)

        print('\n✅ Dropout risk classifier trained successfully!')


def main():
    """Main training function."""
    print('\n' + '=' * 60)
    print('🤖 AI Model Training Pipeline')
    print('=' * 60)

    # Check MongoDB connection
    try:
        client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017'))
        client.server_info()
        print('✓ MongoDB connection successful')
    except Exception as e:
        print(f'❌ MongoDB connection failed: {e}')
        sys.exit(1)

    # Train models
    trainers = [
        PerformancePredictionTrainer(),
        DropoutRiskTrainer(),
    ]

    for trainer in trainers:
        try:
            trainer.train()
        except Exception as e:
            print(f'❌ Error training {trainer.name}: {e}')
            import traceback
            traceback.print_exc()

    print('\n' + '=' * 60)
    print('✅ Training pipeline completed!')
    print('=' * 60)
    print(f'\nModels saved in: {ML_MODELS_DIR}')
    print(f'Reports saved in: {REPORTS_DIR}')


if __name__ == '__main__':
    main()
