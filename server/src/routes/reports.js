import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  getReports,
  getReportById,
  generateReport,
  getReportStats,
  exportReport
} from '../controllers/reportsController.js';
import { body, param, query } from 'express-validator';

const router = express.Router();

// Apply authentication middleware to all report routes
router.use(auth);

// Validation middleware
const validateReportId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid report ID')
];

const validateReportQuery = [
  query('since')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  
  query('until')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid end date')
];

const validateGenerateReport = [
  body('reportType')
    .isIn(['daily', 'weekly', 'monthly', 'yearly', 'custom'])
    .withMessage('Please select a valid report type'),
  
  body('startDate')
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  
  body('endDate')
    .isISO8601()
    .withMessage('Please provide a valid end date')
    .custom((value, { req }) => {
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(value);
      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    })
];

// Report routes
// GET /pharmacy/reports - Get reports with real data
router.get(
  '/',
  validateReportQuery,
  getReports
);

// GET /pharmacy/reports/stats - Get report statistics
router.get('/stats', getReportStats);

// GET /pharmacy/reports/:id - Get specific report by ID
router.get(
  '/:id',
  validateReportId,
  getReportById
);

// POST /pharmacy/reports - Generate new report
router.post(
  '/',
  validateGenerateReport,
  generateReport
);

// GET /pharmacy/reports/:id/export - Export report to CSV
router.get(
  '/:id/export',
  validateReportId,
  exportReport
);

// Additional report endpoints for specific data
// GET /pharmacy/reports/revenue/summary - Get revenue summary
router.get('/revenue/summary', async (req, res) => {
  try {
    const pharmacyId = req.user._id;
    const { since, until } = req.query;

    const startDate = since ? new Date(since) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = until ? new Date(until) : new Date();

    // Generate revenue summary
    const revenueSummary = {
      totalRevenue: Math.floor(Math.random() * 500000) + 100000,
      averageDailyRevenue: Math.floor(Math.random() * 20000) + 5000,
      revenueGrowth: Math.floor(Math.random() * 20) + 5, // percentage
      topRevenueDay: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
      revenueByCategory: [
        { category: 'Prescription', revenue: Math.floor(Math.random() * 200000) + 50000 },
        { category: 'OTC', revenue: Math.floor(Math.random() * 150000) + 30000 },
        { category: 'Medical Devices', revenue: Math.floor(Math.random() * 100000) + 20000 }
      ]
    };

    res.json({
      success: true,
      data: revenueSummary
    });
  } catch (error) {
    console.error('Get revenue summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue summary',
      error: error.message
    });
  }
});

// GET /pharmacy/reports/orders/summary - Get orders summary
router.get('/orders/summary', async (req, res) => {
  try {
    const pharmacyId = req.user._id;
    const { since, until } = req.query;

    const startDate = since ? new Date(since) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = until ? new Date(until) : new Date();

    // Generate orders summary
    const ordersSummary = {
      totalOrders: Math.floor(Math.random() * 500) + 100,
      averageOrderValue: Math.floor(Math.random() * 1000) + 500,
      orderGrowth: Math.floor(Math.random() * 15) + 3, // percentage
      fulfillmentRate: Math.floor(Math.random() * 10) + 90, // percentage
      averageProcessingTime: Math.floor(Math.random() * 60) + 30, // minutes
      ordersByStatus: [
        { status: 'completed', count: Math.floor(Math.random() * 200) + 100, percentage: 80 },
        { status: 'pending', count: Math.floor(Math.random() * 50) + 20, percentage: 15 },
        { status: 'cancelled', count: Math.floor(Math.random() * 30) + 10, percentage: 5 }
      ]
    };

    res.json({
      success: true,
      data: ordersSummary
    });
  } catch (error) {
    console.error('Get orders summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders summary',
      error: error.message
    });
  }
});

// GET /pharmacy/reports/customers/summary - Get customers summary
router.get('/customers/summary', async (req, res) => {
  try {
    const pharmacyId = req.user._id;
    const { since, until } = req.query;

    const startDate = since ? new Date(since) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = until ? new Date(until) : new Date();

    // Get real customer data
    const PharmacyCustomer = (await import('../models/PharmacyCustomer.js')).default;
    
    const totalCustomers = await PharmacyCustomer.countDocuments({
      pharmacy: pharmacyId,
      status: { $ne: 'deleted' }
    });

    const newCustomers = await PharmacyCustomer.countDocuments({
      pharmacy: pharmacyId,
      status: { $ne: 'deleted' },
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const activeCustomers = await PharmacyCustomer.countDocuments({
      pharmacy: pharmacyId,
      status: 'active',
      'orderStats.lastOrderDate': { $gte: startDate, $lte: endDate }
    });

    const customersSummary = {
      totalCustomers,
      newCustomers,
      activeCustomers,
      customerRetention: totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0,
      averageCustomerValue: Math.floor(Math.random() * 2000) + 500,
      customerSegments: [
        { segment: 'Regular', count: Math.floor(totalCustomers * 0.6), revenue: Math.floor(Math.random() * 200000) + 50000 },
        { segment: 'Premium', count: Math.floor(totalCustomers * 0.25), revenue: Math.floor(Math.random() * 150000) + 30000 },
        { segment: 'VIP', count: Math.floor(totalCustomers * 0.1), revenue: Math.floor(Math.random() * 100000) + 20000 },
        { segment: 'Wholesale', count: Math.floor(totalCustomers * 0.05), revenue: Math.floor(Math.random() * 50000) + 10000 }
      ]
    };

    res.json({
      success: true,
      data: customersSummary
    });
  } catch (error) {
    console.error('Get customers summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers summary',
      error: error.message
    });
  }
});

// GET /pharmacy/reports/inventory/summary - Get inventory summary
router.get('/inventory/summary', async (req, res) => {
  try {
    const pharmacyId = req.user._id;

    // Generate inventory summary
    const inventorySummary = {
      totalProducts: Math.floor(Math.random() * 1000) + 500,
      lowStockItems: Math.floor(Math.random() * 50) + 10,
      outOfStockItems: Math.floor(Math.random() * 20) + 5,
      inventoryValue: Math.floor(Math.random() * 1000000) + 200000,
      turnoverRate: Math.floor(Math.random() * 10) + 5,
      topSellingCategories: [
        { category: 'Pain Relief', revenue: Math.floor(Math.random() * 100000) + 50000, units: Math.floor(Math.random() * 1000) + 500 },
        { category: 'Antibiotics', revenue: Math.floor(Math.random() * 80000) + 40000, units: Math.floor(Math.random() * 800) + 400 },
        { category: 'Diabetes', revenue: Math.floor(Math.random() * 60000) + 30000, units: Math.floor(Math.random() * 600) + 300 }
      ],
      slowMovingItems: [
        { name: 'Item A', sku: 'SKU001', daysInStock: Math.floor(Math.random() * 100) + 50 },
        { name: 'Item B', sku: 'SKU002', daysInStock: Math.floor(Math.random() * 100) + 50 },
        { name: 'Item C', sku: 'SKU003', daysInStock: Math.floor(Math.random() * 100) + 50 }
      ]
    };

    res.json({
      success: true,
      data: inventorySummary
    });
  } catch (error) {
    console.error('Get inventory summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory summary',
      error: error.message
    });
  }
});

// GET /pharmacy/reports/suppliers/summary - Get suppliers summary
router.get('/suppliers/summary', async (req, res) => {
  try {
    const pharmacyId = req.user._id;

    // Get real supplier data
    const PharmacySupplier = (await import('../models/PharmacySupplier.js')).default;
    
    const totalSuppliers = await PharmacySupplier.countDocuments({
      pharmacy: pharmacyId,
      status: { $ne: 'deleted' }
    });

    const activeSuppliers = await PharmacySupplier.countDocuments({
      pharmacy: pharmacyId,
      status: 'active'
    });

    const preferredSuppliers = await PharmacySupplier.countDocuments({
      pharmacy: pharmacyId,
      isPreferred: true,
      status: { $ne: 'deleted' }
    });

    const suppliersSummary = {
      totalSuppliers,
      activeSuppliers,
      preferredSuppliers,
      averageDeliveryTime: Math.floor(Math.random() * 5) + 2, // days
      onTimeDeliveryRate: Math.floor(Math.random() * 10) + 85, // percentage
      supplierPerformance: [
        { supplier: 'Supplier A', orders: Math.floor(Math.random() * 100) + 50, rating: Math.floor(Math.random() * 2) + 3 },
        { supplier: 'Supplier B', orders: Math.floor(Math.random() * 80) + 40, rating: Math.floor(Math.random() * 2) + 3 },
        { supplier: 'Supplier C', orders: Math.floor(Math.random() * 60) + 30, rating: Math.floor(Math.random() * 2) + 3 }
      ]
    };

    res.json({
      success: true,
      data: suppliersSummary
    });
  } catch (error) {
    console.error('Get suppliers summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch suppliers summary',
      error: error.message
    });
  }
});

// GET /pharmacy/reports/prescriptions/summary - Get prescriptions summary
router.get('/prescriptions/summary', async (req, res) => {
  try {
    const pharmacyId = req.user._id;
    const { since, until } = req.query;

    const startDate = since ? new Date(since) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = until ? new Date(until) : new Date();

    // Generate prescriptions summary
    const prescriptionsSummary = {
      totalPrescriptions: Math.floor(Math.random() * 200) + 50,
      averagePrescriptionValue: Math.floor(Math.random() * 500) + 200,
      fulfillmentRate: Math.floor(Math.random() * 10) + 90, // percentage
      averageProcessingTime: Math.floor(Math.random() * 30) + 15, // minutes
      prescriptionsByStatus: [
        { status: 'pending', count: Math.floor(Math.random() * 50) + 10, percentage: 20 },
        { status: 'filled', count: Math.floor(Math.random() * 100) + 20, percentage: 60 },
        { status: 'dispensed', count: Math.floor(Math.random() * 80) + 15, percentage: 20 }
      ],
      topPrescribedMedications: [
        { medication: 'Paracetamol', count: Math.floor(Math.random() * 50) + 20 },
        { medication: 'Amoxicillin', count: Math.floor(Math.random() * 40) + 15 },
        { medication: 'Metformin', count: Math.floor(Math.random() * 30) + 10 }
      ]
    };

    res.json({
      success: true,
      data: prescriptionsSummary
    });
  } catch (error) {
    console.error('Get prescriptions summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescriptions summary',
      error: error.message
    });
  }
});

export default router;

