import React from 'react';
import { AppBar, Toolbar, Typography, Container } from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';

const Header = () => {
  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <PaymentIcon sx={{ mr: 2 }} />
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1 }}
          >
            Pick Ticket Payment App
          </Typography>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
