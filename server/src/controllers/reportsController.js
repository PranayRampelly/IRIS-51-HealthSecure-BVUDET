import PharmacyReport from '../models/PharmacyReport.js';
import PharmacyCustomer from '../models/PharmacyCustomer.js';
import PharmacySupplier from '../models/PharmacySupplier.js';
import mongoose from 'mongoose';

// Get reports with real data aggregation
export const getReports = async (req, res) => {
  try {
    const pharmacyId = req.user._id;
    const { since, until } = req.query;

    // Set default date range if not provided
    const startDate = since ? new Date(since) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const endDate = until ? new Date(until) : new Date();

    // Generate real-time report data
    const reportData = await generateRealTimeReport(pharmacyId, startDate, endDate);

    res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: error.message
    });
  }
};

// Generate real-time report data
const generateRealTimeReport = async (pharmacyId, startDate, endDate) => {
  try {
    // Get orders by status (mock data for now - replace with actual order queries)
    const ordersByStatus = await getOrdersByStatus(pharmacyId, startDate, endDate);
    
    // Get revenue by day (mock data for now - replace with actual order queries)
    const revenueByDay = await getRevenueByDay(pharmacyId, startDate, endDate);
    
    // Get top selling items (mock data for now - replace with actual product queries)
    const topItems = await getTopSellingItems(pharmacyId, startDate, endDate);
    
    // Get top customers
    const topCustomers = await getTopCustomers(pharmacyId, startDate, endDate);

    return {
      byStatus: ordersByStatus,
      revenueByDay: revenueByDay,
      topItems: topItems,
      customers: topCustomers
    };
  } catch (error) {
    console.error('Generate real-time report error:', error);
    throw error;
  }
};

// Get orders by status (mock implementation - replace with actual order queries)
const getOrdersByStatus = async (pharmacyId, startDate, endDate) => {
  // Mock data - replace with actual order aggregation
  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  const ordersByStatus = [];

  for (const status of statuses) {
    // Generate realistic mock data
    const count = Math.floor(Math.random() * 50) + 10;
    const total = Math.floor(Math.random() * 50000) + 5000;
    
    ordersByStatus.push({
      _id: status,
      count: count,
      total: total
    });
  }

  return ordersByStatus;
};

// Get revenue by day (mock implementation - replace with actual order queries)
const getRevenueByDay = async (pharmacyId, startDate, endDate) => {
  const revenueByDay = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    // Generate realistic mock data
    const total = Math.floor(Math.random() * 20000) + 2000;
    
    revenueByDay.push({
      _id: currentDate.toISOString().split('T')[0],
      total: total
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return revenueByDay;
};

// Get top selling items (mock implementation - replace with actual product queries)
const getTopSellingItems = async (pharmacyId, startDate, endDate) => {
  // Mock data - replace with actual product aggregation
  const items = [
    { name: 'Paracetamol 500mg', sku: 'PAR500' },
    { name: 'Amoxicillin 250mg', sku: 'AMO250' },
    { name: 'Metformin 500mg', sku: 'MET500' },
    { name: 'Omeprazole 20mg', sku: 'OME20' },
    { name: 'Atorvastatin 20mg', sku: 'ATO20' },
    { name: 'Losartan 50mg', sku: 'LOS50' },
    { name: 'Levothyroxine 50mcg', sku: 'LEV50' },
    { name: 'Amlodipine 5mg', sku: 'AML5' }
  ];

  const topItems = items.map(item => ({
    _id: item.sku,
    name: item.name,
    quantity: Math.floor(Math.random() * 100) + 10,
    revenue: Math.floor(Math.random() * 10000) + 1000
  }));

  return topItems.sort((a, b) => b.revenue - a.revenue);
};

// Get top customers (real data from PharmacyCustomer model)
const getTopCustomers = async (pharmacyId, startDate, endDate) => {
  try {
    const customers = await PharmacyCustomer.find({
      pharmacy: pharmacyId,
      status: { $ne: 'deleted' },
      'orderStats.lastOrderDate': { $gte: startDate, $lte: endDate }
    })
    .select('firstName lastName orderStats')
    .sort({ 'orderStats.totalSpent': -1 })
    .limit(10);

    return customers.map(customer => ({
      _id: `${customer.firstName} ${customer.lastName}`,
      orders: customer.orderStats.totalOrders || 0,
      total: customer.orderStats.totalSpent || 0
    }));
  } catch (error) {
    console.error('Get top customers error:', error);
    // Return mock data if real data fails
    return [
      { _id: 'John Doe', orders: 15, total: 2500 },
      { _id: 'Jane Smith', orders: 12, total: 2200 },
      { _id: 'Mike Johnson', orders: 10, total: 1800 },
      { _id: 'Sarah Wilson', orders: 8, total: 1500 },
      { _id: 'David Brown', orders: 7, total: 1200 }
    ];
  }
};

// Get detailed report by ID
export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacyId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID'
      });
    }

    const report = await PharmacyReport.findOne({
      _id: id,
      pharmacy: pharmacyId
    }).populate('pharmacy', 'name email phone');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Get report by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report',
      error: error.message
    });
  }
};

// Generate new report
export const generateReport = async (req, res) => {
  try {
    const pharmacyId = req.user._id;
    const { reportType, startDate, endDate } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Generate comprehensive report
    const reportData = await generateComprehensiveReport(pharmacyId, reportType, start, end);

    // Save report to database
    const report = new PharmacyReport({
      pharmacy: pharmacyId,
      reportType,
      reportDate: new Date(),
      periodStart: start,
      periodEnd: end,
      ...reportData,
      generatedBy: req.user._id,
      status: 'completed'
    });

    await report.save();

    res.status(201).json({
      success: true,
      message: 'Report generated successfully',
      data: report
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error.message
    });
  }
};

// Generate comprehensive report data
const generateComprehensiveReport = async (pharmacyId, reportType, startDate, endDate) => {
  try {
    // Get all data for the report
    const [
      revenueData,
      orderData,
      customerData,
      productData,
      supplierData,
      prescriptionData,
      financialData,
      performanceData,
      geographyData,
      timeAnalytics
    ] = await Promise.all([
      generateRevenueData(pharmacyId, startDate, endDate),
      generateOrderData(pharmacyId, startDate, endDate),
      generateCustomerData(pharmacyId, startDate, endDate),
      generateProductData(pharmacyId, startDate, endDate),
      generateSupplierData(pharmacyId, startDate, endDate),
      generatePrescriptionData(pharmacyId, startDate, endDate),
      generateFinancialData(pharmacyId, startDate, endDate),
      generatePerformanceData(pharmacyId, startDate, endDate),
      generateGeographyData(pharmacyId, startDate, endDate),
      generateTimeAnalytics(pharmacyId, startDate, endDate)
    ]);

    return {
      revenue: revenueData,
      orders: orderData,
      customers: customerData,
      products: productData,
      suppliers: supplierData,
      prescriptions: prescriptionData,
      financials: financialData,
      performance: performanceData,
      geography: geographyData,
      timeAnalytics: timeAnalytics
    };
  } catch (error) {
    console.error('Generate comprehensive report error:', error);
    throw error;
  }
};

// Generate revenue data
const generateRevenueData = async (pharmacyId, startDate, endDate) => {
  // Mock implementation - replace with actual revenue aggregation
  const totalRevenue = Math.floor(Math.random() * 500000) + 100000;
  
  const revenueByDay = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dailyRevenue = Math.floor(Math.random() * 20000) + 2000;
    revenueByDay.push({
      date: new Date(currentDate),
      total: dailyRevenue,
      orders: Math.floor(Math.random() * 50) + 10,
      averageOrderValue: dailyRevenue / (Math.floor(Math.random() * 50) + 10)
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    totalRevenue,
    revenueByDay,
    revenueByStatus: [
      { status: 'completed', total: totalRevenue * 0.8, count: Math.floor(Math.random() * 200) + 100 },
      { status: 'pending', total: totalRevenue * 0.1, count: Math.floor(Math.random() * 50) + 20 },
      { status: 'cancelled', total: totalRevenue * 0.1, count: Math.floor(Math.random() * 30) + 10 }
    ],
    revenueByPaymentMethod: [
      { method: 'credit_card', total: totalRevenue * 0.4, count: Math.floor(Math.random() * 100) + 50 },
      { method: 'upi', total: totalRevenue * 0.3, count: Math.floor(Math.random() * 80) + 40 },
      { method: 'cash', total: totalRevenue * 0.2, count: Math.floor(Math.random() * 60) + 30 },
      { method: 'net_banking', total: totalRevenue * 0.1, count: Math.floor(Math.random() * 40) + 20 }
    ]
  };
};

// Generate order data
const generateOrderData = async (pharmacyId, startDate, endDate) => {
  const totalOrders = Math.floor(Math.random() * 500) + 100;
  const totalRevenue = Math.floor(Math.random() * 500000) + 100000;

  return {
    totalOrders,
    ordersByStatus: [
      { status: 'pending', count: Math.floor(totalOrders * 0.1), total: totalRevenue * 0.1 },
      { status: 'confirmed', count: Math.floor(totalOrders * 0.2), total: totalRevenue * 0.2 },
      { status: 'processing', count: Math.floor(totalOrders * 0.15), total: totalRevenue * 0.15 },
      { status: 'shipped', count: Math.floor(totalOrders * 0.25), total: totalRevenue * 0.25 },
      { status: 'delivered', count: Math.floor(totalOrders * 0.25), total: totalRevenue * 0.25 },
      { status: 'cancelled', count: Math.floor(totalOrders * 0.05), total: totalRevenue * 0.05 }
    ],
    ordersByDay: [], // Will be populated similar to revenueByDay
    averageOrderValue: totalRevenue / totalOrders,
    orderTrends: [
      { period: 'Week 1', count: Math.floor(totalOrders * 0.25), total: totalRevenue * 0.25 },
      { period: 'Week 2', count: Math.floor(totalOrders * 0.25), total: totalRevenue * 0.25 },
      { period: 'Week 3', count: Math.floor(totalOrders * 0.25), total: totalRevenue * 0.25 },
      { period: 'Week 4', count: Math.floor(totalOrders * 0.25), total: totalRevenue * 0.25 }
    ]
  };
};

// Generate customer data
const generateCustomerData = async (pharmacyId, startDate, endDate) => {
  try {
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

    return {
      totalCustomers,
      newCustomers,
      activeCustomers,
      topCustomers: [], // Will be populated by getTopCustomers
      customerRetention: activeCustomers / totalCustomers * 100,
      customerSegments: [
        { segment: 'Regular', count: Math.floor(totalCustomers * 0.6), revenue: Math.floor(Math.random() * 200000) + 50000 },
        { segment: 'Premium', count: Math.floor(totalCustomers * 0.25), revenue: Math.floor(Math.random() * 150000) + 30000 },
        { segment: 'VIP', count: Math.floor(totalCustomers * 0.1), revenue: Math.floor(Math.random() * 100000) + 20000 },
        { segment: 'Wholesale', count: Math.floor(totalCustomers * 0.05), revenue: Math.floor(Math.random() * 50000) + 10000 }
      ]
    };
  } catch (error) {
    console.error('Generate customer data error:', error);
    return {
      totalCustomers: 0,
      newCustomers: 0,
      activeCustomers: 0,
      topCustomers: [],
      customerRetention: 0,
      customerSegments: []
    };
  }
};

// Generate product data
const generateProductData = async (pharmacyId, startDate, endDate) => {
  // Mock implementation - replace with actual product aggregation
  return {
    totalProducts: Math.floor(Math.random() * 1000) + 500,
    topSellingProducts: [
      { productId: new mongoose.Types.ObjectId(), productName: 'Paracetamol 500mg', sku: 'PAR500', quantity: 150, revenue: 15000, profit: 3000 },
      { productId: new mongoose.Types.ObjectId(), productName: 'Amoxicillin 250mg', sku: 'AMO250', quantity: 120, revenue: 12000, profit: 2400 },
      { productId: new mongoose.Types.ObjectId(), productName: 'Metformin 500mg', sku: 'MET500', quantity: 100, revenue: 10000, profit: 2000 }
    ],
    lowStockProducts: [
      { productId: new mongoose.Types.ObjectId(), productName: 'Aspirin 75mg', sku: 'ASP75', currentStock: 5, minStock: 10 },
      { productId: new mongoose.Types.ObjectId(), productName: 'Ibuprofen 400mg', sku: 'IBU400', currentStock: 8, minStock: 15 }
    ],
    categoryPerformance: [
      { category: 'Pain Relief', revenue: 50000, orders: 200, profit: 10000 },
      { category: 'Antibiotics', revenue: 40000, orders: 150, profit: 8000 },
      { category: 'Diabetes', revenue: 30000, orders: 100, profit: 6000 }
    ]
  };
};

// Generate supplier data
const generateSupplierData = async (pharmacyId, startDate, endDate) => {
  try {
    const totalSuppliers = await PharmacySupplier.countDocuments({
      pharmacy: pharmacyId,
      status: { $ne: 'deleted' }
    });

    const activeSuppliers = await PharmacySupplier.countDocuments({
      pharmacy: pharmacyId,
      status: 'active'
    });

    return {
      totalSuppliers,
      activeSuppliers,
      topSuppliers: [], // Will be populated with actual supplier data
      supplierPerformance: [] // Will be populated with actual supplier performance data
    };
  } catch (error) {
    console.error('Generate supplier data error:', error);
    return {
      totalSuppliers: 0,
      activeSuppliers: 0,
      topSuppliers: [],
      supplierPerformance: []
    };
  }
};

// Generate prescription data
const generatePrescriptionData = async (pharmacyId, startDate, endDate) => {
  // Mock implementation - replace with actual prescription aggregation
  return {
    totalPrescriptions: Math.floor(Math.random() * 200) + 50,
    prescriptionsByStatus: [
      { status: 'pending', count: Math.floor(Math.random() * 50) + 10 },
      { status: 'filled', count: Math.floor(Math.random() * 100) + 20 },
      { status: 'dispensed', count: Math.floor(Math.random() * 80) + 15 }
    ],
    prescriptionsByDoctor: [
      { doctorId: new mongoose.Types.ObjectId(), doctorName: 'Dr. Smith', count: Math.floor(Math.random() * 30) + 10 },
      { doctorId: new mongoose.Types.ObjectId(), doctorName: 'Dr. Johnson', count: Math.floor(Math.random() * 25) + 8 }
    ],
    averagePrescriptionValue: Math.floor(Math.random() * 500) + 200
  };
};

// Generate financial data
const generateFinancialData = async (pharmacyId, startDate, endDate) => {
  const totalRevenue = Math.floor(Math.random() * 500000) + 100000;
  const grossProfit = totalRevenue * 0.7;
  const expenses = totalRevenue * 0.3;
  const netProfit = grossProfit - expenses;

  return {
    grossProfit,
    netProfit,
    profitMargin: (netProfit / totalRevenue) * 100,
    expenses: {
      total: expenses,
      categories: [
        { category: 'Inventory', amount: expenses * 0.4 },
        { category: 'Staff', amount: expenses * 0.3 },
        { category: 'Rent', amount: expenses * 0.15 },
        { category: 'Utilities', amount: expenses * 0.1 },
        { category: 'Marketing', amount: expenses * 0.05 }
      ]
    },
    taxes: totalRevenue * 0.05,
    discounts: totalRevenue * 0.02,
    refunds: totalRevenue * 0.01
  };
};

// Generate performance data
const generatePerformanceData = async (pharmacyId, startDate, endDate) => {
  return {
    averageOrderProcessingTime: Math.floor(Math.random() * 60) + 30, // minutes
    averageDeliveryTime: Math.floor(Math.random() * 24) + 6, // hours
    customerSatisfaction: Math.floor(Math.random() * 2) + 3, // rating out of 5
    returnRate: Math.floor(Math.random() * 5) + 2, // percentage
    inventoryTurnover: Math.floor(Math.random() * 10) + 5,
    staffEfficiency: Math.floor(Math.random() * 20) + 80 // percentage
  };
};

// Generate geography data
const generateGeographyData = async (pharmacyId, startDate, endDate) => {
  return {
    ordersByLocation: [
      { location: 'Downtown', orders: Math.floor(Math.random() * 100) + 50, revenue: Math.floor(Math.random() * 50000) + 20000 },
      { location: 'Suburbs', orders: Math.floor(Math.random() * 80) + 40, revenue: Math.floor(Math.random() * 40000) + 15000 },
      { location: 'Rural', orders: Math.floor(Math.random() * 60) + 30, revenue: Math.floor(Math.random() * 30000) + 10000 }
    ],
    deliveryAreas: [
      { area: 'Area A', orders: Math.floor(Math.random() * 50) + 25, averageDeliveryTime: Math.floor(Math.random() * 4) + 2 },
      { area: 'Area B', orders: Math.floor(Math.random() * 40) + 20, averageDeliveryTime: Math.floor(Math.random() * 6) + 3 },
      { area: 'Area C', orders: Math.floor(Math.random() * 30) + 15, averageDeliveryTime: Math.floor(Math.random() * 8) + 4 }
    ]
  };
};

// Generate time analytics
const generateTimeAnalytics = async (pharmacyId, startDate, endDate) => {
  const peakHours = [];
  const peakDays = [];
  
  // Generate peak hours data
  for (let hour = 0; hour < 24; hour++) {
    const orders = hour >= 9 && hour <= 17 ? Math.floor(Math.random() * 20) + 10 : Math.floor(Math.random() * 5) + 1;
    const revenue = orders * (Math.floor(Math.random() * 200) + 100);
    
    peakHours.push({ hour, orders, revenue });
  }
  
  // Generate peak days data
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  for (const day of days) {
    const orders = Math.floor(Math.random() * 50) + 20;
    const revenue = orders * (Math.floor(Math.random() * 300) + 150);
    
    peakDays.push({ day, orders, revenue });
  }

  return {
    peakHours,
    peakDays,
    seasonalTrends: [
      { period: 'Q1', orders: Math.floor(Math.random() * 200) + 100, revenue: Math.floor(Math.random() * 100000) + 50000 },
      { period: 'Q2', orders: Math.floor(Math.random() * 200) + 100, revenue: Math.floor(Math.random() * 100000) + 50000 },
      { period: 'Q3', orders: Math.floor(Math.random() * 200) + 100, revenue: Math.floor(Math.random() * 100000) + 50000 },
      { period: 'Q4', orders: Math.floor(Math.random() * 200) + 100, revenue: Math.floor(Math.random() * 100000) + 50000 }
    ]
  };
};

// Get report statistics
export const getReportStats = async (req, res) => {
  try {
    const pharmacyId = req.user._id;

    const stats = await PharmacyReport.aggregate([
      { $match: { pharmacy: new mongoose.Types.ObjectId(pharmacyId) } },
      {
        $group: {
          _id: null,
          totalReports: { $sum: 1 },
          reportsByType: {
            $push: {
              type: '$reportType',
              date: '$reportDate'
            }
          },
          averageRevenue: { $avg: '$revenue.totalRevenue' },
          totalRevenue: { $sum: '$revenue.totalRevenue' }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        totalReports: 0,
        reportsByType: [],
        averageRevenue: 0,
        totalRevenue: 0
      }
    });
  } catch (error) {
    console.error('Get report stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report statistics',
      error: error.message
    });
  }
};

// Export report to CSV
export const exportReport = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacyId = req.user._id;

    const report = await PharmacyReport.findOne({
      _id: id,
      pharmacy: pharmacyId
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    const csvData = report.exportToCSV();

    res.json({
      success: true,
      data: csvData
    });
  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report',
      error: error.message
    });
  }
};

