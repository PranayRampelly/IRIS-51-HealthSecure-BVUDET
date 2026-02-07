"""
Online Learning Service for Disease Prediction Models
Continuously collects API data and incrementally updates models
"""

import pandas as pd
import numpy as np
import joblib
import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
import schedule
import time
from sklearn.ensemble import RandomForestClassifier
import warnings
warnings.filterwarnings('ignore')

# Fix Unicode encoding for Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

from data_loader import ComprehensiveDataLoader
from feature_engineering import FeatureEngineer


class OnlineLearningService:
    def __init__(self, models_dir='models_comprehensive'):
        """Initialize online learning service"""
        self.models_dir = Path(__file__).parent / models_dir
        self.data_dir = Path(__file__).parent / 'online_learning_data'
        self.data_dir.mkdir(exist_ok=True)
        
        self.loader = ComprehensiveDataLoader()
        self.engineer = FeatureEngineer()
        
        # Load existing models
        self.models = {}
        self.load_models()
        
        # Data collection buffer
        self.api_data_buffer = []
        self.buffer_file = self.data_dir / 'api_data_buffer.json'
        self.load_buffer()
        
        print(f"[Online Learning] Service initialized")
        print(f"   Models directory: {self.models_dir}")
        print(f"   Data directory: {self.data_dir}")
        
    def load_models(self):
        """Load all trained models"""
        diseases = ['Malaria', 'Dengue', 'Cholera', 'Heat Stroke', 'Respiratory Diseases']
        
        for disease in diseases:
            model_file = self.models_dir / f"{disease.lower().replace(' ', '_')}_model.pkl"
            if model_file.exists():
                self.models[disease] = joblib.load(model_file)
                print(f"   [*] Loaded {disease} model")
    
    def load_buffer(self):
        """Load existing API data buffer"""
        if self.buffer_file.exists():
            try:
                with open(self.buffer_file, 'r') as f:
                    self.api_data_buffer = json.load(f)
                print(f"   [DATA] Loaded {len(self.api_data_buffer)} buffered API records")
            except (json.JSONDecodeError, ValueError) as e:
                print(f"   [WARN] Buffer file corrupted, resetting: {e}")
                self.api_data_buffer = []
                self.save_buffer()
        else:
            print(f"   [DATA] No existing buffer found, starting fresh")
    
    def save_buffer(self):
        """Save API data buffer"""
        with open(self.buffer_file, 'w') as f:
            json.dump(self.api_data_buffer, f, indent=2)

    def collect_api_data(self):
        """Collect real-time API data and add to buffer"""
        print("\n[*] Collecting real-time API data...")
        
        # Fetch current weather and AQI data
        realtime_data = self.loader.fetch_all_realtime_data()
        
        if not realtime_data.empty:
            # Add timestamp and convert to dict
            for _, row in realtime_data.iterrows():
                record = row.to_dict()
                # Convert timestamp to string for JSON serialization
                if 'timestamp' in record and hasattr(record['timestamp'], 'isoformat'):
                    record['timestamp'] = record['timestamp'].isoformat()
                record['collected_at'] = datetime.now().isoformat()
                self.api_data_buffer.append(record)
            
            print(f"   [*] Collected {len(realtime_data)} new records")
            print(f"   [*] Buffer now contains {len(self.api_data_buffer)} total records")
            
            # Save buffer
            self.save_buffer()
            
            # Also save to historical log
            log_file = self.data_dir / f"api_data_{datetime.now().strftime('%Y%m')}.json"
            with open(log_file, 'a') as f:
                for record in realtime_data.to_dict('records'):
                    # Convert all timestamp objects to strings
                    if 'timestamp' in record and hasattr(record['timestamp'], 'isoformat'):
                        record['timestamp'] = record['timestamp'].isoformat()
                    record['collected_at'] = datetime.now().isoformat()
                    f.write(json.dumps(record) + '\n')
            
            return len(realtime_data)
        
        print("   [*]  No new data collected")
        return 0
    
    def prepare_incremental_training_data(self):
        """Prepare buffered API data for incremental training"""
        if len(self.api_data_buffer) < 10:
            print(f"   [*] Not enough data for training (need 10+, have {len(self.api_data_buffer)})")
            return None
        
        print(f"\n[*] Preparing {len(self.api_data_buffer)} API records for training...")
        
        # Convert buffer to DataFrame
        df = pd.DataFrame(self.api_data_buffer)
        
        # Add required columns for feature engineering
        df['Date'] = pd.to_datetime(df['collected_at'])
        df['Temp Max'] = df['temp_max']
        df['Temp Min'] = df['temp_min']
        df['Rain'] = df.get('rain_1h', 0) + df.get('rain_3h', 0)
        df['City'] = df['city']
        
        # Feature engineering
        df = self.engineer.engineer_all_features(df)
        
        print(f"   [*] Prepared {len(df)} records with {len(df.columns)} features")
        return df
    
    def incremental_update(self, disease, new_data, new_labels):
        """Incrementally update a model with new data"""
        if disease not in self.models:
            print(f"   [*]  Model for {disease} not found")
            return False
        
        model_data = self.models[disease]
        rf_model = model_data['rf_model']
        scaler = model_data['scaler']
        feature_cols = model_data['feature_cols']
        
        # Prepare features
        X_new = new_data[feature_cols].fillna(0)
        X_new_scaled = scaler.transform(X_new)
        
        # Incremental training (warm start)
        print(f"   [*] Updating {disease} model with {len(X_new)} new samples...")
        
        # For Random Forest, we need to retrain with combined data
        # In production, you might use partial_fit() with SGDClassifier or similar
        rf_model.n_estimators += 10  # Add more trees
        rf_model.fit(X_new_scaled, new_labels)
        
        # Update model
        model_data['rf_model'] = rf_model
        model_data['last_updated'] = datetime.now().isoformat()
        model_data['update_count'] = model_data.get('update_count', 0) + 1
        
        print(f"   [*] Model updated (update #{model_data['update_count']})")
        return True
    
    def save_updated_models(self):
        """Save updated models"""
        print("\n[*] Saving updated models...")
        
        for disease, model_data in self.models.items():
            model_file = self.models_dir / f"{disease.lower().replace(' ', '_')}_model.pkl"
            joblib.dump(model_data, model_file)
            print(f"   [*] Saved {disease} model")
        
        # Update metrics
        metrics_file = self.models_dir / 'comprehensive_ml_metrics.json'
        if metrics_file.exists():
            with open(metrics_file, 'r') as f:
                metrics = json.load(f)
            
            # Add online learning info
            for disease in metrics:
                if disease in self.models:
                    metrics[disease]['online_learning'] = {
                        'enabled': True,
                        'last_updated': self.models[disease].get('last_updated', 'N/A'),
                        'update_count': self.models[disease].get('update_count', 0)
                    }
            
            with open(metrics_file, 'w') as f:
                json.dump(metrics, f, indent=2)
            
            print(f"   [*] Updated metrics file")
    
    def run_incremental_training(self):
        """Run incremental training with buffered data"""
        print("\n" + "="*80)
        print("[*] ONLINE LEARNING - INCREMENTAL MODEL UPDATE")
        print("="*80)
        
        # Prepare data
        new_data = self.prepare_incremental_training_data()
        
        if new_data is None:
            print("   [*]  Skipping training - insufficient data")
            return
        
        # For each disease, generate labels and update
        from train_comprehensive_model import generate_disease_labels, DISEASE_PARAMS
        
        updated_count = 0
        for disease in DISEASE_PARAMS.keys():
            # Generate labels for new data
            labels = generate_disease_labels(new_data, disease)
            
            if labels.sum() > 0:  # Only update if we have positive cases
                if self.incremental_update(disease, new_data, labels):
                    updated_count += 1
        
        if updated_count > 0:
            # Save updated models
            self.save_updated_models()
            
            # Clear buffer after successful training
            print(f"\n   [*]  Clearing buffer ({len(self.api_data_buffer)} records)")
            self.api_data_buffer = []
            self.save_buffer()
            
            print(f"\n[*] Online learning complete! Updated {updated_count} models")
        else:
            print("\n   [*]  No models updated (no positive cases in new data)")
    
    def schedule_data_collection(self, interval_hours=1):
        """Schedule automatic data collection"""
        print(f"\n[*] Scheduling data collection every {interval_hours} hour(s)")
        
        schedule.every(interval_hours).hours.do(self.collect_api_data)
        
        print("   [*] Scheduler started")
        print("   Press Ctrl+C to stop")
        
        try:
            while True:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
        except KeyboardInterrupt:
            print("\n   [*]  Scheduler stopped")
    
    def schedule_incremental_training(self, interval_hours=24):
        """Schedule automatic incremental training"""
        print(f"\n[*] Scheduling incremental training every {interval_hours} hour(s)")
        
        schedule.every(interval_hours).hours.do(self.run_incremental_training)
        
        print("   [*] Training scheduler started")
        print("   Press Ctrl+C to stop")
        
        try:
            while True:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
        except KeyboardInterrupt:
            print("\n   [*]  Training scheduler stopped")
    
    def run_continuous_learning(self, collect_interval=1, train_interval=24):
        """Run continuous learning with both data collection and training"""
        print("\n" + "="*80)
        print("[*] CONTINUOUS ONLINE LEARNING SERVICE")
        print("="*80)
        print(f"   Data collection: Every {collect_interval} hour(s)")
        print(f"   Model training: Every {train_interval} hour(s)")
        print("   Press Ctrl+C to stop")
        print("="*80)
        
        # Schedule both tasks
        schedule.every(collect_interval).hours.do(self.collect_api_data)
        schedule.every(train_interval).hours.do(self.run_incremental_training)
        
        # Run immediately once
        print("\n[*] Running initial data collection...")
        self.collect_api_data()
        
        try:
            while True:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
        except KeyboardInterrupt:
            print("\n   [*]  Continuous learning service stopped")


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Online Learning Service for Disease Prediction')
    parser.add_argument('--mode', choices=['collect', 'train', 'continuous'], default='continuous',
                       help='Mode: collect (data only), train (training only), continuous (both)')
    parser.add_argument('--collect-interval', type=int, default=1,
                       help='Data collection interval in hours (default: 1)')
    parser.add_argument('--train-interval', type=int, default=24,
                       help='Training interval in hours (default: 24)')
    
    args = parser.parse_args()
    
    service = OnlineLearningService()
    
    if args.mode == 'collect':
        service.schedule_data_collection(args.collect_interval)
    elif args.mode == 'train':
        service.schedule_incremental_training(args.train_interval)
    else:  # continuous
        service.run_continuous_learning(args.collect_interval, args.train_interval)


if __name__ == "__main__":
    main()
