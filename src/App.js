import React, { useState, useEffect } from 'react';
import { Box, CssBaseline } from '@mui/material';
import { styled } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './components/Sidebar';
import ContactDistributor from './components/ContactDistributor';
import RegisterContacts from './components/RegisterContacts';
import Login from './components/Login';
import PhoneFormatter from './components/PhoneFormatter';

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

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('data_distribuidor') !== null);
  const location = useLocation();
  const [selectedPage, setSelectedPage] = useState('distribute'); // Valor inicial

  // Sincroniza o selectedPage com a rota atual
  useEffect(() => {
    if (location.pathname === '/contact-distributor') setSelectedPage('distribute');
    else if (location.pathname === '/register-contacts') setSelectedPage('register');
    else if (location.pathname === '/phone-formatter') setSelectedPage('formatter'); // Novo valor para a tela
  }, [location]);

  // Sincroniza o estado com o localStorage
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(localStorage.getItem('data_distribuidor') !== null);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);

    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {isAuthenticated && <Sidebar selectedPage={selectedPage} />}
      <Main sx={{ marginLeft: isAuthenticated ? `${drawerWidth}px` : 0 }}>
        <Routes>
          <Route path="/" element={<Navigate to={isAuthenticated ? "/register-contacts" : "/login"} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register-contacts" element={isAuthenticated ? <RegisterContacts /> : <Navigate to="/login" />} />
          <Route path="/contact-distributor" element={isAuthenticated ? <ContactDistributor /> : <Navigate to="/login" />} />
          <Route path="/phone-formatter" element={isAuthenticated ? <PhoneFormatter /> : <Navigate to="/login" />} /> {/* Nova rota */}
        </Routes>
      </Main>
    </Box>
  );
}

function App() {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <AppContent />
    </Router>
  );
}

export default App;