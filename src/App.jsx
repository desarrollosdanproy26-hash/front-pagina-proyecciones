/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Container, Box, Alert, CircularProgress, Paper, Button } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import theme from './theme';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Home from './components/Home';
import TableSelector from './components/TableSelector';
import DataGrid from './components/DataGrid';
import Fenologia from './components/Fenologia';
import ConteoFrutos from './components/ConteoFrutos';
import { getTableSchema, logout as apiLogout } from './services/api';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null); // null, 'tables', 'fenologia', 'conteo-frutos'
  const [selectedTable, setSelectedTable] = useState(null);
  const [schema, setSchema] = useState(null);
  const [primaryKeys, setPrimaryKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Verificar si hay sesión activa al cargar
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing user data:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setIsCheckingAuth(false);
  }, []);

  const loadSchema = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTableSchema(selectedTable);
      if (response.success) {
        setSchema(response.schema);
        setPrimaryKeys(response.primaryKeys);
      }
    } catch (err) {
      setError('Error al cargar esquema: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Cargar esquema cuando se selecciona una tabla
  useEffect(() => {
    if (selectedTable && user) {
      loadSchema();
    } else {
      setSchema(null);
      setPrimaryKeys([]);
    }
  }, [selectedTable, user]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    apiLogout();
    setUser(null);
    setSelectedModule(null);
    setSelectedTable(null);
    setSchema(null);
    setPrimaryKeys([]);
  };

  const handleBackToHome = () => {
    setSelectedModule(null);
    setSelectedTable(null);
    setSchema(null);
    setPrimaryKeys([]);
    setError(null);
  };

  // Mostrar pantalla de carga mientras verifica autenticación
  if (isCheckingAuth) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #F5F5F5 0%, #E0E0E0 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23E31837\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3
          }
        }}>
          <CircularProgress size={60} sx={{ color: '#E31837', zIndex: 1 }} />
        </Box>
      </ThemeProvider>
    );
  }

  // Si no hay usuario, mostrar login
  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login onLoginSuccess={handleLoginSuccess} />
      </ThemeProvider>
    );
  }

  // Si hay usuario, mostrar aplicación
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App" style={{ backgroundColor: '#F1F3DE', minHeight: '100vh' }}>
        <Navbar user={user} onLogout={handleLogout} />
        
        {/* Home o Módulos */}
        {!selectedModule ? (
          <Home onModuleSelect={setSelectedModule} />
        ) : (
          <Container maxWidth={false} sx={{ mt: 3, mb: 10, px: 3 }}>
            {/* Módulo de Gestión de Tablas */}
            {selectedModule === 'tables' && (
              <Paper elevation={3} sx={{ p: 3, bgcolor: 'white' }}>
                <TableSelector
                  onTableSelect={setSelectedTable}
                  selectedTable={selectedTable}
                />

                {loading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                )}

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                {selectedTable && schema && !loading && (
                  <DataGrid
                    tableName={selectedTable}
                    schema={schema}
                    primaryKeys={primaryKeys}
                    userRole={user.rol}
                  />
                )}

                {!selectedTable && !loading && (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Alert severity="info" variant="outlined">
                      Selecciona una tabla del menú superior para comenzar a trabajar.
                    </Alert>
                  </Box>
                )}
              </Paper>
            )}

            {/* Módulo de Fenología */}
            {selectedModule === 'fenologia' && (
              <Fenologia />
            )}

            {/* Módulo de Conteo de Frutos */}
            {selectedModule === 'conteo-frutos' && (
              <ConteoFrutos />
            )}
          </Container>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
