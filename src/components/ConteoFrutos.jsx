/* eslint-disable */
/* eslint-disable */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import LockIcon from '@mui/icons-material/Lock';
import EditIcon from '@mui/icons-material/Edit';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function ConteoFrutos() {
  // Estados para selectores en cascada
  const [fundos, setFundos] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [lotes, setLotes] = useState([]);

  // Selecciones actuales
  const [selectedFundo, setSelectedFundo] = useState('');
  const [selectedModulo, setSelectedModulo] = useState('');
  const [selectedTurno, setSelectedTurno] = useState('');
  const [selectedLote, setSelectedLote] = useState(null);

  // Datos de fenología
  const [datosConteo, setDatosConteo] = useState(null);
  const [datosEditados, setDatosEditados] = useState({});
  const [promediosDinamicos, setPromediosDinamicos] = useState({});

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  // Cargar fundos al montar
  useEffect(() => {
    cargarFundos();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  const cargarFundos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/conteo-frutos/fundos`, getAuthHeaders());
      setFundos(response.data.data);
    } catch (err) {
      setError('Error al cargar fundos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarModulos = async (idFundo) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/conteo-frutos/fundos/${idFundo}/modulos`,
        getAuthHeaders()
      );
      setModulos(response.data.data);
      setTurnos([]);
      setLotes([]);
      setSelectedModulo('');
      setSelectedTurno('');
      setSelectedLote(null);
      setDatosConteo(null);
    } catch (err) {
      setError('Error al cargar módulos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarTurnos = async (idModulo) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/conteo-frutos/modulos/${idModulo}/turnos`,
        getAuthHeaders()
      );
      setTurnos(response.data.data);
      setLotes([]);
      setSelectedTurno('');
      setSelectedLote(null);
      setDatosConteo(null);
    } catch (err) {
      setError('Error al cargar turnos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarLotes = async (idTurno) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/conteo-frutos/turnos/${idTurno}/lotes`,
        getAuthHeaders()
      );
      setLotes(response.data.data);
      setSelectedLote(null);
      setDatosConteo(null);
    } catch (err) {
      setError('Error al cargar lotes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarDatosConteo = async (idLote) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/conteo-frutos/lotes/${idLote}/datos`,
        getAuthHeaders()
      );
      setDatosConteo(response.data);
      setDatosEditados({});
      setPromediosDinamicos(response.data.ultimaSemana.promedios);
    } catch (err) {
      setError('Error al cargar datos de fenología: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFundoChange = (e) => {
    const idFundo = e.target.value;
    setSelectedFundo(idFundo);
    if (idFundo) {
      cargarModulos(idFundo);
    } else {
      setModulos([]);
      setTurnos([]);
      setLotes([]);
    }
  };

  const handleModuloChange = (e) => {
    const idModulo = e.target.value;
    setSelectedModulo(idModulo);
    if (idModulo) {
      cargarTurnos(idModulo);
    } else {
      setTurnos([]);
      setLotes([]);
    }
  };

  const handleTurnoChange = (e) => {
    const idTurno = e.target.value;
    setSelectedTurno(idTurno);
    if (idTurno) {
      cargarLotes(idTurno);
    } else {
      setLotes([]);
    }
  };

  const handleLoteClick = (lote) => {
    setSelectedLote(lote);
    cargarDatosConteo(lote.idLote);
  };

  const handleCampoChange = (registroId, campo, valor) => {
    // Actualizar datos editados
    const nuevosEditados = {
      ...datosEditados,
      [registroId]: {
        ...(datosEditados[registroId] || {}),
        [campo]: parseFloat(valor) || 0
      }
    };
    setDatosEditados(nuevosEditados);

    // Recalcular promedios dinámicamente
    const datosActualizados = datosConteo.ultimaSemana.datos.map(dato => {
      if (dato.id === registroId && nuevosEditados[registroId]) {
        return { ...dato, ...nuevosEditados[registroId] };
      }
      return dato;
    });

    const nuevosPromedios = calcularPromedios(datosActualizados);
    setPromediosDinamicos(nuevosPromedios);
  };

  const calcularPromedios = (datos) => {
    const camposNumericos = [
      'Cuajas', 'VerdeInmaduro', 'VerdeInm_turg50', 'VerdeTurgente',
      'Marron30', 'Marron50', 'Marron75', 'Pinton30', 'Pinton50', 'Pinton75',
      'Naranja', 'Rojo', 'TipoAji', 'DeshiSevero', 'DiametroMenor',
      'DeformeModerado', 'DañoAlternaria', 'Descompuesto', 'DañoProdiplosis',
      'DañoRoedores', 'RajadoLeve', 'RajadoSevero', 'Cracking', 'FormaAji'
    ];

    const promedios = {};

    for (const campo of camposNumericos) {
      const valores = datos
        .map(d => d[campo])
        .filter(v => v !== null && v !== undefined && !isNaN(v));
      
      if (valores.length > 0) {
        const suma = valores.reduce((acc, val) => acc + parseFloat(val), 0);
        promedios[campo] = (suma / valores.length).toFixed(2);
      } else {
        promedios[campo] = '0.00';
      }
    }

    return promedios;
  };

  const guardarCambios = async () => {
    try {
      setLoading(true);
      const promises = Object.entries(datosEditados).map(([registroId, datos]) => {
        return axios.put(
          `${API_URL}/conteo-frutos/registros/${registroId}`,
          datos,
          getAuthHeaders()
        );
      });

      await Promise.all(promises);
      setMensaje({ tipo: 'success', texto: 'Cambios guardados correctamente' });
      
      // Recargar datos
      cargarDatosConteo(selectedLote.idLote);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error al guardar cambios: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const camposEditables = [
    { key: 'Muestra', label: 'Muestra', tipo: 'texto', width: 80 },
    { key: 'Cuajas', label: 'Cuajas', tipo: 'numero', width: 80 },
    { key: 'VerdeInmaduro', label: 'Verde Inmaduro', tipo: 'numero', width: 110 },
    { key: 'VerdeInm_turg50', label: 'VI Turg 50%', tipo: 'numero', width: 100 },
    { key: 'VerdeTurgente', label: 'Verde Turgente', tipo: 'numero', width: 110 },
    { key: 'Marron30', label: 'Marrón 30%', tipo: 'numero', width: 90 },
    { key: 'Marron50', label: 'Marrón 50%', tipo: 'numero', width: 90 },
    { key: 'Marron75', label: 'Marrón 75%', tipo: 'numero', width: 90 },
    { key: 'Pinton30', label: 'Pintón 30%', tipo: 'numero', width: 90 },
    { key: 'Pinton50', label: 'Pintón 50%', tipo: 'numero', width: 90 },
    { key: 'Pinton75', label: 'Pintón 75%', tipo: 'numero', width: 90 },
    { key: 'Naranja', label: 'Naranja', tipo: 'numero', width: 80 },
    { key: 'Rojo', label: 'Rojo', tipo: 'numero', width: 80 },
    { key: 'TipoAji', label: 'Tipo Ají', tipo: 'numero', width: 80 },
    { key: 'DeshiSevero', label: 'Deshi Severo', tipo: 'numero', width: 100 },
    { key: 'DiametroMenor', label: 'Diám. Menor', tipo: 'numero', width: 100 },
    { key: 'DeformeModerado', label: 'Deforme Mod.', tipo: 'numero', width: 110 },
    { key: 'DañoAlternaria', label: 'Daño Alternaria', tipo: 'numero', width: 110 },
    { key: 'Descompuesto', label: 'Descompuesto', tipo: 'numero', width: 110 },
    { key: 'DañoProdiplosis', label: 'Daño Prodiplosis', tipo: 'numero', width: 120 },
    { key: 'DañoRoedores', label: 'Daño Roedores', tipo: 'numero', width: 110 },
    { key: 'RajadoLeve', label: 'Rajado Leve', tipo: 'numero', width: 100 },
    { key: 'RajadoSevero', label: 'Rajado Severo', tipo: 'numero', width: 110 },
    { key: 'Cracking', label: 'Cracking', tipo: 'numero', width: 80 },
    { key: 'FormaAji', label: 'Forma Ají', tipo: 'numero', width: 90 }
  ];

  const camposInfo = [
    { key: 'Fecha', label: 'Fecha', render: (val) => new Date(val).toLocaleDateString(), width: 100 },
    { key: 'Hora', label: 'Hora', width: 80 },
    { key: 'Nombre', label: 'Evaluador', width: 150 }
  ];

  const renderTabla = (datos, promedios, editable = false, titulo, semana) => {
    if (!datos || datos.length === 0) {
      return (
        <Alert severity="info">No hay datos para la semana {semana}</Alert>
      );
    }

    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h6">{titulo}</Typography>
          <Chip 
            label={`Semana ${semana}`} 
            color={editable ? "success" : "default"}
            size="small"
          />
          {!editable && <LockIcon sx={{ color: 'text.secondary' }} />}
          {editable && <EditIcon sx={{ color: 'success.main' }} />}
        </Box>

        <TableContainer component={Paper} sx={{ maxHeight: 450, mb: 2, overflowX: 'auto', position: 'relative' }}>
          <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: 'max-content' }}>
            <TableHead>
              <TableRow>
                {/* Columnas de información fija */}
                {camposInfo.map(campo => (
                  <TableCell 
                    key={campo.key}
                    sx={{ 
                      fontWeight: 'bold', 
                      bgcolor: editable ? 'success.light' : 'grey.200',
                      width: campo.width,
                      minWidth: campo.width,
                      maxWidth: campo.width
                    }}
                  >
                    {campo.label}
                  </TableCell>
                ))}
                
                {/* Columnas editables */}
                {camposEditables.map(campo => (
                  <TableCell 
                    key={campo.key} 
                    sx={{ 
                      fontWeight: 'bold', 
                      bgcolor: editable ? 'success.light' : 'grey.200',
                      width: campo.width,
                      minWidth: campo.width,
                      maxWidth: campo.width,
                      textAlign: 'center'
                    }}
                  >
                    {campo.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {datos.map((registro, idx) => (
                <TableRow 
                  key={registro.id}
                  sx={{ 
                    bgcolor: idx % 2 === 0 ? 'background.paper' : 'action.hover',
                    '&:hover': { bgcolor: editable ? 'success.lighter' : 'action.selected' }
                  }}
                >
                  {/* Columnas de información fija */}
                  {camposInfo.map(campo => (
                    <TableCell 
                      key={campo.key} 
                      sx={{ 
                        width: campo.width,
                        minWidth: campo.width,
                        maxWidth: campo.width,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {campo.render ? campo.render(registro[campo.key]) : registro[campo.key]}
                    </TableCell>
                  ))}
                  
                  {/* Columnas editables */}
                  {camposEditables.map(campo => (
                    <TableCell 
                      key={campo.key} 
                      sx={{ 
                        width: campo.width,
                        minWidth: campo.width,
                        maxWidth: campo.width,
                        textAlign: 'center',
                        padding: '4px'
                      }}
                    >
                      {editable && campo.tipo === 'numero' ? (
                        <TextField
                          type="number"
                          size="small"
                          value={
                            datosEditados[registro.id]?.[campo.key] ?? 
                            registro[campo.key] ?? 
                            ''
                          }
                          onChange={(e) => handleCampoChange(registro.id, campo.key, e.target.value)}
                          sx={{ 
                            width: '100%',
                            '& input': { 
                              fontSize: '0.875rem',
                              padding: '4px',
                              bgcolor: 'white',
                              textAlign: 'center'
                            },
                            '& .MuiOutlinedInput-root': {
                              padding: 0
                            }
                          }}
                          inputProps={{ step: 0.01 }}
                        />
                      ) : (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            bgcolor: editable && campo.tipo === 'texto' ? 'white' : 'grey.100', 
                            p: 0.5, 
                            borderRadius: 1,
                            textAlign: 'center',
                            border: editable && campo.tipo === 'texto' ? '1px solid #e0e0e0' : 'none',
                            fontSize: '0.875rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {registro[campo.key] ?? '-'}
                        </Typography>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              
              {/* Fila de promedios */}
              <TableRow sx={{ 
                bgcolor: editable ? 'success.main' : 'primary.main',
                position: 'sticky',
                bottom: 0,
                zIndex: 2,
                boxShadow: '0px -2px 8px rgba(0,0,0,0.15)'
              }}>
                <TableCell 
                  colSpan={camposInfo.length} 
                  sx={{ fontWeight: 'bold', color: 'white', fontSize: '1rem' }}
                >
                  PROMEDIOS
                </TableCell>
                {camposEditables.map(campo => (
                  <TableCell 
                    key={campo.key}
                    sx={{ 
                      fontWeight: 'bold', 
                      color: 'white',
                      fontSize: '0.95rem',
                      textAlign: 'center'
                    }}
                  >
                    {campo.tipo === 'numero' ? (promedios[campo.key] ?? '0.00') : '-'}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#FAFAFA', minHeight: 'calc(100vh - 80px)' }}>
      {/* Header con branding */}
      <Box 
        sx={{ 
          mb: 4,
          p: 3,
          background: 'linear-gradient(135deg, #E31837 0%, #B71C1C 100%)',
          borderRadius: 3,
          boxShadow: '0px 4px 20px rgba(227, 24, 55, 0.3)',
          color: 'white'
        }}
      >
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            fontWeight: 700, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            color: 'white',
            textShadow: '0px 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          <AgricultureIcon sx={{ fontSize: 40 }} />
          Conteo de Frutos - Edición de Datos
        </Typography>
        <Typography variant="body1" sx={{ color:'white', opacity: 0.95, fontWeight: 500 }}>
          Registro y análisis del conteo de frutos de pimiento
        </Typography>
      </Box>

      {/* Mensajes */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {mensaje && (
        <Alert severity={mensaje.tipo} sx={{ mb: 2 }} onClose={() => setMensaje(null)}>
          {mensaje.texto}
        </Alert>
      )}

      {/* Grid de 3 columnas */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 2fr 1fr', 
        gap: 3, 
        mb: 3,
        minHeight: '400px',
        alignItems: 'start'
      }}>
        
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            borderRadius: 3,
            border: '1px solid #E0E0E0',
            background: 'white',
            height: '420px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box 
              sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: 2, 
                bgcolor: '#E31837', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}
            >
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                1
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#212121' }}>
                Selección de Ubicación
              </Typography>
              <Typography variant="caption" sx={{ color: '#616161' }}>
                Selecciona fundo, módulo y turno
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Selector Fundo */}
            <FormControl fullWidth>
              <InputLabel sx={{ '&.Mui-focused': { color: '#E31837' } }}>
                Fundo
              </InputLabel>
              <Select
                value={selectedFundo}
                onChange={handleFundoChange}
                label="Fundo"
                disabled={loading}
                sx={{
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E31837'
                  }
                }}
              >
                <MenuItem value="">
                  <em>Seleccionar...</em>
                </MenuItem>
                {fundos.map(fundo => (
                  <MenuItem key={fundo.idFundo} value={fundo.idFundo}>
                    {fundo.Fundo}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Selector Módulo */}
            <FormControl fullWidth disabled={!selectedFundo || loading}>
              <InputLabel sx={{ '&.Mui-focused': { color: '#E31837' } }}>
                Módulo
              </InputLabel>
              <Select
                value={selectedModulo}
                onChange={handleModuloChange}
                label="Módulo"
                sx={{
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E31837'
                  }
                }}
              >
                <MenuItem value="">
                  <em>Seleccionar...</em>
                </MenuItem>
                {modulos.map(modulo => (
                  <MenuItem key={modulo.idModulo} value={modulo.idModulo}>
                    {modulo.Modulo}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Selector Turno */}
            <FormControl fullWidth disabled={!selectedModulo || loading}>
              <InputLabel sx={{ '&.Mui-focused': { color: '#E31837' } }}>
                Turno
              </InputLabel>
              <Select
                value={selectedTurno}
                onChange={handleTurnoChange}
                label="Turno"
                sx={{
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E31837'
                  }
                }}
              >
                <MenuItem value="">
                  <em>Seleccionar...</em>
                </MenuItem>
                {turnos.map(turno => (
                  <MenuItem key={turno.idTurno} value={turno.idTurno}>
                    {turno.Turno} {turno.SubTurno ? `- ${turno.SubTurno}` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* COLUMNA 2: Lotes */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            borderRadius: 3,
            border: '1px solid #E0E0E0',
            background: lotes.length > 0 ? 'white' : 'rgba(0,0,0,0.02)',
            height: '420px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box 
              sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: 2, 
                bgcolor: lotes.length > 0 ? '#E31837' : '#BDBDBD', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}
            >
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                2
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: lotes.length > 0 ? '#212121' : '#9E9E9E' }}>
                Lotes Disponibles
              </Typography>
              <Typography variant="caption" sx={{ color: '#616161' }}>
                {lotes.length > 0 ? 'Selecciona un lote' : 'Primero selecciona fundo, módulo y turno'}
              </Typography>
            </Box>
          </Box>
          
          {lotes.length > 0 ? (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: 1.5,
              overflowY: 'auto',
              pr: 1,
              '&::-webkit-scrollbar': {
                width: '8px'
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px'
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#E31837',
                borderRadius: '4px',
                '&:hover': {
                  background: '#B71C1C'
                }
              }
            }}>
              {lotes.map(lote => (
                <Chip
                  key={lote.idLote}
                  label={`${lote.Lote}`}
                  onClick={() => handleLoteClick(lote)}
                  color={selectedLote?.idLote === lote.idLote ? "primary" : "default"}
                  variant={selectedLote?.idLote === lote.idLote ? "filled" : "outlined"}
                  sx={{ 
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    height: '36px',
                    fontWeight: 500,
                    justifyContent: 'center',
                    border: selectedLote?.idLote === lote.idLote ? 'none' : '2px solid #E0E0E0',
                    '&:hover': {
                      bgcolor: selectedLote?.idLote === lote.idLote ? '#B71C1C' : 'rgba(227, 24, 55, 0.08)',
                      borderColor: '#E31837',
                      transform: 'scale(1.05)',
                      boxShadow: '0px 4px 12px rgba(227, 24, 55, 0.2)',
                      transition: 'all 0.3s ease'
                    }
                  }}
                />
              ))}
            </Box>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              flexGrow: 1,
              color: '#9E9E9E'
            }}>
              <Typography variant="body2" sx={{ textAlign: 'center' }}>
                Esperando selección de turno...
              </Typography>
            </Box>
          )}
        </Paper>

        {/* COLUMNA 3: Info Lote */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: 3, 
            borderRadius: 3,
            background: selectedLote 
              ? 'linear-gradient(135deg, rgba(227, 24, 55, 0.05) 0%, rgba(183, 28, 28, 0.05) 100%)'
              : 'rgba(0,0,0,0.02)',
            border: selectedLote ? '2px solid #E31837' : '1px solid #E0E0E0',
            height: '420px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {selectedLote ? (
            <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box 
                sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: 2, 
                  bgcolor: '#E31837', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                  ✓
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#E31837' }}>
                Lote Seleccionado
              </Typography>
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#E31837', mb: 2 }}>
                {selectedLote.Lote}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Chip 
                  label={`Variedad: ${selectedLote.Variedad} ${selectedLote.SubVariedad || ''}`} 
                  size="small" 
                  sx={{ fontWeight: 500, justifyContent: 'flex-start' }} 
                />
                <Chip 
                  label={`Densidad: ${selectedLote.Densidad}`} 
                  size="small" 
                  sx={{ fontWeight: 500, justifyContent: 'flex-start' }} 
                />
                <Chip 
                  label={`Vivero: ${selectedLote.Vivero}`} 
                  size="small" 
                  sx={{ fontWeight: 500, justifyContent: 'flex-start' }} 
                />
                <Chip 
                  label={`Hileras: ${selectedLote.Nro_Hileras}`} 
                  size="small" 
                  sx={{ fontWeight: 500, justifyContent: 'flex-start' }} 
                />
              </Box>
            </Box>
            </>
          ) : (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box 
                  sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: 2, 
                    bgcolor: '#BDBDBD', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                    ✓
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#9E9E9E' }}>
                  Lote Seleccionado
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                flexGrow: 1,
                color: '#9E9E9E'
              }}>
                <Typography variant="body2" sx={{ textAlign: 'center' }}>
                  Esperando selección de lote...
                </Typography>
              </Box>
            </>
          )}
        </Paper>
      </Box>
      
      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Datos de Fenología */}
      {datosConteo && !loading && (
        <Box>
          {/* Penúltima Semana (Bloqueada) */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LockIcon color="action" />
                <Typography variant="h6">
                  Penúltima Semana (Solo Lectura)
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {renderTabla(
                datosConteo.penultimaSemana.datos,
                datosConteo.penultimaSemana.promedios,
                false,
                "Datos Bloqueados",
                datosConteo.penultimaSemana.semana
              )}
            </AccordionDetails>
          </Accordion>

          {/* Última Semana (Editable) */}
          <Accordion defaultExpanded sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EditIcon color="success" />
                <Typography variant="h6" color="success.main">
                  Última Semana (Editable)
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {renderTabla(
                datosConteo.ultimaSemana.datos,
                promediosDinamicos,
                true,
                "Datos Editables",
                datosConteo.ultimaSemana.semana
              )}
              
              {/* Botón Guardar */}
              {Object.keys(datosEditados).length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    startIcon={<SaveIcon />}
                    onClick={guardarCambios}
                    disabled={loading}
                  >
                    Guardar Cambios ({Object.keys(datosEditados).length} registros modificados)
                  </Button>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        </Box>
      )}

      {/* Mensaje cuando no hay lote seleccionado */}
      {!selectedLote && !loading && selectedTurno && (
        <Alert severity="info">
          Selecciona un lote para ver y editar los datos de fenología
        </Alert>
      )}
    </Box>
  );
}

export default ConteoFrutos;
