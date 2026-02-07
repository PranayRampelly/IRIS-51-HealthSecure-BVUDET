import PharmacyInventoryItem from '../models/PharmacyInventoryItem.js';
import PharmacyOrder from '../models/PharmacyOrder.js';
import PharmacyPrescription from '../models/PharmacyPrescription.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import PharmacySupplier from '../models/PharmacySupplier.js';
import PharmacyCustomer from '../models/PharmacyCustomer.js';
import PharmacySettings from '../models/PharmacySettings.js';
import PharmacyProfile from '../models/PharmacyProfile.js';
import PharmacyService from '../services/pharmacyService.js';
import PatientOrder from '../models/PatientOrder.js';
import User from '../models/User.js';

// Utility function to convert form data to proper types for PharmacyProfile
const convertPharmacyProfileData = (data) => {
  const convertedData = { ...data };

  // Convert string values to appropriate types for Boolean fields
  const booleanFields = [
    'emergencyServices', 'homeDelivery', 'acceptCOD', 'acceptOnlinePayment',
    'prescriptionServices', 'consultationServices', 'orderUpdates',
    'emailNotifications', 'smsNotifications', 'autoReorder'
  ];

  booleanFields.forEach(field => {
    if (convertedData[field] !== undefined) {
      convertedData[field] = convertedData[field] === 'true' || convertedData[field] === true;
    }
  });

  // Convert numeric fields
  const numericFields = {
    deliveryRadius: { type: 'float', default: 5 },
    deliveryCharges: { type: 'float', default: 0 },
    freeDeliveryThreshold: { type: 'float', default: 0 },
    lowStockThreshold: { type: 'int', default: 10 },
    taxRate: { type: 'float', default: 18 },
    establishmentYear: { type: 'int', default: null }
  };

  Object.entries(numericFields).forEach(([field, config]) => {
    if (convertedData[field] !== undefined) {
      if (config.type === 'float') {
        convertedData[field] = parseFloat(convertedData[field]) || config.default;
      } else if (config.type === 'int') {
        convertedData[field] = parseInt(convertedData[field]) || config.default;
      }
    }
  });

  return convertedData;
};

export const getDashboard = async (req, res) => {
  try {
    const pharmacyId = req.user._id;
    const analytics = await PharmacyService.getPharmacyAnalytics(pharmacyId, '30');

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's orders
    const todayOrders = await PatientOrder.find({ 
      'items.pharmacy': pharmacyId,
      createdAt: { $gte: today, $lt: tomorrow }
    }).lean();

    // Get pending orders
    const pendingOrders = await PatientOrder.find({ 
      'items.pharmacy': pharmacyId,
      status: { $in: ['pending', 'confirmed', 'processing'] }
    }).lean();

    // Get recent orders with full details
    const recentOrders = await PatientOrder.find({ 'items.pharmacy': pharmacyId })
      .populate('patientId', 'firstName lastName email phone')
      .populate('items.medicineId', 'name generic dosage form manufacturer cloudinaryUrl')
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    // Get low stock items
    const lowStockItems = await PharmacyInventoryItem.find({
      pharmacy: pharmacyId,
      stock: { $lte: 10 }
    })
      .sort({ stock: 1 })
      .limit(10)
      .lean();

    // Get prescription queue
    const prescriptions = await PharmacyPrescription.find({ pharmacy: pharmacyId })
      .populate('patientId', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Calculate additional metrics
    const totalCustomers = await PatientOrder.distinct('patientId', { 'items.pharmacy': pharmacyId });
    const averageOrderValue = analytics.totalOrders > 0 ? analytics.totalRevenue / analytics.totalOrders : 0;

    res.json({
      metrics: {
        totalOrdersToday: todayOrders.length,
        pendingOrders: pendingOrders.length,
        prescriptionsQueued: prescriptions.length,
        revenueToday: todayOrders.reduce((sum, order) => sum + (order.pricing?.grandTotal || 0), 0),
        totalCustomers: totalCustomers.length,
        averageOrderValue: Math.round(averageOrderValue),
        deliverySuccessRate: 98.5, // Placeholder - can be calculated from historical data
        customerSatisfaction: 4.7, // Placeholder - can be calculated from reviews
      },
      recentOrders: recentOrders.map((o) => ({
        id: o._id,
        orderNumber: o.orderNumber,
        customer: `${o.patientId?.firstName || ''} ${o.patientId?.lastName || ''}`.trim(),
        items: o.items?.length || 0,
        total: o.pricing?.grandTotal || 0,
        totalAmount: o.pricing?.grandTotal || 0,
        status: o.status,
        placedAt: o.createdAt,
        orderDate: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '',
        estimatedDelivery: o.deliveryDetails?.estimatedDelivery || o.deliveryDetails?.deliveryDate || '',
        trackingNumber: o.deliveryDetails?.trackingNumber || o.trackingNumber || '',
        paymentStatus: o.paymentDetails?.status || 'pending',
        deliveryAddress: o.deliveryDetails?.address || o.deliveryDetails?.fullAddress || '',
        medicines: o.items?.map(item => ({
          name: item.medicineId?.name || item.medicineName || 'Unknown Medicine',
          quantity: item.quantity || 0,
          price: item.unitPrice || item.price || 0
        })) || []
      })),
      prescriptions: prescriptions.map((p) => ({
        id: p._id,
        medicine: p.medicineName || 'Unknown Medicine',
        patientName: `${p.patientId?.firstName || ''} ${p.patientId?.lastName || ''}`.trim(),
        doctorName: p.doctorName || 'Dr. Unknown',
        dosage: p.dosage || '1 capsule',
        frequency: p.frequency || '3 times daily',
        duration: p.duration || p.days || '',
        refills: p.refills || p.refillsRemaining || 0,
        status: p.status || 'active',
        prescribedDate: p.prescribedDate || p.createdAt
      })),
      lowStock: lowStockItems.map((i) => ({
        id: i._id,
        sku: i.sku,
        name: i.name,
        stock: i.stock,
        threshold: i.threshold || 10,
        cloudinaryUrl: i.cloudinaryUrl,
      })),
      deliveries: [
        { id: 'DL-201', time: '11:30 AM', vendor: 'HealthSupply Co.' },
        { id: 'DL-202', time: '02:15 PM', vendor: 'MediLogistics' },
      ],
    });
  } catch (error) {
    console.error('Pharmacy dashboard error:', error);
    res.status(500).json({ message: 'Failed to load pharmacy dashboard' });
  }
};

export const listInventory = async (req, res) => {
  try {
    const pharmacyId = req.user._id;
    const { search, category, inStock, sortBy, page = 1, limit = 20 } = req.query;

    const filters = {};
    if (search) filters.search = search;
    if (category && category !== 'all') filters.category = category;
    if (inStock !== undefined) filters.inStock = inStock === 'true';

    const inventory = await PharmacyService.getInventory(pharmacyId, filters);
    
    // Apply sorting
    let sortedInventory = inventory;
    switch (sortBy) {
      case 'name':
        sortedInventory = inventory.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'stock':
        sortedInventory = inventory.sort((a, b) => (a.stock || 0) - (b.stock || 0));
        break;
      case 'price':
        sortedInventory = inventory.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      default:
        // Keep original order
        break;
    }

    // Apply pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedInventory = sortedInventory.slice(startIndex, endIndex);

    res.json({
      inventory: paginatedInventory,
      pagination: {
        total: inventory.length,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(inventory.length / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('List inventory error:', error);
    res.status(500).json({ message: 'Failed to fetch inventory' });
  }
};

export const getMedicineDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const medicine = await PharmacyService.getMedicineDetails(id);
    
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    // Transform the data to match the frontend Medicine interface
    const medicineDetails = {
      id: medicine._id,
      name: medicine.name,
      generic: medicine.generic || '',
      dosage: medicine.dosage || '',
      form: medicine.form || '',
      manufacturer: medicine.manufacturer || '',
      description: medicine.description || '',
      sideEffects: medicine.sideEffects || [],
      interactions: medicine.interactions || [],
      contraindications: medicine.contraindications || [],
      price: {
        generic: medicine.genericPrice || medicine.price || 0,
        brand: medicine.brandPrice || medicine.price || 0,
        savings: (medicine.brandPrice || medicine.price || 0) - (medicine.genericPrice || medicine.price || 0),
        insuranceCovered: medicine.insuranceCovered || false,
        insurancePrice: medicine.insurancePrice || 0,
      },
      availability: {
        inStock: medicine.stock > 0,
        quantity: medicine.stock || 0,
        deliveryTime: medicine.deliveryTime || '1-2 days',
      },
      rating: medicine.rating || 0,
      reviews: medicine.reviews || 0,
      cloudinaryUrl: medicine.cloudinaryUrl,
      category: medicine.category || 'General',
      prescriptionRequired: medicine.prescriptionRequired || false,
      sku: medicine.sku,
      threshold: medicine.threshold || 10,
      expiryDate: medicine.expiryDate,
      storage: medicine.storage,
      dosageInstructions: medicine.dosageInstructions
    };

    res.json(medicineDetails);
  } catch (error) {
    console.error('Get medicine details error:', error);
    res.status(500).json({ message: 'Failed to fetch medicine details' });
  }
};

export const createInventoryItem = async (req, res) => {
  try {
    const pharmacyId = req.user._id;
    const {
      sku,
      name,
      stock,
      threshold,
      price,
      generic,
      dosage,
      form,
      manufacturer,
      description,
      category,
      prescriptionRequired,
      expiryDate,
      storage,
      dosageInstructions,
      deliveryTime,
      genericPrice,
      brandPrice,
      insuranceCovered,
      insurancePrice,
      rating,
      reviews
    } = req.body;

    // Check if SKU already exists for this pharmacy
    const existingItem = await PharmacyInventoryItem.findOne({ pharmacy: pharmacyId, sku });
    if (existingItem) {
      return res.status(400).json({ message: 'SKU already exists for this pharmacy' });
    }

    // Handle image upload - file is already uploaded to Cloudinary by middleware
    let cloudinaryUrl, cloudinaryId;
    if (req.file) {
      cloudinaryUrl = req.file.path || req.file.url;
      cloudinaryId = req.file.filename || req.file.public_id;
    }

    const inventoryItem = new PharmacyInventoryItem({
      pharmacy: pharmacyId,
      sku,
      name,
      stock: parseInt(stock) || 0,
      threshold: parseInt(threshold) || 10,
      price: parseFloat(price) || 0,
      generic,
      dosage,
      form,
      manufacturer,
      description,
      category,
      prescriptionRequired: prescriptionRequired === 'true',
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      storage,
      dosageInstructions,
      deliveryTime,
      genericPrice: parseFloat(genericPrice) || parseFloat(price) || 0,
      brandPrice: parseFloat(brandPrice) || parseFloat(price) || 0,
      insuranceCovered: insuranceCovered === 'true',
      insurancePrice: parseFloat(insurancePrice) || 0,
      rating: parseFloat(rating) || 0,
      reviews: parseInt(reviews) || 0,
      cloudinaryUrl,
      cloudinaryId
    });

    await inventoryItem.save();

    res.status(201).json({
      message: 'Inventory item created successfully',
      item: inventoryItem
    });
  } catch (error) {
    console.error('Create inventory item error:', error);
    res.status(500).json({ message: 'Failed to create inventory item' });
  }
};

export const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacyId = req.user._id;
    const updateData = { ...req.body };

    // Handle image upload - file is already uploaded to Cloudinary by middleware
    if (req.file) {
      updateData.cloudinaryUrl = req.file.path || req.file.url;
      updateData.cloudinaryId = req.file.filename || req.file.public_id;
    }

    // Convert string values to appropriate types
    if (updateData.stock !== undefined) updateData.stock = parseInt(updateData.stock);
    if (updateData.threshold !== undefined) updateData.threshold = parseInt(updateData.threshold);
    if (updateData.price !== undefined) updateData.price = parseFloat(updateData.price);
    if (updateData.genericPrice !== undefined) updateData.genericPrice = parseFloat(updateData.genericPrice);
    if (updateData.brandPrice !== undefined) updateData.brandPrice = parseFloat(updateData.brandPrice);
    if (updateData.insurancePrice !== undefined) updateData.insurancePrice = parseFloat(updateData.insurancePrice);
    if (updateData.rating !== undefined) updateData.rating = parseFloat(updateData.rating);
    if (updateData.reviews !== undefined) updateData.reviews = parseInt(updateData.reviews);
    if (updateData.prescriptionRequired !== undefined) updateData.prescriptionRequired = updateData.prescriptionRequired === 'true';
    if (updateData.insuranceCovered !== undefined) updateData.insuranceCovered = updateData.insuranceCovered === 'true';
    if (updateData.expiryDate !== undefined) updateData.expiryDate = new Date(updateData.expiryDate);

    const updatedItem = await PharmacyInventoryItem.findOneAndUpdate(
      { _id: id, pharmacy: pharmacyId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Inventory item not found or does not belong to this pharmacy' });
    }

    res.json({
      message: 'Inventory item updated successfully',
      item: updatedItem
    });
  } catch (error) {
    console.error('Update inventory item error:', error);
    res.status(500).json({ message: 'Failed to update inventory item' });
  }
};

export const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacyId = req.user._id;

    const item = await PharmacyInventoryItem.findOne({ _id: id, pharmacy: pharmacyId });
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found or does not belong to this pharmacy' });
    }

    // Delete image from Cloudinary if exists
    if (item.cloudinaryId) {
      await deleteFromCloudinary(item.cloudinaryId);
    }

    await PharmacyInventoryItem.findOneAndDelete({ _id: id, pharmacy: pharmacyId });

    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({ message: 'Failed to delete inventory item' });
  }
};

export const listOrders = async (req, res) => {
  try {
    const pharmacyId = req.user._id;
    const { status, page = 1, limit = 20 } = req.query;

    const query = { 'items.pharmacy': pharmacyId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await PatientOrder.find(query)
      .populate('patientId', 'firstName lastName email phone')
      .populate('items.medicineId', 'name generic dosage form manufacturer cloudinaryUrl')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const total = await PatientOrder.countDocuments(query);

    res.json({
      orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('List orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

export const createOrder = async (req, res) => {
  try {
    const pharmacyId = req.user._id;
    // Support multipart/form-data where the frontend sends JSON in a 'payload' field
    let orderData = req.body;
    if (orderData && typeof orderData.payload === 'string') {
      try {
        const parsed = JSON.parse(orderData.payload);
        // Merge parsed payload with any top-level fields (e.g., from form inputs)
        orderData = { ...parsed, ...orderData };
        delete orderData.payload;
      } catch (e) {
        console.warn('Failed to parse multipart payload JSON:', e?.message);
      }
    }

    // Handle prescription file upload - file is already uploaded to Cloudinary by middleware
    if (req.file) {
      orderData.prescriptionCloudinaryUrl = req.file.path || req.file.url;
      orderData.prescriptionCloudinaryId = req.file.filename || req.file.public_id;
    }

    // Ensure all items have the pharmacy ID
    if (orderData.items && Array.isArray(orderData.items)) {
      orderData.items = orderData.items.map(item => ({
        ...item,
        pharmacy: item.pharmacy || pharmacyId
      }));
    }

    const order = await PharmacyService.createOrder(orderData);
    
    // Automatically sync customers from order (already done in PharmacyService.createOrder)
    
    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const pharmacyId = req.user._id;

    const updatedOrder = await PharmacyService.updateOrderStatus(id, pharmacyId, status);
    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const listPrescriptions = async (req, res) => {
  try {
    const pharmacyId = req.user._id;
    const { status, page = 1, limit = 20 } = req.query;

    const query = { pharmacy: pharmacyId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const prescriptions = await PharmacyPrescription.find(query)
      .populate('patientId', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const total = await PharmacyPrescription.countDocuments(query);

    res.json({
      prescriptions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('List prescriptions error:', error);
    res.status(500).json({ message: 'Failed to fetch prescriptions' });
  }
};

export const updatePrescriptionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const pharmacyId = req.user._id;

    const prescription = await PharmacyPrescription.findOneAndUpdate(
      { _id: id, pharmacy: pharmacyId },
      { status },
      { new: true }
    ).populate('patientId', 'firstName lastName email phone');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.json({
      message: 'Prescription status updated successfully',
      prescription
    });
  } catch (error) {
    console.error('Update prescription status error:', error);
    res.status(500).json({ message: 'Failed to update prescription status' });
  }
};

export const createPrescription = async (req, res) => {
  try {
    const pharmacyId = req.user._id;
    const prescriptionData = { ...req.body, pharmacy: pharmacyId };

    // Handle prescription file upload - file is already uploaded to Cloudinary by middleware
    if (req.file) {
      prescriptionData.prescriptionCloudinaryUrl = req.file.path || req.file.url;
      prescriptionData.prescriptionCloudinaryId = req.file.filename || req.file.public_id;
    }

    const prescription = new PharmacyPrescription(prescriptionData);
    await prescription.save();

    res.status(201).json({
      message: 'Prescription created successfully',
      prescription
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ message: 'Failed to create prescription' });
  }
};

export const listSuppliers = async (req, res) => {
  try {
    const pharmacyId = req.user._id;
    const suppliers = await PharmacySupplier.find({ pharmacy: pharmacyId }).lean();
    res.json(suppliers);
  } catch (error) {
    console.error('List suppliers error:', error);
    res.status(500).json({ message: 'Failed to fetch suppliers' });
  }
};

export const createSupplier = async (req, res) => {
  try {
    const pharmacyId = req.user._id;
    const supplierData = { ...req.body, pharmacy: pharmacyId };

    // Handle image upload - file is already uploaded to Cloudinary by middleware
    if (req.file) {
      supplierData.logoCloudinaryUrl = req.file.path || req.file.url;
      supplierData.logoCloudinaryId = req.file.filename || req.file.public_id;
    }

    const supplier = new PharmacySupplier(supplierData);
    await supplier.save();

    res.status(201).json({
      message: 'Supplier created successfully',
      supplier
    });
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({ message: 'Failed to create supplier' });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacyId = req.user._id;
    const updateData = { ...req.body };

    // Handle image upload - file is already uploaded to Cloudinary by middleware
    if (req.file) {
      updateData.logoCloudinaryUrl = req.file.path || req.file.url;
      updateData.logoCloudinaryId = req.file.filename || req.file.public_id;
    }

    const supplier = await PharmacySupplier.findOneAndUpdate(
      { _id: id, pharmacy: pharmacyId },
      updateData,
      { new: true }
    );

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json({
      message: 'Supplier updated successfully',
      supplier
    });
  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({ message: 'Failed to update supplier' });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacyId = req.user._id;

    const supplier = await PharmacySupplier.findOneAndDelete({ _id: id, pharmacy: pharmacyId });
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({ message: 'Failed to delete supplier' });
  }
};

export const listCustomers = async (req, res) => {
  try {
    const pharmacyId = req.user._id;
    
    // Sync customers from existing orders (background sync)
    // This ensures all customers who have placed orders are in the customer list
    // Only sync if we don't have many customers yet (to avoid performance issues)
    try {
      const customerCount = await PharmacyCustomer.countDocuments({ pharmacy: pharmacyId });
      
      // If we have few customers, sync from all orders; otherwise just sync recent ones
      if (customerCount < 50) {
        // Sync from all orders
        const orders = await PatientOrder.find({ 
          'items.pharmacy': pharmacyId.toString()
        }).limit(500).lean();
        
        for (const order of orders) {
          await PharmacyService.syncCustomersFromOrder(order);
        }
      } else {
        // Only sync recent orders (last 7 days) if we already have many customers
        const recentOrders = await PatientOrder.find({ 
          'items.pharmacy': pharmacyId.toString(),
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }).limit(100).lean();
        
        for (const order of recentOrders) {
          await PharmacyService.syncCustomersFromOrder(order);
        }
      }
    } catch (syncError) {
      console.error('Error syncing customers from orders:', syncError);
      // Continue even if sync fails
    }
    
    // Ensure we only get customers for this specific pharmacy
    const query = { 
      pharmacy: pharmacyId,
      status: { $ne: 'deleted' } // Exclude deleted customers
    };
    
    // Optional search filter
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }
    
    // Optional status filter
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }
    
    const customers = await PharmacyCustomer.find(query)
      .select('firstName lastName email phone address dateOfBirth customerType status orderStats profileImage createdAt')
      .sort({ 'orderStats.lastOrderDate': -1, createdAt: -1 }) // Sort by last order date, then creation date
      .lean();
    
    // Recalculate order stats from actual orders for each customer to ensure accuracy
    const transformedCustomers = await Promise.all(customers.map(async (customer) => {
      // Recalculate stats from actual orders
      const stats = await PharmacyService.recalculateCustomerOrderStats(pharmacyId, customer.email);
      
      // Update customer record with recalculated stats (async, don't wait)
      PharmacyCustomer.findByIdAndUpdate(customer._id, {
        'orderStats.totalOrders': stats.totalOrders,
        'orderStats.totalSpent': stats.totalSpent,
        'orderStats.lastOrderDate': stats.lastOrderDate,
        'orderStats.averageOrderValue': stats.averageOrderValue
      }).catch(err => console.error('Error updating customer stats:', err));
      
      return {
        ...customer,
        name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unknown',
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
        lastOrderDate: stats.lastOrderDate,
        cloudinaryUrl: customer.profileImage?.cloudinaryUrl || null,
        orderStats: {
          ...customer.orderStats,
          totalOrders: stats.totalOrders,
          totalSpent: stats.totalSpent,
          lastOrderDate: stats.lastOrderDate,
          averageOrderValue: stats.averageOrderValue
        }
      };
    }));
    
    res.json(transformedCustomers);
  } catch (error) {
    console.error('List customers error:', error);
    res.status(500).json({ message: 'Failed to fetch customers' });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const pharmacyId = req.user._id;
    const customerData = { ...req.body, pharmacy: pharmacyId };

    // Handle image upload - file is already uploaded to Cloudinary by middleware
    if (req.file) {
      customerData.avatarCloudinaryUrl = req.file.path || req.file.url;
      customerData.avatarCloudinaryId = req.file.filename || req.file.public_id;
    }

    const customer = new PharmacyCustomer(customerData);
    await customer.save();

    res.status(201).json({
      message: 'Customer created successfully',
      customer
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ message: 'Failed to create customer' });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacyId = req.user._id;
    const updateData = { ...req.body };

    // Handle image upload - file is already uploaded to Cloudinary by middleware
    if (req.file) {
      updateData.avatarCloudinaryUrl = req.file.path || req.file.url;
      updateData.avatarCloudinaryId = req.file.filename || req.file.public_id;
    }

    const customer = await PharmacyCustomer.findOneAndUpdate(
      { _id: id, pharmacy: pharmacyId },
      updateData,
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({
      message: 'Customer updated successfully',
      customer
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ message: 'Failed to update customer' });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacyId = req.user._id;

    const customer = await PharmacyCustomer.findOneAndDelete({ _id: id, pharmacy: pharmacyId });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ message: 'Failed to delete customer' });
  }
};

export const getReports = async (req, res) => {
  try {
    const pharmacyId = req.user._id.toString();
    const { since, until } = req.query;

    // Set default date range if not provided (last 30 days)
    const startDate = since ? new Date(since) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = until ? new Date(until) : new Date();
    
    // Ensure dates are at start/end of day
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // Get orders by status with real data
    const ordersByStatus = await PatientOrder.aggregate([
      {
        $match: {
          'items.pharmacy': pharmacyId,
          $or: [
            { placedAt: { $gte: startDate, $lte: endDate } },
            { createdAt: { $gte: startDate, $lte: endDate } }
          ]
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$pricing.grandTotal' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get revenue by day with real data
    const revenueByDay = await PatientOrder.aggregate([
      {
        $match: {
          'items.pharmacy': pharmacyId,
          $or: [
            { placedAt: { $gte: startDate, $lte: endDate } },
            { createdAt: { $gte: startDate, $lte: endDate } }
          ]
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { 
              format: '%Y-%m-%d', 
              date: { $ifNull: ['$placedAt', '$createdAt'] }
            }
          },
          total: { $sum: '$pricing.grandTotal' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get top selling items with real data
    const topItemsAgg = await PatientOrder.aggregate([
      {
        $match: {
          'items.pharmacy': pharmacyId,
          $or: [
            { placedAt: { $gte: startDate, $lte: endDate } },
            { createdAt: { $gte: startDate, $lte: endDate } }
          ]
        }
      },
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.medicineId',
          name: { $first: '$items.medicineName' },
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.totalPrice' }
        }
      },
      {
        $sort: { revenue: -1 }
      },
      {
        $limit: 20
      }
    ]);

    // Populate medicine details for top items
    const topItems = await Promise.all(
      topItemsAgg.map(async (item) => {
        try {
          const medicine = await PharmacyInventoryItem.findById(item._id)
            .select('sku name')
            .lean();
          return {
            _id: medicine?.sku || item._id.toString(),
            name: item.name || medicine?.name || 'Unknown Medicine',
            quantity: item.quantity,
            revenue: item.revenue
          };
        } catch (err) {
          return {
            _id: item._id.toString(),
            name: item.name || 'Unknown Medicine',
            quantity: item.quantity,
            revenue: item.revenue
          };
        }
      })
    );

    // Get top customers with real data
    const topCustomersAgg = await PatientOrder.aggregate([
      {
        $match: {
          'items.pharmacy': pharmacyId,
          $or: [
            { placedAt: { $gte: startDate, $lte: endDate } },
            { createdAt: { $gte: startDate, $lte: endDate } }
          ]
        }
      },
      {
        $group: {
          _id: '$patientId',
          orders: { $sum: 1 },
          total: { $sum: '$pricing.grandTotal' }
        }
      },
      {
        $sort: { total: -1 }
      },
      {
        $limit: 20
      }
    ]);

    // Populate customer names
    const topCustomers = await Promise.all(
      topCustomersAgg.map(async (customer) => {
        try {
          const user = await User.findById(customer._id)
            .select('firstName lastName')
            .lean();
          const customerName = user 
            ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown Customer'
            : 'Unknown Customer';
          return {
            _id: customerName,
            orders: customer.orders,
            total: customer.total
          };
        } catch (err) {
          return {
            _id: 'Unknown Customer',
            orders: customer.orders,
            total: customer.total
          };
        }
      })
    );

    // Return data in the format expected by frontend
    res.json({
      byStatus: ordersByStatus.map(item => ({
        _id: item._id || 'unknown',
        count: item.count || 0,
        total: item.total || 0
      })),
      revenueByDay: revenueByDay.map(item => ({
        _id: item._id,
        total: item.total || 0
      })),
      topItems: topItems,
      customers: topCustomers
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch reports',
      error: error.message 
    });
  }
};

export const getSettings = async (req, res) => {
  try {
    const pharmacyId = req.user._id;
    let settings = await PharmacySettings.findOne({ pharmacy: pharmacyId });

    if (!settings) {
      // Create default settings
      settings = new PharmacySettings({
        pharmacy: pharmacyId,
        businessHours: '9:00 AM - 6:00 PM',
        deliveryRadius: 5,
        deliveryCharges: 20,
        freeDeliveryThreshold: 500,
        acceptCOD: true,
        acceptOnlinePayment: true,
        taxRate: 18
      });
      await settings.save();
    }

    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const pharmacyId = req.user._id;
    const updateData = { ...req.body };

    // Handle file uploads - files are already uploaded to Cloudinary by middleware
    if (req.files) {
      if (req.files.logo && req.files.logo[0]) {
        const file = req.files.logo[0];
        updateData.logoCloudinaryUrl = file.path || file.url;
        updateData.logoCloudinaryId = file.filename || file.public_id;
      }
      if (req.files.banner && req.files.banner[0]) {
        const file = req.files.banner[0];
        updateData.bannerCloudinaryUrl = file.path || file.url;
        updateData.bannerCloudinaryId = file.filename || file.public_id;
      }
    }

    const settings = await PharmacySettings.findOneAndUpdate(
      { pharmacy: pharmacyId },
      updateData,
      { new: true, upsert: true }
    );

    res.json({
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Failed to update settings' });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const pharmacyId = req.user._id;
    let profile = await PharmacyProfile.findOne({ email: req.user.email });
    
    if (!profile) {
      // Create default profile
      profile = new PharmacyProfile({
        email: req.user.email,
        businessName: req.user.pharmacyName || 'My Pharmacy',
        licenseNumber: 'PENDING',
        address: 'Address to be updated',
        city: 'City to be updated',
        state: 'State to be updated'
      });
      await profile.save();
    }

    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const pharmacyId = req.user._id;
    const updateData = convertPharmacyProfileData(req.body);

    // Handle avatar upload - file is already uploaded to Cloudinary by middleware
    if (req.file) {
      updateData.avatarCloudinaryUrl = req.file.path || req.file.url;
      updateData.avatarCloudinaryId = req.file.filename || req.file.public_id;
    }

    const profile = await PharmacyProfile.findOneAndUpdate(
      { email: req.user.email },
      updateData,
      { new: true, upsert: true }
    );

    res.json({
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

export const getProfileCompletion = async (req, res) => {
  try {
    const pharmacyId = req.user._id;
    const profile = await PharmacyProfile.findOne({ email: req.user.email });
    
    if (!profile) {
      return res.json({
        isComplete: false,
        completed: false, // Keep for backward compatibility
        completionPercentage: 0,
        percentage: 0, // Keep for backward compatibility
        missingFields: ['businessName', 'licenseNumber', 'address', 'city', 'state']
      });
    }

    // Check if profile is explicitly marked as completed
    if (profile.profileCompleted) {
      return res.json({
        isComplete: true,
        completed: true, // Keep for backward compatibility
        completionPercentage: 100,
        percentage: 100, // Keep for backward compatibility
        missingFields: [],
        profile
      });
    }

    // Calculate completion percentage
    const requiredFields = [
      'businessName', 'licenseNumber', 'address', 'city', 'state',
      'phone', 'description', 'pharmacyType'
    ];

    const completedFields = requiredFields.filter(field => profile[field] && profile[field].toString().trim());
    const percentage = Math.round((completedFields.length / requiredFields.length) * 100);

    const missingFields = requiredFields.filter(field => !profile[field] || !profile[field].toString().trim());

    res.json({
      isComplete: percentage === 100,
      completed: percentage === 100, // Keep for backward compatibility
      completionPercentage: percentage,
      percentage, // Keep for backward compatibility
      missingFields,
      profile
    });
  } catch (error) {
    console.error('Get profile completion error:', error);
    res.status(500).json({ message: 'Failed to fetch profile completion' });
  }
};

export const saveProfileProgress = async (req, res) => {
  try {
    const pharmacyId = req.user._id;
    const updateData = convertPharmacyProfileData(req.body);

    const profile = await PharmacyProfile.findOneAndUpdate(
      { email: req.user.email },
      updateData,
      { new: true, upsert: true }
    );

    res.json({
      message: 'Profile progress saved successfully',
      profile
    });
  } catch (error) {
    console.error('Save profile progress error:', error);
    res.status(500).json({ message: 'Failed to save profile progress' });
  }
};

export const completeProfile = async (req, res) => {
  try {
    const pharmacyId = req.user._id;
    const updateData = convertPharmacyProfileData(req.body);

    // Handle document uploads - files are already uploaded to Cloudinary by middleware
    if (req.files) {
      updateData.documents = updateData.documents || {};
      
      if (req.files.license && req.files.license[0]) {
        const file = req.files.license[0];
        updateData.documents.license = {
          url: file.path || file.url, // Cloudinary URL
          publicId: file.filename || file.public_id,
          uploadedAt: new Date()
        };
      }
      
      if (req.files.gst && req.files.gst[0]) {
        const file = req.files.gst[0];
        updateData.documents.gst = {
          url: file.path || file.url,
          publicId: file.filename || file.public_id,
          uploadedAt: new Date()
        };
      }
      
      if (req.files.pan && req.files.pan[0]) {
        const file = req.files.pan[0];
        updateData.documents.pan = {
          url: file.path || file.url,
          publicId: file.filename || file.public_id,
          uploadedAt: new Date()
        };
      }
      
      if (req.files.other) {
        updateData.documents.other = [];
        for (const file of req.files.other) {
          updateData.documents.other.push({
            name: file.originalname,
            url: file.path || file.url,
            publicId: file.filename || file.public_id,
            uploadedAt: new Date()
          });
        }
      }
    }

    updateData.profileCompleted = true;
    updateData.completionPercentage = 100;
    updateData.lastUpdated = new Date();

    const profile = await PharmacyProfile.findOneAndUpdate(
      { email: req.user.email },
      updateData,
      { new: true, upsert: true }
    );

    res.json({
      message: 'Profile completed successfully',
      profile
    });
  } catch (error) {
    console.error('Complete profile error:', error);
    res.status(500).json({ message: 'Failed to complete profile' });
  }
};


