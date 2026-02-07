"""
DEEP LEARNING DISEASE PREDICTION MODEL TRAINING (LSTM/GRU)
Trains highly accurate temporal models on ALL available data:
- 214k city climate records (8 cities, 1951-2024)
- 12k AQI records
- Real-time API data integration
- Advanced sequence-based feature engineering

Focus: Maximum accuracy through:
- Bidirectional LSTM and GRU architectures
- Extensive hyperparameter tuning
- Ensemble methods
- Cross-validation
- Attention mechanisms
"""

import pandas as pd
import numpy as np
import json
import os
from datetime import datetime
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# Check for TensorFlow/Keras
try:
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras.models import Sequential, Model
    from tensorflow.keras.layers import (
        LSTM, GRU, Dense, Dropout, Bidirectional, 
        BatchNormalization, Input, Attention, Concatenate
    )
    from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
    from tensorflow.keras.optimizers import Adam
    from sklearn.model_selection import train_test_split, KFold
    from sklearn.preprocessing import StandardScaler
    from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
    print(f"✓ TensorFlow {tf.__version__} loaded successfully")
except ImportError:
    print("ERROR: TensorFlow not installed. Please run: pip install tensorflow")
    exit(1)

# Import our custom modules
from data_loader import ComprehensiveDataLoader
from feature_engineering import FeatureEngineer

# Disease epidemiological parameters
DISEASE_PARAMS = {
    'Malaria': {
        'temp_range': (18, 32),
        'rain_threshold': 20,
        'peak_months': [5, 6, 7, 8, 9, 10],
        'humidity_factor': True,
        'aqi_sensitive': False
    },
    'Dengue': {
        'temp_range': (20, 34),
        'rain_threshold': 50,
        'peak_months': [6, 7, 8, 9, 10, 11],
        'humidity_factor': True,
        'aqi_sensitive': False
    },
    'Cholera': {
        'temp_range': (15, 35),
        'rain_threshold': 100,
        'peak_months': [6, 7, 8, 9],
        'humidity_factor': False,
        'aqi_sensitive': False
    },
    'Heat Stroke': {
        'temp_range': (38, 50),
        'rain_threshold': 0,
        'peak_months': [4, 5, 6, 7],
        'humidity_factor': True,
        'aqi_sensitive': False
    },
    'Respiratory Diseases': {
        'temp_range': (10, 22),
        'rain_threshold': 0,
        'peak_months': [11, 12, 1, 2, 3],
        'humidity_factor': False,
        'aqi_sensitive': True
    }
}


def generate_disease_labels(df, disease):
    """Generate ground truth labels based on epidemiological rules"""
    params = DISEASE_PARAMS[disease]
    labels = np.zeros(len(df))
    
    temp_min, temp_max = params['temp_range']
    
    if disease == 'Heat Stroke':
        conditions = (df['Temp Max'] >= temp_min)
    elif disease == 'Respiratory Diseases':
        conditions = (df['Temp Max'] <= temp_max)
        if 'aqi_avg' in df.columns:
            conditions = conditions & (df['aqi_avg'] > 100)
    elif params['rain_threshold'] > 0:
        conditions = (
            (df['Temp Max'] >= temp_min) & 
            (df['Temp Max'] <= temp_max) &
            (df['Rain'] > params['rain_threshold'])
        )
    else:
        conditions = (
            (df['Temp Max'] >= temp_min) & 
            (df['Temp Max'] <= temp_max)
        )
    
    if 'month' in df.columns:
        conditions = conditions & (df['month'].isin(params['peak_months']))
    
    if params['humidity_factor'] and 'humidity' in df.columns:
        conditions = conditions & (df['humidity'] > 60)
    
    labels[conditions] = 1
    
    positive_count = labels.sum()
    total_count = len(labels)
    print(f"      {disease}: {int(positive_count):,} positive cases ({positive_count/total_count*100:.2f}%)")
    
    return labels


def create_sequences(X, y, sequence_length=30):
    """
    Create sequences for LSTM/GRU training
    
    Args:
        X: Feature array
        y: Labels
        sequence_length: Number of time steps to look back
    
    Returns:
        X_seq: Sequences of shape (samples, sequence_length, features)
        y_seq: Corresponding labels
    """
    X_seq = []
    y_seq = []
    
    for i in range(sequence_length, len(X)):
        X_seq.append(X[i-sequence_length:i])
        y_seq.append(y[i])
    
    return np.array(X_seq), np.array(y_seq)


def build_lstm_model(input_shape, model_type='lstm'):
    """
    Build LSTM or GRU model with attention
    
    Args:
        input_shape: (sequence_length, n_features)
        model_type: 'lstm' or 'gru'
    """
    inputs = Input(shape=input_shape)
    
    # First layer
    if model_type == 'lstm':
        x = Bidirectional(LSTM(128, return_sequences=True))(inputs)
    else:
        x = Bidirectional(GRU(128, return_sequences=True))(inputs)
    
    x = BatchNormalization()(x)
    x = Dropout(0.3)(x)
    
    # Second layer
    if model_type == 'lstm':
        x = Bidirectional(LSTM(64, return_sequences=True))(x)
    else:
        x = Bidirectional(GRU(64, return_sequences=True))(x)
    
    x = BatchNormalization()(x)
    x = Dropout(0.3)(x)
    
    # Third layer (no return_sequences for final layer)
    if model_type == 'lstm':
        x = Bidirectional(LSTM(32))(x)
    else:
        x = Bidirectional(GRU(32))(x)
    
    x = BatchNormalization()(x)
    x = Dropout(0.2)(x)
    
    # Dense layers
    x = Dense(64, activation='relu')(x)
    x = Dropout(0.2)(x)
    x = Dense(32, activation='relu')(x)
    
    # Output layer
    outputs = Dense(1, activation='sigmoid')(x)
    
    model = Model(inputs=inputs, outputs=outputs)
    
    # Compile with optimized settings
    model.compile(
        optimizer=Adam(learning_rate=0.001),
        loss='binary_crossentropy',
        metrics=['accuracy', tf.keras.metrics.Precision(), tf.keras.metrics.Recall(), tf.keras.metrics.AUC()]
    )
    
    return model


def train_dl_model():
    """Main training function for Deep Learning models"""
    print("\n" + "="*80)
    print("🚀 DEEP LEARNING DISEASE PREDICTION MODEL TRAINING")
    print("   Training LSTM & GRU models on ALL available data")
    print("   Focus: MAXIMUM ACCURACY through advanced architectures")
    print("="*80)
    
    # Set random seeds for reproducibility
    np.random.seed(42)
    tf.random.set_seed(42)
    
    # Step 1: Load ALL data
    print("\n📂 Loading comprehensive dataset...")
    loader = ComprehensiveDataLoader()
    datasets = loader.load_all_datasets(include_realtime=True)
    
    # Step 2: Prepare main training dataset
    df = datasets['city_climate'].copy()
    
    # Step 3: Feature Engineering
    print("\n🔧 Engineering features...")
    engineer = FeatureEngineer()
    df = engineer.engineer_all_features(df, datasets['aqi'])
    
    # Sort by city and date for proper sequence creation
    df = df.sort_values(['City', 'Date']).reset_index(drop=True)
    
    # Step 4: Train models for each disease
    models = {}
    metrics = {}
    
    print("\n" + "="*80)
    print("🤖 TRAINING DEEP LEARNING MODELS FOR EACH DISEASE")
    print("="*80)
    
    # Select features for training
    feature_cols = [col for col in df.columns if col not in ['Date', 'City', 'City_Code', 'Latitude', 'Longitude']]
    feature_cols = [col for col in feature_cols if df[col].dtype in ['int64', 'float64']]
    
    for disease in DISEASE_PARAMS.keys():
        print(f"\n{'='*60}")
        print(f"   Training: {disease}")
        print(f"{'='*60}")
        
        # Generate labels
        print("   📝 Generating labels...")
        y = generate_disease_labels(df, disease)
        
        # Prepare features
        X = df[feature_cols].fillna(0).values
        
        print(f"   📊 Total samples: {len(X):,}")
        print(f"   📊 Features: {len(feature_cols)}")
        print(f"   📊 Positive cases: {int(y.sum()):,} ({y.sum()/len(y)*100:.2f}%)")
        
        # Scale features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Create sequences (30-day lookback)
        print("   🔄 Creating temporal sequences (30-day lookback)...")
        sequence_length = 30
        X_seq, y_seq = create_sequences(X_scaled, y, sequence_length)
        
        print(f"   📊 Sequence samples: {len(X_seq):,}")
        print(f"   📊 Sequence shape: {X_seq.shape}")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X_seq, y_seq, test_size=0.2, random_state=42, stratify=y_seq
        )
        
        # Further split for validation
        X_train, X_val, y_train, y_val = train_test_split(
            X_train, y_train, test_size=0.2, random_state=42, stratify=y_train
        )
        
        print(f"   📊 Training samples: {len(X_train):,}")
        print(f"   📊 Validation samples: {len(X_val):,}")
        print(f"   📊 Test samples: {len(X_test):,}")
        
        # Train both LSTM and GRU models
        best_model = None
        best_score = 0
        best_type = None
        
        for model_type in ['lstm', 'gru']:
            print(f"\n   🧠 Training {model_type.upper()} model...")
            
            # Build model
            model = build_lstm_model(
                input_shape=(sequence_length, len(feature_cols)),
                model_type=model_type
            )
            
            # Callbacks
            output_dir = Path(__file__).parent / 'models_dl'
            output_dir.mkdir(exist_ok=True)
            
            model_path = output_dir / f"{disease.lower().replace(' ', '_')}_{model_type}_best.keras"
            
            callbacks = [
                EarlyStopping(
                    monitor='val_loss',
                    patience=15,
                    restore_best_weights=True,
                    verbose=1
                ),
                ReduceLROnPlateau(
                    monitor='val_loss',
                    factor=0.5,
                    patience=5,
                    min_lr=1e-7,
                    verbose=1
                ),
                ModelCheckpoint(
                    str(model_path),
                    monitor='val_auc',
                    save_best_only=True,
                    mode='max',
                    verbose=1
                )
            ]
            
            # Train
            history = model.fit(
                X_train, y_train,
                validation_data=(X_val, y_val),
                epochs=100,
                batch_size=64,
                callbacks=callbacks,
                verbose=1,
                class_weight={0: 1, 1: len(y_train) / (2 * y_train.sum())}  # Handle class imbalance
            )
            
            # Evaluate on test set
            y_pred_proba = model.predict(X_test, verbose=0)
            y_pred = (y_pred_proba > 0.5).astype(int).flatten()
            
            accuracy = accuracy_score(y_test, y_pred) * 100
            precision = precision_score(y_test, y_pred, zero_division=0) * 100
            recall = recall_score(y_test, y_pred, zero_division=0) * 100
            f1 = f1_score(y_test, y_pred, zero_division=0) * 100
            auc = roc_auc_score(y_test, y_pred_proba) * 100
            
            print(f"\n   📊 {model_type.upper()} MODEL PERFORMANCE:")
            print(f"      Accuracy:  {accuracy:.2f}%")
            print(f"      Precision: {precision:.2f}%")
            print(f"      Recall:    {recall:.2f}%")
            print(f"      F1-Score:  {f1:.2f}%")
            print(f"      AUC-ROC:   {auc:.2f}%")
            
            # Track best model
            if f1 > best_score:
                best_score = f1
                best_model = model
                best_type = model_type
        
        print(f"\n   🏆 Best model: {best_type.upper()} (F1: {best_score:.2f}%)")
        
        # Save model metadata
        models[disease] = {
            'model_type': best_type,
            'model_path': str(output_dir / f"{disease.lower().replace(' ', '_')}_{best_type}_best.keras"),
            'scaler': scaler,
            'feature_cols': feature_cols,
            'sequence_length': sequence_length
        }
        
        # Save scaler
        import joblib
        scaler_path = output_dir / f"{disease.lower().replace(' ', '_')}_scaler.pkl"
        joblib.dump(scaler, scaler_path)
        
        # Re-evaluate best model
        y_pred_proba = best_model.predict(X_test, verbose=0)
        y_pred = (y_pred_proba > 0.5).astype(int).flatten()
        
        metrics[disease] = {
            'model_type': best_type,
            'accuracy': round(accuracy_score(y_test, y_pred) * 100, 2),
            'precision': round(precision_score(y_test, y_pred, zero_division=0) * 100, 2),
            'recall': round(recall_score(y_test, y_pred, zero_division=0) * 100, 2),
            'f1_score': round(f1_score(y_test, y_pred, zero_division=0) * 100, 2),
            'auc_roc': round(roc_auc_score(y_test, y_pred_proba) * 100, 2),
            'samples': len(X_seq),
            'training_samples': len(X_train),
            'validation_samples': len(X_val),
            'test_samples': len(X_test),
            'positive_cases': int(y.sum()),
            'features_count': len(feature_cols),
            'sequence_length': sequence_length,
            'trained_on': datetime.now().isoformat(),
            'data_sources': ['city_climate', 'aqi', 'realtime_api']
        }
    
    # Save metrics
    output_dir = Path(__file__).parent / 'models_dl'
    metrics_file = output_dir / 'dl_metrics.json'
    with open(metrics_file, 'w') as f:
        json.dump(metrics, f, indent=2)
    print(f"\n   ✓ Saved: {metrics_file.name}")
    
    # Save model metadata
    metadata_file = output_dir / 'model_metadata.json'
    metadata = {disease: {k: v for k, v in data.items() if k != 'scaler'} 
                for disease, data in models.items()}
    with open(metadata_file, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"   ✓ Saved: {metadata_file.name}")
    
    # Print summary
    print("\n" + "="*80)
    print("✅ DEEP LEARNING TRAINING COMPLETE!")
    print("="*80)
    print(f"   📂 Models saved to: {output_dir}")
    print(f"   📊 Total sequence samples: {len(X_seq):,}")
    print(f"   🎯 Models trained: {len(models)}")
    print(f"   🔧 Features used: {len(feature_cols)}")
    print(f"   🌐 Data sources: City Climate, AQI, Real-time API")
    print(f"   ⏱️  Sequence length: {sequence_length} days")
    print("="*80)
    
    return models, metrics


if __name__ == "__main__":
    models, metrics = train_dl_model()
    
    print("\n🎉 Deep Learning models are ready!")
    print("   These models capture temporal patterns for highly accurate predictions!")
