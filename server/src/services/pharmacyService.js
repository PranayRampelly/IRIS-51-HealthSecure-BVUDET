import mongoose from 'mongoose';
import PharmacyInventoryItem from '../models/PharmacyInventoryItem.js';
import PatientOrder from '../models/PatientOrder.js';
import PatientCartItem from '../models/PatientCartItem.js';
import PharmacyProfile from '../models/PharmacyProfile.js';
import PharmacyCustomer from '../models/PharmacyCustomer.js';
import User from '../models/User.js';

export class PharmacyService {
  // Inventory Management
  static async getInventory(pharmacyId, filters = {}) {
    try {
      const query = { pharmacy: pharmacyId };
      
      if (filters.category) {
        query.category = filters.category;
      }
      
      if (filters.inStock !== undefined) {
        if (filters.inStock) {
          query.stock = { $gt: 0 };
        } else {
          query.stock = { $lte: 0 };
        }
      }
      
      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { generic: { $regex: filters.search, $options: 'i' } },
          { manufacturer: { $regex: filters.search, $options: 'i' } }
        ];
      }

      const inventory = await PharmacyInventoryItem.find(query)
        .sort({ name: 1 })
        .lean();

      return inventory;
    } catch (error) {
      throw new Error(`Failed to fetch inventory: ${error.message}`);
    }
  }

  static async getMedicineDetails(medicineId) {
    try {
      const medicine = await PharmacyInventoryItem.findById(medicineId).lean();
      if (!medicine) {
        throw new Error('Medicine not found');
      }
      return medicine;
    } catch (error) {
      throw new Error(`Failed to fetch medicine details: ${error.message}`);
    }
  }

  static async updateStock(medicineId, quantity, operation = 'decrease') {
    try {
      const medicine = await PharmacyInventoryItem.findById(medicineId);
      if (!medicine) {
        throw new Error('Medicine not found');
      }

      if (operation === 'decrease') {
        if (medicine.stock < quantity) {
          throw new Error('Insufficient stock');
        }
        medicine.stock -= quantity;
      } else if (operation === 'increase') {
        medicine.stock += quantity;
      }

      await medicine.save();
      return medicine;
    } catch (error) {
      throw new Error(`Failed to update stock: ${error.message}`);
    }
  }

  // Order Management
  static async createOrder(orderData) {
    try {
      const { patientId, items, deliveryDetails, paymentDetails, prescriptionRequired } = orderData;
      
      // Validate stock availability and ensure pharmacy IDs are set
      for (const item of items) {
        const medicine = await PharmacyInventoryItem.findById(item.medicineId);
        if (!medicine) {
          throw new Error(`Medicine ${item.medicineId} not found`);
        }
        if (medicine.stock < item.quantity * item.packSize) {
          throw new Error(`Insufficient stock for ${medicine.name}`);
        }
        
        // Ensure pharmacy ID is set (use medicine's pharmacy if not set)
        if (!item.pharmacy) {
          item.pharmacy = medicine.pharmacy?.toString() || medicine.pharmacy;
        } else {
          // Convert to string if it's an ObjectId
          item.pharmacy = item.pharmacy.toString ? item.pharmacy.toString() : item.pharmacy;
        }
      }

      // Calculate totals
      let subtotal = 0;
      let deliveryFee = 0;
      
      for (const item of items) {
        const medicine = await PharmacyInventoryItem.findById(item.medicineId);
        const unitPrice = item.variant === 'generic' ? 
          (medicine.genericPrice || medicine.price) : 
          (medicine.brandPrice || medicine.price);
        
        item.unitPrice = unitPrice;
        item.totalPrice = unitPrice * item.packSize * item.quantity;
        subtotal += item.totalPrice;
      }

      // Calculate delivery fee based on delivery option
      if (deliveryDetails.option === 'sameDay') {
        deliveryFee = 50;
      } else if (deliveryDetails.option === 'standard') {
        deliveryFee = 20;
      }

      const tax = subtotal * 0.18; // 18% GST
      const grandTotal = subtotal + deliveryFee + tax;

      const order = new PatientOrder({
        patientId,
        items: items.map(item => ({
          ...item,
          pharmacy: item.pharmacy // Ensure it's a string
        })),
        deliveryDetails,
        paymentDetails,
        pricing: {
          subtotal,
          deliveryFee,
          discount: 0,
          tax,
          grandTotal
        },
        prescriptionRequired,
        estimatedDelivery: this.calculateEstimatedDelivery(deliveryDetails.option)
      });

      await order.save();

      // Update stock
      for (const item of items) {
        await this.updateStock(item.medicineId, item.quantity * item.packSize, 'decrease');
      }

      // Automatically sync customers from order
      await this.syncCustomersFromOrder(order);

      return order;
    } catch (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  static async getOrderDetails(orderId, pharmacyId) {
    try {
      const order = await PatientOrder.findOne({
        _id: orderId,
        'items.pharmacy': pharmacyId
      })
        .populate('patientId', 'firstName lastName email phone')
        .populate('items.medicineId', 'name generic dosage form manufacturer cloudinaryUrl')
        .lean();

      if (!order) {
        throw new Error('Order not found');
      }

      return order;
    } catch (error) {
      throw new Error(`Failed to fetch order details: ${error.message}`);
    }
  }

  static async updateOrderStatus(orderId, pharmacyId, status) {
    try {
      const allowedStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!allowedStatuses.includes(status)) {
        throw new Error('Invalid status');
      }

      const order = await PatientOrder.findOneAndUpdate(
        { _id: orderId, 'items.pharmacy': pharmacyId },
        { status },
        { new: true }
      )
        .populate('patientId', 'firstName lastName email phone')
        .populate('items.medicineId', 'name generic dosage form manufacturer cloudinaryUrl');

      if (!order) {
        throw new Error('Order not found');
      }

      return order;
    } catch (error) {
      throw new Error(`Failed to update order status: ${error.message}`);
    }
  }

  // Cart Management
  static async getCart(patientId) {
    try {
      const cartItems = await PatientCartItem.find({ patientId })
        .populate('medicineId', 'name generic dosage form manufacturer description category prescriptionRequired cloudinaryUrl genericPrice brandPrice stock')
        .sort({ addedAt: -1 });

      return cartItems.map(item => ({
        id: item._id,
        medicineId: item.medicineId._id,
        name: item.medicineId.name,
        generic: item.medicineId.generic,
        dosage: item.medicineId.dosage,
        form: item.medicineId.form,
        manufacturer: item.medicineId.manufacturer,
        description: item.medicineId.description,
        category: item.medicineId.category,
        prescriptionRequired: item.medicineId.prescriptionRequired,
        cloudinaryUrl: item.medicineId.cloudinaryUrl,
        variant: item.variant,
        quantity: item.quantity,
        packSize: item.packSize,
        pharmacy: item.pharmacy,
        insuranceApplied: item.insuranceApplied,
        genericPrice: item.medicineId.genericPrice || 0,
        brandPrice: item.medicineId.brandPrice || 0,
        unitPrice: item.unitPrice,
        totalPrice: item.unitPrice * item.packSize * item.quantity,
        stock: item.medicineId.stock
      }));
    } catch (error) {
      throw new Error(`Failed to fetch cart: ${error.message}`);
    }
  }

  static async addToCart(cartData) {
    try {
      const { patientId, medicineId, variant, quantity, packSize, pharmacy, insuranceApplied } = cartData;

      // Validate pharmacy
      const pharmacyUser = await User.findById(pharmacy);
      if (!pharmacyUser || pharmacyUser.role !== 'pharmacy') {
        throw new Error('Invalid pharmacy');
      }

      // Validate medicine
      const medicine = await PharmacyInventoryItem.findById(medicineId);
      if (!medicine) {
        throw new Error('Medicine not found');
      }

      // Check stock
      if (medicine.stock < quantity * packSize) {
        throw new Error('Insufficient stock');
      }

      // Calculate unit price
      const unitPrice = variant === 'generic' ? 
        (medicine.genericPrice || medicine.price) : 
        (medicine.brandPrice || medicine.price);

      // Check if item already exists
      let cartItem = await PatientCartItem.findOne({
        patientId,
        medicineId,
        variant
      });

      if (cartItem) {
        // Update existing item
        cartItem.quantity = quantity;
        cartItem.packSize = packSize;
        cartItem.pharmacy = pharmacy;
        cartItem.insuranceApplied = insuranceApplied;
        cartItem.unitPrice = unitPrice;
        await cartItem.save();
      } else {
        // Create new item
        cartItem = new PatientCartItem({
          patientId,
          medicineId,
          variant,
          quantity,
          packSize,
          pharmacy,
          insuranceApplied,
          unitPrice
        });
        await cartItem.save();
      }

      return cartItem;
    } catch (error) {
      throw new Error(`Failed to add to cart: ${error.message}`);
    }
  }

  static async removeFromCart(cartItemId, patientId) {
    try {
      const result = await PatientCartItem.findOneAndDelete({
        _id: cartItemId,
        patientId
      });

      if (!result) {
        throw new Error('Cart item not found');
      }

      return result;
    } catch (error) {
      throw new Error(`Failed to remove from cart: ${error.message}`);
    }
  }

  static async clearCart(patientId) {
    try {
      const result = await PatientCartItem.deleteMany({ patientId });
      return result;
    } catch (error) {
      throw new Error(`Failed to clear cart: ${error.message}`);
    }
  }

  // Price Comparison
  static async getPriceComparison(searchQuery) {
    try {
      const criteria = searchQuery ? {
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { generic: { $regex: searchQuery, $options: 'i' } },
          { manufacturer: { $regex: searchQuery, $options: 'i' } }
        ]
      } : {};

      const items = await PharmacyInventoryItem.find(criteria)
        .select('name generic dosage form manufacturer stock deliveryTime genericPrice brandPrice insurancePrice insuranceCovered rating reviews cloudinaryUrl category prescriptionRequired description')
        .limit(100)
        .lean();

      // Map to comparison shape
      const medicines = items.map(item => ({
        medicineId: String(item._id),
        medicineName: item.name,
        dosage: item.dosage || '',
        form: item.form || '',
        manufacturer: item.manufacturer || '',
        description: item.description || '',
        cloudinaryUrl: item.cloudinaryUrl,
        category: item.category || 'General',
        prescriptionRequired: item.prescriptionRequired || false,
        pharmacies: [
          {
            pharmacyId: '68a7441bd3e6a75f76e88955', // Default pharmacy ID
            pharmacyName: 'HealthSecure Pharmacy',
            genericPrice: Number(item.genericPrice ?? item.price ?? 0),
            brandPrice: Number(item.brandPrice ?? item.price ?? 0),
            insurancePrice: item.insuranceCovered ? Number(item.insurancePrice ?? 0) : undefined,
            savings: Math.max(0, Number(item.brandPrice ?? item.price ?? 0) - Number(item.genericPrice ?? item.price ?? 0)),
            inStock: (item.stock ?? 0) > 0,
            quantity: Number(item.stock ?? 0),
            deliveryTime: item.deliveryTime || '1-2 days',
            rating: Number(item.rating ?? 0),
            reviews: Number(item.reviews ?? 0)
          }
        ]
      }));

      return { medicines };
    } catch (error) {
      throw new Error(`Failed to fetch price comparison: ${error.message}`);
    }
  }

  // Utility Methods
  static calculateEstimatedDelivery(deliveryOption) {
    const now = new Date();
    switch (deliveryOption) {
      case 'sameDay':
        return new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours
      case 'standard':
        return new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days
      case 'pickup':
        return new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours
      default:
        return new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days
    }
  }

  // Recalculate customer order stats from actual orders in database
  static async recalculateCustomerOrderStats(pharmacyId, customerEmail) {
    try {
      // Find patient by email
      const patient = await User.findOne({ email: customerEmail }).select('_id').lean();
      if (!patient) {
        return {
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: null,
          averageOrderValue: 0
        };
      }

      // Find all orders for this customer and pharmacy
      const orders = await PatientOrder.find({
        'items.pharmacy': pharmacyId.toString(),
        patientId: patient._id
      }).lean();

      if (orders.length === 0) {
        return {
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: null,
          averageOrderValue: 0
        };
      }

      // Calculate stats from actual orders
      let totalSpent = 0;
      let lastOrderDate = null;

      for (const order of orders) {
        // Get items for this specific pharmacy
        const pharmacyItems = order.items.filter(item => {
          const itemPharmacy = item.pharmacy?.toString() || item.pharmacy;
          const pharmacyIdStr = pharmacyId.toString();
          return itemPharmacy === pharmacyIdStr || 
                 itemPharmacy?.toString() === pharmacyIdStr ||
                 (typeof itemPharmacy === 'string' && itemPharmacy === pharmacyIdStr);
        });
        
        // Calculate total for this pharmacy's items in the order
        const orderTotal = pharmacyItems.reduce((sum, item) => {
          // Use totalPrice if available, otherwise calculate from unitPrice * quantity * packSize
          const itemTotal = item.totalPrice || (item.unitPrice || 0) * (item.quantity || 0) * (item.packSize || 1);
          return sum + itemTotal;
        }, 0);
        
        totalSpent += orderTotal;

        const orderDate = order.createdAt || order.placedAt || order.updatedAt;
        if (orderDate) {
          const orderDateObj = new Date(orderDate);
          if (!lastOrderDate || orderDateObj > new Date(lastOrderDate)) {
            lastOrderDate = orderDate;
          }
        }
      }

      return {
        totalOrders: orders.length,
        totalSpent: totalSpent,
        lastOrderDate: lastOrderDate,
        averageOrderValue: orders.length > 0 ? totalSpent / orders.length : 0
      };
    } catch (error) {
      console.error('Error recalculating customer order stats:', error);
      return {
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: null,
        averageOrderValue: 0
      };
    }
  }

  // Sync customers from order - automatically create/update PharmacyCustomer records
  static async syncCustomersFromOrder(order) {
    try {
      // Get patient/user data
      const patient = await User.findById(order.patientId).lean();
      if (!patient) {
        console.warn('Patient not found for order:', order._id);
        return;
      }

      // Get unique pharmacies from order items
      const pharmacyIds = [...new Set(order.items.map(item => item.pharmacy).filter(Boolean))];
      
      if (pharmacyIds.length === 0) {
        console.warn('No pharmacy IDs found in order items');
        return;
      }

      // For each pharmacy in the order, create/update customer record
      for (const pharmacyIdOrName of pharmacyIds) {
        let actualPharmacyId = pharmacyIdOrName;
        
        // Handle pharmacy ID - it might be ObjectId, string ObjectId, or pharmacy name
        if (mongoose.Types.ObjectId.isValid(pharmacyIdOrName)) {
          // It's a valid ObjectId (either as ObjectId or string)
          actualPharmacyId = typeof pharmacyIdOrName === 'string' 
            ? new mongoose.Types.ObjectId(pharmacyIdOrName)
            : pharmacyIdOrName;
        } else {
          // It's a pharmacy name string, try to find the pharmacy
          const pharmacy = await User.findOne({ 
            role: 'pharmacy',
            $or: [
              { pharmacyName: pharmacyIdOrName },
              { businessName: pharmacyIdOrName }
            ]
          }).lean();
          
          if (pharmacy) {
            actualPharmacyId = pharmacy._id;
          } else {
            // Skip if we can't find the pharmacy
            console.warn('Pharmacy not found:', pharmacyIdOrName);
            continue;
          }
        }

        // Check if customer already exists for this pharmacy
        let customer = await PharmacyCustomer.findOne({
          pharmacy: actualPharmacyId,
          email: patient.email
        });

        if (customer) {
          // Recalculate stats from all orders to ensure accuracy
          const stats = await this.recalculateCustomerOrderStats(actualPharmacyId, patient.email);
          
          customer.orderStats.totalOrders = stats.totalOrders;
          customer.orderStats.totalSpent = stats.totalSpent;
          customer.orderStats.lastOrderDate = stats.lastOrderDate;
          customer.orderStats.averageOrderValue = stats.averageOrderValue;
          
          // Update address if provided in delivery details
          if (order.deliveryDetails?.address) {
            // Parse address string or use as street
            const addressParts = order.deliveryDetails.address.split(',').map(s => s.trim());
            if (!customer.address.street || customer.address.street === '') {
              customer.address.street = addressParts[0] || order.deliveryDetails.address;
            }
            if (addressParts.length > 1 && !customer.address.city) {
              customer.address.city = addressParts[1];
            }
            if (addressParts.length > 2 && !customer.address.state) {
              customer.address.state = addressParts[2];
            }
          }
          
          // Update phone if not set
          if (!customer.phone && patient.phone) {
            customer.phone = patient.phone;
          }
          
          customer.status = 'active';
          await customer.save();
        } else {
          // Create new customer - calculate initial stats from this order
          const addressParts = order.deliveryDetails?.address ? 
            order.deliveryDetails.address.split(',').map(s => s.trim()) : [];
          
          // Get items for this specific pharmacy
          const pharmacyItems = order.items.filter(item => {
            const itemPharmacy = item.pharmacy?.toString() || item.pharmacy;
            return itemPharmacy === pharmacyIdOrName.toString() || 
                   itemPharmacy === actualPharmacyId.toString();
          });
          const pharmacyTotal = pharmacyItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
          
          customer = new PharmacyCustomer({
            pharmacy: actualPharmacyId,
            firstName: patient.firstName || 'Unknown',
            lastName: patient.lastName || '',
            email: patient.email,
            phone: patient.phone || '',
            dateOfBirth: patient.dateOfBirth || new Date('1990-01-01'),
            gender: patient.gender?.toLowerCase() || 'prefer_not_to_say',
            address: {
              street: addressParts[0] || order.deliveryDetails?.address || '',
              city: addressParts[1] || '',
              state: addressParts[2] || '',
              country: 'India'
            },
            customerType: 'regular',
            status: 'active',
            orderStats: {
              totalOrders: 1,
              totalSpent: pharmacyTotal,
              lastOrderDate: order.createdAt || new Date(),
              averageOrderValue: pharmacyTotal,
              loyaltyPoints: 0
            }
          });
          
          await customer.save();
          
          // Recalculate stats from all orders to ensure accuracy
          const stats = await this.recalculateCustomerOrderStats(actualPharmacyId, patient.email);
          customer.orderStats.totalOrders = stats.totalOrders;
          customer.orderStats.totalSpent = stats.totalSpent;
          customer.orderStats.lastOrderDate = stats.lastOrderDate;
          customer.orderStats.averageOrderValue = stats.averageOrderValue;
          await customer.save();
        }
      }
    } catch (error) {
      console.error('Error syncing customers from order:', error);
      // Don't throw - we don't want to fail order creation if customer sync fails
    }
  }

  // Analytics and Reports
  static async getPharmacyAnalytics(pharmacyId, timeRange = '30') {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));

      const [totalOrders, totalRevenue, lowStockItems, topMedicines] = await Promise.all([
        PatientOrder.countDocuments({
          'items.pharmacy': pharmacyId,
          createdAt: { $gte: startDate }
        }),
        PatientOrder.aggregate([
          {
            $match: {
              'items.pharmacy': pharmacyId,
              createdAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$pricing.grandTotal' }
            }
          }
        ]),
        PharmacyInventoryItem.find({
          stock: { $lte: 10 }
        }).sort({ stock: 1 }).limit(10).lean(),
        PatientOrder.aggregate([
          {
            $match: {
              'items.pharmacy': pharmacyId,
              createdAt: { $gte: startDate }
            }
          },
          {
            $unwind: '$items'
          },
          {
            $group: {
              _id: '$items.medicineId',
              totalQuantity: { $sum: '$items.quantity' },
              totalRevenue: { $sum: '$items.totalPrice' }
            }
          },
          {
            $sort: { totalQuantity: -1 }
          },
          {
            $limit: 10
          }
        ])
      ]);

      return {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        lowStockItems,
        topMedicines
      };
    } catch (error) {
      throw new Error(`Failed to fetch analytics: ${error.message}`);
    }
  }
}

export default PharmacyService;
