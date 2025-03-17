import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import authService from '../service/authService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('data_distribuidor');
  }, []);

  const handleLogin = async () => {
    try {
      const response = await authService.login(email, password);
      console.log(response.authorized);
      if (response.authorized === true) {
        window.location.href = '/register-contacts';
      } else {
        alert(response.message);
      }
    } catch (error) {
      alert('Erro ao autenticar: ' + error.message);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff', // Fundo branco limpo
      }}
    >
      <Paper
        elevation={2} // Sombra mais sutil para minimalismo
        sx={{
          p: 4, // Reduzi o padding para um layout mais compacto
          borderRadius: '20px', // Arredondamento suave
          width: '100%',
          maxWidth: '400px', // Reduzi um pouco o tamanho máximo
          backgroundColor: '#fff',
        }}
      >
        <Stack spacing={3}> {/* Reduzi o espaçamento para um look mais enxuto */}
          <Typography
            variant="h4" // Menor que h3 para minimalismo
            sx={{
              fontWeight: 'bold', // Ainda bold, mas menos agressivo
              textAlign: 'center',
              color: '#1CB0F6', // Mantive o azul
            }}
          >
            Bem-vindo
          </Typography>
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px', // Arredondamento mais sutil
                '& fieldset': {
                  borderColor: '#E0E0E0', // Bordas leves
                },
                '&:hover fieldset': {
                  borderColor: '#1CB0F6', // Feedback azul no hover
                },
              },
            }}
          />
          <TextField
            fullWidth
            label="Senha"
            variant="outlined"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                '& fieldset': {
                  borderColor: '#E0E0E0',
                },
                '&:hover fieldset': {
                  borderColor: '#1CB0F6',
                },
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleLogin}
            sx={{
              backgroundColor: '#58CC02', // Verde do Duolingo como destaque
              borderRadius: '20px', // Arredondamento reduzido
              padding: '10px 0', // Menor altura
              fontSize: '16px', // Fonte menor para minimalismo
              fontWeight: 'bold',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#4AB302', // Hover mais sutil
              },
            }}
          >
            Entrar
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Login;