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

    const results = [];

    for (const row of csvData) {
      if (interrupted) {
        setLogs(prevLogs => [...prevLogs, 'Processo interrompido pelo usuário.']);
        break;
      }

      const phoneWithDDD = addDDD && row.phone ? `55${row.phone}` : row.phone || '';
      const url = `${process.env.REACT_APP_API_HOST}/api/v1/customers/${customerID}/contacts`;
      try {
        const response = await axios.post(url, {
          phone: phoneWithDDD,
          email: row.email,
          name: row.name
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.status === 200 || response.status === 201) {
          if (response.data.message === "Contato salvo com sucesso.") {
            if (response.data.data.already_exists) {
              setExistingCount(prevCount => prevCount + 1);
              results.push({
                name: row.name,
                email: row.email || '',
                phone: phoneWithDDD,
                status: 'Ja existente',
                errorMessage: ''
              });
              setLogs(prevLogs => [...prevLogs, `Contato ${row.name} ja existente.`]);
            } else {
              setSuccessCount(prevCount => prevCount + 1);
              results.push({
                name: row.name,
                email: row.email || '',
                phone: phoneWithDDD,
                status: 'Sucesso',
                errorMessage: ''
              });
              setLogs(prevLogs => [...prevLogs, `Contato ${row.name} cadastrado com sucesso!`]);
            }
          }
        } else {
          setErrorCount(prevCount => prevCount + 1);
          const errorMsg = response.data.message || 'Erro desconhecido';
          results.push({
            name: row.name,
            email: row.email || '',
            phone: phoneWithDDD,
            status: 'Erro',
            errorMessage: errorMsg
          });
          setLogs(prevLogs => [...prevLogs, `Erro ao cadastrar contato ${row.name}: ${errorMsg}`]);
        }
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || 'Erro na requisição';
        if (error.response?.status === 403 && errorMsg === "Contato j\u00e1 existe nessa empresa.") {
          // Trata erro 403 como "já existente"
          setExistingCount(prevCount => prevCount + 1);
          results.push({
            name: row.name,
            email: row.email || '',
            phone: phoneWithDDD,
            status: 'Ja existente',
            errorMessage: ''
          });
          setLogs(prevLogs => [...prevLogs, `Contato ${row.name} ja existente nessa empresa.`]);
        } else {
          // Outros erros continuam como "Erro"
          setErrorCount(prevCount => prevCount + 1);
          results.push({
            name: row.name,
            email: row.email || '',
            phone: phoneWithDDD,
            status: 'Erro',
            errorMessage: errorMsg
          });
          setLogs(prevLogs => [...prevLogs, `Erro ao cadastrar contato ${row.name}: ${errorMsg}`]);
        }
      }
    }

    setResultData(results);
    setLoading(false);
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
        Cadastrar Contatos
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

          {/* Link do modelo */}
          <Link
            href="https://docs.google.com/spreadsheets/d/1172gOd-Pz8S7Sqml2tO_p_ZSZE1RSs5GMj_PP1yOlj8/edit?usp=sharing"
            target="_blank"
            sx={{ color: '#1CB0F6', fontWeight: 'bold' }}
          >
            Ver modelo de planilha
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
              {csvUploaded ? 'Trocar CSV' : 'Upload CSV'}
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
                  label="CSV Carregado!"
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
                  }}
                  sx={{
                    borderRadius: '25px',
                    padding: '10px 20px',
                  }}
                >
                  Remover CSV
                </Button>
              </>
            )}
          </Box>

          {/* Botão de Cadastro e Interromper */}
          <Box sx={{ display: 'flex', gap: 2 }}>
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
              Cadastrar Contatos
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

      {/* Seção de Resumo */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: '20px',
          backgroundColor: '#fff',
          border: '2px solid #1CB0F6',
          width: '100%',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1CB0F6', mb: 2 }}>
          Resumo
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="space-around">
          <Box textAlign="center">
            <Typography variant="h5" sx={{ color: '#58CC02', fontWeight: 'bold' }}>
              {successCount}
            </Typography>
            <Typography variant="body2" sx={{ color: '#777' }}>
              Cadastrados
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box textAlign="center">
            <Typography variant="h5" sx={{ color: '#FF6200', fontWeight: 'bold' }}>
              {existingCount}
            </Typography>
            <Typography variant="body2" sx={{ color: '#777' }}>
              Já existentes
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box textAlign="center">
            <Typography variant="h5" sx={{ color: '#FF0000', fontWeight: 'bold' }}>
              {errorCount}
            </Typography>
            <Typography variant="body2" sx={{ color: '#777' }}>
              Erros
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Seção de Logs com barras de rolagem */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: '20px',
          backgroundColor: '#fff',
          border: '2px solid #FF6200',
          width: '100%',
          maxHeight: '400px',
          overflowX: 'auto',
          overflowY: 'auto',
          whiteSpace: 'nowrap',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FF6200' }}>
            Logs
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
            Baixar Resultados
          </Button>
        </Box>
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
                whiteSpace: 'nowrap',
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