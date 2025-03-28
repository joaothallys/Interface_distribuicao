import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, CircularProgress, Paper, Divider, Stack, Chip, IconButton, InputAdornment, Link, Switch, FormControlLabel
} from '@mui/material';
import { CloudUpload, CheckCircle, AssignmentTurnedIn, Visibility, VisibilityOff, Download, Stop } from '@mui/icons-material';
import axios from 'axios';
import Papa from 'papaparse';

const RegisterContacts = () => {
  const [csvData, setCsvData] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [customerID, setCustomerID] = useState(() => localStorage.getItem('customerID') || '');
  const [loading, setLoading] = useState(false);
  const [csvUploaded, setCsvUploaded] = useState(false);
  const [loadingCsv, setLoadingCsv] = useState(false);
  const [logs, setLogs] = useState([]);
  const [successCount, setSuccessCount] = useState(0);
  const [existingCount, setExistingCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [showToken, setShowToken] = useState(false);
  const [resultData, setResultData] = useState([]);
  const [interrupted, setInterrupted] = useState(false);
  const [addDDD, setAddDDD] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [avgRequestTime, setAvgRequestTime] = useState(0);

  useEffect(() => {
    localStorage.setItem('token', token);
    localStorage.setItem('customerID', customerID);
  }, [token, customerID]);

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

  const handleRegisterContacts = async () => {
    if (!csvData || !token || !customerID) {
      alert('Por favor, preencha todos os campos e faça o upload de um CSV.');
      return;
    }

    setLoading(true);
    setSuccessCount(0);
    setExistingCount(0);
    setErrorCount(0);
    setLogs([]);
    setResultData([]);
    setInterrupted(false);
    setProcessedCount(0);
    setEstimatedTime(null);
    setAvgRequestTime(0);

    const results = [];
    const totalContacts = csvData.length;
    let totalTime = 0;
    let requestCount = 0;

    for (const row of csvData) {
      if (interrupted) {
        setLogs(prevLogs => [...prevLogs, 'Processo interrompido pelo usuário.']);
        break;
      }

      const phoneWithDDD = addDDD && row.phone ? `55${row.phone}` : row.phone || '';
      const url = `${process.env.REACT_APP_API_HOST}/api/v1/customers/${customerID}/contacts`;
      const startTime = performance.now();

      try {
        const response = await axios.post(
          url,
          {
            phone: phoneWithDDD,
            email: row.email,
            name: row.name,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

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

        if (response.status === 200 || response.status === 201) {
          if (response.data.message === 'Contato salvo com sucesso.') {
            if (response.data.data.already_exists) {
              setExistingCount(prevCount => prevCount + 1);
              results.push({
                name: row.name,
                email: row.email || '',
                phone: phoneWithDDD,
                status: 'Ja existente',
                errorMessage: '',
              });
              setLogs(prevLogs => [...prevLogs, `Contato ${row.name} ja existente.`]);
            } else {
              setSuccessCount(prevCount => prevCount + 1);
              results.push({
                name: row.name,
                email: row.email || '',
                phone: phoneWithDDD,
                status: 'Sucesso',
                errorMessage: '',
              });
              setLogs(prevLogs => [...prevLogs, `Contato ${row.name} cadastrado com sucesso!`]);
            }
          }
        }
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

        const errorMsg = error.response?.data?.message || error.message || 'Erro na requisição';
        if (error.response?.status === 403 && errorMsg === 'Contato j\u00e1 existe nessa empresa.') {
          setExistingCount(prevCount => prevCount + 1);
          results.push({
            name: row.name,
            email: row.email || '',
            phone: phoneWithDDD,
            status: 'Ja existente',
            errorMessage: '',
          });
          setLogs(prevLogs => [...prevLogs, `Contato ${row.name} ja existente nessa empresa.`]);
        } else {
          setErrorCount(prevCount => prevCount + 1);
          results.push({
            name: row.name,
            email: row.email || '',
            phone: phoneWithDDD,
            status: 'Erro',
            errorMessage: errorMsg,
          });
          setLogs(prevLogs => [...prevLogs, `Erro ao cadastrar contato ${row.name}: ${errorMsg}`]);
        }
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

    if (resultData.length > 0) {
      const csv = Papa.unparse({
        fields: ['name', 'email', 'phone', 'status', 'errorMessage'],
        data: resultData,
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'resultados_contatos_parciais.csv';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      window.location.reload();
    }
  };

  const handleDownloadResults = () => {
    if (resultData.length === 0) {
      alert('Nenhum resultado disponível para download.');
      return;
    }

    const csv = Papa.unparse({
      fields: ['name', 'email', 'phone', 'status', 'errorMessage'],
      data: resultData,
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'resultados_contatos.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        p: { xs: 2, sm: 4 }, // Ajuste de padding para telas menores
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
          fontSize: { xs: '1.5rem', sm: '2.125rem' }, // Reduz tamanho em telas pequenas
        }}
      >
        Cadastrar Contatos 🚀
      </Typography>

      {/* Seção de Inputs */}
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 4 }, // Padding responsivo
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

          {/* Link do modelo */}
          <Link
            href="https://docs.google.com/spreadsheets/d/1172gOd-Pz8S7Sqml2tO_p_ZSZE1RSs5GMj_PP1yOlj8/copy"
            target="_blank"
            sx={{ color: '#1CB0F6', fontWeight: 'bold', wordBreak: 'break-word' }}
          >
            Pegue o modelo da planilha aqui! 📝
          </Link>

          {/* Chave para adicionar DDD */}
          <FormControlLabel
            control={
              <Switch
                checked={addDDD}
                onChange={(e) => setAddDDD(e.target.checked)}
                color="primary"
              />
            }
            label="Adicionar DDD 55 automaticamente"
            sx={{ color: '#1CB0F6' }}
          />

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
                    setExistingCount(0);
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

          {/* Botão de Cadastro e Interromper */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={handleRegisterContacts}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={24} /> : <AssignmentTurnedIn />}
              sx={{
                backgroundColor: '#58CC02',
                borderRadius: '25px',
                padding: '12px 24px',
                fontWeight: 'bold',
                '&:hover': { backgroundColor: '#4ab002' },
              }}
            >
              Vamos Cadastrar! 🎉
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
          p: { xs: 2, sm: 4 }, // Padding responsivo
          borderRadius: '20px',
          backgroundColor: '#fff',
          border: '2px solid #1CB0F6',
          width: '100%',
          overflow: 'hidden', // Evita overflow
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            color: '#1CB0F6',
            mb: 2,
            fontSize: { xs: '1.25rem', sm: '1.5rem' }, // Ajuste de tamanho
          }}
        >
          Seu Progresso ⭐
        </Typography>
        <Stack
          direction={{ xs: 'column', sm: 'row' }} // Coluna em telas pequenas, linha em telas maiores
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
            <Typography variant="h5" sx={{ color: '#FF6200', fontWeight: 'bold' }}>
              {existingCount}
            </Typography>
            <Typography variant="body2" sx={{ color: '#777' }}>
              Já Conhecidos
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
              wordWrap: 'break-word', // Quebra de linha para evitar corte
            }}
          >
            <Typography
              variant="body1"
              sx={{
                color: '#1CB0F6',
                fontWeight: 'bold',
                fontSize: { xs: '0.9rem', sm: '1rem' }, // Ajuste de tamanho
              }}
            >
              Missão: {processedCount} / {csvData.length} contatos
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#777',
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
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

      {/* Seção de Logs com barras de rolagem */}
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 4 }, // Padding responsivo
          borderRadius: '20px',
          backgroundColor: '#fff',
          border: '2px solid #FF6200',
          width: '100%',
          maxHeight: '400px',
          overflowX: 'auto',
          overflowY: 'auto',
          whiteSpace: { xs: 'normal', sm: 'nowrap' }, // Normal em telas pequenas para evitar corte
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            flexWrap: 'wrap', // Permite quebra em telas pequenas
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
                wordWrap: 'break-word', // Evita corte em telas pequenas
              }}
            >
              {log}
            </Typography>
          ))
        )}
      </Paper>
    </Box>
  );
};

export default RegisterContacts;