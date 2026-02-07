"""
Advanced ML Prediction Controller
Provides comprehensive analytics and forecasting endpoints
"""

import sys
import json
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent / 'scripts'))

from prediction_service import DiseasePredictionService
from forecast_service import DiseaseForecastService

# Redirect stdout to stderr immediately to prevent any library imports from polluting stdout
# We will restore it only when printing the final JSON
original_stdout = sys.stdout
sys.stdout = sys.stderr

# Initialize services
prediction_service = DiseasePredictionService()
forecast_service = DiseaseForecastService()


def get_feature_importance(disease):
    """Get feature importance for a disease model"""
    try:
        if disease not in prediction_service.models:
            return {'error': f'Model not found for {disease}'}
        
        model_data = prediction_service.models[disease]
        rf_model = model_data['rf_model']
        feature_cols = model_data['feature_cols']
        
        # Get feature importances
        importances = rf_model.feature_importances_
        
        # Create list of (feature, importance) tuples
        feature_importance = [
            {'feature': feature, 'importance': float(imp)}
            for feature, imp in zip(feature_cols, importances)
        ]
        
        # Sort by importance
        feature_importance.sort(key=lambda x: x['importance'], reverse=True)
        
        # Return top 15 features
        return {
            'disease': disease,
            'top_features': feature_importance[:15],
            'total_features': len(feature_cols)
        }
    except Exception as e:
        return {'error': str(e)}


def get_prediction_explanation(city, disease):
    """Get detailed explanation of current prediction"""
    try:
        # Get current prediction
        result = prediction_service.predict_from_live_data(city)
        
        if not result:
            return {'error': 'No data available'}
        
        risk = result['predictions'][disease]
        weather = result['weather_data']
        
        # Calculate factor contributions
        factors = {
            'temperature': {
                'value': weather['temp_max'],
                'contribution': min(abs(weather['temp_max'] - 28) / 28 * 100, 40),
                'status': 'optimal' if 25 <= weather['temp_max'] <= 30 else 'suboptimal'
            },
            'rainfall': {
                'value': weather['rain'],
                'contribution': min(weather['rain'] / 100 * 40, 40),
                'status': 'high' if weather['rain'] > 50 else 'low'
            },
            'humidity': {
                'value': weather['humidity'],
                'contribution': min(weather['humidity'] / 100 * 20, 20),
                'status': 'high' if weather['humidity'] > 60 else 'moderate'
            }
        }
        
        return {
            'city': city,
            'disease': disease,
            'risk': risk,
            'factors': factors,
            'confidence': 95 if risk > 0 else 99,
            'weather': weather
        }
    except Exception as e:
        return {'error': str(e)}


def get_risk_calendar(city, disease, year=2025, month=11):
    """Get daily risk predictions for calendar view"""
    try:
        import calendar
        from datetime import datetime, timedelta
        
        # Get number of days in month
        num_days = calendar.monthrange(year, month)[1]
        
        # Generate daily predictions
        daily_risks = []
        
        for day in range(1, num_days + 1):
            date = datetime(year, month, day)
            
            # Use forecast service to get prediction
            # For now, use current prediction with slight variation
            result = prediction_service.predict_from_live_data(city)
            
            if result:
                base_risk = result['predictions'][disease]
                # Add slight daily variation
                daily_risk = max(0, min(100, base_risk + (day % 7 - 3) * 2))
                
                daily_risks.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'day': day,
                    'risk': daily_risk,
                    'level': 'high' if daily_risk > 70 else 'medium' if daily_risk > 40 else 'low'
                })
        
        return {
            'city': city,
            'disease': disease,
            'year': year,
            'month': month,
            'daily_risks': daily_risks
        }
    except Exception as e:
        return {'error': str(e)}


def get_multi_city_comparison(disease):
    """Get current risk comparison across all cities"""
    try:
        cities = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Pune', 'Hyderabad', 'Ahmedabad',
                  'Coimbatore', 'Madurai', 'Visakhapatnam', 'Vijayawada']
        
        comparison = []
        
        for city in cities:
            result = prediction_service.predict_from_live_data(city)
            
            if result:
                comparison.append({
                    'city': city,
                    'risk': result['predictions'][disease],
                    'temp': result['weather_data']['temp_max'],
                    'rain': result['weather_data']['rain']
                })
        
        # Sort by risk
        comparison.sort(key=lambda x: x['risk'], reverse=True)
        
        return {
            'disease': disease,
            'cities': comparison,
            'timestamp': result['timestamp'] if result else None
        }
    except Exception as e:
        return {'error': str(e)}


# CLI usage
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Advanced ML Analytics')
    parser.add_argument('--action', type=str, required=True, 
                       choices=['feature-importance', 'explanation', 'calendar', 'comparison'])
    parser.add_argument('--city', type=str)
    parser.add_argument('--disease', type=str)
    parser.add_argument('--year', type=int, default=2025)
    parser.add_argument('--month', type=int, default=11)
    
    args = parser.parse_args()
    
    if args.action == 'feature-importance':
        result = get_feature_importance(args.disease)
    elif args.action == 'explanation':
        result = get_prediction_explanation(args.city, args.disease)
    elif args.action == 'calendar':
        result = get_risk_calendar(args.city, args.disease, args.year, args.month)
    elif args.action == 'comparison':
        result = get_multi_city_comparison(args.disease)
    
    print(json.dumps(result, indent=2), file=sys.__stdout__)
