import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

const FAQ = () => (
  <Container maxWidth="md" sx={{ py: 4 }}>
    <Typography variant="h3" gutterBottom>Frequently Asked Questions</Typography>
    <Typography variant="h6">How does FixLater work?</Typography>
    <Typography variant="body1" color="text.secondary">Post a task, get offers, and hire a provider!</Typography>
    <Typography variant="h6" sx={{ mt: 3 }}>Is FixLater free?</Typography>
    <Typography variant="body1" color="text.secondary">Browsing and posting tasks is free. Providers may pay a small fee per job.</Typography>
  </Container>
);

export default FAQ;
