"""
PHARMACY INTELLIGENCE DATA COLLECTOR
Integrates pharmacy sales data to detect disease outbreak patterns
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from pathlib import Path
import json
import sys

class PharmacyIntelligenceCollector:
    """
    Collects and analyzes pharmacy data for disease outbreak detection
    """
    
    def __init__(self):
        self.data_dir = Path(__file__).parent.parent.parent / 'UsefulDataset' / 'pharmacy_data'
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Medicine categories mapped to diseases
        self.medicine_disease_mapping = {
            'Antimalarial': ['Malaria'],
            'Antibiotic': ['Cholera', 'Typhoid', 'Dysentery', 'Pneumonia'],
            'Antiviral': ['Influenza', 'COVID-19', 'Dengue'],
            'Antipyretic': ['Dengue', 'Malaria', 'Influenza', 'Typhoid'],
            'Antihistamine': ['Allergies', 'Asthma'],
            'Bronchodilator': ['Asthma', 'Bronchitis'],
            'ORS': ['Cholera', 'Dysentery'],
            'Anti-TB': ['Tuberculosis']
        }
        
        # Cities to monitor
        self.cities = [
            'Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata',
            'Pune', 'Hyderabad', 'Ahmedabad', 'Jaipur', 'Lucknow'
        ]
    
    def collect_medicine_sales_data(self, city, days=30):
        """
        Collect medicine sales data for outbreak detection
        
        Args:
            city: City name
            days: Number of days to look back
            
        Returns:
            DataFrame with sales patterns
        """
        # In production, this would connect to pharmacy database/API
        # For now, we'll simulate realistic data
        
        dates = pd.date_range(end=datetime.now(), periods=days, freq='D')
        data = []
        
        for date in dates:
            for medicine_type in self.medicine_disease_mapping.keys():
                # Simulate sales with seasonal patterns
                base_sales = np.random.poisson(100)
                
                # Add seasonal spikes for certain diseases
                month = date.month
                if medicine_type == 'Antimalarial' and month in [7, 8, 9, 10]:
                    base_sales *= 2.5  # Monsoon spike
                elif medicine_type == 'Antihistamine' and month in [2, 3, 4]:
                    base_sales *= 2.0  # Spring allergies
                elif medicine_type == 'Antiviral' and month in [12, 1, 2]:
                    base_sales *= 1.8  # Winter flu
                
                data.append({
                    'date': date,
                    'city': city,
                    'medicine_type': medicine_type,
                    'sales_count': int(base_sales),
                    'stock_level': np.random.randint(500, 2000),
                    'demand_trend': np.random.choice(['increasing', 'stable', 'decreasing'])
                })
        
        return pd.DataFrame(data)
    
    def detect_outbreak_signals(self, city, threshold=1.5):
        """
        Detect potential disease outbreaks from pharmacy sales spikes
        
        Args:
            city: City name
            threshold: Multiplier for anomaly detection
            
        Returns:
            List of detected outbreak signals
        """
        sales_data = self.collect_medicine_sales_data(city, days=30)
        signals = []
        
        for medicine_type in self.medicine_disease_mapping.keys():
            medicine_sales = sales_data[sales_data['medicine_type'] == medicine_type]
            
            # Calculate baseline (average of last 30 days)
            baseline = medicine_sales['sales_count'].mean()
            std = medicine_sales['sales_count'].std()
            
            # Check recent sales (last 7 days)
            recent_sales = medicine_sales.tail(7)['sales_count'].mean()
            
            # Detect spike
            if recent_sales > baseline + (threshold * std):
                related_diseases = self.medicine_disease_mapping[medicine_type]
                
                for disease in related_diseases:
                    signals.append({
                        'city': city,
                        'disease': disease,
                        'medicine_type': medicine_type,
                        'baseline_sales': round(baseline, 2),
                        'recent_sales': round(recent_sales, 2),
                        'spike_percentage': round(((recent_sales - baseline) / baseline) * 100, 2),
                        'confidence': min(95, 60 + (recent_sales - baseline) / baseline * 100),
                        'alert_level': 'HIGH' if recent_sales > baseline * 2 else 'MEDIUM',
                        'timestamp': datetime.now().isoformat()
                    })
        
        return signals
    
    def get_regional_health_index(self, city):
        """
        Calculate health index from pharmacy data
        
        Args:
            city: City name
            
        Returns:
            Health index (0-100, higher is better)
        """
        sales_data = self.collect_medicine_sales_data(city, days=7)
        
        # Calculate total medicine sales
        total_sales = sales_data['sales_count'].sum()
        
        # Baseline for healthy population (lower medicine sales = healthier)
        baseline_sales = 5000  # Expected weekly sales for healthy population
        
        # Calculate index (inverse relationship)
        if total_sales < baseline_sales:
            health_index = 100
        else:
            health_index = max(0, 100 - ((total_sales - baseline_sales) / baseline_sales) * 100)
        
        return {
            'city': city,
            'health_index': round(health_index, 2),
            'total_medicine_sales': total_sales,
            'status': 'GOOD' if health_index > 70 else 'MODERATE' if health_index > 40 else 'POOR',
            'timestamp': datetime.now().isoformat()
        }
    
    def get_demand_patterns(self, city):
        """
        Analyze medicine demand patterns
        
        Args:
            city: City name
            
        Returns:
            Demand pattern analysis
        """
        sales_data = self.collect_medicine_sales_data(city, days=30)
        
        patterns = []
        for medicine_type in self.medicine_disease_mapping.keys():
            medicine_sales = sales_data[sales_data['medicine_type'] == medicine_type]
            
            # Calculate trend
            recent_avg = medicine_sales.tail(7)['sales_count'].mean()
            previous_avg = medicine_sales.head(7)['sales_count'].mean()
            
            trend = 'increasing' if recent_avg > previous_avg * 1.1 else \
                    'decreasing' if recent_avg < previous_avg * 0.9 else 'stable'
            
            patterns.append({
                'medicine_type': medicine_type,
                'related_diseases': self.medicine_disease_mapping[medicine_type],
                'current_demand': round(recent_avg, 2),
                'trend': trend,
                'change_percentage': round(((recent_avg - previous_avg) / previous_avg) * 100, 2)
            })
        
        return {
            'city': city,
            'patterns': patterns,
            'timestamp': datetime.now().isoformat()
        }
    
    def get_stock_analysis(self, city):
        """
        Analyze pharmacy stock levels
        
        Args:
            city: City name
            
        Returns:
            Stock analysis
        """
        sales_data = self.collect_medicine_sales_data(city, days=7)
        
        stock_status = []
        for medicine_type in self.medicine_disease_mapping.keys():
            medicine_data = sales_data[sales_data['medicine_type'] == medicine_type]
            
            avg_stock = medicine_data['stock_level'].mean()
            avg_sales = medicine_data['sales_count'].mean()
            
            # Days of stock remaining
            days_remaining = avg_stock / avg_sales if avg_sales > 0 else 999
            
            status = 'CRITICAL' if days_remaining < 7 else \
                     'LOW' if days_remaining < 14 else \
                     'ADEQUATE' if days_remaining < 30 else 'GOOD'
            
            stock_status.append({
                'medicine_type': medicine_type,
                'current_stock': round(avg_stock, 2),
                'daily_sales': round(avg_sales, 2),
                'days_remaining': round(days_remaining, 2),
                'status': status
            })
        
        return {
            'city': city,
            'stock_analysis': stock_status,
            'timestamp': datetime.now().isoformat()
        }
    
    def get_all_cities_intelligence(self):
        """
        Get pharmacy intelligence for all cities
        
        Returns:
            Complete pharmacy intelligence data
        """
        intelligence = {
            'outbreak_signals': [],
            'health_indices': [],
            'demand_patterns': [],
            'stock_analysis': [],
            'timestamp': datetime.now().isoformat()
        }
        
        for city in self.cities:
            # Outbreak signals
            signals = self.detect_outbreak_signals(city)
            intelligence['outbreak_signals'].extend(signals)
            
            # Health index
            health_index = self.get_regional_health_index(city)
            intelligence['health_indices'].append(health_index)
            
            # Demand patterns
            demand = self.get_demand_patterns(city)
            intelligence['demand_patterns'].append(demand)
            
            # Stock analysis
            stock = self.get_stock_analysis(city)
            intelligence['stock_analysis'].append(stock)
        
        return intelligence


# CLI usage
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Pharmacy Intelligence Collector')
    parser.add_argument('--city', type=str, help='City name')
    parser.add_argument('--all', action='store_true', help='Get all cities data')
    
    args = parser.parse_args()
    
    collector = PharmacyIntelligenceCollector()
    
    try:
        if args.all:
            result = collector.get_all_cities_intelligence()
        elif args.city:
            result = {
                'outbreak_signals': collector.detect_outbreak_signals(args.city),
                'health_index': collector.get_regional_health_index(args.city),
                'demand_patterns': collector.get_demand_patterns(args.city),
                'stock_analysis': collector.get_stock_analysis(args.city)
            }
        else:
            result = {'error': 'Please specify --city or --all'}
        
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)
