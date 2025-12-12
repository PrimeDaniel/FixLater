import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

const About = () => (
  <Container maxWidth="md" sx={{ py: 4 }}>
    <Typography variant="h3" gutterBottom>About FixLater</Typography>
    <Typography variant="body1" color="text.secondary">
      FixLater is a platform connecting people who need help with tasks to trusted local service providers. Our mission is to make it easy, safe, and fast to get things done.
    </Typography>
  </Container>
);

export default About;
