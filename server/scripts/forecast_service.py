"""
Disease Forecast Service
Generates future disease risk forecasts using ML models and OpenWeather forecast API
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from pathlib import Path
import json
import sys
import requests
import os

# Redirect stdout to stderr immediately to prevent any library imports from polluting stdout
# We will restore it only when printing the final JSON
original_stdout = sys.stdout
sys.stdout = sys.stderr

sys.path.append(str(Path(__file__).parent))

from prediction_service import DiseasePredictionService


class DiseaseForecastService:
    def __init__(self):
        """Initialize forecast service"""
        self.prediction_service = DiseasePredictionService()
        self.api_key = os.getenv('OPENWEATHER_API_KEY', 'd8582631a1293a90d7389d8f7123becc')
        self.base_url = 'https://api.openweathermap.org/data/2.5'
        
        # Historical climate patterns for long-term forecasting (beyond 5 days)
        self.climate_patterns = {
            'Delhi': {
                'temp_max': [21, 24, 30, 36, 40, 38, 34, 33, 33, 34, 29, 23],
                'temp_min': [7, 10, 15, 21, 25, 28, 27, 26, 25, 21, 14, 9],
                'rain': [24, 18, 18, 9, 13, 66, 211, 247, 130, 31, 3, 11]
            },
            'Mumbai': {
                'temp_max': [31, 31, 32, 33, 33, 32, 30, 29, 30, 32, 33, 32],
                'temp_min': [18, 19, 21, 24, 26, 26, 25, 25, 25, 24, 22, 19],
                'rain': [1, 1, 1, 1, 18, 498, 868, 554, 341, 125, 12, 3]
            },
            'Chennai': {
                'temp_max': [29, 31, 33, 35, 37, 38, 37, 36, 35, 32, 29, 29],
                'temp_min': [21, 22, 24, 26, 28, 29, 28, 27, 26, 25, 23, 22],
                'rain': [25, 12, 19, 29, 51, 53, 56, 84, 120, 267, 351, 141]
            },
            'Bangalore': {
                'temp_max': [27, 29, 32, 33, 33, 30, 28, 28, 28, 28, 27, 26],
                'temp_min': [15, 16, 19, 21, 22, 21, 20, 20, 20, 20, 18, 16],
                'rain': [3, 6, 12, 39, 113, 110, 88, 122, 144, 194, 51, 19]
            },
            'Kolkata': {
                'temp_max': [27, 29, 34, 36, 36, 34, 32, 32, 32, 33, 31, 27],
                'temp_min': [14, 16, 21, 25, 26, 27, 27, 27, 26, 25, 20, 15],
                'rain': [13, 22, 33, 44, 120, 297, 326, 328, 252, 185, 28, 9]
            },
            'Pune': {
                'temp_max': [30, 32, 35, 38, 38, 33, 30, 29, 29, 32, 33, 31],
                'temp_min': [12, 14, 17, 20, 23, 23, 22, 22, 22, 20, 16, 13],
                'rain': [2, 2, 3, 13, 39, 114, 187, 123, 91, 65, 19, 5]
            },
            'Hyderabad': {
                'temp_max': [29, 32, 35, 38, 39, 35, 31, 30, 31, 31, 31, 29],
                'temp_min': [15, 17, 20, 24, 26, 25, 23, 23, 23, 22, 19, 16],
                'rain': [5, 8, 14, 28, 52, 109, 164, 148, 133, 115, 28, 10]
            },
            'Ahmedabad': {
                'temp_max': [29, 31, 36, 40, 42, 39, 33, 31, 32, 36, 34, 31],
                'temp_min': [13, 15, 19, 23, 27, 27, 26, 26, 25, 24, 19, 14],
                'rain': [2, 2, 2, 4, 9, 92, 214, 285, 137, 39, 7, 3]
            }
        }
    
    def fetch_weather_forecast(self, city):
        """Fetch 5-day weather forecast from OpenWeather API"""
        try:
            url = f"{self.base_url}/forecast"
            params = {
                'q': f'{city},IN',
                'appid': self.api_key,
                'units': 'metric',
                'cnt': 40  # 5 days * 8 (3-hour intervals)
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            # Aggregate by day
            daily_forecasts = {}
            
            for item in data['list']:
                dt = datetime.fromtimestamp(item['dt'])
                date_key = dt.strftime('%Y-%m-%d')
                
                if date_key not in daily_forecasts:
                    daily_forecasts[date_key] = {
                        'temps': [],
                        'rains': [],
                        'humidity': []
                    }
                
                daily_forecasts[date_key]['temps'].append(item['main']['temp'])
                daily_forecasts[date_key]['humidity'].append(item['main']['humidity'])
                
                # Get rainfall
                rain = 0
                if 'rain' in item:
                    rain = item['rain'].get('3h', 0)
                daily_forecasts[date_key]['rains'].append(rain)
            
            # Calculate daily averages
            forecast_days = []
            for date_key in sorted(daily_forecasts.keys())[:6]:  # Max 6 days
                day_data = daily_forecasts[date_key]
                forecast_days.append({
                    'date': date_key,
                    'temp_max': max(day_data['temps']),
                    'temp_min': min(day_data['temps']),
                    'temp_avg': sum(day_data['temps']) / len(day_data['temps']),
                    'rain': sum(day_data['rains']),
                    'humidity': sum(day_data['humidity']) / len(day_data['humidity']),
                    'source': 'OpenWeather API'
                })
            
            return forecast_days
            
        except Exception as e:
            print(f"Error fetching forecast for {city}: {e}", file=sys.stderr)
            return None
    
    def generate_forecast(self, city, disease, months=12):
        """
        Generate disease risk forecast using hybrid approach:
        - Days 1-5: Real OpenWeather forecast
        - Months 1-12: Historical climate patterns
        
        Args:
            city: City name
            disease: Disease name
            months: Number of months to forecast (default 12)
        
        Returns:
            List of forecast data points
        """
        forecast = []
        month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        
        # Part 1: Use OpenWeather API for next 5 days
        weather_forecast = self.fetch_weather_forecast(city)
        
        if weather_forecast:
            for day_forecast in weather_forecast[:5]:  # First 5 days
                temp_max = day_forecast['temp_max']
                temp_min = day_forecast['temp_min']
                rain = day_forecast['rain']
                
                date = datetime.strptime(day_forecast['date'], '%Y-%m-%d')
                month = date.month - 1
                
                risk = self.prediction_service.predict_risk(
                    city=city,
                    disease=disease,
                    temp_max=temp_max,
                    temp_min=temp_min,
                    rain=rain,
                    month=month
                )
                
                forecast.append({
                    'date': day_forecast['date'],
                    'month': month_names[month],
                    'risk': risk,
                    'temp': round(day_forecast['temp_avg'], 1),
                    'temp_max': round(temp_max, 1),
                    'temp_min': round(temp_min, 1),
                    'rainfall': round(rain, 1),
                    'humidity': round(day_forecast['humidity'], 1),
                    'source': 'OpenWeather API (Real Forecast)'
                })
        
        # Part 2: Use historical patterns for remaining months
        if city in self.climate_patterns:
            climate = self.climate_patterns[city]
            current_month = datetime.now().month - 1
            
            # Start from next month after the 5-day forecast
            start_month = (current_month + 1) % 12
            
            for i in range(months - 1):  # Remaining months (excluding current)
                month = (start_month + i) % 12
                
                # Get historical climate for this month
                temp_max = climate['temp_max'][month]
                temp_min = climate['temp_min'][month]
                rain = climate['rain'][month]
                
                # Add slight variation
                temp_max *= np.random.uniform(0.95, 1.05)
                temp_min *= np.random.uniform(0.95, 1.05)
                rain *= np.random.uniform(0.9, 1.1)
                
                # Calculate approximate date
                future_date = datetime.now() + timedelta(days=5 + (i * 30))
                
                risk = self.prediction_service.predict_risk(
                    city=city,
                    disease=disease,
                    temp_max=temp_max,
                    temp_min=temp_min,
                    rain=rain,
                    month=month
                )
                
                forecast.append({
                    'date': future_date.strftime('%Y-%m-%d'),
                    'month': month_names[month],
                    'risk': risk,
                    'temp': round((temp_max + temp_min) / 2, 1),
                    'temp_max': round(temp_max, 1),
                    'temp_min': round(temp_min, 1),
                    'rainfall': round(rain, 1),
                    'humidity': 50,  # Estimated
                    'source': 'Historical Climate Pattern'
                })
        
        return forecast
    
    def generate_all_diseases_forecast(self, city, months=12):
        """Generate 12-month forecast for all diseases using hybrid approach"""
        diseases = ['Malaria', 'Dengue', 'Cholera', 'Heat Stroke', 'Respiratory Diseases']
        
        forecasts = {}
        for disease in diseases:
            forecasts[disease] = self.generate_forecast(city, disease, months)
        
        return {
            'city': city,
            'forecasts': forecasts,
            'forecast_type': 'Hybrid (5-day API + Historical)',
            'weather_source': 'OpenWeather API + Historical Climate Data',
            'timestamp': datetime.now().isoformat()
        }


# CLI usage
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Disease Forecast Service')
    parser.add_argument('--city', type=str, required=True, help='City name')
    parser.add_argument('--disease', type=str, help='Disease name (optional)')
    parser.add_argument('--months', type=int, default=6, help='Number of months to forecast')
    
    args = parser.parse_args()
    
    service = DiseaseForecastService()
    
    if args.disease:
        forecast = service.generate_forecast(args.city, args.disease, args.months)
        print(json.dumps(forecast, indent=2), file=sys.__stdout__)
    else:
        result = service.generate_all_diseases_forecast(args.city, args.months)
        print(json.dumps(result, indent=2), file=sys.__stdout__)
