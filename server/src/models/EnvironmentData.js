import mongoose from 'mongoose';

const environmentDataSchema = new mongoose.Schema({
  region: {
    type: String,
    required: true,
    index: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    default: 'India',
  },
  coordinates: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  // Air Quality Data
  airQuality: {
    aqi: {
      type: Number,
      required: true,
      min: 0,
      max: 500,
    },
    category: {
      type: String,
      enum: ['Good', 'Moderate', 'Unhealthy for Sensitive Groups', 'Unhealthy', 'Very Unhealthy', 'Hazardous'],
      required: true,
    },
    healthRisk: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    pm25: {
      type: Number,
      default: 0,
    },
    pm10: {
      type: Number,
      default: 0,
    },
    no2: {
      type: Number,
      default: 0,
    },
    o3: {
      type: Number,
      default: 0,
    },
    co: {
      type: Number,
      default: 0,
    },
    so2: {
      type: Number,
      default: 0,
    },
    source: {
      type: String,
      enum: ['RapidAPI', 'OpenWeather', 'AirVisual', 'Breezometer', 'WeatherAPI', 'Government', 'Manual', 'Fallback', 'AQICN'], // AQICN kept for backward compatibility
      default: 'RapidAPI',
    },
  },
  // Climate Data
  climate: {
    temperature: {
      type: Number,
      required: true,
    },
    feelsLike: {
      type: Number,
    },
    humidity: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    windSpeed: {
      type: Number,
      default: 0,
    },
    windDirection: {
      type: Number,
      min: 0,
      max: 360,
    },
    pressure: {
      type: Number,
      default: 1013.25,
    },
    uvIndex: {
      type: Number,
      min: 0,
      max: 11,
      default: 0,
    },
    visibility: {
      type: Number,
    },
    cloudCover: {
      type: Number,
      min: 0,
      max: 100,
    },
    precipitation: {
      type: Number,
      default: 0,
    },
    source: {
      type: String,
      enum: ['OpenWeather', 'WeatherAPI', 'AirVisual', 'Breezometer', 'Government', 'Manual', 'Fallback'],
      default: 'OpenWeather',
    },
  },
  // Historical data points
  historicalData: [{
    date: {
      type: Date,
      required: true,
    },
    aqi: Number,
    temperature: Number,
    humidity: Number,
    pressure: Number,
  }],
  // Metadata
  lastUpdated: {
    type: Date,
    default: Date.now,
    index: true,
  },
  dataSource: {
    type: String,
    default: 'Environment Agent',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
environmentDataSchema.index({ region: 1, lastUpdated: -1 });
environmentDataSchema.index({ 'coordinates.lat': 1, 'coordinates.lng': 1 });
environmentDataSchema.index({ 'airQuality.healthRisk': 1 });
environmentDataSchema.index({ createdAt: -1 });

const EnvironmentData = mongoose.model('EnvironmentData', environmentDataSchema);

export default EnvironmentData;

