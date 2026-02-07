import express from 'express';
import { auth } from '../middleware/auth.js';
import PharmacyInventoryItem from '../models/PharmacyInventoryItem.js';
import PharmacyService from '../services/pharmacyService.js';
import PatientCartItem from '../models/PatientCartItem.js';
import PatientOrder from '../models/PatientOrder.js';
import PharmacyProfile from '../models/PharmacyProfile.js';

const router = express.Router();

// All endpoints require patient auth
router.use(auth);

// GET /api/patient/pharmacy/price-comparison?q=amox
// Returns medicines with per-pharmacy pricing (uses current single-pharmacy inventory as source)
router.get('/price-comparison', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    const result = await PharmacyService.getPriceComparison(q);
    res.json(result);
  } catch (e) {
    console.error('Price comparison error:', e);
    res.status(500).json({ message: 'Failed to fetch price comparison' });
  }
});

// GET /api/patient/pharmacy/search?q=medicine&category=antibiotics&inStock=true
// Search medicines with filters
router.get('/search', async (req, res) => {
  try {
    const { q, category, inStock, sortBy = 'relevance', limit = 50 } = req.query;
    
    const filters = {};
    if (q) {
      filters.search = q;
    }
    if (category && category !== 'all') {
      filters.category = category;
    }
    if (inStock !== undefined) {
      filters.inStock = inStock === 'true';
    }

    const medicines = await PharmacyInventoryItem.find({
      $or: [
        { name: { $regex: q || '', $options: 'i' } },
        { generic: { $regex: q || '', $options: 'i' } },
        { manufacturer: { $regex: q || '', $options: 'i' } }
      ],
      ...(category && category !== 'all' ? { category } : {}),
      ...(inStock !== undefined ? { stock: inStock === 'true' ? { $gt: 0 } : { $lte: 0 } } : {})
    })
      .select('pharmacy name generic dosage form manufacturer stock deliveryTime genericPrice brandPrice insurancePrice insuranceCovered rating reviews cloudinaryUrl category prescriptionRequired description')
      .limit(parseInt(limit))
      .lean();

    // Sort results
    let sortedMedicines = medicines;
    switch (sortBy) {
      case 'price':
        sortedMedicines = medicines.sort((a, b) => (a.genericPrice || a.price) - (b.genericPrice || b.price));
        break;
      case 'rating':
        sortedMedicines = medicines.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'name':
        sortedMedicines = medicines.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'stock':
        sortedMedicines = medicines.sort((a, b) => (b.stock || 0) - (a.stock || 0));
        break;
      default:
        // relevance - keep original order
        break;
    }

    res.json({ 
      medicines: sortedMedicines,
      total: sortedMedicines.length,
      filters: { q, category, inStock, sortBy }
    });
  } catch (error) {
    console.error('Medicine search error:', error);
    res.status(500).json({ message: 'Failed to search medicines' });
  }
});

// GET /api/patient/pharmacy/medicines/:id
// Get detailed medicine information
router.get('/medicines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const medicine = await PharmacyService.getMedicineDetails(id);
    
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json(medicine);
  } catch (error) {
    console.error('Medicine details error:', error);
    res.status(500).json({ message: 'Failed to fetch medicine details' });
  }
});

// GET /api/patient/pharmacy/categories
// Get all available medicine categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await PharmacyInventoryItem.distinct('category');
    res.json({ categories: categories.filter(cat => cat && cat.trim()) });
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// GET /api/patient/pharmacy/cart
// Get patient's cart
router.get('/cart', async (req, res) => {
  try {
    const patientId = req.user._id;
    const cart = await PharmacyService.getCart(patientId);
    res.json(cart);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
});

// POST /api/patient/pharmacy/cart
// Add item to cart
router.post('/cart', async (req, res) => {
  try {
    const patientId = req.user._id;
    const cartData = { ...req.body, patientId };
    
    const cartItem = await PharmacyService.addToCart(cartData);
    res.status(201).json(cartItem);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/patient/pharmacy/cart/:id
// Update cart item
router.put('/cart/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user._id;
    const { quantity, packSize, variant, insuranceApplied } = req.body;

    const cartItem = await PatientCartItem.findOne({ _id: id, patientId });
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    if (quantity !== undefined) cartItem.quantity = quantity;
    if (packSize !== undefined) cartItem.packSize = packSize;
    if (variant !== undefined) cartItem.variant = variant;
    if (insuranceApplied !== undefined) cartItem.insuranceApplied = insuranceApplied;

    await cartItem.save();
    res.json(cartItem);
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Failed to update cart item' });
  }
});

// DELETE /api/patient/pharmacy/cart/:id
// Remove item from cart
router.delete('/cart/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user._id;
    
    await PharmacyService.removeFromCart(id, patientId);
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/patient/pharmacy/cart
// Clear entire cart
router.delete('/cart', async (req, res) => {
  try {
    const patientId = req.user._id;
    await PharmacyService.clearCart(patientId);
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Failed to clear cart' });
  }
});

// GET /api/patient/pharmacy/contact/:pharmacyId
// Public pharmacy contact details for order tracking
router.get('/contact/:pharmacyId', async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const profile = await PharmacyProfile.findOne({ $or: [{ email: req.user?.email }, { _id: pharmacyId }, { pharmacy: pharmacyId }] })
      .lean();

    if (!profile) {
      // Try to glean from orders if profile not present
      const anyOrder = await PatientOrder.findOne({ 'items.pharmacy': pharmacyId })
        .populate('items.pharmacy', 'businessName address')
        .lean();
      const fallback = anyOrder?.items?.find(i => String(i.pharmacy?._id || i.pharmacy) === String(pharmacyId))?.pharmacy;
      return res.json({
        id: pharmacyId,
        name: fallback?.businessName || 'Pharmacy',
        address: fallback?.address || '',
        phone: '',
        email: '',
        rating: 4.5,
        logo: ''
      });
    }

    res.json({
      id: String(pharmacyId),
      name: profile.businessName || 'Pharmacy',
      address: profile.address || '',
      phone: profile.phone || '',
      email: profile.email || '',
      rating: Number(profile.rating || 4.5),
      logo: profile.avatarCloudinaryUrl || ''
    });
  } catch (e) {
    console.error('Pharmacy contact error:', e);
    res.status(500).json({ message: 'Failed to fetch pharmacy contact' });
  }
});

// POST /api/patient/pharmacy/checkout
// Checkout cart and create order
router.post('/checkout', async (req, res) => {
  try {
    const patientId = req.user._id;
    const { deliveryDetails, paymentDetails, prescriptionRequired, prescriptionFile } = req.body;

    // Get cart items
    const cartItems = await PharmacyService.getCart(patientId);
    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Transform cart items to order items
    const orderItems = cartItems.map(item => ({
      medicineId: item.medicineId,
      medicineName: item.name,
      variant: item.variant,
      quantity: item.quantity,
      packSize: item.packSize,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      pharmacy: item.pharmacy,
      insuranceApplied: item.insuranceApplied
    }));

    // Create order
    const orderData = {
      patientId,
      items: orderItems,
      deliveryDetails,
      paymentDetails,
      prescriptionRequired
    };

    const order = await PharmacyService.createOrder(orderData);

    // Clear cart after successful order
    await PharmacyService.clearCart(patientId);

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        totalAmount: order.pricing.grandTotal,
        status: order.status,
        estimatedDelivery: order.estimatedDelivery
      }
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(400).json({ message: error.message });
  }
});

// GET /api/patient/pharmacy/orders
// Get patient's order history
router.get('/orders', async (req, res) => {
  try {
    const patientId = req.user._id;
    const { status, limit = 20, page = 1 } = req.query;

    const query = { patientId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await PatientOrder.find(query)
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
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// GET /api/patient/pharmacy/orders/:orderId
// Get specific order details
router.get('/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const patientId = req.user._id;

    const order = await PatientOrder.findOne({ _id: orderId, patientId })
      .populate('items.medicineId', 'name generic dosage form manufacturer cloudinaryUrl')
      .lean();

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ message: 'Failed to fetch order details' });
  }
});

// GET /api/patient/pharmacy/analytics
// Get patient's pharmacy analytics
router.get('/analytics', async (req, res) => {
  try {
    const patientId = req.user._id;
    const { timeRange = '90' } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const [totalOrders, totalSpent, ordersByStatus, topMedicines] = await Promise.all([
      PatientOrder.countDocuments({ patientId, createdAt: { $gte: startDate } }),
      PatientOrder.aggregate([
        { $match: { patientId, createdAt: { $gte: startDate } } },
        { $group: { _id: null, total: { $sum: '$pricing.grandTotal' } } }
      ]),
      PatientOrder.aggregate([
        { $match: { patientId, createdAt: { $gte: startDate } } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      PatientOrder.aggregate([
        { $match: { patientId, createdAt: { $gte: startDate } } },
        { $unwind: '$items' },
        { $group: { _id: '$items.medicineId', totalQuantity: { $sum: '$items.quantity' } } },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 }
      ])
    ]);

    res.json({
      totalOrders,
      totalSpent: totalSpent[0]?.total || 0,
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      topMedicines,
      timeRange: parseInt(timeRange)
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

// GET /api/patient/pharmacy/prescriptions
// Get patient's prescriptions (placeholder for future implementation)
router.get('/prescriptions', async (req, res) => {
  try {
    // This would integrate with the prescription system
    res.json({ message: 'Prescription system coming soon', prescriptions: [] });
  } catch (error) {
    console.error('Prescriptions error:', error);
    res.status(500).json({ message: 'Failed to fetch prescriptions' });
  }
});

export default router;


