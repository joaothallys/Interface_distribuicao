import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, CircularProgress, Paper, Stack, Chip, Link, IconButton, InputAdornment, Divider
} from '@mui/material';
import { CloudUpload, CheckCircle, PlayArrow, Stop, Visibility, VisibilityOff, Download } from '@mui/icons-material';
import axios from 'axios';
import Papa from 'papaparse';
import WelcomePopup from './WelcomePopup';

const ContactDistributor = () => {
  const [csvData, setCsvData] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [customerID, setCustomerID] = useState(() => localStorage.getItem('customerID') || '');
  const [userIDs, setUserIDs] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [interrupted, setInterrupted] = useState(false);
  const [csvUploaded, setCsvUploaded] = useState(false);
  const [loadingCsv, setLoadingCsv] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [avgRequestTime, setAvgRequestTime] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [resultData, setResultData] = useState([]);

  useEffect(() => {
    localStorage.setItem('token', token);
    localStorage.setItem('customerID', customerID);
  }, [token, customerID]);

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      setShowPopup(true);
      localStorage.setItem('hasVisited', 'true');
    }
  }, []);

  // Carregar o anúncio do Google AdSense dinamicamente
  useEffect(() => {
    console.log('Iniciando carregamento do AdSense...');

    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8615891643411344';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onerror = (e) => console.error('Erro ao carregar o script do AdSense:', e);

    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', 'ca-pub-8615891643411344');
    ins.setAttribute('data-ad-slot', '1870885792');
    ins.setAttribute('data-ad-format', 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');

    const adContainer = document.getElementById('ad-container');
    if (adContainer) {
      adContainer.appendChild(ins);
      console.log('Elemento <ins> adicionado ao container');

      script.onload = () => {
        console.log('Script do AdSense carregado com sucesso');
        if (!ins.getAttribute('data-adsbygoogle-status')) {
          requestAnimationFrame(() => {
            const pushScript = document.createElement('script');
            pushScript.innerHTML = "(adsbygoogle = window.adsbygoogle || []).push({});";
            document.head.appendChild(pushScript);
            console.log('Push do AdSense executado após script carregado');
          });
        } else {
          console.log('Anúncio já inicializado, ignorando push');
        }
      };
    } else {
      console.error('Container de anúncio não encontrado');
    }

    document.head.appendChild(script);

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

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLoadingCsv(true);
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          setCsvData(results.data);
          setCsvUploaded(true);
          setLoadingCsv(false);
        },
      });
    }
  };

  const handleDistribution = async () => {
    if (!csvData || !token || !customerID || !userIDs) {
      alert('Por favor, preencha todos os campos e faça o upload de um CSV.');
      return;
    }

    const userIDArray = userIDs.split(',').map(id => id.trim());
    setLoading(true);
    setInterrupted(false);
    setLogs([]);
    setProcessedCount(0);
    setEstimatedTime(null);
    setAvgRequestTime(0);
    setSuccessCount(0);
    setErrorCount(0);
    setResultData([]);

    const results = [];
    const totalContacts = csvData.length;
    let totalTime = 0;
    let requestCount = 0;

    for (const row of csvData) {
      if (interrupted) {
        setLogs(prevLogs => [...prevLogs, 'Processo interrompido pelo usuário.']);
        break;
      }

      const contatoID = row.contactID;
      const url = `${process.env.REACT_APP_API_HOST}/api/v1/customers/${customerID}/contacts/redirect/contacts/${contatoID}`;
      const userID = userIDArray[requestCount % userIDArray.length];

      const startTime = performance.now();

      try {
        const response = await axios.post(url, { user_id: userID }, { headers: { Authorization: `Bearer ${token}` } });
        const responseDataWithoutSomeKey = extractFieldsFromResponse(response.data);
        const endTime = performance.now();
        const requestTime = (endTime - startTime) / 1000;
        totalTime += requestTime;
        requestCount += 1;

        const newAvgTime = totalTime / requestCount;
        setAvgRequestTime(newAvgTime);
        setProcessedCount(prevCount => prevCount + 1);
        const remainingContacts = totalContacts - requestCount;
        const estimatedSeconds = remainingContacts * newAvgTime;
        setEstimatedTime(estimatedSeconds);

        setSuccessCount(prevCount => prevCount + 1);
        results.push({
          contactID: contatoID,
          userID: userID,
          status: 'Sucesso',
          response: JSON.stringify(responseDataWithoutSomeKey),
        });
        setLogs(prevLogs => [...prevLogs, `Contato ${contatoID} distribuído com sucesso para ${userID}!`]);
      } catch (error) {
        const endTime = performance.now();
        const requestTime = (endTime - startTime) / 1000;
        totalTime += requestTime;
        requestCount += 1;

        setAvgRequestTime(totalTime / requestCount);
        setProcessedCount(prevCount => prevCount + 1);
        const remainingContacts = totalContacts - requestCount;
        const estimatedSeconds = remainingContacts * (totalTime / requestCount);
        setEstimatedTime(estimatedSeconds);

        setErrorCount(prevCount => prevCount + 1);
        results.push({
          contactID: contatoID,
          userID: userID,
          status: 'Erro',
          errorMessage: error.message,
        });
        setLogs(prevLogs => [...prevLogs, `Erro ao distribuir ${contatoID}: ${error.message}`]);
      }
    }

    setResultData(results);
    setLoading(false);
  };

  const formatEstimatedTime = (seconds) => {
    if (!seconds || seconds <= 0) return 'Calculando...';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes} min ${remainingSeconds} seg`;
  };

  const handleInterrupt = () => {
    setInterrupted(true);
    setLoading(false);
    setLogs(prevLogs => [...prevLogs, 'Processo de distribuição interrompido.']);
    if (resultData.length > 0) {
      const csv = Papa.unparse({
        fields: ['contactID', 'userID', 'status', 'response', 'errorMessage'],
        data: resultData,
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'resultados_distribuicao_parciais.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleDownloadResults = () => {
    if (resultData.length === 0) {
      alert('Nenhum resultado disponível para download.');
      return;
    }

    const csv = Papa.unparse({
      fields: ['contactID', 'userID', 'status', 'response', 'errorMessage'],
      data: resultData,
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'resultados_distribuicao.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const extractFieldsFromResponse = (data) => {
    return {
      customer_id: data.customer_id,
      channel_id: data.channel_id,
      contact_id: data.contact_id,
      origin_id: data.origin_id,
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
        p: { xs: 2, sm: 4 },
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      {/* Container para o anúncio */}
      <Box
        id="ad-container"
        sx={{
          width: '100%',
          maxWidth: '728px', // Largura máxima de um banner comum
          minWidth: '300px', // Largura mínima garantida
          minHeight: '90px', // Altura mínima garantida
          display: 'block', // Mudar para block para evitar problemas com flex
          marginBottom: 2,
          backgroundColor: '#f0f0f0', // Para debug visual
          visibility: 'visible', // Garante visibilidade
        }}
      />

      {/* Cabeçalho */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 'bold',
          color: '#1CB0F6',
          textAlign: 'left',
          mb: 2,
          fontSize: { xs: '1.5rem', sm: '2.125rem' },
        }}
      >
        Distribuição de Contatos 🚀
      </Typography>

      {/* Seção de Inputs */}
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 4 },
          borderRadius: '20px',
          backgroundColor: '#fff',
          border: '2px solid #58CC02',
          width: '100%',
        }}
      >
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Token Secreto"
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
            label="ID do Cliente"
            variant="outlined"
            value={customerID}
            onChange={(e) => setCustomerID(e.target.value)}
            sx={{ borderRadius: '10px' }}
          />
          <TextField
            fullWidth
            label="IDs dos Usuários (separados por vírgula)"
            variant="outlined"
            value={userIDs}
            onChange={(e) => setUserIDs(e.target.value)}
            sx={{ borderRadius: '10px' }}
          />

          {/* Link do modelo */}
          <Link
            href="https://docs.google.com/spreadsheets/d/19FzZcDX1ZtU9w80wNhlI4PTuBzOvXwTMZk4UtzeyyaY/copy"
            target="_blank"
            sx={{ color: '#1CB0F6', fontWeight: 'bold', wordBreak: 'break-word' }}
          >
            Pegue o modelo da planilha aqui! 📝
          </Link>

          {/* Upload CSV */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
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
              {csvUploaded ? 'Trocar CSV' : 'Subir CSV'}
              <input
                type="file"
                accept=".csv"
                hidden
                onChange={handleFileUpload}
                key={csvUploaded ? 'csv-upload-new' : 'csv-upload'}
              />
            </Button>
            {csvUploaded && !loadingCsv && (
              <>
                <Chip
                  icon={<CheckCircle />}
                  label="CSV Pronto!"
                  color="success"
                  sx={{ borderRadius: '16px' }}
                />
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setCsvData(null);
                    setCsvUploaded(false);
                    setLogs([]);
                    setSuccessCount(0);
                    setErrorCount(0);
                    setResultData([]);
                    setProcessedCount(0);
                    setEstimatedTime(null);
                  }}
                  sx={{
                    borderRadius: '25px',
                    padding: '10px 20px',
                  }}
                >
                  Limpar CSV
                </Button>
              </>
            )}
          </Box>

          {/* Botões de Ação */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
              Iniciar Missão! 🎉
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
              Parar Missão
            </Button>
          </Box>
        </Stack>
      </Paper>

      {/* Seção de Resumo */}
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 4 },
          borderRadius: '20px',
          backgroundColor: '#fff',
          border: '2px solid #1CB0F6',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            color: '#1CB0F6',
            mb: 2,
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            textAlign: 'center',
          }}
        >
          Seu Progresso ⭐
        </Typography>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="space-around"
          alignItems="center"
          divider={<Divider orientation={{ xs: 'horizontal', sm: 'vertical' }} flexItem />}
        >
          <Box textAlign="center">
            <Typography variant="h5" sx={{ color: '#58CC02', fontWeight: 'bold' }}>
              {successCount}
            </Typography>
            <Typography variant="body2" sx={{ color: '#777' }}>
              Vitórias
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h5" sx={{ color: '#FF0000', fontWeight: 'bold' }}>
              {errorCount}
            </Typography>
            <Typography variant="body2" sx={{ color: '#777' }}>
              Desafios
            </Typography>
          </Box>
        </Stack>

        {/* Progresso e estimativa */}
        {loading && csvData && (
          <Box
            sx={{
              mt: 2,
              textAlign: 'center',
              maxWidth: '100%',
              wordWrap: 'break-word',
            }}
          >
            <Typography
              variant="body1"
              sx={{
                color: '#1CB0F6',
                fontWeight: 'bold',
                fontSize: { xs: '0.9rem', sm: '1rem' },
              }}
            >
              Missão: {processedCount} / {csvData.length} contatos
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#777',
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                mt: 1,
              }}
            >
              Tempo para a vitória: {formatEstimatedTime(estimatedTime)}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#58CC02',
                mt: 1,
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
              }}
            >
              {processedCount === csvData.length / 2
                ? "Metade do caminho! Você está arrasando! 💪"
                : "Continue assim, você vai dominar essa lista! 🔥"}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Seção de Logs */}
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 4 },
          borderRadius: '20px',
          backgroundColor: '#fff',
          border: '2px solid #FF6200',
          width: '100%',
          maxHeight: '400px',
          overflowX: 'auto',
          overflowY: 'auto',
          whiteSpace: { xs: 'normal', sm: 'nowrap' },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: '#FF6200',
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
            }}
          >
            Diário da Missão 📜
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleDownloadResults}
            disabled={resultData.length === 0 || loading}
            sx={{
              borderColor: '#FF6200',
              color: '#FF6200',
              borderRadius: '25px',
              '&:hover': { borderColor: '#e55a00', color: '#e55a00' },
            }}
          >
            Baixar Relatório
          </Button>
        </Box>
        {logs.length === 0 ? (
          <Typography
            variant="body2"
            sx={{
              color: '#777',
              textAlign: 'center',
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
            }}
          >
            Nenhum registro ainda. Vamos começar a aventura? 🌟
          </Typography>
        ) : (
          logs.map((log, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                color: log.includes('Erro') ? '#FF0000' : '#58CC02',
                mb: 1,
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                wordWrap: 'break-word',
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