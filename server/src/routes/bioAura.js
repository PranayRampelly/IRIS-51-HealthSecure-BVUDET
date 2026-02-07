import express from 'express';
import { auth } from '../middleware/auth.js';
import { validateRole } from '../middleware/roleValidation.js';
import {
  getDashboardOverview,
  getHealthIndex,
  getDemandPatterns,
  getPharmacyNetwork,
  getRegionalSales,
  getRegionalStocks,
  getApiIntegrationStatus,
  getApiKeys,
  createApiKey,
  revokeApiKey,
  deleteApiKey,
  getWebhooks,
  createWebhook,
  testWebhook,
  deleteWebhook,
  getApiUsageStats,
  getEnvironmentDashboard,
  getAirQualityMonitoring,
  getClimateAnalysis,
  getPollutionTrends,
  getRegionalEnvironmentMap,
  getEnvironmentAlerts,
  getAvailableRegions,
} from '../controllers/bioAuraController.js';

const router = express.Router();

// Public Disease Prediction Endpoints (no auth required)
router.get('/disease-prediction/data', (req, res) => {
  try {
    // Import the processed climate data
    import('../../scripts/processed_climate_data.json', { assert: { type: 'json' } })
      .then(module => {
        res.json(module.default);
      })
      .catch(error => {
        console.error('Error loading climate data:', error);
        res.status(500).json({ error: 'Failed to load climate data' });
      });
  } catch (error) {
    console.error('Error in disease prediction endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/disease-prediction/:city/:disease', (req, res) => {
  try {
    const { city, disease } = req.params;

    import('../../scripts/processed_climate_data.json', { assert: { type: 'json' } })
      .then(module => {
        const data = module.default;

        if (!data.diseaseRisks[city]) {
          return res.status(404).json({ error: 'City not found' });
        }

        if (!data.diseaseRisks[city][disease]) {
          return res.status(404).json({ error: 'Disease not found' });
        }

        res.json({
          city,
          disease,
          climateData: data.climateData[city],
          riskScores: data.diseaseRisks[city][disease],
          metadata: data.metadata
        });
      })
      .catch(error => {
        console.error('Error loading climate data:', error);
        res.status(500).json({ error: 'Failed to load climate data' });
      });
  } catch (error) {
    console.error('Error in disease prediction endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// ML-based prediction endpoints (uses trained models)
import * as mlPredictionController from '../controllers/mlPredictionController.js';

// ML Prediction routes
router.get('/ml-predictions', mlPredictionController.getAllCitiesPredictions);
router.get('/ml-predictions-dl', mlPredictionController.getAllCitiesPredictionsDL);
router.get('/ml-predictions-gemini', mlPredictionController.getAllCitiesPredictionsGemini);
router.get('/ml-predictions/:city', mlPredictionController.getMLPredictions);
router.get('/ml-forecast/:city', mlPredictionController.getMLForecast);

// Advanced Analytics routes
router.get('/feature-importance/:disease', mlPredictionController.getFeatureImportance);
router.get('/prediction-explanation/:city/:disease', mlPredictionController.getPredictionExplanation);
router.get('/risk-calendar/:city/:disease', mlPredictionController.getRiskCalendar);
router.get('/multi-city-comparison/:disease', mlPredictionController.getMultiCityComparison);

// Pharmacy Intelligence routes
router.get('/pharmacy-intelligence', mlPredictionController.getPharmacyIntelligence);

// Protected routes (require authentication)
router.use(auth);
router.use(validateRole(['bioaura', 'admin', 'pharmacy']));

router.get('/overview', getDashboardOverview);
router.get('/health-index', getHealthIndex);
router.get('/demand-patterns', getDemandPatterns);
router.get('/pharmacy-network', getPharmacyNetwork);
router.get('/regional-sales', getRegionalSales);
router.get('/regional-stocks', getRegionalStocks);
router.get('/api-integration', getApiIntegrationStatus);

// API Key Management
router.get('/api-keys', getApiKeys);
router.post('/api-keys', createApiKey);
router.patch('/api-keys/:id/revoke', revokeApiKey);
router.delete('/api-keys/:id', deleteApiKey);

// Webhook Management
router.get('/webhooks', getWebhooks);
router.post('/webhooks', createWebhook);
router.post('/webhooks/:id/test', testWebhook);
router.delete('/webhooks/:id', deleteWebhook);

// API Usage Statistics
router.get('/api-usage', getApiUsageStats);

// Environment Agent Endpoints
router.get('/environment/regions', getAvailableRegions);
router.get('/environment/dashboard', getEnvironmentDashboard);
router.get('/environment/air-quality', getAirQualityMonitoring);
router.get('/environment/climate', getClimateAnalysis);
router.get('/environment/pollution-trends', getPollutionTrends);
router.get('/environment/regional-map', getRegionalEnvironmentMap);
router.get('/environment/alerts', getEnvironmentAlerts);

export default router;
