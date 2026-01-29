import React, { useState } from 'react';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Avatar
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import { login } from '../services/api';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await login(username, password);
      
      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        onLoginSuccess(response.user);
      } else {
        setError(response.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error de conexión. Verifica el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #E31837 0%, #B71C1C 50%, #8B0000 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3
        }
      }}
    >
      <Card
        elevation={24}
        sx={{
          maxWidth: 450,
          width: '90%',
          p: 4,
          borderRadius: 4,
          position: 'relative',
          zIndex: 1,
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(10px)'
        }}
      >
        {/* Logo y Título */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: '#E31837',
              margin: '0 auto',
              mb: 2,
              boxShadow: '0px 4px 20px rgba(227, 24, 55, 0.4)'
            }}
          >
            <AgricultureIcon sx={{ fontSize: 48, color: 'white' }} />
          </Avatar>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              color: '#E31837',
              mb: 1,
              letterSpacing: '1px'
            }}
          >
            DANPER
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#616161',
              fontWeight: 500
            }}
          >
            Sistema de Proyecciones Agrícolas
          </Typography>
        </Box>

        {/* Mensaje de error */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-icon': {
                color: '#E31837'
              }
            }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            required
            autoComplete="username"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: '#E31837' }} />
                </InputAdornment>
              )
            }}
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#E31837'
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#E31837',
                  borderWidth: 2
                }
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#E31837'
              }
            }}
          />

          <TextField
            fullWidth
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            autoComplete="current-password"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: '#E31837' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{ color: '#616161' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ 
              mb: 4,
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#E31837'
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#E31837',
                  borderWidth: 2
                }
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#E31837'
              }
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              background: 'linear-gradient(90deg, #E31837 0%, #B71C1C 100%)',
              boxShadow: '0px 4px 12px rgba(227, 24, 55, 0.4)',
              '&:hover': {
                background: 'linear-gradient(90deg, #B71C1C 0%, #8B0000 100%)',
                boxShadow: '0px 6px 16px rgba(227, 24, 55, 0.5)',
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease'
              },
              '&:active': {
                transform: 'translateY(0)'
              }
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              'Iniciar Sesión'
            )}
          </Button>
        </form>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="caption" sx={{ color: '#9E9E9E' }}>
            © 2026 Danper - Todos los derechos reservados
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}

export default Login;
