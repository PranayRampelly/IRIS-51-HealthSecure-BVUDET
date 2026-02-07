"""
Deep Learning Disease Prediction Service
Uses trained LSTM/GRU models for temporal disease risk prediction
"""

import pandas as pd
import numpy as np
import joblib
import json
from pathlib import Path
from datetime import datetime, timedelta
import sys

# Redirect stdout to stderr to prevent pollution
original_stdout = sys.stdout
sys.stdout = sys.stderr

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))

from data_loader import ComprehensiveDataLoader
from feature_engineering import FeatureEngineer

# Try to import TensorFlow
try:
    import tensorflow as tf
    from tensorflow import keras
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False
    print("TensorFlow not available. Deep Learning predictions will not work.", file=sys.stderr)


class DLPredictionService:
    def __init__(self, models_dir='models_dl'):
        """Initialize DL prediction service with trained LSTM/GRU models"""
        if not TF_AVAILABLE:
            raise ImportError("TensorFlow is required for DL predictions")
        
        self.models_dir = Path(__file__).parent / models_dir
        self.loader = ComprehensiveDataLoader()
        self.engineer = FeatureEngineer()
        
        # Load models and metadata
        self.models = {}
        self.metadata = {}
        self.load_models()
    
    def load_models(self):
        """Load all trained DL models"""
        diseases = ['Malaria', 'Dengue', 'Cholera', 'Heat Stroke', 'Respiratory Diseases']
        
        # Load metadata
        metadata_file = self.models_dir / 'model_metadata.json'
        if metadata_file.exists():
            with open(metadata_file, 'r') as f:
                self.metadata = json.load(f)
        
        # Load each model
        for disease in diseases:
            if disease in self.metadata:
                model_path = Path(self.metadata[disease]['model_path'])
                scaler_path = self.models_dir / f"{disease.lower().replace(' ', '_')}_scaler.pkl"
                
                if model_path.exists() and scaler_path.exists():
                    try:
                        self.models[disease] = {
                            'model': keras.models.load_model(str(model_path)),
                            'scaler': joblib.load(scaler_path),
                            'feature_cols': self.metadata[disease]['feature_cols'],
                            'sequence_length': self.metadata[disease]['sequence_length']
                        }
                    except Exception as e:
                        print(f"Error loading {disease} model: {e}", file=sys.stderr)
    
    def prepare_sequence(self, city, disease, historical_days=30):
        """
        Prepare sequence data for DL prediction
        
        Args:
            city: City name
            disease: Disease name
            historical_days: Number of historical days to use (default: 30)
        
        Returns:
            Prepared sequence array or None if insufficient data
        """
        if disease not in self.models:
            return None
        
        model_data = self.models[disease]
        sequence_length = model_data['sequence_length']
        feature_cols = model_data['feature_cols']
        scaler = model_data['scaler']
        
        # Fetch recent historical data
        # For now, use live data + synthetic historical pattern
        live_data = self.loader.fetch_all_realtime_data()
        
        if live_data.empty:
            return None
        
        city_data = live_data[live_data['city'] == city]
        if city_data.empty:
            return None
        
        record = city_data.iloc[0]
        
        # Create synthetic historical sequence (in production, use actual historical data)
        # This simulates the past 30 days with slight variations
        historical_data = []
        for i in range(sequence_length):
            day_offset = sequence_length - i
            variation = np.random.normal(1.0, 0.05)  # 5% variation
            
            data_point = {
                'Date': datetime.now() - timedelta(days=day_offset),
                'City': city,
                'Temp Max': record['temp_max'] * variation,
                'Temp Min': record['temp_min'] * variation,
                'Rain': max(0, record.get('rain_1h', 0) + record.get('rain_3h', 0)) * variation,
                'month': (datetime.now() - timedelta(days=day_offset)).month
            }
            
            if 'aqi' in record:
                data_point['aqi_avg'] = record['aqi'] * variation
            
            historical_data.append(data_point)
        
        # Create DataFrame and engineer features
        df = pd.DataFrame(historical_data)
        df = self.engineer.engineer_all_features(df)
        
        # Select and scale features
        X = df[feature_cols].fillna(0).values
        X_scaled = scaler.transform(X)
        
        # Reshape for LSTM/GRU: (1, sequence_length, features)
        X_seq = X_scaled.reshape(1, sequence_length, len(feature_cols))
        
        return X_seq
    
    def predict_risk_dl(self, city, disease):
        """
        Predict disease risk using DL model
        
        Args:
            city: City name
            disease: Disease name
        
        Returns:
            Risk percentage (0-100) or None if prediction fails
        """
        if disease not in self.models:
            return None
        
        # Prepare sequence
        X_seq = self.prepare_sequence(city, disease)
        
        if X_seq is None:
            return None
        
        # Get model
        model = self.models[disease]['model']
        
        # Predict
        try:
            prob = model.predict(X_seq, verbose=0)[0][0]
            risk = int(prob * 100)
            return risk
        except Exception as e:
            print(f"Prediction error for {disease} in {city}: {e}", file=sys.stderr)
            return None
    
    def predict_all_diseases_dl(self, city):
        """Predict risk for all diseases using DL models"""
        results = {}
        
        for disease in self.models.keys():
            risk = self.predict_risk_dl(city, disease)
            if risk is not None:
                results[disease] = risk
        
        return results
    
    def predict_from_live_data_dl(self, city):
        """Predict using live weather data with DL models"""
        # Fetch live data for metadata
        live_data = self.loader.fetch_all_realtime_data()
        
        if live_data.empty:
            return None
        
        city_data = live_data[live_data['city'] == city]
        if city_data.empty:
            return None
        
        record = city_data.iloc[0]
        
        # Predict for all diseases
        results = self.predict_all_diseases_dl(city)
        
        if not results:
            return None
        
        return {
            'city': city,
            'predictions': results,
            'model_type': 'deep_learning',
            'weather_data': {
                'temp_max': float(record['temp_max']),
                'temp_min': float(record['temp_min']),
                'rain': float(record.get('rain_1h', 0) + record.get('rain_3h', 0)),
                'humidity': float(record.get('humidity', 0)),
                'aqi': float(record.get('aqi', 0)) if 'aqi' in record else None
            },
            'timestamp': datetime.now().isoformat()
        }


# CLI usage
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='DL Disease Prediction Service')
    parser.add_argument('--city', type=str, required=True, help='City name')
    parser.add_argument('--disease', type=str, help='Disease name (optional)')
    
    args = parser.parse_args()
    
    try:
        service = DLPredictionService()
        
        if args.disease:
            risk = service.predict_risk_dl(args.city, args.disease)
            if risk is not None:
                print(json.dumps({
                    'disease': args.disease,
                    'city': args.city,
                    'risk': risk,
                    'model_type': 'deep_learning',
                    'message': f"{args.disease} risk in {args.city}: {risk}% (DL Model)"
                }, indent=2), file=sys.__stdout__)
            else:
                print(json.dumps({'error': f"Could not predict {args.disease} for {args.city}"}), file=sys.__stdout__)
        else:
            result = service.predict_from_live_data_dl(args.city)
            if result:
                print(json.dumps(result, indent=2), file=sys.__stdout__)
            else:
                print(json.dumps({'error': f"No data available for {args.city}"}), file=sys.__stdout__)
    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.__stdout__)
