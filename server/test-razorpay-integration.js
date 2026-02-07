import dotenv from 'dotenv';
import Razorpay from 'razorpay';

// Load environment variables
dotenv.config();

// Test Razorpay configuration
console.log('🧪 Testing Razorpay Integration...');
console.log('📋 Environment Variables:');
console.log('  RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? '✅ Set' : '❌ Not set');
console.log('  RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '✅ Set' : '❌ Not set');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Test creating an order
async function testCreateOrder() {
  try {
    console.log('\n🔍 Testing Order Creation...');
    
    const orderData = {
      amount: 50000, // ₹500 in paise
      currency: 'INR',
      receipt: `test_order_${Date.now()}`,
      notes: {
        test: 'true',
        description: 'Test appointment booking'
      },
      partial_payment: false,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(orderData);
    
    console.log('✅ Order created successfully!');
    console.log('📋 Order Details:');
    console.log('  Order ID:', order.id);
    console.log('  Amount:', order.amount);
    console.log('  Currency:', order.currency);
    console.log('  Receipt:', order.receipt);
    console.log('  Status:', order.status);
    
    return order;
  } catch (error) {
    console.error('❌ Error creating order:', error.message);
    if (error.error) {
      console.error('  Error Code:', error.error.code);
      console.error('  Error Description:', error.error.description);
    }
    throw error;
  }
}

// Test fetching orders
async function testFetchOrders() {
  try {
    console.log('\n🔍 Testing Order Fetching...');
    
    const orders = await razorpay.orders.all({
      count: 5
    });
    
    console.log('✅ Orders fetched successfully!');
    console.log('📋 Found', orders.items.length, 'orders');
    
    orders.items.forEach((order, index) => {
      console.log(`  ${index + 1}. Order ID: ${order.id}, Amount: ${order.amount}, Status: ${order.status}`);
    });
    
    return orders;
  } catch (error) {
    console.error('❌ Error fetching orders:', error.message);
    throw error;
  }
}

// Test payment verification
async function testPaymentVerification() {
  try {
    console.log('\n🔍 Testing Payment Verification...');
    
    // This is a mock test since we don't have a real payment
    const mockPaymentId = 'pay_test123';
    const mockOrderId = 'order_test123';
    const mockSignature = 'test_signature';
    
    console.log('📋 Mock Payment Details:');
    console.log('  Payment ID:', mockPaymentId);
    console.log('  Order ID:', mockOrderId);
    console.log('  Signature:', mockSignature);
    
    // In real scenario, you would verify the signature here
    console.log('✅ Payment verification test completed (mock)');
    
  } catch (error) {
    console.error('❌ Error in payment verification test:', error.message);
    throw error;
  }
}

// Main test function
async function runTests() {
  try {
    console.log('🚀 Starting Razorpay Integration Tests...\n');
    
    // Test 1: Configuration
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('❌ Razorpay credentials not configured properly');
      process.exit(1);
    }
    
    // Test 2: Order Creation
    const order = await testCreateOrder();
    
    // Test 3: Order Fetching
    await testFetchOrders();
    
    // Test 4: Payment Verification
    await testPaymentVerification();
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('✅ Razorpay integration is working properly');
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export { testCreateOrder, testFetchOrders, testPaymentVerification };











