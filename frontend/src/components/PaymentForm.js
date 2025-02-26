import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import axios from 'axios';

const PaymentForm = () => {
  const [formData, setFormData] = useState({
    orderId: '',
    customerName: '',
    customerEmail: '',
    amount: '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/payment/generate`, {
        orderId: formData.orderId,
        customer: {
          name: formData.customerName,
          email: formData.customerEmail,
        },
        amount: parseFloat(formData.amount),
      });

      setStatus({
        type: 'success',
        message: 'Payment link has been sent to the customer email!',
      });
      setFormData({
        orderId: '',
        customerName: '',
        customerEmail: '',
        amount: '',
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.error || 'Failed to generate payment link',
      });
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Generate Payment Link
          </Typography>
          
          {status.type && (
            <Alert severity={status.type} sx={{ mb: 2 }}>
              {status.message}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Order ID"
              name="orderId"
              value={formData.orderId}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Customer Name"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Customer Email"
              name="customerEmail"
              type="email"
              value={formData.customerEmail}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              margin="normal"
              required
              inputProps={{ step: "0.01", min: "0" }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
            >
              Generate Payment Link
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default PaymentForm;
