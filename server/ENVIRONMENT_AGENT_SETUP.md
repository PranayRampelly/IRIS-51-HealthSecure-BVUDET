# Environment Agent Setup Guide

## Overview
The Environment Agent uses real APIs to fetch air quality and climate data from multiple sources and stores it in MongoDB for efficient access and historical tracking.

## Required API Keys

Add these environment variables to your `.env` file in the `server` directory:

```env
# RapidAPI Key (Primary Source)
RAPIDAPI_KEY=your_rapidapi_key_here

# OpenWeather API (Free tier available at https://openweathermap.org/api)
OPENWEATHER_API_KEY=your_openweather_api_key_here

# WeatherAPI (Optional - Alternative to OpenWeather)
WEATHERAPI_KEY=your_weatherapi_key_here

# AirVisual API (Optional - Alternative air quality source)
AIRVISUAL_API_KEY=your_airvisual_api_key_here

# Breezometer API (Optional - Premium air quality source)
BREEZOMETER_API_KEY=your_breezometer_api_key_here
```

## API Setup Instructions

### 1. RapidAPI (Air Quality)
1. Visit https://rapidapi.com/
2. Sign up for an account
3. Subscribe to an Air Quality API (e.g., Air Quality by API-Ninjas or similar)
4. Get your API key
5. Add to `.env` as `RAPIDAPI_KEY`

### 2. OpenWeather API (Climate & Air Pollution)
1. Visit https://openweathermap.org/api
2. Sign up for a free account (1000 calls/day)
3. Get your API key
4. Add to `.env` as `OPENWEATHER_API_KEY`

**APIs Used:**
- Current Weather Data API
- Air Pollution API

### 3. WeatherAPI (Optional Alternative)
1. Visit https://www.weatherapi.com/
2. Sign up for free tier (1 million calls/month)
3. Get your API key
4. Add to `.env` as `WEATHERAPI_KEY`

### 4. AirVisual API (Optional - Air Quality Alternative)
1. Visit https://www.airvisual.com/api
2. Sign up for free tier
3. Get your API key
4. Add to `.env` as `AIRVISUAL_API_KEY`

### 5. Breezometer API (Optional - Premium Air Quality)
1. Visit https://www.breezometer.com/products/air-quality-api
2. Sign up for an account
3. Get your API key
4. Add to `.env` as `BREEZOMETER_API_KEY`

## Database Models

### EnvironmentData
Stores air quality and climate data for each region with:
- Real-time AQI and pollutant levels
- Temperature, humidity, wind, pressure, UV index
- Historical data points (last 30 days)
- Automatic data refresh (every hour)

### EnvironmentAlert
Stores environmental health alerts with:
- Alert types (air_quality, temperature, humidity)
- Severity levels (low, medium, high, critical)
- Auto-expiration
- Status tracking

## Features

### Real API Integration (Multiple Sources for Redundancy)
- **RapidAPI**: Primary source for air quality data
- **OpenWeather API**: Climate data and air pollution fallback
- **WeatherAPI**: Alternative climate data source
- **AirVisual API**: Alternative air quality source
- **Breezometer API**: Premium air quality source
- Automatic fallback chain: RapidAPI → AirVisual → OpenWeather → Breezometer
- Parallel API calls for maximum reliability

### Real-Time Data Updates
- **Backend**: Data refreshed every 15 minutes (real-time)
- **Frontend**: Auto-refresh every 1 minute (30 seconds for alerts)
- **Scheduler**: Runs every 15 minutes to update all regions
- Data cached in MongoDB for 15 minutes
- Reduces API calls while maintaining freshness
- Historical data stored for trend analysis (last 30 days)

### Automatic Alert Generation
- Alerts created automatically when thresholds exceeded:
  - AQI > 150: Air quality alert
  - Temperature > 35°C: Heat alert
  - Humidity > 80%: Humidity alert
- Alerts expire automatically after set duration

## API Endpoints

All endpoints require authentication and bioaura/admin role:

- `GET /api/bioaura/environment/dashboard` - Main dashboard
- `GET /api/bioaura/environment/air-quality` - Air quality monitoring
- `GET /api/bioaura/environment/climate` - Climate analysis
- `GET /api/bioaura/environment/pollution-trends` - Pollution trends
- `GET /api/bioaura/environment/regional-map` - Regional map data
- `GET /api/bioaura/environment/alerts` - Environment alerts

## Testing Without API Keys

If API keys are not configured, the system will:
1. Try to fetch from APIs (will fail gracefully)
2. Return fallback data based on region averages
3. Log warnings but continue functioning

## Monitoring

- Check server logs for API call status
- Monitor API usage limits
- Review database for data freshness
- Check alert generation frequency

