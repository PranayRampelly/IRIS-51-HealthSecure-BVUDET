import mongoose from 'mongoose';

const pharmacyReportSchema = new mongoose.Schema({
  // Report identification
  pharmacy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    required: true
  },
  reportType: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom'],
    required: true
  },
  reportDate: {
    type: Date,
    required: true
  },
  periodStart: {
    type: Date,
    required: true
  },
  periodEnd: {
    type: Date,
    required: true
  },

  // Revenue data
  revenue: {
    totalRevenue: { type: Number, default: 0 },
    revenueByDay: [{
      date: { type: Date, required: true },
      total: { type: Number, default: 0 },
      orders: { type: Number, default: 0 },
      averageOrderValue: { type: Number, default: 0 }
    }],
    revenueByStatus: [{
      status: { type: String, required: true },
      total: { type: Number, default: 0 },
      count: { type: Number, default: 0 }
    }],
    revenueByPaymentMethod: [{
      method: { type: String, required: true },
      total: { type: Number, default: 0 },
      count: { type: Number, default: 0 }
    }]
  },

  // Order data
  orders: {
    totalOrders: { type: Number, default: 0 },
    ordersByStatus: [{
      status: { type: String, required: true },
      count: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    }],
    ordersByDay: [{
      date: { type: Date, required: true },
      count: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    }],
    averageOrderValue: { type: Number, default: 0 },
    orderTrends: [{
      period: { type: String, required: true },
      count: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    }]
  },

  // Customer data
  customers: {
    totalCustomers: { type: Number, default: 0 },
    newCustomers: { type: Number, default: 0 },
    activeCustomers: { type: Number, default: 0 },
    topCustomers: [{
      customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'PharmacyCustomer' },
      customerName: { type: String, required: true },
      orders: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    }],
    customerRetention: { type: Number, default: 0 },
    customerSegments: [{
      segment: { type: String, required: true },
      count: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 }
    }]
  },

  // Product/Inventory data
  products: {
    totalProducts: { type: Number, default: 0 },
    topSellingProducts: [{
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'PharmacyProduct' },
      productName: { type: String, required: true },
      sku: { type: String, required: true },
      quantity: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      profit: { type: Number, default: 0 }
    }],
    lowStockProducts: [{
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'PharmacyProduct' },
      productName: { type: String, required: true },
      sku: { type: String, required: true },
      currentStock: { type: Number, default: 0 },
      minStock: { type: Number, default: 0 }
    }],
    categoryPerformance: [{
      category: { type: String, required: true },
      revenue: { type: Number, default: 0 },
      orders: { type: Number, default: 0 },
      profit: { type: Number, default: 0 }
    }]
  },

  // Supplier data
  suppliers: {
    totalSuppliers: { type: Number, default: 0 },
    activeSuppliers: { type: Number, default: 0 },
    topSuppliers: [{
      supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'PharmacySupplier' },
      supplierName: { type: String, required: true },
      orders: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    }],
    supplierPerformance: [{
      supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'PharmacySupplier' },
      supplierName: { type: String, required: true },
      onTimeDelivery: { type: Number, default: 0 },
      qualityRating: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 }
    }]
  },

  // Prescription data
  prescriptions: {
    totalPrescriptions: { type: Number, default: 0 },
    prescriptionsByStatus: [{
      status: { type: String, required: true },
      count: { type: Number, default: 0 }
    }],
    prescriptionsByDoctor: [{
      doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
      doctorName: { type: String, required: true },
      count: { type: Number, default: 0 }
    }],
    averagePrescriptionValue: { type: Number, default: 0 }
  },

  // Financial metrics
  financials: {
    grossProfit: { type: Number, default: 0 },
    netProfit: { type: Number, default: 0 },
    profitMargin: { type: Number, default: 0 },
    expenses: {
      total: { type: Number, default: 0 },
      categories: [{
        category: { type: String, required: true },
        amount: { type: Number, default: 0 }
      }]
    },
    taxes: { type: Number, default: 0 },
    discounts: { type: Number, default: 0 },
    refunds: { type: Number, default: 0 }
  },

  // Performance metrics
  performance: {
    averageOrderProcessingTime: { type: Number, default: 0 }, // in minutes
    averageDeliveryTime: { type: Number, default: 0 }, // in hours
    customerSatisfaction: { type: Number, default: 0 }, // rating out of 5
    returnRate: { type: Number, default: 0 }, // percentage
    inventoryTurnover: { type: Number, default: 0 },
    staffEfficiency: { type: Number, default: 0 }
  },

  // Geographic data
  geography: {
    ordersByLocation: [{
      location: { type: String, required: true },
      orders: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 }
    }],
    deliveryAreas: [{
      area: { type: String, required: true },
      orders: { type: Number, default: 0 },
      averageDeliveryTime: { type: Number, default: 0 }
    }]
  },

  // Time-based analytics
  timeAnalytics: {
    peakHours: [{
      hour: { type: Number, required: true },
      orders: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 }
    }],
    peakDays: [{
      day: { type: String, required: true },
      orders: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 }
    }],
    seasonalTrends: [{
      period: { type: String, required: true },
      orders: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 }
    }]
  },

  // Report metadata
  generatedAt: {
    type: Date,
    default: Date.now
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isAutomated: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['generating', 'completed', 'failed'],
    default: 'completed'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
pharmacyReportSchema.index({ pharmacy: 1, reportDate: -1 });
pharmacyReportSchema.index({ pharmacy: 1, reportType: 1 });
pharmacyReportSchema.index({ pharmacy: 1, periodStart: 1, periodEnd: 1 });
pharmacyReportSchema.index({ generatedAt: -1 });

// Virtual for report duration
pharmacyReportSchema.virtual('duration').get(function() {
  const diffTime = Math.abs(this.periodEnd - this.periodStart);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Static methods
pharmacyReportSchema.statics.findByPharmacy = function(pharmacyId, options = {}) {
  const query = { pharmacy: pharmacyId };
  
  if (options.reportType) {
    query.reportType = options.reportType;
  }
  
  if (options.startDate && options.endDate) {
    query.periodStart = { $gte: options.startDate };
    query.periodEnd = { $lte: options.endDate };
  }
  
  return this.find(query).sort({ reportDate: -1 });
};

pharmacyReportSchema.statics.getLatestReport = function(pharmacyId, reportType = 'daily') {
  return this.findOne({ 
    pharmacy: pharmacyId, 
    reportType 
  }).sort({ reportDate: -1 });
};

pharmacyReportSchema.statics.generateReport = async function(pharmacyId, reportType, startDate, endDate) {
  // This method will be implemented in the controller
  // It will aggregate data from various collections
  return this.create({
    pharmacy: pharmacyId,
    reportType,
    reportDate: new Date(),
    periodStart: startDate,
    periodEnd: endDate,
    status: 'generating'
  });
};

// Instance methods
pharmacyReportSchema.methods.calculateMetrics = function() {
  // Calculate derived metrics
  if (this.orders.totalOrders > 0) {
    this.orders.averageOrderValue = this.revenue.totalRevenue / this.orders.totalOrders;
  }
  
  if (this.revenue.totalRevenue > 0) {
    this.financials.profitMargin = (this.financials.netProfit / this.revenue.totalRevenue) * 100;
  }
  
  if (this.customers.totalCustomers > 0) {
    this.customers.customerRetention = (this.customers.activeCustomers / this.customers.totalCustomers) * 100;
  }
  
  return this.save();
};

pharmacyReportSchema.methods.exportToCSV = function() {
  // Export report data to CSV format
  const csvData = {
    revenue: this.revenue,
    orders: this.orders,
    customers: this.customers,
    products: this.products,
    suppliers: this.suppliers,
    prescriptions: this.prescriptions,
    financials: this.financials,
    performance: this.performance
  };
  
  return csvData;
};

const PharmacyReport = mongoose.model('PharmacyReport', pharmacyReportSchema);

export default PharmacyReport;

