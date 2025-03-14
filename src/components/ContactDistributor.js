import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, CircularProgress, Paper, Stack, Chip, Link, IconButton, InputAdornment
} from '@mui/material';
import { CloudUpload, CheckCircle, PlayArrow, Stop, Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import Papa from 'papaparse';
import WelcomePopup from './WelcomePopup'; // Importe o novo componente

const ContactDistributor = () => {
  const [csvData, setCsvData] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || ''); // Carrega do localStorage
  const [customerID, setCustomerID] = useState(() => localStorage.getItem('customerID') || ''); // Carrega do localStorage
  const [userIDs, setUserIDs] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [interrupted, setInterrupted] = useState(false);
  const [csvUploaded, setCsvUploaded] = useState(false);
  const [loadingCsv, setLoadingCsv] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // Salva as credenciais no localStorage quando mudam
  useEffect(() => {
    localStorage.setItem('token', token);
    localStorage.setItem('customerID', customerID);
  }, [token, customerID]);

  // Verifica se o usuário já acessou a página antes
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      setShowPopup(true);
      localStorage.setItem('hasVisited', 'true');
    }
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setLoadingCsv(true);
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setCsvData(results.data);
        setCsvUploaded(true);
        setLoadingCsv(false);
      },
    });
  };

  const handleDistribution = async () => {
    if (!csvData || !token || !customerID || !userIDs) {
      alert('Por favor, preencha todos os campos e faça o upload de um CSV.');
      return;
    }

    const userIDArray = userIDs.split(',').map(id => id.trim());
    let index = 0;
    setLoading(true);
    setInterrupted(false);

    for (const row of csvData) {
      if (interrupted) {
        setLogs(prevLogs => [...prevLogs, 'Processo interrompido pelo usuário.']);
        break;
      }

      const contatoID = row.contactsID;
      const url = `${process.env.REACT_APP_API_HOST}/api/v1/customers/${customerID}/contacts/redirect/contacts/${contatoID}`;
      const userID = userIDArray[index % userIDArray.length];

      try {
        const response = await axios.post(url, { user_id: userID }, { headers: { Authorization: `Bearer ${token}` } });
        const responseDataWithoutSomeKey = extractFieldsFromResponse(response.data);
        setLogs(prevLogs => [...prevLogs, `Requisição para ${contatoID} feita com sucesso! Resposta: ${JSON.stringify(responseDataWithoutSomeKey)}`]);
      } catch (error) {
        setLogs(prevLogs => [...prevLogs, `Erro na requisição para ${contatoID}: ${error.message}`]);
      }

      index++;
    }

    setLoading(false);
  };

  const handleInterrupt = () => {
    setInterrupted(true);
    setLoading(false);
    setLogs(prevLogs => [...prevLogs, 'Processo de distribuição interrompido.']);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const extractFieldsFromResponse = (data) => {
    return {
      customer_id: data.customer_id,
      channel_id: data.channel_id,
      contact_id: data.contact_id,
      origin_id: data.origin_id
    };
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        p: 4,
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      {/* Cabeçalho */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 'bold',
          color: '#1CB0F6',
          textAlign: 'left',
          mb: 2,
        }}
      >
        Distribuição de Contatos
      </Typography>

      {/* Seção de Inputs */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: '20px',
          backgroundColor: '#fff',
          border: '2px solid #58CC02',
          width: '100%',
        }}
      >
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Token"
            variant="outlined"
            type={showToken ? 'text' : 'password'}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            sx={{ borderRadius: '10px' }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle token visibility"
                    onClick={() => setShowToken(!showToken)}
                    edge="end"
                  >
                    {showToken ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Customer ID"
            variant="outlined"
            value={customerID}
            onChange={(e) => setCustomerID(e.target.value)}
            sx={{ borderRadius: '10px' }}
          />
          <TextField
            fullWidth
            label="User IDs (separados por vírgula)"
            variant="outlined"
            value={userIDs}
            onChange={(e) => setUserIDs(e.target.value)}
            sx={{ borderRadius: '10px' }}
          />

          {/* Link do modelo */}
          <Link
            href="https://docs.google.com/spreadsheets/d/1172gOd-Pz8S7Sqml2tO_p_ZSZE1RSs5GMj_PP1yOlj8/edit?usp=sharing"
            target="_blank"
            sx={{ color: '#1CB0F6', fontWeight: 'bold' }}
          >
            Ver modelo de planilha
          </Link>

          {/* Upload CSV */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              component="label"
              startIcon={loadingCsv ? <CircularProgress size={24} /> : <CloudUpload />}
              disabled={loadingCsv}
              sx={{
                backgroundColor: '#FF6200',
                borderRadius: '25px',
                padding: '10px 20px',
                '&:hover': { backgroundColor: '#e55a00' },
              }}
            >
              Upload CSV
              <input
                type="file"
                accept=".csv"
                hidden
                onChange={handleFileUpload}
              />
            </Button>
            {csvUploaded && !loadingCsv && (
              <Chip
                icon={<CheckCircle />}
                label="CSV Carregado!"
                color="success"
                sx={{ borderRadius: '16px' }}
              />
            )}
          </Box>

          {/* Botões de Ação */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleDistribution}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={24} /> : <PlayArrow />}
              sx={{
                backgroundColor: '#58CC02',
                borderRadius: '25px',
                padding: '12px 24px',
                fontWeight: 'bold',
                '&:hover': { backgroundColor: '#4ab002' },
              }}
            >
              Iniciar Distribuição
            </Button>
            <Button
              variant="contained"
              onClick={handleInterrupt}
              disabled={!loading}
              startIcon={<Stop />}
              sx={{
                backgroundColor: '#FF0000',
                borderRadius: '25px',
                padding: '12px 24px',
                fontWeight: 'bold',
                '&:hover': { backgroundColor: '#d40000' },
              }}
            >
              Interromper
            </Button>
          </Box>
        </Stack>
      </Paper>

      {/* Seção de Logs */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: '20px',
          backgroundColor: '#fff',
          border: '2px solid #FF6200',
          width: '100%',
          maxHeight: '400px',
          overflow: 'auto',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FF6200', mb: 2 }}>
          Logs
        </Typography>
        {logs.length === 0 ? (
          <Typography variant="body2" sx={{ color: '#777', textAlign: 'center' }}>
            Nenhum log disponível ainda.
          </Typography>
        ) : (
          logs.map((log, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                color: log.includes('Erro') ? '#FF0000' : '#58CC02',
                mb: 1,
              }}
            >
              {log}
            </Typography>
          ))
        )}
      </Paper>

      {/* Popup de Boas-vindas */}
      <WelcomePopup open={showPopup} onClose={handleClosePopup} />
    </Box>
  );
};

export default ContactDistributor;