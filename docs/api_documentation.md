# Payment App API Documentation

## Base URL
```
Development: http://localhost:3001/api
Production: https://your-domain.com/api
```

## Authentication
No authentication is required for these endpoints as they are intended for internal use. However, the Clover webhook endpoint should be configured with proper webhook secret verification.

## Endpoints

### 1. Generate Payment Link
Generate a new payment link for an order using Clover.

**Endpoint:** `POST /payment/generate`

**Request Body:**
```json
{
    "orderId": "ORD-123456",
    "customer": {
        "name": "John Doe",
        "email": "john.doe@example.com"
    },
    "amount": 99.99,
    "currency": "USD"  // Optional, defaults to USD
}
```

**Success Response (200 OK):**
```json
{
    "paymentLink": "https://sandbox.dev.clover.com/pay/1234abcd",
    "status": "PENDING"
}
```

**Error Response (400 Bad Request):**
```json
{
    "error": "Missing required fields"
}
```

**Error Response (500 Internal Server Error):**
```json
{
    "error": "Failed to generate payment link",
    "details": "Detailed error message from Clover"
}
```

### 2. Check Payment Status
Check the status of a payment by order ID.

**Endpoint:** `GET /payment/status/:orderId`

**Parameters:**
- `orderId` (path parameter): The ID of the order to check

**Success Response (200 OK):**
```json
{
    "orderId": "ORD-123456",
    "paymentStatus": "PAID",
    "transactionId": "CLV-TXID-123456",
    "amount": 99.99,
    "currency": "USD"
}
```

**Error Response (404 Not Found):**
```json
{
    "error": "Payment not found"
}
```

**Error Response (500 Internal Server Error):**
```json
{
    "error": "Failed to check payment status",
    "details": "Detailed error message"
}
```

### 3. Clover Webhook
Endpoint for receiving payment status updates from Clover.

**Endpoint:** `POST /payment/webhook`

**Request Body (Payment Success):**
```json
{
    "type": "PAYMENT_SUCCESS",
    "orderId": "CLV-ORD-123456",
    "paymentId": "CLV-TXID-123456",
    "amount": 9999,  // Amount in cents
    "currency": "USD"
}
```

**Request Body (Payment Failed):**
```json
{
    "type": "PAYMENT_FAILED",
    "orderId": "CLV-ORD-123456",
    "error": "Payment declined"
}
```

**Success Response (200 OK):**
```json
{
    "success": true
}
```

**Error Response (500 Internal Server Error):**
```json
{
    "error": "Failed to process webhook"
}
```

## Testing with Postman

1. Import the Postman collection:
   - Open Postman
   - Click "Import"
   - Select the file: `postman/Payment_App_APIs.postman_collection.json`

2. Set up environment variables:
   - Create a new environment in Postman
   - Add variable `baseUrl` with value `http://localhost:3001`

3. Test Generate Payment Link:
   - Select the "Generate Payment Link" request
   - Verify the request body has valid order details
   - Send the request
   - You should receive a payment link in the response

4. Test Check Payment Status:
   - Select the "Check Payment Status" request
   - Replace `:orderId` in the URL with your actual order ID
   - Send the request
   - You should see the current payment status

5. Test Webhook (for development):
   - Select the "Clover Webhook" request
   - Modify the webhook payload as needed
   - Send the request to simulate a Clover notification

## Common HTTP Status Codes

- `200 OK`: Request successful
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

## Testing in Different Environments

### Development (Sandbox)
```
CLOVER_API_BASE=https://sandbox.dev.clover.com
```

### Production
```
CLOVER_API_BASE=https://api.clover.com
```

Make sure to use the appropriate Clover API credentials for each environment.
