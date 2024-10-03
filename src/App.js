// src/App.js
import React from 'react';
import ContactDistributor from './components/ContactDistributor';
import { Container } from '@mui/material';

function App() {
  return (
    <Container maxWidth="md">
      <ContactDistributor />
    </Container>
  );
}

export default App;
