import PatientCartItem from '../models/PatientCartItem.js';
import PatientOrder from '../models/PatientOrder.js';
import PharmacyInventoryItem from '../models/PharmacyInventoryItem.js';
import User from '../models/User.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// Get patient's cart
export const getCart = async (req, res) => {
  try {
    const patientId = (req.user && (req.user.patientId || req.user._id || req.user.id))?.toString();
    
    const cartItems = await PatientCartItem.find({ patientId })
      .populate('medicineId', 'name generic dosage form manufacturer description category prescriptionRequired cloudinaryUrl genericPrice brandPrice stock')
      .sort({ addedAt: -1 });

    const cartWithDetails = cartItems.map(item => ({
      id: item._id,
      key: item._id.toString(),
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
      addedAt: item.addedAt,
      stock: item.medicineId.stock ?? undefined,
    }));

    res.json(cartWithDetails);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const patientId = (req.user && (req.user.patientId || req.user._id || req.user.id))?.toString();
    const { medicineId, variant = 'generic', quantity = 1, packSize = 10, pharmacy, insuranceApplied = false } = req.body;

    // Validate pharmacy ID
    if (!pharmacy) {
      return res.status(400).json({ message: 'Pharmacy ID is required' });
    }

    console.log('Validating pharmacy ID:', pharmacy);

    // Validate pharmacy exists and is a pharmacy user
    const pharmacyUser = await User.findById(pharmacy);
    if (!pharmacyUser || pharmacyUser.role !== 'pharmacy') {
      console.log('Pharmacy validation failed:', { pharmacy, found: !!pharmacyUser, role: pharmacyUser?.role });
      return res.status(400).json({ message: 'Invalid pharmacy' });
    }

    console.log('Pharmacy validated successfully:', pharmacyUser.pharmacyName);

    // Validate medicine exists
    const medicine = await PharmacyInventoryItem.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    // Check stock availability
    if (medicine.stock < quantity * packSize) {
      return res.status(400).json({ message: 'Insufficient stock available' });
    }

    // Calculate unit price based on variant
    const unitPrice = variant === 'generic' ? (medicine.genericPrice || medicine.price) : (medicine.brandPrice || medicine.price);

    // Check if item already exists in cart
    const existingItem = await PatientCartItem.findOne({
      patientId,
      medicineId,
      variant
    });

    if (existingItem) {
      // Update existing item
      existingItem.quantity = quantity;
      existingItem.packSize = packSize;
      existingItem.pharmacy = pharmacy;
      existingItem.insuranceApplied = insuranceApplied;
      existingItem.unitPrice = unitPrice;
      await existingItem.save();

      const updatedItem = await PatientCartItem.findById(existingItem._id)
        .populate('medicineId', 'name generic dosage form manufacturer description category prescriptionRequired cloudinaryUrl genericPrice brandPrice');

      res.json({
        id: updatedItem._id,
        key: updatedItem._id.toString(),
        medicineId: updatedItem.medicineId._id,
        name: updatedItem.medicineId.name,
        generic: updatedItem.medicineId.generic,
        dosage: updatedItem.medicineId.dosage,
        form: updatedItem.medicineId.form,
        manufacturer: updatedItem.medicineId.manufacturer,
        description: updatedItem.medicineId.description,
        category: updatedItem.medicineId.category,
        prescriptionRequired: updatedItem.medicineId.prescriptionRequired,
        cloudinaryUrl: updatedItem.medicineId.cloudinaryUrl,
        variant: updatedItem.variant,
        quantity: updatedItem.quantity,
        packSize: updatedItem.packSize,
        pharmacy: updatedItem.pharmacy,
        insuranceApplied: updatedItem.insuranceApplied,
        genericPrice: updatedItem.medicineId.genericPrice || 0,
        brandPrice: updatedItem.medicineId.brandPrice || 0,
        unitPrice: updatedItem.unitPrice,
        totalPrice: updatedItem.unitPrice * updatedItem.packSize * updatedItem.quantity,
        addedAt: updatedItem.addedAt,
      });
    } else {
      // Create new cart item
      const newCartItem = new PatientCartItem({
        patientId,
        medicineId,
        variant,
        quantity,
        packSize,
        pharmacy,
        insuranceApplied,
        unitPrice,
      });

      await newCartItem.save();

      const savedItem = await PatientCartItem.findById(newCartItem._id)
        .populate('medicineId', 'name generic dosage form manufacturer description category prescriptionRequired cloudinaryUrl genericPrice brandPrice');

      res.status(201).json({
        id: savedItem._id,
        key: savedItem._id.toString(),
        medicineId: savedItem.medicineId._id,
        name: savedItem.medicineId.name,
        generic: savedItem.medicineId.generic,
        dosage: savedItem.medicineId.dosage,
        form: savedItem.medicineId.form,
        manufacturer: savedItem.medicineId.manufacturer,
        description: savedItem.medicineId.description,
        category: savedItem.medicineId.category,
        prescriptionRequired: savedItem.medicineId.prescriptionRequired,
        cloudinaryUrl: savedItem.medicineId.cloudinaryUrl,
        variant: savedItem.variant,
        quantity: savedItem.quantity,
        packSize: savedItem.packSize,
        pharmacy: savedItem.pharmacy,
        insuranceApplied: savedItem.insuranceApplied,
        genericPrice: savedItem.medicineId.genericPrice || 0,
        brandPrice: savedItem.medicineId.brandPrice || 0,
        unitPrice: savedItem.unitPrice,
        totalPrice: savedItem.unitPrice * savedItem.packSize * savedItem.quantity,
        addedAt: savedItem.addedAt,
      });
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Failed to add item to cart' });
  }
};

// Update cart item
export const updateCartItem = async (req, res) => {
  try {
    const patientId = (req.user && (req.user.patientId || req.user._id || req.user.id))?.toString();
    const { id } = req.params;
    const updates = req.body;

    const cartItem = await PatientCartItem.findOne({ _id: id, patientId });
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Load the medicine whenever stock-sensitive fields or variant may change
    if (updates.quantity !== undefined || updates.packSize !== undefined || updates.variant !== undefined) {
      const medicine = await PharmacyInventoryItem.findById(cartItem.medicineId);
      if (!medicine) {
        return res.status(404).json({ message: 'Medicine not found' });
      }

      // If variant is changing, recalculate the unit price accordingly
      if (updates.variant !== undefined) {
        const newVariant = updates.variant === 'brand' ? 'brand' : 'generic';
        cartItem.variant = newVariant;
        cartItem.unitPrice = newVariant === 'brand'
          ? (medicine.brandPrice ?? medicine.price ?? 0)
          : (medicine.genericPrice ?? medicine.price ?? 0);
      }

      // Validate stock with prospective quantity/pack
      const newQuantity = updates.quantity !== undefined ? Number(updates.quantity) : cartItem.quantity;
      const newPackSize = updates.packSize !== undefined ? Number(updates.packSize) : cartItem.packSize;

      if (newQuantity < 1 || newPackSize < 1) {
        return res.status(400).json({ message: 'Quantity and pack size must be at least 1' });
      }

      if (medicine.stock < newQuantity * newPackSize) {
        // Gracefully cap to available stock instead of failing with 400
        const maxQuantity = Math.max(1, Math.floor(medicine.stock / newPackSize));
        cartItem.quantity = maxQuantity;
        cartItem.packSize = newPackSize;
        await cartItem.save();

        const adjustedItem = await PatientCartItem.findById(cartItem._id)
          .populate('medicineId', 'name generic dosage form manufacturer description category prescriptionRequired cloudinaryUrl genericPrice brandPrice');

        return res.status(200).json({
          id: adjustedItem._id,
          key: adjustedItem._id.toString(),
          medicineId: adjustedItem.medicineId._id,
          name: adjustedItem.medicineId.name,
          generic: adjustedItem.medicineId.generic,
          dosage: adjustedItem.medicineId.dosage,
          form: adjustedItem.medicineId.form,
          manufacturer: adjustedItem.medicineId.manufacturer,
          description: adjustedItem.medicineId.description,
          category: adjustedItem.medicineId.category,
          prescriptionRequired: adjustedItem.medicineId.prescriptionRequired,
          cloudinaryUrl: adjustedItem.medicineId.cloudinaryUrl,
          variant: adjustedItem.variant,
          quantity: adjustedItem.quantity,
          packSize: adjustedItem.packSize,
          pharmacy: adjustedItem.pharmacy,
          insuranceApplied: adjustedItem.insuranceApplied,
          genericPrice: adjustedItem.medicineId.genericPrice || 0,
          brandPrice: adjustedItem.medicineId.brandPrice || 0,
          unitPrice: adjustedItem.unitPrice,
          totalPrice: adjustedItem.unitPrice * adjustedItem.packSize * adjustedItem.quantity,
          addedAt: adjustedItem.addedAt,
          warning: 'Quantity adjusted to available stock',
        });
      }
    }

    // Update the cart item
    if (updates.quantity !== undefined) cartItem.quantity = Number(updates.quantity);
    if (updates.packSize !== undefined) cartItem.packSize = Number(updates.packSize);
    if (updates.pharmacy !== undefined) cartItem.pharmacy = updates.pharmacy;
    if (updates.insuranceApplied !== undefined) cartItem.insuranceApplied = !!updates.insuranceApplied;
    await cartItem.save();

    const updatedItem = await PatientCartItem.findById(cartItem._id)
      .populate('medicineId', 'name generic dosage form manufacturer description category prescriptionRequired cloudinaryUrl genericPrice brandPrice');

    res.json({
      id: updatedItem._id,
      key: updatedItem._id.toString(),
      medicineId: updatedItem.medicineId._id,
      name: updatedItem.medicineId.name,
      generic: updatedItem.medicineId.generic,
      dosage: updatedItem.medicineId.dosage,
      form: updatedItem.medicineId.form,
      manufacturer: updatedItem.medicineId.manufacturer,
      description: updatedItem.medicineId.description,
      category: updatedItem.medicineId.category,
      prescriptionRequired: updatedItem.medicineId.prescriptionRequired,
      cloudinaryUrl: updatedItem.medicineId.cloudinaryUrl,
      variant: updatedItem.variant,
      quantity: updatedItem.quantity,
      packSize: updatedItem.packSize,
      pharmacy: updatedItem.pharmacy,
      insuranceApplied: updatedItem.insuranceApplied,
      genericPrice: updatedItem.medicineId.genericPrice || 0,
      brandPrice: updatedItem.medicineId.brandPrice || 0,
      unitPrice: updatedItem.unitPrice,
      totalPrice: updatedItem.unitPrice * updatedItem.packSize * updatedItem.quantity,
      addedAt: updatedItem.addedAt,
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Failed to update cart item' });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const patientId = (req.user && (req.user.patientId || req.user._id || req.user.id))?.toString();
    const { id } = req.params;

    const result = await PatientCartItem.findOneAndDelete({ _id: id, patientId });
    
    if (!result) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Failed to remove item from cart' });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const patientId = (req.user && (req.user.patientId || req.user._id || req.user.id))?.toString();

    await PatientCartItem.deleteMany({ patientId });

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Failed to clear cart' });
  }
};

// Checkout - Create order from cart
export const checkout = async (req, res) => {
  try {
    const patientId = (req.user && (req.user.patientId || req.user._id || req.user.id))?.toString();
    // deliveryDetails and paymentDetails may come as JSON strings in multipart/form-data
    const deliveryDetails = typeof req.body.deliveryDetails === 'string' 
      ? JSON.parse(req.body.deliveryDetails) 
      : req.body.deliveryDetails;
    let paymentDetails = typeof req.body.paymentDetails === 'string' 
      ? JSON.parse(req.body.paymentDetails) 
      : req.body.paymentDetails;
    // Enforce: if method is online, mark payment status as completed
    if (paymentDetails && paymentDetails.method === 'online') {
      paymentDetails.status = 'completed';
    }

    // Get cart items
    const cartItems = await PatientCartItem.find({ patientId })
      .populate('medicineId');

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate stock for all items
    for (const item of cartItems) {
      if (item.medicineId.stock < item.quantity * item.packSize) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${item.medicineId.name}` 
        });
      }
    }

    // Calculate pricing
    const subtotal = cartItems.reduce((sum, item) => 
      sum + (item.unitPrice * item.packSize * item.quantity), 0
    );
    const deliveryFee = deliveryDetails.option === 'sameDay' ? 49 : 0;
    const discount = 0; // Could be calculated based on coupon codes
    const tax = (subtotal - discount) * 0.05;
    const grandTotal = subtotal - discount + tax + deliveryFee;

    // Handle prescription upload if provided
    let prescriptionUrl = null;
    let prescriptionId = null;
    if (req.file) {
      // cloudinary middleware already uploaded file
      prescriptionUrl = req.file?.path || req.file?.url || null;
      prescriptionId = req.file?.filename || req.file?.public_id || null;
    }

    // Check if any items require prescription
    const prescriptionRequired = cartItems.some(item => item.medicineId.prescriptionRequired);

    // Create order
    // Ensure pharmacy ID is stored as string (ObjectId.toString()) for PatientOrder model
    const order = new PatientOrder({
      patientId,
      items: cartItems.map(item => ({
        medicineId: item.medicineId._id,
        medicineName: item.medicineId.name,
        variant: item.variant,
        quantity: item.quantity,
        packSize: item.packSize,
        unitPrice: item.unitPrice,
        totalPrice: item.unitPrice * item.packSize * item.quantity,
        pharmacy: item.pharmacy?.toString() || item.pharmacy || 'Unknown',
        insuranceApplied: item.insuranceApplied,
        insurancePrice: item.insuranceApplied ? (item.medicineId.insurancePrice || 0) : 0,
      })),
      deliveryDetails,
      paymentDetails,
      pricing: {
        subtotal,
        deliveryFee,
        discount,
        tax,
        grandTotal,
      },
      prescriptionRequired,
      prescriptionUrl,
      prescriptionId,
      estimatedDelivery: deliveryDetails.option === 'sameDay' 
        ? new Date(Date.now() + 24 * 60 * 60 * 1000) // Same day
        : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    });

    await order.save();

    // Update stock levels
    for (const item of cartItems) {
      await PharmacyInventoryItem.findByIdAndUpdate(
        item.medicineId._id,
        { $inc: { stock: -(item.quantity * item.packSize) } }
      );
    }

    // Automatically sync customers from order
    try {
      const { PharmacyService } = await import('../services/pharmacyService.js');
      await PharmacyService.syncCustomersFromOrder(order);
    } catch (error) {
      console.error('Error syncing customers from order:', error);
      // Don't fail the order if customer sync fails
    }

    // Clear cart after successful order
    await PatientCartItem.deleteMany({ patientId });

    // Populate order with medicine details for response
    const populatedOrder = await PatientOrder.findById(order._id)
      .populate('items.medicineId', 'name generic dosage form manufacturer cloudinaryUrl');

    res.status(201).json({
      message: 'Order placed successfully',
      order: populatedOrder
    });
  } catch (error) {
    console.error('Error during checkout:', error);
    res.status(500).json({ message: 'Failed to process checkout' });
  }
};

// Get patient's order history
export const getOrderHistory = async (req, res) => {
  try {
    const patientId = (req.user && (req.user.patientId || req.user._id || req.user.id))?.toString();
    const { page = 1, limit = 10, status } = req.query;

    const query = { patientId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await PatientOrder.find(query)
      .populate('items.medicineId', 'name generic dosage form manufacturer cloudinaryUrl')
      .sort({ placedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PatientOrder.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching order history:', error);
    res.status(500).json({ message: 'Failed to fetch order history' });
  }
};

// Get order details
export const getOrderDetails = async (req, res) => {
  try {
    const patientId = (req.user && (req.user.patientId || req.user._id || req.user.id))?.toString();
    const { orderId } = req.params;

    const order = await PatientOrder.findOne({ _id: orderId, patientId })
      .populate('items.medicineId', 'name generic dosage form manufacturer description cloudinaryUrl');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Failed to fetch order details' });
  }
};
