import express from 'express';
import {
  getInventorySummary,
  getInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getInventoryAlerts,
  updateInventoryQuantity,
  getInventoryStatistics
} from '../controllers/bloodInventoryController.js';
import { addQualityTest } from '../controllers/qualityControlController.js';

const router = express.Router();

// Get inventory summary
router.get('/summary', getInventorySummary);

// Get all inventory items with filtering and pagination
router.get('/units', getInventory);

// Get single inventory item by ID
router.get('/units/:unitId', getInventoryItem);

// Create new inventory item
router.post('/units', createInventoryItem);

// Update inventory item
router.put('/units/:unitId', updateInventoryItem);

// Delete inventory item
router.delete('/units/:unitId', deleteInventoryItem);

// Get inventory alerts
router.get('/alerts', getInventoryAlerts);

// Update inventory quantity
router.patch('/units/:unitId/quantity', updateInventoryQuantity);

// Add quality test result
router.post('/units/:unitId/quality-test', addQualityTest);

// Get inventory statistics
router.get('/analytics', getInventoryStatistics);

export default router;
