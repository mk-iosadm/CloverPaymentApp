# Pick Ticket Payment App

A payment processing application built with React and Node.js that integrates with Clover.com for payment processing.

## Project Structure
```
PaymentApp_new/
├── frontend/          # React frontend application
├── backend/           # Node.js backend application
├── docs/             # Project documentation
```

## Tech Stack
- Frontend: React
- Backend: Node.js + Express
- Database: PostgreSQL
- Payment Gateway: Clover.com API

## Getting Started

### Backend Setup
1. Navigate to the backend directory:
```bash
cd backend
npm install
```

2. Create a `.env` file in the backend directory with your configuration:
```
PORT=3001
DATABASE_URL=postgresql://username:password@localhost:5432/payment_app
CLOVER_MERCHANT_ID=your_merchant_id
CLOVER_API_KEY=your_api_key
CLOVER_ACCESS_TOKEN=your_access_token
```

3. Start the backend server:
```bash
npm run dev
```

### Frontend Setup
1. Navigate to the frontend directory:
```bash
cd frontend
npm install
```

2. Create a `.env` file in the frontend directory:
```
REACT_APP_API_URL=http://localhost:3001/api
```

3. Start the frontend development server:
```bash
npm start
```

## Features
- Generate payment links for orders
- Email payment links to customers
- Process payments through Clover
- Track payment status
- Update order status in ERP

## API Documentation
Detailed API documentation can be found in the `docs` directory.
