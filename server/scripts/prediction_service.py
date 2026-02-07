"""
Disease Prediction API Service
Uses trained ML models to predict disease risks
"""

import pandas as pd
import numpy as np
import joblib
import json
from pathlib import Path
from datetime import datetime
import sys

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))

from data_loader import ComprehensiveDataLoader
from feature_engineering import FeatureEngineer


class DiseasePredictionService:
    def __init__(self, models_dir='models_comprehensive'):
        """Initialize prediction service with trained models"""
        self.models_dir = Path(__file__).parent / models_dir
        self.loader = ComprehensiveDataLoader()
        self.engineer = FeatureEngineer()
        
        # Load all models
        self.models = {}
        self.load_models()
        
        # Silent init - no print
    
    def load_models(self):
        """Load all trained models"""
        diseases = ['Malaria', 'Dengue', 'Cholera', 'Heat Stroke', 'Respiratory Diseases']
        
        for disease in diseases:
            model_file = self.models_dir / f"{disease.lower().replace(' ', '_')}_model.pkl"
            if model_file.exists():
                self.models[disease] = joblib.load(model_file)
    
    def predict_risk(self, city, disease, temp_max, temp_min, rain, month=None, aqi=None):
        """
        Predict disease risk using trained ML model
        
        Args:
            city: City name
            disease: Disease name
            temp_max: Maximum temperature
            temp_min: Minimum temperature
            rain: Rainfall in mm
            month: Month (0-11), defaults to current month
            aqi: Air Quality Index (optional)
        
        Returns:
            Risk percentage (0-100)
        """
        if disease not in self.models:
            return 0
        
        # Get current month if not provided
        if month is None:
            month = datetime.now().month - 1  # 0-indexed
        
        # Create input dataframe
        data = {
            'Date': [datetime.now()],
            'City': [city],
            'Temp Max': [temp_max],
            'Temp Min': [temp_min],
            'Rain': [rain],
            'month': [month]
        }
        
        if aqi is not None:
            data['aqi_avg'] = [aqi]
        
        df = pd.DataFrame(data)
        
        # Engineer features
        df = self.engineer.engineer_all_features(df)
        
        # Get model and features
        model_data = self.models[disease]
        rf_model = model_data['rf_model']
        scaler = model_data['scaler']
        feature_cols = model_data['feature_cols']
        
        # Prepare features - ensure all required columns exist
        X = df.reindex(columns=feature_cols, fill_value=0)
        X_scaled = scaler.transform(X)
        
        # Get prediction probability
        prob = rf_model.predict_proba(X_scaled)[0][1]  # Probability of positive class
        
        # Convert to risk percentage (0-100)
        risk = int(prob * 100)
        
        return risk
    
    def predict_all_diseases(self, city, temp_max, temp_min, rain, month=None, aqi=None):
        """Predict risk for all diseases"""
        results = {}
        
        for disease in self.models.keys():
            risk = self.predict_risk(city, disease, temp_max, temp_min, rain, month, aqi)
            results[disease] = risk
        
        return results
    
    def predict_from_live_data(self, city):
        """Predict using live weather data"""
        # Fetch live data
        live_data = self.loader.fetch_all_realtime_data()
        
        if live_data.empty:
            return None
        
        # Filter for city
        city_data = live_data[live_data['city'] == city]
        
        if city_data.empty:
            return None
        
        # Get latest record
        record = city_data.iloc[0]
        
        # Predict for all diseases
        results = self.predict_all_diseases(
            city=city,
            temp_max=record['temp_max'],
            temp_min=record['temp_min'],
            rain=record.get('rain_1h', 0) + record.get('rain_3h', 0),
            aqi=record.get('aqi', None)
        )
        
        return {
            'city': city,
            'predictions': results,
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
    
    parser = argparse.ArgumentParser(description='Disease Prediction Service')
    parser.add_argument('--city', type=str, required=True, help='City name')
    parser.add_argument('--disease', type=str, help='Disease name (optional, predicts all if not provided)')
    parser.add_argument('--temp-max', type=float, help='Maximum temperature')
    parser.add_argument('--temp-min', type=float, help='Minimum temperature')
    parser.add_argument('--rain', type=float, help='Rainfall in mm')
    parser.add_argument('--live', action='store_true', help='Use live weather data')
    
    args = parser.parse_args()
    
    service = DiseasePredictionService()
    
    if args.live:
        # Use live data
        result = service.predict_from_live_data(args.city)
        if result:
            print(json.dumps(result, indent=2))
        else:
            print(json.dumps({'error': f"No live data available for {args.city}"}))
    else:
        # Use provided data
        if args.disease:
            risk = service.predict_risk(
                city=args.city,
                disease=args.disease,
                temp_max=args.temp_max,
                temp_min=args.temp_min,
                rain=args.rain
            )
            print(json.dumps({
                'disease': args.disease,
                'city': args.city,
                'risk': risk,
                'message': f"{args.disease} risk in {args.city}: {risk}%"
            }))
        else:
            results = service.predict_all_diseases(
                city=args.city,
                temp_max=args.temp_max,
                temp_min=args.temp_min,
                rain=args.rain
            )
            print(json.dumps(results, indent=2))
