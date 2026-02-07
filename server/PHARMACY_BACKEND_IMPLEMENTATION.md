# Pharmacy Backend Implementation

## Overview

This document describes the comprehensive pharmacy backend implementation for the HealthSecure platform. The backend provides a complete pharmacy management system including inventory management, order processing, patient interactions, and analytics.

## Architecture

The pharmacy backend follows a layered architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Routes                              │
│  ┌─────────────────┐  ┌─────────────────┐                │
│  │ Patient Routes  │  │ Pharmacy Routes │                │
│  └─────────────────┘  └─────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Controllers                              │
│  ┌─────────────────┐  ┌─────────────────┐                │
│  │ Patient Ctrl    │  │ Pharmacy Ctrl   │                │
│  └─────────────────┘  └─────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Services                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              PharmacyService                        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Models                                  │
│  ┌─────────────────┐  ┌─────────────────┐                │
│  │ Inventory       │  │ Orders          │                │
│  │ Cart            │  │ Profile         │                │
│  └─────────────────┘  └─────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   MongoDB                                  │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Pharmacy Service (`services/pharmacyService.js`)

The central service that handles all pharmacy business logic:

- **Inventory Management**: CRUD operations for medicines
- **Order Processing**: Creating, updating, and managing orders
- **Cart Management**: Add, remove, and manage shopping cart
- **Price Comparison**: Search and compare medicine prices
- **Analytics**: Generate reports and insights

### 2. Models

#### PharmacyInventoryItem
```javascript
{
  sku: String,                    // Stock Keeping Unit
  name: String,                   // Medicine name
  generic: String,                // Generic name
  dosage: String,                 // Dosage strength
  form: String,                   // Form (tablet, capsule, etc.)
  manufacturer: String,           // Manufacturer name
  description: String,            // Medicine description
  category: String,               // Medicine category
  prescriptionRequired: Boolean,  // Whether prescription is needed
  stock: Number,                  // Current stock quantity
  threshold: Number,              // Low stock threshold
  price: Number,                  // Base price
  genericPrice: Number,           // Generic variant price
  brandPrice: Number,             // Brand variant price
  insuranceCovered: Boolean,      // Insurance coverage status
  insurancePrice: Number,         // Insurance price
  rating: Number,                 // Average rating
  reviews: Number,                // Number of reviews
  cloudinaryUrl: String,          // Medicine image URL
  deliveryTime: String            // Estimated delivery time
}
```

#### PatientOrder
```javascript
{
  orderNumber: String,            // Unique order number
  patientId: ObjectId,            // Reference to patient
  items: [{                       // Order items
    medicineId: ObjectId,         // Reference to medicine
    medicineName: String,         // Medicine name
    variant: String,              // Generic or brand
    quantity: Number,             // Quantity ordered
    packSize: Number,             // Pack size
    unitPrice: Number,            // Price per unit
    totalPrice: Number,           // Total price for item
    pharmacy: String,             // Pharmacy ID
    insuranceApplied: Boolean     // Insurance applied
  }],
  deliveryDetails: {               // Delivery information
    option: String,               // Delivery option
    address: String,              // Delivery address
    instructions: String          // Special instructions
  },
  paymentDetails: {                // Payment information
    method: String,               // Payment method
    status: String,               // Payment status
    transactionId: String         // Transaction ID
  },
  pricing: {                       // Pricing breakdown
    subtotal: Number,             // Subtotal
    deliveryFee: Number,          // Delivery fee
    discount: Number,              // Discount amount
    tax: Number,                   // Tax amount
    grandTotal: Number             // Grand total
  },
  status: String,                  // Order status
  estimatedDelivery: Date         // Estimated delivery date
}
```

#### PatientCartItem
```javascript
{
  patientId: ObjectId,            // Reference to patient
  medicineId: ObjectId,           // Reference to medicine
  variant: String,                // Generic or brand
  quantity: Number,               // Quantity
  packSize: Number,               // Pack size
  pharmacy: ObjectId,             // Reference to pharmacy
  insuranceApplied: Boolean,      // Insurance applied
  unitPrice: Number,              // Unit price
  addedAt: Date                   // When added to cart
}
```

### 3. API Endpoints

#### Patient Pharmacy Routes (`/api/patient/pharmacy`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/price-comparison?q=search` | Search medicines and compare prices | Yes |
| GET | `/search?q=search&category=cat&inStock=true` | Search medicines with filters | Yes |
| GET | `/medicines/:id` | Get detailed medicine information | Yes |
| GET | `/categories` | Get all medicine categories | Yes |
| GET | `/cart` | Get patient's shopping cart | Yes |
| POST | `/cart` | Add item to cart | Yes |
| PUT | `/cart/:id` | Update cart item | Yes |
| DELETE | `/cart/:id` | Remove item from cart | Yes |
| DELETE | `/cart` | Clear entire cart | Yes |
| POST | `/checkout` | Checkout cart and create order | Yes |
| GET | `/orders` | Get patient's order history | Yes |
| GET | `/orders/:orderId` | Get specific order details | Yes |
| GET | `/analytics?timeRange=90` | Get patient's pharmacy analytics | Yes |
| GET | `/prescriptions` | Get patient's prescriptions | Yes |

#### Pharmacy Routes (`/api/pharmacy`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/dashboard` | Get pharmacy dashboard | Yes |
| GET | `/inventory` | Get pharmacy inventory | Yes |
| GET | `/inventory/:id` | Get medicine details | Yes |
| POST | `/inventory` | Create new medicine | Yes |
| PUT | `/inventory/:id` | Update medicine | Yes |
| DELETE | `/inventory/:id` | Delete medicine | Yes |
| GET | `/orders` | Get pharmacy orders | Yes |
| POST | `/orders` | Create new order | Yes |
| PATCH | `/orders/:id/status` | Update order status | Yes |
| GET | `/prescriptions` | Get prescriptions | Yes |
| POST | `/prescriptions` | Create prescription | Yes |
| PATCH | `/prescriptions/:id/status` | Update prescription status | Yes |
| GET | `/suppliers` | Get suppliers | Yes |
| POST | `/suppliers` | Create supplier | Yes |
| PUT | `/suppliers/:id` | Update supplier | Yes |
| DELETE | `/suppliers/:id` | Delete supplier | Yes |
| GET | `/customers` | Get customers | Yes |
| POST | `/customers` | Create customer | Yes |
| PUT | `/customers/:id` | Update customer | Yes |
| DELETE | `/customers/:id` | Delete customer | Yes |
| GET | `/reports` | Get analytics reports | Yes |
| GET | `/settings` | Get pharmacy settings | Yes |
| POST/PUT | `/settings` | Update pharmacy settings | Yes |
| GET | `/me` | Get pharmacy profile | Yes |
| PUT | `/me` | Update pharmacy profile | Yes |
| GET | `/profile-completion` | Get profile completion status | Yes |
| POST | `/save-profile-progress` | Save profile progress | Yes |
| POST | `/complete-profile` | Complete profile setup | Yes |

## Key Features

### 1. Inventory Management
- **Stock Tracking**: Real-time stock levels with low stock alerts
- **Medicine Categories**: Organized medicine classification
- **Pricing**: Support for generic, brand, and insurance pricing
- **Image Management**: Cloudinary integration for medicine images

### 2. Order Processing
- **Cart System**: Shopping cart with quantity and variant management
- **Checkout Process**: Complete order creation with delivery options
- **Status Tracking**: Order status updates throughout the process
- **Payment Integration**: Support for multiple payment methods

### 3. Patient Experience
- **Medicine Search**: Advanced search with filters and sorting
- **Price Comparison**: Compare generic vs brand pricing
- **Order History**: Complete order tracking and history
- **Analytics**: Personal pharmacy usage insights

### 4. Pharmacy Management
- **Dashboard**: Real-time metrics and insights
- **Order Management**: Process and track patient orders
- **Inventory Control**: Manage stock levels and alerts
- **Customer Management**: Track patient relationships
- **Reporting**: Comprehensive analytics and reports

### 5. Security & Authentication
- **JWT Authentication**: Secure API access
- **Role-based Access**: Patient vs Pharmacy permissions
- **Data Validation**: Input validation and sanitization
- **Audit Logging**: Track all system activities

## Database Schema

### Collections
1. **pharmacyinventoryitems** - Medicine inventory
2. **patientorders** - Patient orders
3. **patientcartitems** - Shopping cart items
4. **pharmacyprofiles** - Pharmacy business profiles
5. **pharmacysettings** - Pharmacy configuration
6. **pharmacysuppliers** - Supplier information
7. **pharmacycustomers** - Customer records
8. **pharmacyorders** - Internal pharmacy orders
9. **pharmacyprescriptions** - Prescription management

### Indexes
- Unique SKU for inventory items
- Patient-medicine-variant combination for cart items
- Order number uniqueness
- Email indexing for profiles

## Business Logic

### 1. Stock Management
```javascript
// Automatic stock updates on order placement
await PharmacyService.updateStock(medicineId, quantity, 'decrease');
```

### 2. Price Calculation
```javascript
// Dynamic pricing based on variant and insurance
const unitPrice = variant === 'generic' ? 
  medicine.genericPrice : medicine.brandPrice;
```

### 3. Delivery Estimation
```javascript
// Calculate delivery time based on option
const estimatedDelivery = PharmacyService.calculateEstimatedDelivery(deliveryOption);
```

### 4. Order Processing
```javascript
// Complete order workflow
const order = await PharmacyService.createOrder(orderData);
await PharmacyService.clearCart(patientId);
```

## Error Handling

The system implements comprehensive error handling:

```javascript
try {
  const result = await PharmacyService.operation();
  return result;
} catch (error) {
  throw new Error(`Operation failed: ${error.message}`);
}
```

### Common Error Types
- **Validation Errors**: Invalid input data
- **Authentication Errors**: Invalid or expired tokens
- **Authorization Errors**: Insufficient permissions
- **Business Logic Errors**: Insufficient stock, invalid status
- **System Errors**: Database connection issues

## Testing

### Test Script
Run the comprehensive test suite:

```bash
cd server
node test-pharmacy-backend.js
```

### Test Coverage
- Server health checks
- User authentication (pharmacy & patient)
- CRUD operations for all entities
- Business logic validation
- Error handling scenarios
- API endpoint functionality

## Performance Considerations

### 1. Database Optimization
- Proper indexing on frequently queried fields
- Pagination for large result sets
- Lean queries for read-only operations

### 2. Caching Strategy
- Redis integration for session management
- Query result caching for static data
- CDN for image assets

### 3. API Optimization
- Response compression
- Rate limiting
- Request validation

## Security Features

### 1. Authentication
- JWT-based token system
- Token expiration and refresh
- Secure password hashing

### 2. Authorization
- Role-based access control
- Resource ownership validation
- API endpoint protection

### 3. Data Protection
- Input sanitization
- SQL injection prevention
- XSS protection

## Deployment

### Environment Variables
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/healthsecure

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server
PORT=5000
NODE_ENV=production
```

### Production Considerations
- HTTPS enforcement
- Rate limiting
- Logging and monitoring
- Backup strategies
- Load balancing

## Monitoring & Analytics

### 1. System Health
- Database connection status
- API response times
- Error rates and types

### 2. Business Metrics
- Order volume and revenue
- Inventory turnover
- Customer engagement
- Popular medicines

### 3. Performance Metrics
- API endpoint usage
- Database query performance
- Memory and CPU usage

## Future Enhancements

### 1. Advanced Features
- Prescription management system
- Insurance integration
- Advanced analytics dashboard
- Mobile app API

### 2. Integrations
- Payment gateway integration
- SMS/Email notifications
- Third-party pharmacy systems
- Government compliance APIs

### 3. Scalability
- Microservices architecture
- Event-driven processing
- Real-time notifications
- Multi-tenant support

## Troubleshooting

### Common Issues

#### 1. Database Connection
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check connection string
echo $MONGODB_URI
```

#### 2. Authentication Issues
```bash
# Verify JWT secret
echo $JWT_SECRET

# Check token expiration
jwt decode <token>
```

#### 3. File Upload Issues
```bash
# Verify Cloudinary credentials
echo $CLOUDINARY_CLOUD_NAME
echo $CLOUDINARY_API_KEY
```

### Debug Mode
Enable debug logging:

```bash
export DEBUG=true
npm start
```

## Support & Maintenance

### 1. Regular Maintenance
- Database optimization
- Log rotation
- Security updates
- Performance monitoring

### 2. Backup Strategy
- Daily database backups
- Configuration backups
- Code repository backups

### 3. Update Procedures
- Staging environment testing
- Rolling updates
- Rollback procedures
- Change documentation

## Conclusion

The pharmacy backend implementation provides a robust, scalable, and secure foundation for pharmacy management operations. With comprehensive features covering inventory, orders, analytics, and patient management, it serves as a complete solution for modern pharmacy operations.

The modular architecture ensures maintainability and extensibility, while the comprehensive testing suite guarantees reliability. The system is production-ready and includes all necessary security and performance optimizations.
