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
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('data_distribuidor');
  }, []);

  // Carregar o anúncio do Google AdSense dinamicamente
  useEffect(() => {
    console.log('Iniciando carregamento do AdSense...');

    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8615891643411344';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => console.log('Script do AdSense carregado com sucesso');
    script.onerror = (e) => console.error('Erro ao carregar o script do AdSense:', e);
    document.head.appendChild(script);

    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', 'ca-pub-8615891643411344');
    ins.setAttribute('data-ad-slot', '1870885792');
    ins.setAttribute('data-ad-format', 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');

    const adContainer = document.getElementById('ad-container');
    let pushExecuted = false;

    if (adContainer) {
      adContainer.appendChild(ins);
      console.log('Elemento <ins> adicionado ao container');

      if (!ins.getAttribute('data-adsbygoogle-status')) {
        const observer = new ResizeObserver((entries) => {
          const entry = entries[0];
          if (entry.contentRect.width > 0 && !pushExecuted) {
            const pushScript = document.createElement('script');
            pushScript.innerHTML = "(adsbygoogle = window.adsbygoogle || []).push({});";
            document.head.appendChild(pushScript);
            console.log('Push do AdSense executado com largura:', entry.contentRect.width);
            pushExecuted = true;
            observer.disconnect();
          }
        });
        observer.observe(adContainer);
      } else {
        console.log('Anúncio já inicializado, ignorando push');
      }
    } else {
      console.error('Container de anúncio não encontrado');
    }

    return () => {
      if (adContainer && ins.parentNode) {
        adContainer.removeChild(ins);
        console.log('Elemento <ins> removido');
      }
      document.head.removeChild(script);
      const pushScript = document.querySelector('script[src="adsbygoogle.js"] + script');
      if (pushScript && pushScript.parentNode) {
        pushScript.parentNode.removeChild(pushScript);
      }
      console.log('Scripts removidos');
    };
  }, []);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
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
        flexDirection: 'column', // Alterado para column para empilhar o anúncio e o formulário
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        gap: 2, // Espaço entre o anúncio e o formulário
      }}
    >
      {/* Container para o anúncio */}
      <Box
        id="ad-container"
        sx={{
          width: '100%',
          maxWidth: '728px',
          minWidth: '300px',
          minHeight: '90px',
          display: 'block',
          backgroundColor: '#f0f0f0',
          visibility: 'visible',
        }}
      />

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
            disabled={isLoading}
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
            startIcon={isLoading && <CircularProgress size={20} color="inherit" />}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Login;