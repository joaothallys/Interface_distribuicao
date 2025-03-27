import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Stack, Alert } from '@mui/material';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';

const PhoneFormatter = () => {
    const [ddi, setDdi] = useState('55'); // Padrão Brasil
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

    const normalizePhoneNumber = (input, userDdi, userDdd) => {
        // Remove todos os caracteres não numéricos
        let rawNumber = String(input || '').replace(/\D/g, '');

        // Remove DDIs duplicados (ex.: 5555 -> 55)
        while (rawNumber.startsWith(userDdi + userDdi)) {
            rawNumber = rawNumber.slice(userDdi.length);
        }

        // Adiciona DDI se ausente
        if (!rawNumber.startsWith(userDdi)) {
            rawNumber = userDdi + rawNumber;
        }

        // Verifica se tem DDD (2 dígitos após o DDI)
        const hasDdd = rawNumber.length >= (userDdi.length + 2) &&
            /^\d{2}$/.test(rawNumber.slice(userDdi.length, userDdi.length + 2));
        if (!hasDdd) {
            rawNumber = userDdi + userDdd + rawNumber.slice(userDdi.length); // Adiciona DDD do usuário se não tiver
        }

        // Adiciona o dígito 9 para números móveis brasileiros (se não tiver e tiver 12 dígitos)
        if (rawNumber.length === (userDdi.length + 10) && rawNumber.charAt(userDdi.length + 2) !== '9') {
            rawNumber = rawNumber.slice(0, userDdi.length + 2) + '9' + rawNumber.slice(userDdi.length + 2);
        }

        // Validação com libphonenumber-js
        const phoneNumber = parsePhoneNumberFromString(rawNumber, 'BR');
        const isValid = phoneNumber && phoneNumber.isValid();

        // Retorna o número bruto se válido, ou "Número inválido"
        return isValid ? rawNumber : 'Número inválido';
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
            const formatted = normalizePhoneNumber(row.celular, ddi, ddd);
            const isValid = formatted !== 'Número inválido';

            return {
                ...row,
                celular_formatado: formatted,
                valido: isValid ? 'Sim' : 'Não',
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