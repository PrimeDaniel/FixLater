import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

const Contact = () => (
  <Container maxWidth="md" sx={{ py: 4 }}>
    <Typography variant="h3" gutterBottom>Contact Us</Typography>
    <Typography variant="body1" color="text.secondary">
      For support or inquiries, email us at <a href="mailto:support@fixlater.com">support@fixlater.com</a>.
    </Typography>
  </Container>
);

export default Contact;
