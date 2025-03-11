import React from 'react';
import {
  Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, Box
} from '@mui/material';
import { Contacts, Assignment } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const drawerWidth = 240;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
  backgroundColor: '#1CB0F6',
  color: '#fff',
  borderBottom: '2px solid #fff',
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: '#fff',
    borderRight: '2px solid #58CC02',
    borderRadius: '0 20px 20px 0',
  },
}));

const Sidebar = ({ onSelect, selectedPage }) => {
  return (
    <StyledDrawer
      variant="permanent"
      anchor="left"
    >
      {/* Cabeçalho da Sidebar */}
      <DrawerHeader>
        <Typography
          variant="h6"
          sx={{ fontWeight: 'bold', ml: 2 }}
        >
          Menu
        </Typography>
      </DrawerHeader>

      {/* Lista de Itens */}
      <Box sx={{ p: 1 }}>
        <List>
          <ListItem
            button
            onClick={() => onSelect('distribute')}
            sx={{
              borderRadius: '15px',
              mb: 1,
              '&:hover': {
                backgroundColor: '#FF6200',
                color: '#fff',
                '& .MuiListItemIcon-root': { color: '#fff' },
              },
              ...(selectedPage === 'distribute' && {
                boxShadow: '0px 4px 12px rgba(255, 98, 0, 0.5)', // Sombra laranja quando selecionado
                backgroundColor: '#FF6200', // Fundo laranja
                color: '#fff', // Texto branco
                '& .MuiListItemIcon-root': { color: '#fff' }, // Ícone branco
              }),
            }}
          >
            <ListItemIcon sx={{ color: '#FF6200' }}>
              <Assignment />
            </ListItemIcon>
            <ListItemText
              primary="Distribuição de Contatos"
              primaryTypographyProps={{ fontWeight: 'bold' }}
            />
          </ListItem>
          <ListItem
            button
            onClick={() => onSelect('register')}
            sx={{
              borderRadius: '15px',
              '&:hover': {
                backgroundColor: '#58CC02',
                color: '#fff',
                '& .MuiListItemIcon-root': { color: '#fff' },
              },
              ...(selectedPage === 'register' && {
                boxShadow: '0px 4px 12px rgba(88, 204, 2, 0.5)', // Sombra verde quando selecionado
                backgroundColor: '#58CC02', // Fundo verde
                color: '#fff', // Texto branco
                '& .MuiListItemIcon-root': { color: '#fff' }, // Ícone branco
              }),
            }}
          >
            <ListItemIcon sx={{ color: '#58CC02' }}>
              <Contacts />
            </ListItemIcon>
            <ListItemText
              primary="Cadastrar Contatos"
              primaryTypographyProps={{ fontWeight: 'bold' }}
            />
          </ListItem>
        </List>
      </Box>
    </StyledDrawer>
  );
};

export default Sidebar;