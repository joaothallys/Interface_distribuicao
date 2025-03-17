import React, { useState, useEffect } from 'react';
import { Box, CssBaseline } from '@mui/material';
import { styled } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ContactDistributor from './components/ContactDistributor';
import RegisterContacts from './components/RegisterContacts';
import Login from './components/Login';

const drawerWidth = 240;

const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginLeft: `${drawerWidth}px`,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
}));

function App() {
  const [selectedPage, setSelectedPage] = useState('distribute');
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('data_distribuidor') !== null);

  // Sincroniza o estado com o localStorage
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(localStorage.getItem('data_distribuidor') !== null);
    };

    // Verifica inicialmente
    checkAuth();

    // Ouve mudanças no localStorage (opcional, dependendo do navegador)
    window.addEventListener('storage', checkAuth);

    // Limpeza do evento
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleSelectPage = (page) => {
    setSelectedPage(page);
  };

  return (
    <Router>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        {isAuthenticated && <Sidebar onSelect={handleSelectPage} selectedPage={selectedPage} />}
        <Main sx={{ marginLeft: isAuthenticated ? `${drawerWidth}px` : 0 }}>
          <Routes>
            <Route path="/" element={<Navigate to={isAuthenticated ? "/register-contacts" : "/login"} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register-contacts" element={isAuthenticated ? <RegisterContacts /> : <Navigate to="/login" />} />
            <Route path="/contact-distributor" element={isAuthenticated ? <ContactDistributor /> : <Navigate to="/login" />} />
          </Routes>
        </Main>
      </Box>
    </Router>
  );
}

export default App;