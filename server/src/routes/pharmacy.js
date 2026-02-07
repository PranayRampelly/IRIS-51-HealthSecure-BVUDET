import express from 'express';
import multer from 'multer';
import { uploadCloud } from '../middleware/cloudinary.js';
import { auth } from '../middleware/auth.js';
import {
  getDashboard,
  listInventory,
  getMedicineDetails,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  listOrders,
  createOrder,
  updateOrderStatus,
  listPrescriptions,
  updatePrescriptionStatus,
  createPrescription,
  listSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  listCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getReports,
  getSettings,
  updateSettings,
  getMyProfile,
  updateMyProfile,
  getProfileCompletion,
  saveProfileProgress,
  completeProfile,
} from '../controllers/pharmacyController.js';

const router = express.Router();

// Apply authentication middleware to all pharmacy routes
router.use(auth);

// Dashboard summary
router.get('/dashboard', getDashboard);

// Inventory
router.get('/inventory', listInventory);
router.get('/inventory/:id', getMedicineDetails);
router.post('/inventory', uploadCloud.single('image'), createInventoryItem);
router.put('/inventory/:id', uploadCloud.single('image'), updateInventoryItem);
router.delete('/inventory/:id', deleteInventoryItem);

// Orders
router.get('/orders', listOrders);
// multipart/form-data with optional file and json payload in field 'payload'
router.post('/orders', uploadCloud.single('file'), createOrder);
router.patch('/orders/:id/status', updateOrderStatus);

// Export Order PDF
router.get('/orders/:id/pdf', async (req, res) => {
  try {
    const { default: PatientOrder } = await import('../models/PatientOrder.js');
    const { default: PharmacyProfile } = await import('../models/PharmacyProfile.js');
    const { default: PharmacySettings } = await import('../models/PharmacySettings.js');
    const { id } = req.params;

    const order = await PatientOrder.findById(id)
      .populate('patientId', 'firstName lastName email phone')
      .populate('items.medicineId', 'name generic dosage form manufacturer')
      .lean();

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Locale & currency
    const locale = (req.query.locale || 'en-IN').toString();
    const currency = (req.query.currency || 'INR').toString();
    const nf = new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 2 });
    const toINR = (n) => nf.format(Number(n || 0));

    // Brand/context
    const profile = await PharmacyProfile.findOne({ email: req.user?.email }).lean();
    const settings = await PharmacySettings.findOne({ pharmacy: req.user?._id }).lean();
    const brand = {
      name: profile?.businessName || 'HealthSecure Pharmacy',
      address: profile?.address || '',
      phone: req.user?.phone || profile?.phone || '',
      email: req.user?.email || profile?.email || '',
      logoUrl: settings?.logoCloudinaryUrl || profile?.avatarCloudinaryUrl
    };

    const PDFDocument = (await import('pdfkit')).default;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=order-${order.orderNumber}.pdf`);

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);

    // Header band
    doc.rect(0, 0, doc.page.width, 90).fill('#0f766e'); // teal header
    // Logo (optional)
    try {
      if (brand.logoUrl) {
        const fetch = (await import('node-fetch')).default;
        const resp = await fetch(brand.logoUrl);
        const buf = Buffer.from(await resp.arrayBuffer());
        doc.image(buf, 40, 18, { fit: [50, 50] });
      }
    } catch {}
    doc.fillColor('#ffffff').fontSize(18).text(brand.name, 100, 26, { align: 'left' });
    doc.fontSize(10).text(brand.address || '', 100, 50);
    doc.text(brand.phone ? `Ph: ${brand.phone}` : '', 100, 62);
    doc.text(brand.email ? `Email: ${brand.email}` : '', 260, 62);

    // Title
    doc.fillColor('#111827');
    doc.moveDown(2);
    doc.fontSize(20).text('Order Receipt', { align: 'left' });
    // divider under title
    doc.moveTo(40, doc.y + 4).lineTo(doc.page.width - 40, doc.y + 4).strokeColor('#e5e7eb').stroke();
    doc.moveDown(1);

    // Order meta grid + QR
    const leftX = 40, midX = 280;
    const yStart = doc.y;
    doc.fontSize(12).fillColor('#374151');
    doc.text('Order Number', leftX, yStart);
    doc.text('Order Date', leftX, yStart + 18);
    doc.text('Status', leftX, yStart + 36);
    doc.text('Payment', midX, yStart);
    doc.text('Delivery', midX, yStart + 18);
    doc.text('Total', midX, yStart + 36);

    doc.fillColor('#111827');
    doc.text(`${order.orderNumber}`, leftX + 120, yStart);
    doc.text(`${new Date(order.placedAt || order.createdAt).toLocaleString(locale)}`, leftX + 120, yStart + 18);
    doc.text(`${order.status}`, leftX + 120, yStart + 36);
    doc.text(`${order.paymentDetails?.method || '—'}`, midX + 90, yStart);
    doc.text(`${order.deliveryDetails?.option || '—'}`, midX + 90, yStart + 18);
    doc.text(`${toINR(order.pricing?.grandTotal)}`, midX + 90, yStart + 36);

    // QR Code with order number
    try {
      const QRCode = (await import('qrcode')).default;
      const qr = await QRCode.toDataURL(`ORDER:${order.orderNumber}`);
      const b64 = qr.split(',')[1];
      const qrBuf = Buffer.from(b64, 'base64');
      doc.image(qrBuf, doc.page.width - 120, yStart - 6, { width: 80, height: 80 });
    } catch {}

    doc.moveDown();
    // Customer
    doc.moveDown(1.2);
    doc.fontSize(14).fillColor('#0f766e').text('Customer Information');
    const name = `${order.patientId?.firstName || ''} ${order.patientId?.lastName || ''}`.trim();
    doc.fillColor('#111827').fontSize(12).text(`Name: ${name || '—'}`);
    doc.text(`Phone: ${order.patientId?.phone || '—'}`);
    doc.text(`Email: ${order.patientId?.email || '—'}`);
    // subtle divider between sections
    doc.moveTo(40, doc.y + 6).lineTo(doc.page.width - 40, doc.y + 6).strokeColor('#f3f4f6').stroke();

    doc.moveDown();
    doc.fontSize(14).fillColor('#0f766e').text('Delivery Details');
    doc.fillColor('#111827').fontSize(12).text(`Option: ${order.deliveryDetails?.option || '—'}`);
    doc.text(`Slot: ${order.deliveryDetails?.slot || '—'}`);
    doc.text(`Address: ${order.deliveryDetails?.address || '—'}`);
    doc.moveTo(40, doc.y + 6).lineTo(doc.page.width - 40, doc.y + 6).strokeColor('#f3f4f6').stroke();

    doc.moveDown();
    // Items table
    doc.fontSize(14).fillColor('#0f766e').text('Order Items');
    doc.moveDown(0.5);
    const tableTop = doc.y;
    const col = { name: 40, variant: 320, qty: 420, unit: 470, total: 540 };

    const drawRow = (y, row, header = false) => {
      doc.fillColor(header ? '#374151' : '#111827').fontSize(11);
      const asText = (v) => v === undefined || v === null ? '' : String(v);
      const money = (v) => (typeof v === 'number') ? toINR(v) : asText(v);
      doc.text(asText(row.name), col.name, y, { width: col.variant - col.name - 8 });
      doc.text(asText(row.variant), col.variant, y, { width: col.qty - col.variant - 8 });
      doc.text(asText(row.qty), col.qty, y, { width: col.unit - col.qty - 8, align: 'right' });
      doc.text(money(row.unit), col.unit, y, { width: col.total - col.unit - 8, align: 'right' });
      doc.text(money(row.total), col.total, y, { align: 'right' });
    };

    // header with background
    doc.save();
    doc.rect(40, tableTop - 2, 520, 18).fill('#f3f4f6');
    doc.restore();
    doc.fontSize(11).fillColor('#374151');
    drawRow(tableTop, { name: 'Medicine', variant: 'Variant', qty: 'Qty', unit: 'Unit', total: 'Total' }, true);
    doc.moveTo(40, tableTop + 16).lineTo(560, tableTop + 16).strokeColor('#e5e7eb').stroke();

    let rowY = tableTop + 20;
    order.items.forEach((it) => {
      drawRow(rowY, {
        name: it.medicineId?.name || it.medicineName || '—',
        variant: it.variant || '—',
        qty: it.quantity,
        unit: it.unitPrice || 0,
        total: it.totalPrice || 0
      });
      rowY += 18;
    });

    doc.moveDown();
    // Totals panel
    doc.moveDown(1);
    // totals box on right
    const boxTop = doc.y;
    const totalsLeft = 360, totalsWidth = 200;
    doc.roundedRect(totalsLeft - 10, boxTop - 8, totalsWidth + 20, 130, 6).strokeColor('#e5e7eb').stroke();
    doc.fontSize(14).fillColor('#0f766e').text('Cost Breakdown', totalsLeft, boxTop - 4);
    const pricing = order.pricing || {};
    const addTotal = (label, value, bold = false) => {
      doc.fontSize(12).fillColor('#374151').text(label, totalsLeft, doc.y, { width: 140 });
      doc.fontSize(12).fillColor('#111827');
      if (bold) doc.font('Helvetica-Bold'); else doc.font('Helvetica');
      doc.text(toINR(value), totalsLeft + 140, doc.y - 14, { width: totalsWidth - 140, align: 'right' });
      doc.moveDown(0.3);
    };
    addTotal('Subtotal', pricing.subtotal || 0);
    addTotal('Delivery Fee', pricing.deliveryFee || 0);
    addTotal('Discount', pricing.discount || 0);
    addTotal('Tax', pricing.tax || 0);
    doc.moveTo(totalsLeft, doc.y).lineTo(totalsLeft + totalsWidth, doc.y).strokeColor('#e5e7eb').stroke();
    addTotal('Grand Total', pricing.grandTotal || 0, true);

    // Footer
    doc.fillColor('#6b7280').fontSize(9).text('Thank you for choosing HealthSecure.', 40, doc.page.height - 40, { align: 'center', width: doc.page.width - 80 });

    doc.end();
  } catch (e) {
    console.error('Export order PDF error:', e);
    res.status(500).json({ message: 'Failed to generate PDF' });
  }
});

// Send Order SMS to patient (if Twilio configured)
router.post('/orders/:id/sms', async (req, res) => {
  try {
    const { default: PatientOrder } = await import('../models/PatientOrder.js');
    const { id } = req.params;
    const order = await PatientOrder.findById(id).populate('patientId', 'firstName lastName phone').lean();
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const to = order.patientId?.phone;
    if (!to) return res.status(400).json({ message: 'Patient phone not available' });

    const body = `Order ${order.orderNumber}: ${order.status}. Total ₹${order.pricing?.grandTotal ?? 0}. Thank you for ordering with HealthSecure.`;

    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_FROM_NUMBER;
    if (!sid || !token || !from) {
      console.log('Twilio not configured. SMS content:', body);
      return res.json({ message: 'SMS not sent (Twilio not configured). Logged content.', preview: body });
    }

    const twilio = (await import('twilio')).default(sid, token);
    const result = await twilio.messages.create({ to, from, body });
    res.json({ message: 'SMS sent', sid: result.sid });
  } catch (e) {
    console.error('Send order SMS error:', e);
    res.status(500).json({ message: 'Failed to send SMS' });
  }
});

// Prescriptions
router.get('/prescriptions', listPrescriptions);
router.post('/prescriptions', uploadCloud.single('file'), createPrescription);
router.patch('/prescriptions/:id/status', updatePrescriptionStatus);

// Suppliers
router.get('/suppliers', listSuppliers);
router.post('/suppliers', uploadCloud.single('image'), createSupplier);
router.put('/suppliers/:id', uploadCloud.single('image'), updateSupplier);
router.delete('/suppliers/:id', deleteSupplier);

// Customers
router.get('/customers', listCustomers);
router.post('/customers', uploadCloud.single('image'), createCustomer);
router.put('/customers/:id', uploadCloud.single('image'), updateCustomer);
router.delete('/customers/:id', deleteCustomer);

// Reports
router.get('/reports', getReports);

// Settings (multipart with possible logo & banner fields)
const settingsUpload = uploadCloud.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
]);
router.get('/settings', getSettings);
router.post('/settings', settingsUpload, updateSettings);
router.put('/settings', settingsUpload, updateSettings);

// My Profile (single document, multipart for avatar)
router.get('/me', getMyProfile);
router.put('/me', uploadCloud.single('avatar'), updateMyProfile);

// Profile Completion System
router.get('/profile-completion', getProfileCompletion);
router.get('/profile-completion-status', getProfileCompletion); // Alias for backward compatibility
router.post('/save-profile-progress', saveProfileProgress);
router.post('/complete-profile', uploadCloud.fields([
  { name: 'license', maxCount: 1 },
  { name: 'gst', maxCount: 1 },
  { name: 'pan', maxCount: 1 },
  { name: 'other', maxCount: 5 }
]), completeProfile);

// Get patient orders for this pharmacy
router.get('/orders/patients', async (req, res) => {
  try {
    // Get pharmacy ID from authenticated user
    const pharmacyId = req.user._id;
    
    console.log('Fetching patient orders for pharmacy:', pharmacyId);
    
    // Import PatientOrder model (use regular import)
    const { default: PatientOrder } = await import('../models/PatientOrder.js');
    
    const orders = await PatientOrder.find({ 'items.pharmacy': pharmacyId })
      .populate('patientId', 'firstName lastName email phone')
      .populate('items.medicineId', 'name generic dosage form manufacturer cloudinaryUrl')
      .populate('items.pharmacy', 'businessName address')
      .sort({ createdAt: -1 })
      .lean();

    console.log(`Found ${orders.length} patient orders for pharmacy ${pharmacyId}`);

    const transformedOrders = orders.map(order => ({
      id: order._id,
      _id: order._id,
      orderNumber: order.orderNumber,
      patient: {
        id: order.patientId?._id,
        // Provide both full name and separate fields
        name: `${order.patientId?.firstName || ''} ${order.patientId?.lastName || ''}`.trim(),
        firstName: order.patientId?.firstName,
        lastName: order.patientId?.lastName,
        email: order.patientId?.email,
        phone: order.patientId?.phone
      },
      items: order.items.map(item => ({
        id: item._id,
        medicine: {
          id: item.medicineId?._id,
          name: item.medicineId?.name,
          generic: item.medicineId?.generic,
          dosage: item.medicineId?.dosage,
          form: item.medicineId?.form,
          manufacturer: item.medicineId?.manufacturer,
          image: item.medicineId?.cloudinaryUrl
        },
        pharmacy: {
          id: item.pharmacy?._id,
          name: item.pharmacy?.businessName,
          address: item.pharmacy?.address
        },
        variant: item.variant,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      })),
      // Surface all financial and logistics sections for the UI
      pricing: order.pricing || {},
      paymentDetails: order.paymentDetails || {},
      deliveryDetails: order.deliveryDetails || {},
      // Prefer pricing.grandTotal; original model doesn't have totalAmount field
      totalAmount: order.pricing?.grandTotal ?? 0,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      deliveryAddress: order.deliveryAddress || order.deliveryDetails?.address,
      placedAt: order.placedAt || order.createdAt,
      updatedAt: order.updatedAt
    }));

    res.json(transformedOrders);
  } catch (error) {
    console.error('Error fetching patient orders:', error);
    res.status(500).json({ message: 'Failed to fetch patient orders' });
  }
});

// Update patient order status (restricted to the authenticated pharmacy and its orders)
router.patch('/orders/patients/:orderId/status', async (req, res) => {
  try {
    const pharmacyId = req.user._id;
    const { orderId } = req.params;
    const { status } = req.body || {};

    const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const { default: PatientOrder } = await import('../models/PatientOrder.js');

    const updated = await PatientOrder.findOneAndUpdate(
      { _id: orderId, 'items.pharmacy': pharmacyId },
      { $set: { status } },
      { new: true }
    )
      .populate('patientId', 'firstName lastName email phone')
      .populate('items.medicineId', 'name generic dosage form manufacturer cloudinaryUrl')
      .select('-__v');

    if (!updated) {
      return res.status(404).json({ message: 'Order not found for this pharmacy' });
    }

    res.json(updated);
  } catch (e) {
    console.error('Error updating patient order status:', e);
    console.error('Stack trace:', e.stack);
    res.status(500).json({ message: 'Failed to update order status', error: e.message });
  }
});

export default router;


