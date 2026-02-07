/**
 * WHO Disease Surveillance Service
 * Integrates with WHO Global Health Observatory API
 */

import axios from 'axios';

const WHO_API_BASE = 'https://ghoapi.azureedge.net/api';

export class WHODataService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 24 * 60 * 60 * 1000; // 24 hours
    }

    /**
     * Fetch malaria cases from WHO database
     * @param {string} countryCode - ISO country code (e.g., 'IND')
     * @param {number} year - Year to fetch data for
     */
    async getMalariaCases(countryCode = 'IND', year = 2023) {
        const cacheKey = `malaria_${countryCode}_${year}`;

        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const response = await axios.get(`${WHO_API_BASE}/MALARIA_EST_CASES`, {
                params: {
                    $filter: `SpatialDim eq '${countryCode}' and TimeDim eq ${year}`
                }
            });

            const data = response.data.value;
            this.cache.set(cacheKey, { data, timestamp: Date.now() });

            return data;
        } catch (error) {
            console.error('Error fetching WHO malaria data:', error);
            throw error;
        }
    }

    /**
     * Fetch dengue cases from WHO database
     */
    async getDengueCases(countryCode = 'IND', year = 2023) {
        try {
            const response = await axios.get(`${WHO_API_BASE}/DENGUE_TOTAL`, {
                params: {
                    $filter: `SpatialDim eq '${countryCode}' and TimeDim eq ${year}`
                }
            });

            return response.data.value;
        } catch (error) {
            console.error('Error fetching WHO dengue data:', error);
            throw error;
        }
    }

    /**
     * Fetch cholera cases from WHO database
     */
    async getCholeraCases(countryCode = 'IND', year = 2023) {
        try {
            const response = await axios.get(`${WHO_API_BASE}/CHOLERA`, {
                params: {
                    $filter: `SpatialDim eq '${countryCode}' and TimeDim eq ${year}`
                }
            });

            return response.data.value;
        } catch (error) {
            console.error('Error fetching WHO cholera data:', error);
            throw error;
        }
    }

    /**
     * Get all available indicators from WHO
     */
    async getAvailableIndicators() {
        try {
            const response = await axios.get(`${WHO_API_BASE}/Indicator`);
            return response.data.value;
        } catch (error) {
            console.error('Error fetching WHO indicators:', error);
            throw error;
        }
    }

    /**
     * Validate our predictions against WHO historical data
     */
    async validatePrediction(disease, countryCode, year, ourPrediction) {
        let whoData;

        switch (disease.toLowerCase()) {
            case 'malaria':
                whoData = await this.getMalariaCases(countryCode, year);
                break;
            case 'dengue':
                whoData = await getDengueCases(countryCode, year);
                break;
            case 'cholera':
                whoData = await this.getCholeraCases(countryCode, year);
                break;
            default:
                return { validated: false, reason: 'Disease not supported' };
        }

        if (!whoData || whoData.length === 0) {
            return { validated: false, reason: 'No WHO data available' };
        }

        const actualCases = whoData[0].NumericValue;
        const accuracy = this.calculateAccuracy(ourPrediction, actualCases);

        return {
            validated: true,
            ourPrediction,
            actualCases,
            accuracy,
            confidence: this.calculateConfidence(accuracy)
        };
    }

    /**
     * Calculate prediction accuracy
     */
    calculateAccuracy(predicted, actual) {
        if (actual === 0) return 0;
        const error = Math.abs(predicted - actual) / actual;
        return Math.max(0, 100 - (error * 100));
    }

    /**
     * Calculate confidence based on historical accuracy
     */
    calculateConfidence(accuracy) {
        if (accuracy > 90) return 'high';
        if (accuracy > 70) return 'medium';
        return 'low';
    }

    /**
     * Get historical trends for a disease
     */
    async getHistoricalTrends(disease, countryCode, startYear, endYear) {
        const trends = [];

        for (let year = startYear; year <= endYear; year++) {
            try {
                let data;
                switch (disease.toLowerCase()) {
                    case 'malaria':
                        data = await this.getMalariaCases(countryCode, year);
                        break;
                    case 'dengue':
                        data = await this.getDengueCases(countryCode, year);
                        break;
                    case 'cholera':
                        data = await this.getCholeraCases(countryCode, year);
                        break;
                }

                if (data && data.length > 0) {
                    trends.push({
                        year,
                        cases: data[0].NumericValue,
                        incidenceRate: data[0].Value
                    });
                }
            } catch (error) {
                console.warn(`No data for ${year}`);
            }
        }

        return trends;
    }
}

export default new WHODataService();
