import React from 'react';
import {
  Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, Box
} from '@mui/material';
import { Contacts, Assignment } from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

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

const Sidebar = ({ selectedPage }) => {
  const navigate = useNavigate();

  return (
    <StyledDrawer
      variant="permanent"
      anchor="left"
    >
      <DrawerHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 'bold' }}
          >
            Couve
          </Typography>
        </Box>
      </DrawerHeader>

      <Box sx={{ p: 1 }}>
        <List>
          <ListItem
            button
            onClick={() => navigate('/contact-distributor')}
            sx={{
              borderRadius: '15px',
              mb: 1,
              '&:hover': {
                backgroundColor: '#FF6200',
                color: '#fff',
                '& .MuiListItemIcon-root': { color: '#fff' },
              },
              ...(selectedPage === 'distribute' && {
                boxShadow: '0px 4px 12px rgba(255, 98, 0, 0.5)',
                backgroundColor: '#FF6200',
                color: '#fff',
                '& .MuiListItemIcon-root': { color: '#fff' },
              }),
              ...(selectedPage !== 'distribute' && {
                backgroundColor: 'transparent',
                color: '#000',
                '& .MuiListItemIcon-root': { color: '#FF6200' },
              }),
            }}
          >
            <ListItemIcon sx={{ color: selectedPage === 'distribute' ? '#fff' : '#FF6200' }}>
              <Assignment />
            </ListItemIcon>
            <ListItemText
              primary="Distribuição de Contatos"
              primaryTypographyProps={{ fontWeight: 'bold' }}
            />
          </ListItem>
          <ListItem
            button
            onClick={() => navigate('/register-contacts')}
            sx={{
              borderRadius: '15px',
              '&:hover': {
                backgroundColor: '#58CC02',
                color: '#fff',
                '& .MuiListItemIcon-root': { color: '#fff' },
              },
              ...(selectedPage === 'register' && {
                boxShadow: '0px 4px 12px rgba(88, 204, 2, 0.5)',
                backgroundColor: '#58CC02',
                color: '#fff',
                '& .MuiListItemIcon-root': { color: '#fff' },
              }),
              ...(selectedPage !== 'register' && {
                backgroundColor: 'transparent',
                color: '#000',
                '& .MuiListItemIcon-root': { color: '#58CC02' },
              }),
            }}
          >
            <ListItemIcon sx={{ color: selectedPage === 'register' ? '#fff' : '#58CC02' }}>
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