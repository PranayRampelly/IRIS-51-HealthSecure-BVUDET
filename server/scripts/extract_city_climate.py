#!/usr/bin/env python3
"""
Extract Climate Data for New Cities
Extracts temperature data from GlobalLandTemperaturesByCity.csv
and generates rainfall estimates for Tamil Nadu and Andhra Pradesh cities
"""

import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime

# New cities to add
NEW_CITIES = {
    'Coimbatore': {'state': 'Tamil Nadu', 'monsoon_pattern': 'southwest_northeast'},
    'Madurai': {'state': 'Tamil Nadu', 'monsoon_pattern': 'southwest_northeast'},
    'Visakhapatnam': {'state': 'Andhra Pradesh', 'monsoon_pattern': 'southwest'},
    'Vijayawada': {'state': 'Andhra Pradesh', 'monsoon_pattern': 'southwest'}
}

# Rainfall patterns based on Indian monsoon (monthly averages in mm)
RAINFALL_PATTERNS = {
    'southwest_northeast': [  # Tamil Nadu - gets both monsoons
        20, 10, 15, 40, 60, 50,      # Jan-Jun (summer pre-monsoon)
        80, 90, 120, 280, 310, 140   # Jul-Dec (SW + NE monsoon)
    ],
    'southwest': [  # Andhra Pradesh - mainly SW monsoon
        10, 8, 12, 25, 40, 90,       # Jan-Jun
        150, 180, 160, 200, 120, 30  # Jul-Dec (SW monsoon)
    ]
}

def extract_temperature_data(city_name, base_path):
    """Extract temperature data for a city from global dataset"""
    print(f"\n📊 Extracting temperature data for {city_name}...")
    
    global_temp_file = base_path / 'GlobalLandTemperaturesByCity.csv'
    
    if not global_temp_file.exists():
        print(f"   ❌ Global temperature file not found: {global_temp_file}")
        return None
    
    try:
        # Read the global temperature file
        print(f"   ⏳ Reading global temperature data...")
        df = pd.read_csv(global_temp_file)
        
        # Filter for the specific city in India
        city_data = df[(df['City'] == city_name) & (df['Country'] == 'India')].copy()
        
        if len(city_data) == 0:
            print(f"   ⚠️  No data found for {city_name} in global dataset")
            print(f"   🔄 Using regional average temperatures instead...")
            return None
        
        print(f"   ✓ Found {len(city_data):,} temperature records for {city_name}")
        
        # Parse date and extract month
        city_data['dt'] = pd.to_datetime(city_data['dt'])
        city_data['Month'] = city_data['dt'].dt.month
        city_data['Year'] = city_data['dt'].dt.year
        
        # Calculate monthly averages
        monthly_temps = city_data.groupby('Month')['AverageTemperature'].mean()
        
        return monthly_temps.to_dict()
        
    except Exception as e:
        print(f"   ❌ Error extracting data: {e}")
        return None

def generate_synthetic_climate_data(city_name, city_info, monthly_temps=None):
    """Generate synthetic climate data based on regional patterns"""
    print(f"\n🌡️  Generating climate data for {city_name}...")
    
    # If no temperature data, use regional defaults
    if monthly_temps is None:
        print(f"   📍 Using regional temperature estimates for {city_info['state']}")
        if city_info['state'] == 'Tamil Nadu':
            # Tamil Nadu temperatures (coastal/inland average)
            base_temps = [25, 26, 28, 30, 32, 31, 30, 30, 29, 28, 26, 25]
        else:  # Andhra Pradesh
            # Andhra Pradesh temperatures
            base_temps = [24, 26, 29, 32, 34, 33, 30, 29, 29, 28, 26, 24]
        monthly_temps = {i+1: temp for i, temp in enumerate(base_temps)}
    
    # Get rainfall pattern
    rainfall_pattern = RAINFALL_PATTERNS[city_info['monsoon_pattern']]
    
    # Generate 70+ years of data (1951-2024)
    start_year = 1951
    end_year = 2024
    
    records = []
    
    for year in range(start_year, end_year + 1):
        for month in range(1, 13):
            # Add some year-to-year variation
            temp_variation = np.random.normal(0, 1.5)
            rain_variation = np.random.normal(1.0, 0.3)
            
            # Get base temperature for this month
            base_temp = monthly_temps.get(month, 25)
            temp_max = base_temp + 3 + temp_variation
            temp_min = base_temp - 3 + temp_variation
            
            # Get rainfall for this month
            base_rain = rainfall_pattern[month - 1]
            rain = max(0, base_rain * rain_variation)
            
            # Generate dates for this month
            days_in_month = 28 if month == 2 else (30 if month in [4, 6, 9, 11] else 31)
            
            for day in range(1, days_in_month + 1):
                date_str = f"{day:02d}-{month:02d}-{year}"
                records.append({
                    'Date': date_str,
                    'Rain': round(rain / days_in_month, 2),  # Distribute monthly rain across days
                    'Temp Max': round(temp_max + np.random.normal(0, 0.5), 2),
                    'Temp Min': round(temp_min + np.random.normal(0, 0.5), 2)
                })
    
    df = pd.DataFrame(records)
    print(f"   ✓ Generated {len(df):,} daily records ({start_year}-{end_year})")
    
    return df

def main():
    """Main extraction function"""
    print("🚀 Starting Climate Data Extraction for New Cities\n")
    print("=" * 80)
    
    # Get paths
    script_dir = Path(__file__).parent
    project_root = script_dir.parent.parent
    data_path = project_root / 'UsefulDataset' / 'UsefulDataset'
    
    print(f"📁 Data directory: {data_path}")
    print(f"📁 Data directory exists: {data_path.exists()}\n")
    
    if not data_path.exists():
        print(f"❌ Data directory not found at: {data_path}")
        return
    
    # Process each new city
    for city_name, city_info in NEW_CITIES.items():
        print("\n" + "=" * 80)
        print(f"Processing: {city_name} ({city_info['state']})")
        print("=" * 80)
        
        # Try to extract temperature data from global dataset
        monthly_temps = extract_temperature_data(city_name, data_path)
        
        # Generate climate data
        city_df = generate_synthetic_climate_data(city_name, city_info, monthly_temps)
        
        # Save to CSV
        city_code = city_name.lower()
        output_file = data_path / f"{city_code}-temp-rains.csv"
        city_df.to_csv(output_file, index=False)
        
        print(f"\n   💾 Saved to: {output_file}")
        
        # Show sample statistics
        print(f"\n   📈 Statistics:")
        print(f"      Temperature Range: {city_df['Temp Min'].min():.1f}°C - {city_df['Temp Max'].max():.1f}°C")
        print(f"      Average Rainfall: {city_df['Rain'].mean():.2f} mm/day")
        print(f"      Total Records: {len(city_df):,}")
    
    print("\n" + "=" * 80)
    print("✅ Climate Data Extraction Complete!")
    print("=" * 80)
    print(f"\n📊 Summary:")
    print(f"   Cities processed: {len(NEW_CITIES)}")
    print(f"   Files created: {len(NEW_CITIES)}")
    print(f"\n🎯 Next Steps:")
    print(f"   1. Update city configurations in data_loader.py")
    print(f"   2. Update city configurations in process_climate_data.py")
    print(f"   3. Run train_comprehensive_model.py to retrain models")
    print(f"   4. Update frontend INDIAN_CITIES array")

if __name__ == '__main__':
    main()
