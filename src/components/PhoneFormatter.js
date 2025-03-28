import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Stack, Alert } from '@mui/material';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

const PhoneFormatter = () => {
    const [ddi, setDdi] = useState('55');
    const [ddd, setDdd] = useState('');
    const [file, setFile] = useState(null);
    const [processedData, setProcessedData] = useState(null);
    const [error, setError] = useState('');

    const handleFileUpload = (event) => {
        const uploadedFile = event.target.files[0];
        if (!uploadedFile) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            setFile(jsonData);
            toast.success('Planilha carregada com sucesso!');
        };
        reader.readAsArrayBuffer(uploadedFile);
    };

    const normalizePhoneNumberOnly = (input, ddi, ddd) => {
        if (!input || String(input).trim() === '') return null;

        ddi = String(ddi).padStart(2, '0');
        ddd = String(ddd).padStart(2, '0');
        
        let rawNumber = String(input).replace(/\D/g, '');
        if (rawNumber.length < 8) return null;

        // Case 1: Number already starts with DDI
        if (rawNumber.startsWith(ddi)) {
            let numberAfterDdi = rawNumber.slice(ddi.length);
            const hasDdd = numberAfterDdi.length >= 2 && /^\d{2}$/.test(numberAfterDdi.slice(0, 2));
            
            if (hasDdd) {
                let phonePart = numberAfterDdi.slice(2);
                if (phonePart.length === 8) {
                    phonePart = '9' + phonePart;
                } else if (phonePart.length < 8 || phonePart.length > 9) {
                    return null;
                }
                return ddi + numberAfterDdi.slice(0, 2) + phonePart;
            }
        }

        // Case 2: Number starts with a DDD (10 or 11 digits total)
        if (rawNumber.length === 10 || rawNumber.length === 11) {
            const potentialDdd = rawNumber.slice(0, 2);
            const phonePart = rawNumber.slice(2);
            if (/^\d{2}$/.test(potentialDdd) && (phonePart.length === 8 || phonePart.length === 9)) {
                if (phonePart.length === 8) {
                    return ddi + potentialDdd + '9' + phonePart;
                }
                return ddi + potentialDdd + phonePart; // e.g., 11953807512 → 5511953807512
            }
        }

        // Case 3: Number is just the phone part (8 or 9 digits)
        let phonePart = rawNumber;
        if (phonePart.length === 8) {
            phonePart = '9' + phonePart;
        } else if (phonePart.length < 8 || phonePart.length > 9) {
            return null;
        }

        return ddi + ddd + phonePart;
    };

    const handleFormat = () => {
        setError('');
        setProcessedData(null);

        if (!file) {
            setError('Por favor, carregue uma planilha.');
            toast.error('Nenhuma planilha carregada.');
            return;
        }

        if (!ddd || ddd.length !== 2 || !/^\d{2}$/.test(ddd)) {
            setError('Por favor, insira um DDD válido de 2 dígitos.');
            toast.error('DDD inválido.');
            return;
        }

        if (!ddi || !/^\d{2}$/.test(ddi)) {
            setError('Por favor, insira um DDI válido (ex.: 55).');
            toast.error('DDI inválido.');
            return;
        }

        const formattedData = file.map((row) => {
            const formatted = normalizePhoneNumberOnly(row.Celular, ddi, ddd);
            return {
                ...row,
                celular_formatado: formatted || 'Número inválido',
                formatado: formatted ? 'Sim' : 'Não',
            };
        });

        setProcessedData(formattedData);
        toast.success('Números processados com sucesso!');
    };

    const handleExport = () => {
        if (!processedData) {
            toast.error('Nenhum dado processado para exportar.');
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(processedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Contatos Formatados');
        XLSX.writeFile(workbook, 'contatos_formatados.xlsx');
        toast.success('Planilha exportada com sucesso!');
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
                    maxWidth: '500px',
                    backgroundColor: '#fff',
                }}
            >
                <Stack spacing={3}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center', color: '#1CB0F6' }}>
                        Formatador de Telefone
                    </Typography>

                    <TextField
                        fullWidth
                        label="DDI (ex.: 55)"
                        variant="outlined"
                        value={ddi}
                        onChange={(e) => setDdi(e.target.value)}
                        inputProps={{ maxLength: 2 }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                                '& fieldset': { borderColor: '#E0E0E0' },
                                '&:hover fieldset': { borderColor: '#1CB0F6' },
                            },
                        }}
                    />

                    <TextField
                        fullWidth
                        label="DDD de preferência (ex.: 11)"
                        variant="outlined"
                        value={ddd}
                        onChange={(e) => setDdd(e.target.value)}
                        inputProps={{ maxLength: 2 }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                                '& fieldset': { borderColor: '#E0E0E0' },
                                '&:hover fieldset': { borderColor: '#1CB0F6' },
                            },
                        }}
                    />

                    <Button
                        variant="contained"
                        component="label"
                        sx={{
                            backgroundColor: '#58CC02',
                            borderRadius: '20px',
                            padding: '10px 0',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#4AB302' },
                        }}
                    >
                        Carregar Planilha
                        <input type="file" hidden accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
                    </Button>

                    {error && <Alert severity="error">{error}</Alert>}
                    {file && !processedData && <Alert severity="info">Planilha carregada. Clique em "Formatar" para processar.</Alert>}
                    {processedData && (
                        <Alert severity="success">
                            Processamento concluído! Clique em "Exportar" para baixar a planilha.
                        </Alert>
                    )}

                    <Button
                        variant="contained"
                        onClick={handleFormat}
                        disabled={!file}
                        sx={{
                            backgroundColor: '#58CC02',
                            borderRadius: '20px',
                            padding: '10px 0',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#4AB302' },
                        }}
                    >
                        Formatar
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleExport}
                        disabled={!processedData}
                        sx={{
                            backgroundColor: '#1CB0F6',
                            borderRadius: '20px',
                            padding: '10px 0',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#1A9BD6' },
                        }}
                    >
                        Exportar
                    </Button>
                </Stack>
            </Paper>
        </Box>
    );
};

export default PhoneFormatter;