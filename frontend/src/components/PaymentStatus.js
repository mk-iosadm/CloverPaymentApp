import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';

const PaymentStatus = () => {
  const { orderId } = useParams();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/payment/status/${orderId}`
        );
        setStatus(response.data);
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to fetch payment status');
        setLoading(false);
      }
    };

    checkStatus();
  }, [orderId]);

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            mt: 4,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Payment Status
          </Typography>
          
          {error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <>
              <Typography variant="body1" gutterBottom>
                Order ID: {status.orderId}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Status: {status.paymentStatus}
              </Typography>
              {status.transactionId && (
                <Typography variant="body1" gutterBottom>
                  Transaction ID: {status.transactionId}
                </Typography>
              )}
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default PaymentStatus;
