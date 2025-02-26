import cloverService from './src/services/cloverService.js';

async function testCloverIntegration() {
  try {
    console.log('1. Creating a test order...');
    const orderData = {
      orderId: `TEST-${Date.now()}`,
      amount: 10.99,
      customer: {
        name: 'Test User',
        email: 'test@example.com'
      }
    };

    const order = await cloverService.createOrder(orderData);
    console.log('Order created successfully:', order);

    console.log('\n2. Creating payment link...');
    const paymentLink = await cloverService.createPaymentLink(
      orderData.orderId,
      orderData.amount,
      orderData.customer
    );
    console.log('Payment link created successfully:', paymentLink);

    console.log('\n3. Checking payment status...');
    const status = await cloverService.getPaymentStatus(paymentLink.orderId);
    console.log('Payment status:', status);

  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.responseData) {
      console.error('API Response:', error.responseData);
    }
  }
}

console.log('Starting Clover integration test...\n');
testCloverIntegration();
