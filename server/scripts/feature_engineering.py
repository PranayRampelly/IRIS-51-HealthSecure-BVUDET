"""
Advanced Feature Engineering for Disease Prediction
Creates sophisticated features from raw climate, AQI, and real-time data
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')
import sys
import builtins

# Redirect all prints to stderr to avoid polluting stdout (which is used for JSON output)
def print(*args, **kwargs):
    kwargs['file'] = sys.stderr
    return builtins.print(*args, **kwargs)


class FeatureEngineer:
    def __init__(self):
        """Initialize feature engineer"""
        self.feature_names = []
        
    def add_temporal_features(self, df):
        """Add time-based features"""
        print("   🕐 Adding temporal features...")
        
        # Extract from Date column
        if 'Date' in df.columns:
            df['year'] = df['Date'].dt.year
            df['month'] = df['Date'].dt.month
            df['day'] = df['Date'].dt.day
            df['day_of_year'] = df['Date'].dt.dayofyear
            df['week_of_year'] = df['Date'].dt.isocalendar().week
            df['quarter'] = df['Date'].dt.quarter
            
            # Cyclical encoding for month (important for seasonality)
            df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
            df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)
            
            # Season encoding
            season_map = {'winter': 0, 'summer': 1, 'monsoon': 2, 'post_monsoon': 3}
            df['season'] = df['month'].apply(lambda x: 
                'winter' if x in [12, 1, 2] else
                'summer' if x in [3, 4, 5] else
                'monsoon' if x in [6, 7, 8, 9] else 'post_monsoon'
            )
            df['season_encoded'] = df['season'].map(season_map)
            df['is_monsoon'] = (df['season'] == 'monsoon').astype(int)
            df['is_summer'] = (df['season'] == 'summer').astype(int)
            df['is_winter'] = (df['season'] == 'winter').astype(int)
            # Drop the string season column to avoid issues
            df = df.drop('season', axis=1)

        
        return df
    
    def add_rolling_features(self, df, group_col='City'):
        """Add rolling window features"""
        print("   📊 Adding rolling window features...")
        
        if 'Temp Max' in df.columns:
            # Temperature rolling features
            for window in [7, 14, 30, 90]:
                df[f'temp_max_{window}d_avg'] = df.groupby(group_col)['Temp Max'].transform(
                    lambda x: x.rolling(window, min_periods=1).mean()
                )
                df[f'temp_min_{window}d_avg'] = df.groupby(group_col)['Temp Min'].transform(
                    lambda x: x.rolling(window, min_periods=1).mean()
                )
                df[f'temp_{window}d_std'] = df.groupby(group_col)['Temp Max'].transform(
                    lambda x: x.rolling(window, min_periods=1).std()
                )
        
        if 'Rain' in df.columns:
            # Rainfall rolling features
            for window in [7, 14, 30, 90]:
                df[f'rain_{window}d_sum'] = df.groupby(group_col)['Rain'].transform(
                    lambda x: x.rolling(window, min_periods=1).sum()
                )
                df[f'rain_{window}d_avg'] = df.groupby(group_col)['Rain'].transform(
                    lambda x: x.rolling(window, min_periods=1).mean()
                )
                df[f'rain_{window}d_max'] = df.groupby(group_col)['Rain'].transform(
                    lambda x: x.rolling(window, min_periods=1).max()
                )
        
        return df
    
    def add_lag_features(self, df, group_col='City'):
        """Add lag features (previous days' values)"""
        print("   ⏮️  Adding lag features...")
        
        if 'Temp Max' in df.columns:
            for lag in [1, 3, 7, 14, 30]:
                df[f'temp_max_lag_{lag}d'] = df.groupby(group_col)['Temp Max'].shift(lag)
                df[f'temp_min_lag_{lag}d'] = df.groupby(group_col)['Temp Min'].shift(lag)
        
        if 'Rain' in df.columns:
            for lag in [1, 3, 7, 14]:
                df[f'rain_lag_{lag}d'] = df.groupby(group_col)['Rain'].shift(lag)
        
        return df
    
    def add_derived_features(self, df):
        """Add derived/calculated features"""
        print("   🧮 Adding derived features...")
        
        if 'Temp Max' in df.columns and 'Temp Min' in df.columns:
            # Temperature range and average
            df['temp_range'] = df['Temp Max'] - df['Temp Min']
            df['temp_avg'] = (df['Temp Max'] + df['Temp Min']) / 2
            
            # Temperature variability
            if 'temp_max_7d_avg' in df.columns:
                df['temp_variability_7d'] = df.groupby('City')['temp_avg'].transform(
                    lambda x: x.rolling(7, min_periods=1).std()
                )
                df['temp_variability_30d'] = df.groupby('City')['temp_avg'].transform(
                    lambda x: x.rolling(30, min_periods=1).std()
                )
        
        if 'Rain' in df.columns:
            # Rain intensity indicators
            df['is_rainy_day'] = (df['Rain'] > 2.5).astype(int)
            df['is_heavy_rain'] = (df['Rain'] > 50).astype(int)
            df['is_very_heavy_rain'] = (df['Rain'] > 100).astype(int)
            
            # Consecutive rainy days
            df['rainy_streak'] = df.groupby('City')['is_rainy_day'].transform(
                lambda x: x.groupby((x != x.shift()).cumsum()).cumcount() + 1
            )
        
        # Heat index (simplified)
        if 'temp_avg' in df.columns and 'humidity' in df.columns:
            df['heat_index'] = df['temp_avg'] + 0.5 * (df['humidity'] - 50)
        
        return df
    
    def add_interaction_features(self, df):
        """Add interaction features between variables"""
        print("   🔗 Adding interaction features...")
        
        if 'temp_avg' in df.columns and 'Rain' in df.columns:
            # Temperature × Rainfall interactions (important for disease risk)
            df['temp_rain_interaction'] = df['temp_avg'] * df['Rain']
            df['temp_rain_ratio'] = df['temp_avg'] / (df['Rain'] + 1)  # +1 to avoid division by zero
        
        if 'temp_avg' in df.columns and 'humidity' in df.columns:
            # Temperature × Humidity interaction
            df['temp_humidity_interaction'] = df['temp_avg'] * df['humidity']
        
        if 'Rain' in df.columns and 'humidity' in df.columns:
            # Rain × Humidity interaction
            df['rain_humidity_interaction'] = df['Rain'] * df['humidity']
        
        return df
    
    def add_aqi_features(self, df, aqi_df):
        """Merge and add AQI-related features"""
        print("   🌫️  Adding AQI features...")
        
        if aqi_df.empty:
            return df
        
        # This is a simplified merge - in production, you'd want temporal alignment
        # For now, we'll add average AQI per city
        if 'City' in aqi_df.columns:
            aqi_summary = aqi_df.groupby('City').agg({
                'AQI': ['mean', 'max', 'std']
            }).reset_index()
            aqi_summary.columns = ['City', 'aqi_avg', 'aqi_max', 'aqi_std']
            
            df = df.merge(aqi_summary, on='City', how='left')
            
            # AQI risk categories (numeric encoding)
            if 'aqi_avg' in df.columns:
                df['aqi_category'] = pd.cut(df['aqi_avg'], 
                    bins=[0, 50, 100, 150, 200, 300, 500],
                    labels=[0, 1, 2, 3, 4, 5]  # Numeric labels instead of strings
                ).astype(float)

        
        return df
    
    def engineer_all_features(self, df, aqi_df=None):
        """Apply all feature engineering steps"""
        print("\n🔧 FEATURE ENGINEERING")
        print("="*60)
        
        initial_features = len(df.columns)
        
        # Add all features
        df = self.add_temporal_features(df)
        df = self.add_rolling_features(df)
        df = self.add_lag_features(df)
        df = self.add_derived_features(df)
        df = self.add_interaction_features(df)
        
        if aqi_df is not None and not aqi_df.empty:
            df = self.add_aqi_features(df, aqi_df)
        
        # Fill NaN values created by rolling/lag features
        df = df.bfill().ffill().fillna(0)
        
        final_features = len(df.columns)
        new_features = final_features - initial_features
        
        print(f"\n   ✅ Feature engineering complete!")
        print(f"   📊 Initial features: {initial_features}")
        print(f"   📊 New features created: {new_features}")
        print(f"   📊 Total features: {final_features}")
        print("="*60)
        
        return df


if __name__ == "__main__":
    # Test feature engineering
    print("Testing Feature Engineering...")
    
    # Create sample data
    dates = pd.date_range('2020-01-01', '2023-12-31', freq='D')
    sample_df = pd.DataFrame({
        'Date': dates,
        'City': ['Delhi'] * len(dates),
        'Temp Max': np.random.uniform(20, 40, len(dates)),
        'Temp Min': np.random.uniform(10, 25, len(dates)),
        'Rain': np.random.exponential(5, len(dates)),
        'humidity': np.random.uniform(40, 90, len(dates))
    })
    
    engineer = FeatureEngineer()
    engineered_df = engineer.engineer_all_features(sample_df)
    
    print(f"\n✅ Test complete! Created {len(engineered_df.columns)} features")
    print(f"   Sample features: {list(engineered_df.columns[:10])}")
