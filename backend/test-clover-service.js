import cloverService from './src/services/cloverService.js';

async function testCloverService() {
  try {
    // Test 1: Get Merchant Info
    console.log('\nTesting getMerchantInfo()...');
    const merchantInfo = await cloverService.getMerchantInfo();
    console.log('Merchant Info:', merchantInfo);

    // Test 2: Create Order
    console.log('\nTesting createOrder()...');
    const orderData = {
      currency: 'USD',
      total: 1500, // $15.00
      title: 'Test Order via Service',
    };
    const order = await cloverService.createOrder(orderData);
    console.log('Created Order:', order);

    // Test 3: Get Order
    console.log('\nTesting getOrder()...');
    const retrievedOrder = await cloverService.getOrder(order.id);
    console.log('Retrieved Order:', retrievedOrder);

  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.responseData) {
      console.error('API Response:', error.responseData);
    }
  }
}

console.log('Starting Clover Service Tests...');
testCloverService();
