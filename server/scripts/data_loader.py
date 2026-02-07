"""
Comprehensive Data Loader for Disease Prediction ML Model
Loads ALL available datasets:
- 8 City Climate Data (214k rows)
- AQI Data (12k rows)
- Global Temperature Data (8.6M rows - filtered for Indian cities)
- Population Data (30k rows)
- Climate Disasters (2k rows)
- Real-time API data integration
"""

import pandas as pd
import numpy as np
import os
import requests
from datetime import datetime, timedelta
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')
import sys
import builtins

# Redirect all prints to stderr to avoid polluting stdout (which is used for JSON output)
def print(*args, **kwargs):
    kwargs['file'] = sys.stderr
    return builtins.print(*args, **kwargs)

# API Configuration
OPENWEATHER_API_KEY = "d8582631a1293a90d7389d8f7123becc"
IQAIR_API_KEY = os.getenv('IQAIR_API_KEY', '')

# Indian Cities Configuration
INDIAN_CITIES = {
    'Delhi': {'lat': 28.6139, 'lon': 77.2090, 'code': 'delhi'},
    'Mumbai': {'lat': 19.0760, 'lon': 72.8777, 'code': 'mumbai'},
    'Chennai': {'lat': 13.0827, 'lon': 80.2707, 'code': 'chennai'},
    'Bangalore': {'lat': 12.9716, 'lon': 77.5946, 'code': 'bengaluru'},
    'Kolkata': {'lat': 22.5726, 'lon': 88.3639, 'code': 'kolkata'},
    'Pune': {'lat': 18.5204, 'lon': 73.8567, 'code': 'pune'},
    'Hyderabad': {'lat': 17.3850, 'lon': 78.4867, 'code': 'hyd'},
    'Ahmedabad': {'lat': 23.0225, 'lon': 72.5714, 'code': 'amd'},
    'Coimbatore': {'lat': 11.0168, 'lon': 76.9558, 'code': 'coimbatore'},
    'Madurai': {'lat': 9.9252, 'lon': 78.1198, 'code': 'madurai'},
    'Visakhapatnam': {'lat': 17.6868, 'lon': 83.2185, 'code': 'visakhapatnam'},
    'Vijayawada': {'lat': 16.5062, 'lon': 80.6480, 'code': 'vijayawada'}
}

class ComprehensiveDataLoader:
    def __init__(self, base_path=None):
        """Initialize data loader with base path to UsefulDataset"""
        if base_path is None:
            script_dir = Path(__file__).parent
            project_root = script_dir.parent.parent
            self.base_path = project_root / 'UsefulDataset' / 'UsefulDataset'
        else:
            self.base_path = Path(base_path)
        
        print(f"📂 Data directory: {self.base_path}")
        
    def load_city_climate_data(self):
        """Load all 8 city temperature and rainfall datasets (214k rows)"""
        print("\n🌡️  Loading City Climate Data...")
        all_city_data = []
        
        for city_name, city_info in INDIAN_CITIES.items():
            file_path = self.base_path / f"{city_info['code']}-temp-rains.csv"
            
            if file_path.exists():
                df = pd.read_csv(file_path)
                df['Date'] = pd.to_datetime(df['Date'], format='%d-%m-%Y', errors='coerce')
                df['City'] = city_name
                df['City_Code'] = city_info['code']
                df['Latitude'] = city_info['lat']
                df['Longitude'] = city_info['lon']
                
                # Clean numeric columns
                for col in ['Rain', 'Temp Max', 'Temp Min']:
                    df[col] = pd.to_numeric(df[col], errors='coerce')
                
                df = df.dropna(subset=['Date', 'Rain', 'Temp Max', 'Temp Min'])
                all_city_data.append(df)
                print(f"   ✓ {city_name}: {len(df):,} records ({df['Date'].min().year}-{df['Date'].max().year})")
            else:
                print(f"   ✗ {city_name}: File not found")
        
        combined_df = pd.concat(all_city_data, ignore_index=True)
        print(f"\n   📊 Total Climate Records: {len(combined_df):,}")
        return combined_df
    
    def load_aqi_data(self):
        """Load AQI datasets for available cities (12k rows)"""
        print("\n🌫️  Loading AQI Data...")
        all_aqi_data = []
        
        aqi_cities = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Hyderabad']
        
        for city in aqi_cities:
            file_path = self.base_path / f"{city}_AQI_Dataset.csv"
            
            if file_path.exists():
                df = pd.read_csv(file_path)
                df['City'] = city
                all_aqi_data.append(df)
                print(f"   ✓ {city}: {len(df):,} AQI records")
            else:
                print(f"   ✗ {city}: AQI file not found")
        
        if all_aqi_data:
            combined_df = pd.concat(all_aqi_data, ignore_index=True)
            print(f"\n   📊 Total AQI Records: {len(combined_df):,}")
            return combined_df
        return pd.DataFrame()
    
    def load_global_temperature_data(self, filter_indian_cities=True):
        """Load global temperature data (8.6M rows, filtered for Indian cities)"""
        print("\n🌍 Loading Global Temperature Data...")
        file_path = self.base_path / 'GlobalLandTemperaturesByCity.csv'
        
        if file_path.exists():
            # Read in chunks to handle large file
            print("   ⏳ Reading large file (8.6M rows)...")
            df = pd.read_csv(file_path)
            print(f"   ✓ Loaded {len(df):,} global records")
            
            if filter_indian_cities:
                # Filter for Indian cities
                indian_city_names = list(INDIAN_CITIES.keys())
                df_filtered = df[df['City'].isin(indian_city_names) & (df['Country'] == 'India')]
                print(f"   🇮🇳 Filtered to {len(df_filtered):,} Indian city records")
                return df_filtered
            
            return df
        else:
            print("   ✗ Global temperature file not found")
            return pd.DataFrame()
    
    def load_population_data(self):
        """Load population data (30k rows)"""
        print("\n👥 Loading Population Data...")
        file_path = self.base_path / 'unsd-citypopulation-year-both.csv'
        
        if file_path.exists():
            df = pd.read_csv(file_path)
            print(f"   ✓ Loaded {len(df):,} population records")
            return df
        else:
            print("   ✗ Population file not found")
            return pd.DataFrame()
    
    def load_climate_disasters(self):
        """Load climate disaster frequency data (2k rows)"""
        print("\n⚠️  Loading Climate Disaster Data...")
        file_path = self.base_path / 'Indicator_11_1_Physical_Risks_Climate_related_disasters_frequency_7212563912390016675.csv'
        
        if file_path.exists():
            df = pd.read_csv(file_path)
            print(f"   ✓ Loaded {len(df):,} disaster records")
            return df
        else:
            print("   ✗ Climate disaster file not found")
            return pd.DataFrame()
    
    def load_co2_emissions(self):
        """Load CO2 emissions data"""
        print("\n🏭 Loading CO2 Emissions Data...")
        file_path = self.base_path / 'co2_emissions.csv'
        
        if file_path.exists():
            df = pd.read_csv(file_path)
            print(f"   ✓ Loaded {len(df):,} emission records")
            return df
        else:
            print("   ✗ CO2 emissions file not found")
            return pd.DataFrame()
    
    def fetch_realtime_weather(self, city_name):
        """Fetch real-time weather data from OpenWeatherMap API"""
        try:
            url = "https://api.openweathermap.org/data/2.5/weather"
            params = {
                'q': f"{city_name},IN",
                'appid': OPENWEATHER_API_KEY,
                'units': 'metric'
            }
            response = requests.get(url, params=params, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                return {
                    'city': city_name,
                    'timestamp': datetime.now(),
                    'temp': data['main']['temp'],
                    'temp_min': data['main']['temp_min'],
                    'temp_max': data['main']['temp_max'],
                    'humidity': data['main']['humidity'],
                    'pressure': data['main']['pressure'],
                    'rain_1h': data.get('rain', {}).get('1h', 0),
                    'rain_3h': data.get('rain', {}).get('3h', 0),
                    'wind_speed': data['wind']['speed'],
                    'clouds': data['clouds']['all'],
                    'weather': data['weather'][0]['main'],
                    'description': data['weather'][0]['description']
                }
        except Exception as e:
            print(f"   ⚠️  Error fetching weather for {city_name}: {e}")
        return None
    
    def fetch_realtime_aqi(self, city_name):
        """Fetch real-time AQI data from IQAir API"""
        if not IQAIR_API_KEY:
            return None
            
        try:
            city_info = INDIAN_CITIES.get(city_name)
            if not city_info:
                return None
                
            url = "http://api.airvisual.com/v2/nearest_city"
            params = {
                'lat': city_info['lat'],
                'lon': city_info['lon'],
                'key': IQAIR_API_KEY
            }
            response = requests.get(url, params=params, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                pollution = data['data']['current']['pollution']
                return {
                    'city': city_name,
                    'timestamp': datetime.now(),
                    'aqi': pollution['aqius'],
                    'main_pollutant': pollution['mainus']
                }
        except Exception as e:
            print(f"   ⚠️  Error fetching AQI for {city_name}: {e}")
        return None
    
    def fetch_all_realtime_data(self):
        """Fetch real-time data for all Indian cities"""
        print("\n🔴 Fetching Real-time API Data...")
        realtime_data = []
        
        for city_name in INDIAN_CITIES.keys():
            weather = self.fetch_realtime_weather(city_name)
            aqi = self.fetch_realtime_aqi(city_name)
            
            if weather:
                if aqi:
                    weather.update({'aqi': aqi['aqi'], 'main_pollutant': aqi['main_pollutant']})
                realtime_data.append(weather)
                print(f"   ✓ {city_name}: {weather['temp']}°C, Humidity: {weather['humidity']}%")
        
        if realtime_data:
            df = pd.DataFrame(realtime_data)
            print(f"\n   📊 Fetched {len(df)} real-time records")
            return df
        return pd.DataFrame()
    
    def load_all_datasets(self, include_realtime=True):
        """Load ALL datasets - historical + real-time"""
        print("\n" + "="*80)
        print("🚀 COMPREHENSIVE DATA LOADING - ALL SOURCES")
        print("="*80)
        
        datasets = {}
        
        # Historical Data
        datasets['city_climate'] = self.load_city_climate_data()
        datasets['aqi'] = self.load_aqi_data()
        datasets['global_temp'] = self.load_global_temperature_data(filter_indian_cities=True)
        datasets['population'] = self.load_population_data()
        datasets['disasters'] = self.load_climate_disasters()
        datasets['co2'] = self.load_co2_emissions()
        
        # Real-time Data
        if include_realtime:
            datasets['realtime'] = self.fetch_all_realtime_data()
        
        # Summary
        print("\n" + "="*80)
        print("📊 DATA LOADING SUMMARY")
        print("="*80)
        total_records = 0
        for name, df in datasets.items():
            if not df.empty:
                records = len(df)
                total_records += records
                print(f"   {name:20s}: {records:>10,} rows")
        print(f"\n   {'TOTAL':20s}: {total_records:>10,} rows")
        print("="*80)
        
        return datasets


if __name__ == "__main__":
    # Test the data loader
    loader = ComprehensiveDataLoader()
    datasets = loader.load_all_datasets(include_realtime=True)
    
    print("\n✅ Data loading test complete!")
    print(f"   Loaded {len(datasets)} datasets")
    print(f"   Total records: {sum(len(df) for df in datasets.values() if not df.empty):,}")
