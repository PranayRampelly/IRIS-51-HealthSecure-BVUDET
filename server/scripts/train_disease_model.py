#!/usr/bin/env python3
"""
BioAura Disease Prediction - Machine Learning Training Pipeline
Trains a Random Forest Classifier to predict disease outbreaks based on historical climate data.
"""

import pandas as pd
import numpy as np
import json
import os
import joblib
from datetime import datetime
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# Reuse epidemiological parameters for ground truth generation (Weak Supervision)
DISEASE_PARAMS = {
    'Malaria': {
        'optimal_temp_min': 20, 'optimal_temp_max': 30,
        'rainfall_threshold': 100, 'rainfall_weight': 0.4, 'temp_weight': 0.4, 'seasonal_weight': 0.2,
        'peak_months': [6, 7, 8, 9], 'rainfall_correlation': 'positive'
    },
    'Dengue': {
        'optimal_temp_min': 22, 'optimal_temp_max': 32,
        'rainfall_threshold': 100, 'rainfall_weight': 0.4, 'temp_weight': 0.4, 'seasonal_weight': 0.2,
        'peak_months': [6, 7, 8, 9, 10], 'rainfall_correlation': 'positive'
    },
    'Cholera': {
        'optimal_temp_min': 15, 'optimal_temp_max': 35,
        'rainfall_threshold': 150, 'rainfall_weight': 0.5, 'temp_weight': 0.3, 'seasonal_weight': 0.2,
        'peak_months': [5, 6, 7, 8], 'rainfall_correlation': 'positive'
    },
    'Heat Stroke': {
        'optimal_temp_min': 35, 'optimal_temp_max': 50,
        'rainfall_threshold': 50, 'rainfall_weight': 0.3, 'temp_weight': 0.5, 'seasonal_weight': 0.2,
        'peak_months': [3, 4, 5], 'rainfall_correlation': 'negative'
    },
    'Respiratory Diseases': {
        'optimal_temp_min': 10, 'optimal_temp_max': 25,
        'rainfall_threshold': 50, 'rainfall_weight': 0.2, 'temp_weight': 0.5, 'seasonal_weight': 0.3,
        'peak_months': [10, 11, 0, 1], 'rainfall_correlation': 'positive'
    }
}

CITIES = {
    'delhi': 'Delhi', 'mumbai': 'Mumbai', 'chennai': 'Chennai',
    'bengaluru': 'Bangalore', 'kolkata': 'Kolkata', 'pune': 'Pune',
    'hyd': 'Hyderabad', 'amd': 'Ahmedabad'
}

def calculate_risk_score(row, disease):
    """Calculate a synthetic risk score to use as ground truth label"""
    params = DISEASE_PARAMS[disease]
    risk = 0
    
    # Temp Risk
    temp_avg = (row['Temp Max'] + row['Temp Min']) / 2
    temp_mid = (params['optimal_temp_min'] + params['optimal_temp_max']) / 2
    temp_range = params['optimal_temp_max'] - params['optimal_temp_min']
    
    if params['optimal_temp_min'] <= temp_avg <= params['optimal_temp_max']:
        temp_score = 100 - (abs(temp_avg - temp_mid) / (temp_range / 2)) * 30
        risk += temp_score * params['temp_weight']
    else:
        deviation = min(abs(temp_avg - temp_mid) - (temp_range / 2), 20)
        temp_score = max(0, 70 - deviation * 3)
        risk += temp_score * params['temp_weight']
        
    # Rain Risk
    rain = row['Rain']
    if params['rainfall_correlation'] == 'positive':
        rainfall_score = min(100, (rain / params['rainfall_threshold']) * 100)
        risk += rainfall_score * params['rainfall_weight']
    else:
        rainfall_score = max(0, 100 - (rain / params['rainfall_threshold']) * 100)
        risk += rainfall_score * params['rainfall_weight']
        
    # Seasonal Risk
    month = row['Month']
    is_peak_month = month in params['peak_months']
    seasonal_score = 100 if is_peak_month else 30
    risk += seasonal_score * params['seasonal_weight']
    
    return min(max(round(risk), 0), 100)

def get_risk_label(score):
    if score > 70: return 2 # High
    if score > 40: return 1 # Medium
    return 0 # Low

def load_and_prepare_data(data_path):
    print("🔄 Loading and preparing training data...")
    all_data = []
    
    for city_code, city_name in CITIES.items():
        file_path = os.path.join(data_path, f'{city_code}-temp-rains.csv')
        if not os.path.exists(file_path):
            continue
            
        df = pd.read_csv(file_path)
        
        # Preprocessing
        df['Date'] = pd.to_datetime(df['Date'], format='%d-%m-%Y', errors='coerce')
        df['Month'] = df['Date'].dt.month - 1
        df['City_Code'] = list(CITIES.keys()).index(city_code)
        
        # Force numeric types
        for col in ['Rain', 'Temp Max', 'Temp Min']:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        
        # Clean data
        df = df.dropna(subset=['Rain', 'Temp Max', 'Temp Min', 'Month'])
        
        # Add to collection
        all_data.append(df)
        
    combined_df = pd.concat(all_data, ignore_index=True)
    print(f"✅ Loaded {len(combined_df)} total climate records")
    return combined_df

def train_models(df, output_dir):
    metrics = {}
    
    for disease in DISEASE_PARAMS.keys():
        print(f"\n🤖 Training Random Forest Model for {disease}...")
        
        # 1. Generate Synthetic Labels (Weak Supervision)
        # We calculate the risk score for each day to create our "Target" variable
        print(f"   Generating ground truth labels...")
        df['Risk_Score'] = df.apply(lambda row: calculate_risk_score(row, disease), axis=1)
        df['Target'] = df['Risk_Score'].apply(get_risk_label)
        
        # 2. Prepare Features (X) and Target (y)
        X = df[['Rain', 'Temp Max', 'Temp Min', 'Month', 'City_Code']]
        y = df['Target']
        
        # 3. Split Data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # 4. Train Random Forest
        rf_model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
        rf_model.fit(X_train, y_train)
        
        # 5. Evaluate
        y_pred = rf_model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        report = classification_report(y_test, y_pred, output_dict=True)
        
        print(f"   🎯 Model Accuracy: {accuracy:.2%}")
        
        # 6. Feature Importance
        feature_importance = dict(zip(X.columns, rf_model.feature_importances_))
        top_feature = max(feature_importance, key=feature_importance.get)
        print(f"   🔑 Top Predictor: {top_feature} ({feature_importance[top_feature]:.2%})")
        
        # 7. Save Model & Metrics
        model_filename = f'rf_model_{disease.lower().replace(" ", "_")}.pkl'
        joblib.dump(rf_model, os.path.join(output_dir, model_filename))
        
        metrics[disease] = {
            'accuracy': round(accuracy * 100, 1),
            'precision': round(report['weighted avg']['precision'] * 100, 1),
            'recall': round(report['weighted avg']['recall'] * 100, 1),
            'top_feature': top_feature,
            'feature_importance': {k: round(v*100, 1) for k, v in feature_importance.items()},
            'model_file': model_filename,
            'samples': len(df)
        }
        
    # Save overall metrics
    with open(os.path.join(output_dir, 'ml_model_metrics.json'), 'w') as f:
        json.dump(metrics, f, indent=2)
        
    return metrics

def main():
    script_dir = Path(__file__).parent
    project_root = script_dir.parent.parent
    data_path = project_root / 'UsefulDataset' / 'UsefulDataset'
    output_dir = script_dir / 'models'
    
    # Create models directory
    output_dir.mkdir(exist_ok=True)
    
    if not data_path.exists():
        print(f"❌ Data path not found: {data_path}")
        return

    # Load Data
    df = load_and_prepare_data(str(data_path))
    
    # Train Models
    metrics = train_models(df, str(output_dir))
    
    print("\n✨ All models trained successfully!")
    print(f"📂 Models saved to: {output_dir}")

if __name__ == '__main__':
    main()
