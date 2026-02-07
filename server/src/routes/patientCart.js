import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import { uploadCloud } from '../middleware/cloudinary.js';
import PharmacyOrder from '../models/PharmacyOrder.js';
import PatientOrder from '../models/PatientOrder.js';
import { auth } from '../middleware/auth.js';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  checkout,
  getOrderHistory,
  getOrderDetails,
} from '../controllers/patientCartController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// Cart operations
router.get('/cart', getCart);
router.post('/cart', addToCart);
router.put('/cart/:id', updateCartItem);
router.delete('/cart/:id', removeFromCart);
router.delete('/cart', clearCart);

// Checkout
router.post('/checkout', uploadCloud.single('prescriptionFile'), checkout);

// Pharmacy-facing orders list filtered by pharmacyId
router.get('/pharmacy/:pharmacyId/orders', async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    
    // Validate pharmacyId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(pharmacyId)) {
      return res.status(400).json({ message: 'Invalid pharmacy ID format' });
    }
    
    // Return patient orders where any item pharmacy matches the requested pharmacy id
    const orders = await PatientOrder.find({ 'items.pharmacy': pharmacyId })
      .populate('patientId', 'firstName lastName email phone')
      .populate('items.medicineId', 'name generic dosage form manufacturer cloudinaryUrl')
      .sort({ placedAt: -1 })
      .select('-__v');
    res.json(orders);
  } catch (e) {
    console.error('Error fetching pharmacy orders:', e);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Order history
router.get('/orders', getOrderHistory);
router.get('/orders/:orderId', getOrderDetails);

export default router;
