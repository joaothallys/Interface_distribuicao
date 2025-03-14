import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, Box, Stack
} from '@mui/material';
import couveMascote from '../image/image.png'; // Ajuste o caminho da imagem sem fundo

const WelcomePopup = ({ open, onClose }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            PaperProps={{
                sx: {
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #ffffff 0%, #e0f7fa 100%)',
                    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)',
                    width: '1000px', // Aumentado para 1000px
                    height: '600px', // Aumentado para 600px
                    p: 4, // Aumentei o padding para melhor espaçamento interno
                },
            }}
        >
            <DialogTitle sx={{ textAlign: 'center', color: '#1CB0F6', fontWeight: 'bold', fontSize: '1.8rem' }}>
                Bem-vindo à Couve-flor!
            </DialogTitle>
            <DialogContent>
                <Stack direction="row" spacing={4} alignItems="center" sx={{ mt: 3 }}>
                    {/* Imagem do Mascote */}
                    <Box sx={{ flexShrink: 0 }}>
                        <img
                            src={couveMascote}
                            alt="Mascote Couve"
                            style={{ width: '300px', height: '300px' }}
                        />
                    </Box>
                    {/* Texto Engraçado */}
                    <Typography
                        variant="body1"
                        sx={{
                            color: '#333',
                            fontSize: '1.3rem',
                            lineHeight: '1.6',
                            maxWidth: '550px', // Aumentei para ocupar melhor o espaço
                        }}
                    >
                        Olá! Eu sou o Couve, seu parceiro verde e divertido para dominar a distribuição de contatos! 🍃📱 Faça upload do seu CSV e me deixe misturar esses contatos na api com de um jeito maluco. Quer começar a redistribuir e importar com estilo? Vamos lá!
                    </Typography>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', mb: 2 }}>
                <Button
                    onClick={onClose}
                    variant="contained"
                    sx={{
                        backgroundColor: '#58CC02',
                        color: '#fff',
                        borderRadius: '25px',
                        padding: '12px 24px',
                        fontSize: '1.1rem',
                        '&:hover': { backgroundColor: '#4ab002' },
                    }}
                >
                    Vamos Lá, Couve!
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default WelcomePopup;