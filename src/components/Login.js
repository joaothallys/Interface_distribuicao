import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Stack, InputAdornment, IconButton, CircularProgress } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import authService from '../service/authService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Estado para controlar o carregamento
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('data_distribuidor');
  }, []);

  const handleLogin = async () => {
    try {
      // Ativar o estado de carregamento
      setIsLoading(true);
      // Resetar os estados de erro antes de tentar o login
      setEmailError(false);
      setPasswordError(false);
      setErrorMessage('');

      const response = await authService.login(email, password);

      if (response.authorized === true) {
        window.location.href = '/contact-distributor';
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        setEmailError(true);
        setPasswordError(true);
        setErrorMessage('Credenciais inválidas. Verifique seu email e senha.');
      }
    } catch (error) {
      toast.error('Erro ao autenticar: ' + error.message, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      setEmailError(true);
      setPasswordError(true);
      setErrorMessage('Ocorreu um erro ao tentar fazer login.');
    } finally {
      // Desativar o estado de carregamento, independentemente do resultado
      setIsLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
      }}
    >
      <Paper
        elevation={2}
        sx={{
          p: 4,
          borderRadius: '20px',
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#fff',
        }}
      >
        <Stack spacing={3}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#1CB0F6',
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
            error={emailError}
            helperText={emailError && errorMessage}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                '& fieldset': {
                  borderColor: emailError ? '#f44336' : '#E0E0E0',
                },
                '&:hover fieldset': {
                  borderColor: emailError ? '#f44336' : '#1CB0F6',
                },
                '&.Mui-focused fieldset': {
                  borderColor: emailError ? '#f44336' : '#1CB0F6',
                },
              },
            }}
          />
          <TextField
            fullWidth
            label="Senha"
            variant="outlined"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
            helperText={passwordError && errorMessage}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                '& fieldset': {
                  borderColor: passwordError ? '#f44336' : '#E0E0E0',
                },
                '&:hover fieldset': {
                  borderColor: passwordError ? '#f44336' : '#1CB0F6',
                },
                '&.Mui-focused fieldset': {
                  borderColor: passwordError ? '#f44336' : '#1CB0F6',
                },
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={handleLogin}
            disabled={isLoading} // Desabilitar o botão durante o carregamento
            sx={{
              backgroundColor: '#58CC02',
              borderRadius: '20px',
              padding: '10px 0',
              fontSize: '16px',
              fontWeight: 'bold',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#4AB302',
              },
              '&.Mui-disabled': {
                backgroundColor: '#58CC02',
                opacity: 0.7,
                color: '#fff',
              },
            }}
            startIcon={isLoading && <CircularProgress size={20} color="inherit" />} // Adicionar ícone de carregamento
          >
            {isLoading ? 'Entrando...' : 'Entrar'} {/* Mudar texto durante o carregamento */}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Login;