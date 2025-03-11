import React, { useState } from 'react';
import { Box, CssBaseline } from '@mui/material';
import { styled } from '@mui/material/styles';
import Sidebar from './components/Sidebar';
import ContactDistributor from './components/ContactDistributor';
import RegisterContacts from './components/RegisterContacts';

const drawerWidth = 240; // Largura fixa da sidebar

const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginLeft: `${drawerWidth}px`, // Margem fixa para a sidebar
  display: 'flex',
  justifyContent: 'center', // Centraliza o conteúdo horizontalmente
  alignItems: 'center', // Centraliza verticalmente (opcional)
  minHeight: '100vh', // Garante que o conteúdo ocupe a tela inteira
}));

function App() {
  const [selectedPage, setSelectedPage] = useState('distribute');

  const handleSelectPage = (page) => {
    setSelectedPage(page);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Sidebar onSelect={handleSelectPage} selectedPage={selectedPage} />
      <Main open={true}>
        {selectedPage === 'distribute' && <ContactDistributor />}
        {selectedPage === 'register' && <RegisterContacts />}
      </Main>
    </Box>
  );
}
export default App;