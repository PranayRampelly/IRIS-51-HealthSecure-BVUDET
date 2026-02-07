/**
 * Environmental Data Service
 * Integrates humidity, air quality, and water quality data
 */

import axios from 'axios';

export class EnvironmentalDataService {
    constructor() {
        this.openWeatherApiKey = process.env.OPENWEATHER_API_KEY;
        this.iqAirApiKey = process.env.IQAIR_API_KEY;

        // City coordinates for API calls
        this.cityCoordinates = {
            'Delhi': { lat: 28.6139, lon: 77.2090 },
            'Mumbai': { lat: 19.0760, lon: 72.8777 },
            'Chennai': { lat: 13.0827, lon: 80.2707 },
            'Bangalore': { lat: 12.9716, lon: 77.5946 },
            'Kolkata': { lat: 22.5726, lon: 88.3639 },
            'Pune': { lat: 18.5204, lon: 73.8567 },
            'Hyderabad': { lat: 17.3850, lon: 78.4867 },
            'Ahmedabad': { lat: 23.0225, lon: 72.5714 }
        };
    }

    /**
     * Get current humidity data from OpenWeatherMap
     */
    async getHumidityData(city) {
        const coords = this.cityCoordinates[city];
        if (!coords) {
            throw new Error(`City ${city} not found`);
        }

        try {
            const response = await axios.get(
                'https://api.openweathermap.org/data/2.5/weather',
                {
                    params: {
                        lat: coords.lat,
                        lon: coords.lon,
                        appid: this.openWeatherApiKey,
                        units: 'metric'
                    }
                }
            );

            return {
                humidity: response.data.main.humidity,
                temperature: response.data.main.temp,
                pressure: response.data.main.pressure,
                feelsLike: response.data.main.feels_like,
                timestamp: new Date(response.data.dt * 1000)
            };
        } catch (error) {
            console.error('Error fetching humidity data:', error);
            throw error;
        }
    }

    /**
     * Get air quality index from IQAir
     */
    async getAirQuality(city) {
        try {
            const response = await axios.get(
                'https://api.airvisual.com/v2/city',
                {
                    params: {
                        city: city,
                        country: 'India',
                        key: this.iqAirApiKey
                    }
                }
            );

            const pollution = response.data.data.current.pollution;

            return {
                aqi: pollution.aqius,
                pm25: pollution.p2 ? pollution.p2.conc : null,
                pm10: pollution.p1 ? pollution.p1.conc : null,
                category: this.getAQICategory(pollution.aqius),
                timestamp: new Date(pollution.ts)
            };
        } catch (error) {
            console.error('Error fetching air quality data:', error);
            // Return fallback data if API fails
            return this.getFallbackAQI(city);
        }
    }

    /**
     * Get comprehensive environmental data
     */
    async getComprehensiveData(city) {
        try {
            const [humidity, airQuality] = await Promise.all([
                this.getHumidityData(city),
                this.getAirQuality(city)
            ]);

            return {
                city,
                humidity: humidity.humidity,
                temperature: humidity.temperature,
                aqi: airQuality.aqi,
                pm25: airQuality.pm25,
                pm10: airQuality.pm10,
                aqiCategory: airQuality.category,
                timestamp: new Date()
            };
        } catch (error) {
            console.error('Error fetching comprehensive environmental data:', error);
            throw error;
        }
    }

    /**
     * Calculate enhanced disease risk with environmental factors
     */
    calculateEnhancedRisk(baseRisk, environmentalData, disease) {
        let enhancedRisk = baseRisk;

        // Humidity impact
        const humidityImpact = this.calculateHumidityImpact(
            environmentalData.humidity,
            disease
        );
        enhancedRisk += humidityImpact;

        // Air quality impact
        const aqiImpact = this.calculateAQIImpact(
            environmentalData.aqi,
            disease
        );
        enhancedRisk += aqiImpact;

        return {
            risk: Math.min(Math.max(enhancedRisk, 0), 100),
            factors: {
                base: baseRisk,
                humidity: humidityImpact,
                aqi: aqiImpact
            },
            breakdown: {
                baseRisk: `${baseRisk}%`,
                humidityContribution: `${humidityImpact > 0 ? '+' : ''}${humidityImpact}%`,
                aqiContribution: `${aqiImpact > 0 ? '+' : ''}${aqiImpact}%`,
                totalRisk: `${Math.round(enhancedRisk)}%`
            }
        };
    }

    /**
     * Calculate humidity impact on disease risk
     */
    calculateHumidityImpact(humidity, disease) {
        switch (disease) {
            case 'Malaria':
            case 'Dengue':
                // Optimal humidity for mosquitoes: 60-90%
                if (humidity >= 60 && humidity <= 90) {
                    return 15;
                } else if (humidity >= 50 && humidity < 60) {
                    return 8;
                } else if (humidity > 90) {
                    return 5;
                }
                return 0;

            case 'Respiratory Diseases':
                // Low humidity increases respiratory issues
                if (humidity < 30) {
                    return 12;
                } else if (humidity < 40) {
                    return 6;
                }
                return 0;

            case 'Heat Stroke':
                // High humidity makes heat worse
                if (humidity > 70) {
                    return 10;
                } else if (humidity > 60) {
                    return 5;
                }
                return 0;

            default:
                return 0;
        }
    }

    /**
     * Calculate AQI impact on disease risk
     */
    calculateAQIImpact(aqi, disease) {
        if (disease === 'Respiratory Diseases') {
            if (aqi > 200) return 25;      // Very Unhealthy
            if (aqi > 150) return 18;      // Unhealthy
            if (aqi > 100) return 12;      // Unhealthy for Sensitive Groups
            if (aqi > 50) return 5;        // Moderate
            return 0;                      // Good
        }

        // AQI affects all diseases to some degree
        if (aqi > 150) return 8;
        if (aqi > 100) return 4;
        return 0;
    }

    /**
     * Get AQI category
     */
    getAQICategory(aqi) {
        if (aqi <= 50) return 'Good';
        if (aqi <= 100) return 'Moderate';
        if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
        if (aqi <= 200) return 'Unhealthy';
        if (aqi <= 300) return 'Very Unhealthy';
        return 'Hazardous';
    }

    /**
     * Fallback AQI data when API is unavailable
     */
    getFallbackAQI(city) {
        // Average AQI values for Indian cities
        const averageAQI = {
            'Delhi': 180,
            'Mumbai': 120,
            'Chennai': 90,
            'Bangalore': 85,
            'Kolkata': 140,
            'Pune': 95,
            'Hyderabad': 100,
            'Ahmedabad': 110
        };

        const aqi = averageAQI[city] || 100;

        return {
            aqi,
            pm25: null,
            pm10: null,
            category: this.getAQICategory(aqi),
            timestamp: new Date(),
            fallback: true
        };
    }
}

export default new EnvironmentalDataService();
