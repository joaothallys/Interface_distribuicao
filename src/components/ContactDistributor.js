// src/components/ContactDistributor.js
import React, { useState } from 'react';
import { Button, TextField, Box, Typography, Paper, CircularProgress, Link } from '@mui/material';
import { UploadFile, CheckCircle } from '@mui/icons-material';
import axios from 'axios';
import Papa from 'papaparse';


const ContactDistributor = () => {
    const [csvData, setCsvData] = useState(null);
    const [token, setToken] = useState('');
    const [customerID, setCustomerID] = useState('');
    const [userIDs, setUserIDs] = useState('');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [interrupted, setInterrupted] = useState(false);
    const [csvUploaded, setCsvUploaded] = useState(false);
    const [loadingCsv, setLoadingCsv] = useState(false);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        setLoadingCsv(true);  // Indica que o processamento do CSV começou
        Papa.parse(file, {
            header: true,
            complete: (results) => {
                setCsvData(results.data);
                setCsvUploaded(true);  // Marca que o CSV foi carregado com sucesso
                setLoadingCsv(false);  // Finaliza o carregamento do CSV
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
                break;  // Encerra o loop imediatamente
            }

            const contatoID = row.contactsID;
            const url = `https://app.poli.digital/api/v1/customers/${customerID}/contacts/redirect/contacts/${contatoID}`;
            const userID = userIDArray[index % userIDArray.length];

            try {
                const response = await axios.post(url, { user_id: userID }, { headers: { Authorization: `Bearer ${token}` } });
                const responseDataWithoutSomeKey = extractFieldsFromResponse(response.data);
                setLogs(prevLogs => [...prevLogs, `Requisição para ${contatoID} feita com sucesso! Resposta: ${JSON.stringify(responseDataWithoutSomeKey)}`]);
            } catch (error) {
                setLogs(prevLogs => [...prevLogs, `Erro na requisição para ${contatoID}: ${error.message}`]);
            }

            index++;
            //await new Promise(resolve => setTimeout(resolve, 5000));
        }

        setLoading(false);
    };

    const handleInterrupt = () => {
        setInterrupted(true);
        setLoading(false);
        setLogs(prevLogs => [...prevLogs, 'Processo de distribuição interrompido.']);

        // Recarrega a página para garantir que o processo seja interrompido completamente
        setTimeout(() => {
            window.location.reload();
        }, 500);  // Pequeno atraso para garantir que o log final seja registrado
    };

    const extractFieldsFromResponse = (data) => {
        return {
            customer_id: data.customer_id,
            channel_id: data.channel_id,
            contact_id: data.contact_id,
            origin_id: data.origin_id
        };
    };

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>
                Distribuição de Contatos
            </Typography>

            <Paper sx={{ p: 3, mb: 2, backgroundColor: '#FFFAF0' }}> {/* Fundo laranja claro */}
                <TextField
                    fullWidth
                    label="Token"
                    variant="outlined"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="Customer ID"
                    variant="outlined"
                    value={customerID}
                    onChange={(e) => setCustomerID(e.target.value)}
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="User IDs (separados por vírgula)"
                    variant="outlined"
                    value={userIDs}
                    onChange={(e) => setUserIDs(e.target.value)}
                    margin="normal"
                />

                <Link
                    href="https://docs.google.com/spreadsheets/d/1172gOd-Pz8S7Sqml2tO_p_ZSZE1RSs5GMj_PP1yOlj8/edit?usp=sharing"
                    target="_blank"
                    sx={{ display: 'block', mb: 1 }}
                >
                    Link modelo planilha
                </Link>

                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <Button
                        variant="contained"
                        component="label"
                        startIcon={loadingCsv ? <CircularProgress size={24} /> : <UploadFile />}
                        disabled={loadingCsv}
                    >
                        UPLOAD CSV
                        <input
                            type="file"
                            accept=".csv"
                            hidden
                            onChange={handleFileUpload}
                        />
                    </Button>

                    {csvUploaded && !loadingCsv && (
                        <CheckCircle sx={{ color: 'green', ml: 2 }} />
                    )}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleDistribution}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'INICIAR DISTRIBUIÇÃO'}
                    </Button>

                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleInterrupt}
                        disabled={!loading}
                    >
                        INTERROMPER PROCESSO
                    </Button>
                </Box>
            </Paper>

            <Typography variant="h6" gutterBottom>
                Logs:
            </Typography>
            <Paper sx={{ p: 3, maxHeight: '400px', overflow: 'auto' }}>
                {logs.map((log, index) => (
                    <Typography key={index} variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {log}
                    </Typography>
                ))}
            </Paper>
        </Box>
    );
};

export default ContactDistributor;
