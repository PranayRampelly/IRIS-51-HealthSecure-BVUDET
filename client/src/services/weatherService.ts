import axios from 'axios';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || 'd8582631a1293a90d7389d8f7123becc'; // User provided key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
    temp: number;
    humidity: number;
    rain: number;
    condition: string;
    icon: string;
}

export interface ForecastData {
    date: Date;
    temp: number;
    humidity: number;
    rain: number;
    condition: string;
}

export const weatherService = {
    async getCityWeather(cityName: string): Promise<WeatherData | null> {
        try {
            const response = await axios.get(`${BASE_URL}/weather`, {
                params: {
                    q: `${cityName},IN`, // Append country code for better accuracy
                    appid: API_KEY,
                    units: 'metric'
                }
            });

            const data = response.data;

            // Extract rainfall (last 1h or 3h)
            const rain = data.rain ? (data.rain['1h'] || data.rain['3h'] || 0) : 0;

            return {
                temp: data.main.temp,
                humidity: data.main.humidity,
                rain: rain,
                condition: data.weather[0].main,
                icon: data.weather[0].icon
            };
        } catch (error) {
            console.error(`Failed to fetch weather for ${cityName}:`, error);
            return null;
        }
    },

    async getCityForecast(cityName: string): Promise<ForecastData[] | null> {
        try {
            const response = await axios.get(`${BASE_URL}/forecast`, {
                params: {
                    q: `${cityName},IN`,
                    appid: API_KEY,
                    units: 'metric',
                    cnt: 40 // 5 days * 8 (3-hour intervals)
                }
            });

            const data = response.data;

            // Process forecast data - aggregate by day
            const dailyForecasts: Map<string, ForecastData[]> = new Map();

            data.list.forEach((item: any) => {
                const date = new Date(item.dt * 1000);
                const dateKey = date.toISOString().split('T')[0];

                const forecastItem: ForecastData = {
                    date: date,
                    temp: item.main.temp,
                    humidity: item.main.humidity,
                    rain: item.rain ? (item.rain['3h'] || 0) : 0,
                    condition: item.weather[0].main
                };

                if (!dailyForecasts.has(dateKey)) {
                    dailyForecasts.set(dateKey, []);
                }
                dailyForecasts.get(dateKey)!.push(forecastItem);
            });

            // Average the forecasts for each day
            const aggregatedForecasts: ForecastData[] = [];
            dailyForecasts.forEach((forecasts, dateKey) => {
                const avgTemp = forecasts.reduce((sum, f) => sum + f.temp, 0) / forecasts.length;
                const avgHumidity = forecasts.reduce((sum, f) => sum + f.humidity, 0) / forecasts.length;
                const totalRain = forecasts.reduce((sum, f) => sum + f.rain, 0);
                const mostCommonCondition = forecasts[0].condition; // Simplified

                aggregatedForecasts.push({
                    date: new Date(dateKey),
                    temp: avgTemp,
                    humidity: avgHumidity,
                    rain: totalRain,
                    condition: mostCommonCondition
                });
            });

            return aggregatedForecasts;
        } catch (error) {
            console.error(`Failed to fetch forecast for ${cityName}:`, error);
            return null;
        }
    }
};
