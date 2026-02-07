#!/usr/bin/env python3
"""
BioAura Disease Prediction Data Processor - Fixed Version
Processes real climate data from ALL 12 Indian cities to generate disease risk predictions
Based on 70+ years of historical temperature and rainfall data (1951-2024)
"""

import pandas as pd
import json
import os
from datetime import datetime
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# Disease parameters based on epidemiological research
DISEASE_PARAMS = {
    'Malaria': {
        'optimal_temp_min': 20,
        'optimal_temp_max': 30,
        'rainfall_threshold': 100,
        'rainfall_weight': 0.4,
        'temp_weight': 0.4,
        'seasonal_weight': 0.2,
        'peak_months': [6, 7, 8, 9],  # July-October (0-indexed)
        'rainfall_correlation': 'positive'
    },
    'Dengue': {
        'optimal_temp_min': 22,
        'optimal_temp_max': 32,
        'rainfall_threshold': 100,
        'rainfall_weight': 0.4,
        'temp_weight': 0.4,
        'seasonal_weight': 0.2,
        'peak_months': [6, 7, 8, 9, 10],  # July-November
        'rainfall_correlation': 'positive'
    },
    'Cholera': {
        'optimal_temp_min': 15,
        'optimal_temp_max': 35,
        'rainfall_threshold': 150,
        'rainfall_weight': 0.5,
        'temp_weight': 0.3,
        'seasonal_weight': 0.2,
        'peak_months': [5, 6, 7, 8],  # June-September
        'rainfall_correlation': 'positive'
    },
    'Heat Stroke': {
        'optimal_temp_min': 35,
        'optimal_temp_max': 50,
        'rainfall_threshold': 50,
        'rainfall_weight': 0.3,
        'temp_weight': 0.5,
        'seasonal_weight': 0.2,
        'peak_months': [3, 4, 5],  # April-June
        'rainfall_correlation': 'negative'
    },
    'Respiratory Diseases': {
        'optimal_temp_min': 10,
        'optimal_temp_max': 25,
        'rainfall_threshold': 50,
        'rainfall_weight': 0.2,
        'temp_weight': 0.5,
        'seasonal_weight': 0.3,
        'peak_months': [10, 11, 0, 1],  # November-February
        'rainfall_correlation': 'positive'
    }
}

CITIES = {
    'delhi': 'Delhi',
    'mumbai': 'Mumbai',
    'chennai': 'Chennai',
    'bengaluru': 'Bangalore',
    'kolkata': 'Kolkata',
    'pune': 'Pune',
    'hyd': 'Hyderabad',
    'amd': 'Ahmedabad',
    'coimbatore': 'Coimbatore',
    'madurai': 'Madurai',
    'visakhapatnam': 'Visakhapatnam',
    'vijayawada': 'Vijayawada'
}

def process_city_data(city_code, data_path):
    """Process climate data for a single city"""
    file_path = os.path.join(data_path, f'{city_code}-temp-rains.csv')
    
    if not os.path.exists(file_path):
        print(f"⚠️  File not found: {file_path}")
        return None
    
    print(f"📊 Processing {CITIES[city_code]}...")
    
    try:
        # Read CSV file
        df = pd.read_csv(file_path)
        print(f"   ✓ Loaded {len(df)} records")
        
        # Parse date and extract month
        df['Date'] = pd.to_datetime(df['Date'], format='%d-%m-%Y', errors='coerce')
        df['Month'] = df['Date'].dt.month - 1  # 0-indexed
        
        # Convert numeric columns, coercing errors to NaN
        df['Rain'] = pd.to_numeric(df['Rain'], errors='coerce')
        df['Temp Max'] = pd.to_numeric(df['Temp Max'], errors='coerce')
        df['Temp Min'] = pd.to_numeric(df['Temp Min'], errors='coerce')
        
        # Drop rows with NaN values
        df = df.dropna(subset=['Month', 'Rain', 'Temp Max', 'Temp Min'])
        
        # Calculate monthly averages
        monthly_data = []
        for month in range(12):
            month_df = df[df['Month'] == month]
            
            if len(month_df) > 0:
                avg_rain = month_df['Rain'].mean()
                avg_temp_max = month_df['Temp Max'].mean()
                avg_temp_min = month_df['Temp Min'].mean()
                avg_temp = (avg_temp_max + avg_temp_min) / 2
                
                monthly_data.append({
                    'month': month,
                    'rain': round(avg_rain, 2),
                    'tempMax': round(avg_temp_max, 2),
                    'tempMin': round(avg_temp_min, 2),
                    'tempAvg': round(avg_temp, 2)
                })
            else:
                monthly_data.append({
                    'month': month,
                    'rain': 0,
                    'tempMax': 0,
                    'tempMin': 0,
                    'tempAvg': 0
                })
        
        print(f"   ✓ Calculated 12 months of averages")
        return monthly_data
    
    except Exception as e:
        print(f"❌ Error processing {CITIES[city_code]}: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

def calculate_disease_risk(climate_data, disease, month):
    """Calculate disease risk based on climate data"""
    if not climate_data or month >= len(climate_data):
        return 0
    
    month_data = climate_data[month]
    rain = month_data['rain']
    temp_avg = month_data['tempAvg']
    
    params = DISEASE_PARAMS[disease]
    risk = 0
    
    # Temperature risk (40% or 50%)
    temp_mid = (params['optimal_temp_min'] + params['optimal_temp_max']) / 2
    temp_range = params['optimal_temp_max'] - params['optimal_temp_min']
    
    if params['optimal_temp_min'] <= temp_avg <= params['optimal_temp_max']:
        # Within optimal range
        temp_score = 100 - (abs(temp_avg - temp_mid) / (temp_range / 2)) * 30
        risk += temp_score * params['temp_weight']
    else:
        # Outside optimal range
        deviation = min(abs(temp_avg - temp_mid) - (temp_range / 2), 20)
        temp_score = max(0, 70 - deviation * 3)
        risk += temp_score * params['temp_weight']
    
    # Rainfall risk (30-50%)
    if params['rainfall_correlation'] == 'positive':
        # More rain = more risk
        rainfall_score = min(100, (rain / params['rainfall_threshold']) * 100)
        risk += rainfall_score * params['rainfall_weight']
    else:
        # More rain = less risk (heat stroke)
        rainfall_score = max(0, 100 - (rain / params['rainfall_threshold']) * 100)
        risk += rainfall_score * params['rainfall_weight']
    
    # Seasonal risk (20-30%)
    is_peak_month = month in params['peak_months']
    seasonal_score = 100 if is_peak_month else 30
    risk += seasonal_score * params['seasonal_weight']
    
    return min(max(round(risk), 0), 100)

def main():
    """Main processing function"""
    print("🚀 Starting BioAura Disease Prediction Data Processing\n")
    
    # Get data path - UsefulDataset/UsefulDataset (nested structure)
    script_dir = Path(__file__).parent
    project_root = script_dir.parent.parent
    data_path = project_root / 'UsefulDataset' / 'UsefulDataset'
    
    print(f"📁 Data directory: {data_path}")
    print(f"📁 Data directory exists: {data_path.exists()}\n")
    
    if not data_path.exists():
        print(f"❌ Data directory not found at: {data_path}")
        print(f"   Please check the path and try again.")
        return
    
    # Process all cities
    climate_data = {}
    for city_code, city_name in CITIES.items():
        city_data = process_city_data(city_code, str(data_path))
        if city_data:
            climate_data[city_name] = city_data
    
    print(f"\n✅ Processed {len(climate_data)} cities\n")
    
    # Calculate disease risks
    print("🦠 Calculating disease risks...\n")
    disease_risks = {}
    
    for city_name, city_climate in climate_data.items():
        disease_risks[city_name] = {}
        for disease in DISEASE_PARAMS.keys():
            disease_risks[city_name][disease] = []
            for month in range(12):
                risk = calculate_disease_risk(city_climate, disease, month)
                disease_risks[city_name][disease].append(risk)
    
    # Prepare output
    output_data = {
        'climateData': climate_data,
        'diseaseRisks': disease_risks,
        'metadata': {
            'cities': list(climate_data.keys()),
            'diseases': list(DISEASE_PARAMS.keys()),
            'generatedAt': datetime.now().isoformat(),
            'dataSource': 'Real historical climate data from UsefulDataset (1951-2024)',
            'description': 'Disease risk predictions based on actual temperature and rainfall patterns',
            'totalRecords': sum(len(data) for data in climate_data.values()),
            'yearsOfData': '70+ years (1951-2024)'
        }
    }
    
    # Save to JSON
    output_path = script_dir / 'processed_climate_data.json'
    with open(output_path, 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print(f"💾 Saved processed data to: {output_path}")
    print(f"\n📈 Summary:")
    print(f"   Cities: {len(climate_data)}")
    print(f"   Diseases: {len(DISEASE_PARAMS)}")
    print(f"   Total monthly records: {sum(len(data) for data in climate_data.values())}")
    print(f"   Risk calculations: {len(climate_data) * len(DISEASE_PARAMS) * 12}")
    
    # Print sample data
    print(f"\n📊 Sample Risk Data (Delhi, January):")
    if 'Delhi' in disease_risks:
        for disease, risks in disease_risks['Delhi'].items():
            print(f"   {disease}: {risks[0]}% risk")
    
    print("\n✅ Data processing completed successfully!")

if __name__ == '__main__':
    main()
