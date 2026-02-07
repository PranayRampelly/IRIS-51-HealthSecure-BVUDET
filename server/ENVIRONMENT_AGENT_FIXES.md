# Environment Agent - Fixes and API Configuration

## ✅ Fixed Issues

### 1. Export Error Fixed
- **Problem**: `REGION_COORDINATES` was not exported from `environmentService.js`
- **Solution**: Added `export` keyword to `REGION_COORDINATES` constant
- **File**: `server/src/services/environmentService.js`

### 2. Multiple API Integration
- Added support for 5 different APIs for redundancy:
  - AQICN (Primary air quality)
  - OpenWeather (Climate + Air Pollution)
  - WeatherAPI (Alternative climate)
  - AirVisual (Alternative air quality)
  - Breezometer (Premium air quality)

### 3. Real-Time Updates
- **Backend**: Data refresh every 15 minutes (was 1 hour)
- **Scheduler**: Runs every 15 minutes (was 1 hour)
- **Frontend**: Auto-refresh every 1 minute (30 seconds for alerts)

### 4. Enhanced Fallback Chain
- Implemented automatic fallback: AQICN → OpenWeather → AirVisual → Breezometer
- Parallel API calls using `Promise.allSettled` for maximum reliability

## 🔑 Required API Keys

Add these to your `.env` file in the `server` directory:

```env
# AQICN API (Free tier available at https://aqicn.org/api/)
AQICN_TOKEN=demo

# OpenWeather API (Free tier: 1000 calls/day at https://openweathermap.org/api)
OPENWEATHER_API_KEY=your_openweather_api_key_here

# WeatherAPI (Free tier: 1M calls/month at https://www.weatherapi.com/)
WEATHERAPI_KEY=your_weatherapi_key_here

# AirVisual API (Optional - Alternative air quality source)
AIRVISUAL_API_KEY=your_airvisual_api_key_here

# Breezometer API (Optional - Premium air quality source)
BREEZOMETER_API_KEY=your_breezometer_api_key_here
```

## 📝 API Setup Instructions

### Minimum Required (For Basic Functionality)
1. **AQICN Token**: 
   - Visit: https://aqicn.org/api/
   - Sign up for free account
   - Get token and add to `.env` as `AQICN_TOKEN`

2. **OpenWeather API Key** (Recommended):
   - Visit: https://openweathermap.org/api
   - Sign up for free account (1000 calls/day)
   - Get API key and add to `.env` as `OPENWEATHER_API_KEY`
   - Used for: Current Weather + Air Pollution APIs

### Optional (For Better Redundancy)
3. **WeatherAPI Key**:
   - Visit: https://www.weatherapi.com/
   - Sign up for free tier (1M calls/month)
   - Get API key and add to `.env` as `WEATHERAPI_KEY`

4. **AirVisual API Key**:
   - Visit: https://www.airvisual.com/api
   - Sign up for free tier
   - Get API key and add to `.env` as `AIRVISUAL_API_KEY`

5. **Breezometer API Key**:
   - Visit: https://www.breezometer.com/products/air-quality-api
   - Sign up for account
   - Get API key and add to `.env` as `BREEZOMETER_API_KEY`

## 🚀 How It Works

1. **Data Fetching**: 
   - System tries multiple APIs in parallel
   - Uses first successful response
   - Falls back to next API if one fails

2. **Data Storage**:
   - Data cached in MongoDB for 15 minutes
   - Historical data stored for last 30 days
   - Automatic updates via scheduler

3. **Real-Time Updates**:
   - Backend scheduler runs every 15 minutes
   - Frontend polls every 1 minute
   - Alerts refresh every 30 seconds

## ⚠️ Notes

- If no API keys are provided, system will use fallback data
- System works with just AQICN_TOKEN (demo mode)
- More API keys = better redundancy and reliability
- All API calls are logged for monitoring

## ✅ Verification

After adding API keys:
1. Restart the server
2. Check server logs for API call status
3. Visit Environment Dashboard to see real data
4. Monitor API usage in respective dashboards

## 📊 Current Status

- ✅ Export errors fixed
- ✅ Multiple API support added
- ✅ Real-time updates configured
- ✅ Fallback mechanisms implemented
- ✅ Frontend polling updated
- ✅ Scheduler configured for 15-minute updates

