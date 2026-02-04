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
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import LockIcon from '@mui/icons-material/Lock';
import EditIcon from '@mui/icons-material/Edit';
import SpaIcon from '@mui/icons-material/Spa';
import axios from 'axios';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
//const API_URL = 'http://localhost:5000/api';
const API_URL = 'http://portal-web-proyecciones-apipagina-ecn8tf-ddab49-147-93-190-116.traefik.me/api';

function Fenologia() {
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

  // Nombres para display
  const [moduloNombre, setModuloNombre] = useState('');
  const [turnoNombre, setTurnoNombre] = useState('');

  // Datos de fenología
  const [datosFenologia, setDatosFenologia] = useState(null);
  const [datosEditados, setDatosEditados] = useState({});
  const [promediosDinamicos, setPromediosDinamicos] = useState({});

  // Datos para nivel turno y lote
  const [datosNivelTurno, setDatosNivelTurno] = useState(null);
  const [datosNivelLote, setDatosNivelLote] = useState(null);
  const [loteEsEditable, setLoteEsEditable] = useState(false);
  const [promediosEditadosLote, setPromediosEditadosLote] = useState({});
  const [modoEdicionLote, setModoEdicionLote] = useState(false);
  const [valoresMinLote, setValoresMinLote] = useState({});
  const [valoresMaxLote, setValoresMaxLote] = useState({});

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalTipo, setModalTipo] = useState('muestra'); // 'turno', 'lote', 'muestra'

  // Cargar fundos al montar
  useEffect(() => {
    cargarFundos();
  }, []);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  }, []);

  const cargarFundos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/fenologia/fundos`, getAuthHeaders());
      setFundos(response.data.data);
    } catch (err) {
      setError('Error al cargar fundos: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const cargarModulos = async (idFundo) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/fenologia/fundos/${idFundo}/modulos`,
        getAuthHeaders()
      );
      setModulos(response.data.data);
      setTurnos([]);
      setLotes([]);
      setSelectedModulo('');
      setSelectedTurno('');
      setSelectedLote(null);
      setDatosFenologia(null);
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
        `${API_URL}/fenologia/modulos/${idModulo}/turnos`,
        getAuthHeaders()
      );
      setTurnos(response.data.data);
      setLotes([]);
      setSelectedTurno('');
      setSelectedLote(null);
      setDatosFenologia(null);
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
        `${API_URL}/fenologia/turnos/${idTurno}/lotes`,
        getAuthHeaders()
      );
      setLotes(response.data.data);
      setSelectedLote(null);
      setDatosFenologia(null);
    } catch (err) {
      setError('Error al cargar lotes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarDatosFenologia = async (idLote) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/fenologia/lotes/${idLote}/datos`,
        getAuthHeaders()
      );
      setDatosFenologia(response.data);
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

    // Guardar nombre del módulo
    const moduloObj = modulos.find(m => m.idModulo == idModulo);
    setModuloNombre(moduloObj ? moduloObj.Modulo : '');

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

    // Guardar nombre del turno
    const turnoObj = turnos.find(t => t.idTurno == idTurno);
    setTurnoNombre(turnoObj ? `${turnoObj.Turno}${turnoObj.SubTurno ? ' - ' + turnoObj.SubTurno : ''}` : '');

    if (idTurno) {
      cargarLotes(idTurno);
    } else {
      setLotes([]);
    }
  };

  const handleLoteClick = (lote) => {
    setSelectedLote(lote);
    cargarDatosFenologia(lote.idLote);
  };

  const handleCampoChange = (registroId, campo, valor) => {
    // Validar según tipo de campo
    let valorProcesado;
    if (campo === 'AlturaPlanta') {
      valorProcesado = parseFloat(valor) || 0;
    } else {
      valorProcesado = Math.round(parseFloat(valor)) || 0; // Solo enteros
    }

    // Actualizar datos editados
    const nuevosEditados = {
      ...datosEditados,
      [registroId]: {
        ...(datosEditados[registroId] || {}),
        [campo]: valorProcesado
      }
    };
    setDatosEditados(nuevosEditados);

    // Recalcular promedios dinámicamente
    const datosActualizados = datosFenologia.ultimaSemana.datos.map(dato => {
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
      'AlturaPlanta', 'Botones', 'Flores', 'FrutoNivel1', 'FrutoNivel2',
      'FrutoNivel3', 'FrutoNivel4', 'FrutoNivel5', 'FrutoNivel6',
      'CuajasDañoAlternaria', 'CuajaDañoProdi', 'CuajaDeforme', 'PreCuajas',
      'LargoFruto', 'AnchoFruto', 'Maduro', 'Bifido'
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
    // Confirmación antes de guardar
    const confirmar = window.confirm(
      `¿Está seguro que desea guardar los cambios?\n\n` +
      `Se modificarán ${Object.keys(datosEditados).length} registro(s) en la base de datos.`
    );

    if (!confirmar) {
      return; // Usuario canceló
    }

    try {
      setLoading(true);
      const promises = Object.entries(datosEditados).map(([registroId, datos]) => {
        return axios.put(
          `${API_URL}/fenologia/registros/${registroId}`,
          datos,
          getAuthHeaders()
        );
      });

      await Promise.all(promises);
      alert('✅ Cambios guardados correctamente en la base de datos');
      setDatosEditados({}); // Limpiar cambios pendientes

      // Recargar datos
      await cargarDatosFenologia(selectedLote.idLote);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: '❌ Error al guardar cambios: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos a nivel TURNO
  const cargarDatosNivelTurno = async (idTurno) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/fenologia/turnos/${idTurno}/nivel-turno`,
        getAuthHeaders()
      );
      setDatosNivelTurno(response.data);
    } catch (err) {
      console.error('Error al cargar datos nivel turno:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos a nivel LOTE
  const cargarDatosNivelLote = async (idLote) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/fenologia/lotes/${idLote}/nivel-lote`,
        getAuthHeaders()
      );
      setDatosNivelLote(response.data);

      // Verificar si tiene Validacion=2
      const esEditable = response.data.esEditable || false;
      setLoteEsEditable(esEditable);

    } catch (err) {
      console.error('Error al cargar datos nivel lote:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const distribuirPromedioEntreMuestras = (muestras, campo, nuevoPromedio, valorMin, valorMax) => {
    const n = muestras.length;
    if (n === 0) return muestras;

    const esAlturaPlanta = campo === 'AlturaPlanta';

    // Si promedio es 0, todos a 0
    if (Math.abs(nuevoPromedio) < 0.001) {
      return muestras.map(muestra => ({
        ...muestra,
        [campo]: 0
      }));
    }

    // Usar min/max si están definidos, sino usar rango automático
    const minValor = valorMin !== undefined && valorMin !== null ? parseFloat(valorMin) : Math.max(0, nuevoPromedio * 0.7);
    const maxValor = valorMax !== undefined && valorMax !== null ? parseFloat(valorMax) : nuevoPromedio * 1.3;

    // PASO 1: Generar valores aleatorios entre min y max
    let nuevosValores = [];

    for (let i = 0; i < n; i++) {
      const valorAleatorio = minValor + Math.random() * (maxValor - minValor);

      if (esAlturaPlanta) {
        nuevosValores.push(Math.round(valorAleatorio * 10) / 10);
      } else {
        nuevosValores.push(Math.round(valorAleatorio));
      }
    }

    // PASO 2: Ajustar para lograr el promedio EXACTO
    let sumaActual = nuevosValores.reduce((a, b) => a + b, 0);
    const sumaObjetivo = nuevoPromedio * n;
    let diferencia = sumaObjetivo - sumaActual;

    const ajustePorValor = esAlturaPlanta ? 0.1 : 1;
    let intentos = 0;
    const maxIntentos = n * 100;

    while (Math.abs(diferencia) > 0.001 && intentos < maxIntentos) {
      const idx = Math.floor(Math.random() * n);

      if (diferencia > 0) {
        // Necesitamos SUBIR (pero no pasar max)
        if (nuevosValores[idx] + ajustePorValor <= maxValor) {
          nuevosValores[idx] += ajustePorValor;
          diferencia -= ajustePorValor;
        }
      } else {
        // Necesitamos BAJAR (pero no bajar de min)
        if (nuevosValores[idx] - ajustePorValor >= minValor) {
          nuevosValores[idx] -= ajustePorValor;
          diferencia += ajustePorValor;
        }
      }

      intentos++;
    }

    // Redondeo final
    if (esAlturaPlanta) {
      nuevosValores = nuevosValores.map(v => Math.round(v * 10) / 10);
    } else {
      nuevosValores = nuevosValores.map(v => Math.round(v));
    }

    const promedioFinal = nuevosValores.reduce((a, b) => a + b, 0) / n;
    console.log(`✅ ${campo}: Min=${minValor}, Max=${maxValor}, Prom=${promedioFinal.toFixed(2)}`);

    return muestras.map((muestra, idx) => ({
      ...muestra,
      [campo]: nuevosValores[idx]
    }));
  };

  const guardarCambiosPromediosLote = async () => {
    // Solo considerar columnas que realmente fueron editadas
    const columnasEditadas = Object.keys(promediosEditadosLote).filter(campo => {
      const promedioActual = parseFloat(datosNivelLote.ultimaSemana.promedios[campo]);
      const promedioNuevo = parseFloat(promediosEditadosLote[campo]);
      return Math.abs(promedioNuevo - promedioActual) > 0.001; // Cambió
    });

    if (columnasEditadas.length === 0) {
      alert('⚠️ No has modificado ningún promedio');
      return;
    }

    const confirmar = window.confirm(
      `¿Está seguro de ajustar las muestras según los nuevos promedios?\n\n` +
      `Columnas a modificar: ${columnasEditadas.join(', ')}\n` +
      `Esto modificará ${datosFenologia.ultimaSemana.datos.length} muestras automáticamente.`
    );

    if (!confirmar) return;

    try {
      setLoading(true);

      // Obtener muestras actuales
      let muestrasActualizadas = [...datosFenologia.ultimaSemana.datos];

      // Aplicar SOLO los campos editados
      for (const campo of columnasEditadas) {
        const nuevoPromedio = promediosEditadosLote[campo];
        const valorMin = valoresMinLote[campo];
        const valorMax = valoresMaxLote[campo];

        muestrasActualizadas = distribuirPromedioEntreMuestras(
          muestrasActualizadas,
          campo,
          parseFloat(nuevoPromedio),
          valorMin,
          valorMax
        );
      }

      // Guardar cada muestra en BD
      const promises = muestrasActualizadas.map(muestra => {
        const datos = {};
        columnasEditadas.forEach(campo => {
          datos[campo] = muestra[campo];
        });

        return axios.put(
          `${API_URL}/fenologia/registros/${muestra.id}`,
          datos,
          getAuthHeaders()
        );
      });

      await Promise.all(promises);
      // Actualizar Validacion de 2 a 1
      await axios.put(
        `${API_URL}/fenologia/lotes/${selectedLote.idLote}/cambiar-validacion`,
        { validacionNueva: 1 },
        getAuthHeaders()
      );

      alert('✅ Promedios ajustados y muestras actualizadas correctamente');

      // Recargar datos
      await cargarDatosFenologia(selectedLote.idLote);
      await cargarDatosNivelLote(selectedLote.idLote);
      setPromediosEditadosLote({});
      setValoresMinLote({});
      setValoresMaxLote({});
      setModoEdicionLote(false);

    } catch (err) {
      alert('❌ Error al guardar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const camposEditables = [
    { key: 'AlturaPlanta', label: 'Alt. Planta', tipo: 'numero', width: 90 },      // AltPlant
    { key: 'Botones', label: 'Botones', tipo: 'numero', width: 80 },               // N_bot
    { key: 'Flores', label: 'Flores', tipo: 'numero', width: 80 },                 // N_Flor
    { key: 'Cuajas', label: 'Cuajas', tipo: 'numero', width: 80 },                 // N_Cuajas
    { key: 'PreCuajas', label: 'Pre Cuajas', tipo: 'numero', width: 90 },          // N_PC
    { key: 'CuajaDeforme', label: 'Cuaja Deforme', tipo: 'numero', width: 110 },   // N_CDeforP
    { key: 'CuajasDañoAlternaria', label: 'Cuajas Daño Alt.', tipo: 'numero', width: 130 }, // N_CDA
    { key: 'CuajaDañoProdi', label: 'Cuaja Daño Prodi', tipo: 'numero', width: 130 },       // N_CDP

    { key: 'FrutoNivel1', label: 'Fruto N1', tipo: 'numero', width: 80 },          // N_FrtN1
    { key: 'FrutosQuemados', label: 'Frutos Quemados', tipo: 'numero', width: 130 }, // N_FrtfQ
    { key: 'FrutosDeformes', label: 'Frutos Deformes', tipo: 'numero', width: 130 }, // N_FrtFMD
    { key: 'DeformeLeve', label: 'Deforme Leve', tipo: 'numero', width: 110 },       // N_FrtDeforL
    { key: 'TipoAji', label: 'Tipo Ají', tipo: 'numero', width: 90 },               // N_FrtTAPR
    { key: 'FormaAji', label: 'Forma Ají', tipo: 'numero', width: 90 },             // N_FrtFA
    { key: 'DañoAlternaria', label: 'Daño Alternaria', tipo: 'numero', width: 130 },// N_FrtDA
    { key: 'DañoProdiplosis', label: 'Daño Prodiplosis', tipo: 'numero', width: 140 }, // N_FrtDP
    { key: 'FrutosDescompuestos', label: 'Frutos Descomp.', tipo: 'numero', width: 140 }, // N_FrtDescomp
    { key: 'DiametroMenor', label: 'Diámetro Menor', tipo: 'numero', width: 120 },  // N_FrtDM
    { key: 'DañoRoedores', label: 'Daño Roedores', tipo: 'numero', width: 120 },    // N_FrtDPR
    { key: 'DañoPajaros', label: 'Daño Pájaros', tipo: 'numero', width: 120 }       // N_FrtDPP
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

  // Tabla SOLO de promedios (para nivel Turno y Lote)
  const renderTablaPromedios = (promedios, tipo, editable = false) => {
    if (!promedios || Object.keys(promedios).length === 0) {
      return <Alert severity="info">No hay datos disponibles</Alert>;
    }

    const color = tipo === 'turno' ? '#CD0A0A' : '#EC0101';

    return (
      <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: 'max-content' }}>
        <TableHead>
          <TableRow>
            {camposEditables.filter(c => c.key !== 'Muestra').map(campo => (
              <TableCell
                key={campo.key}
                sx={{
                  fontWeight: 700,
                  bgcolor: color,
                  color: 'white',
                  width: campo.width,
                  minWidth: campo.width,
                  textAlign: 'center',
                  position: 'sticky',
                  top: 0,
                  zIndex: 3
                }}
              >
                {campo.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Fila de PROMEDIOS */}
          <TableRow sx={{
            bgcolor: 'white',
            height: '48px',
            '& td': {
              height: '48px',
              maxHeight: '48px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }
          }}>
            {camposEditables.filter(c => c.key !== 'Muestra').map(campo => (
              <TableCell
                key={campo.key}
                sx={{
                  width: campo.width,
                  textAlign: 'center',
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: color,
                  padding: '4px'
                }}
              >
                {editable && campo.tipo === 'numero' && modoEdicionLote ? (
                  <TextField
                    type="number"
                    size="small"
                    value={promediosEditadosLote[campo.key] ?? promedios[campo.key] ?? '0.00'}
                    onChange={(e) => setPromediosEditadosLote({
                      ...promediosEditadosLote,
                      [campo.key]: e.target.value
                    })}
                    sx={{
                      width: '100%',
                      '& input': {
                        fontSize: '0.95rem',
                        padding: '4px',
                        bgcolor: '#FFF3CD',
                        textAlign: 'center',
                        fontWeight: 600
                      }
                    }}
                    inputProps={{ step: campo.key === 'AlturaPlanta' ? 0.1 : 1 }}
                  />
                ) : (
                  campo.tipo === 'numero' ? (promedios[campo.key] ?? '0.00') : '-'
                )}
              </TableCell>
            ))}
          </TableRow>

          {/* Fila de MÍNIMO (solo si está editando) */}
          {editable && modoEdicionLote && (
            <TableRow sx={{ bgcolor: '#FFEBEE', height: '48px' }}>
              {camposEditables.filter(c => c.key !== 'Muestra').map(campo => (
                <TableCell
                  key={campo.key}
                  sx={{
                    width: campo.width,
                    textAlign: 'center',
                    padding: '4px'
                  }}
                >
                  {campo.tipo === 'numero' ? (
                    <TextField
                      type="number"
                      size="small"
                      placeholder="Min"
                      value={valoresMinLote[campo.key] ?? ''}
                      onChange={(e) => setValoresMinLote({
                        ...valoresMinLote,
                        [campo.key]: e.target.value
                      })}
                      sx={{
                        width: '100%',
                        '& input': {
                          fontSize: '0.875rem',
                          padding: '4px',
                          textAlign: 'center',
                          bgcolor: 'white'
                        }
                      }}
                      inputProps={{ step: campo.key === 'AlturaPlanta' ? 0.1 : 1, min: 0 }}
                    />
                  ) : '-'}
                </TableCell>
              ))}
            </TableRow>
          )}

          {/* Fila de MÁXIMO (solo si está editando) */}
          {editable && modoEdicionLote && (
            <TableRow sx={{ bgcolor: '#E8F5E9', height: '48px' }}>
              {camposEditables.filter(c => c.key !== 'Muestra').map(campo => (
                <TableCell
                  key={campo.key}
                  sx={{
                    width: campo.width,
                    textAlign: 'center',
                    padding: '4px'
                  }}
                >
                  {campo.tipo === 'numero' ? (
                    <TextField
                      type="number"
                      size="small"
                      placeholder="Max"
                      value={valoresMaxLote[campo.key] ?? ''}
                      onChange={(e) => setValoresMaxLote({
                        ...valoresMaxLote,
                        [campo.key]: e.target.value
                      })}
                      sx={{
                        width: '100%',
                        '& input': {
                          fontSize: '0.875rem',
                          padding: '4px',
                          textAlign: 'center',
                          bgcolor: 'white'
                        }
                      }}
                      inputProps={{ step: campo.key === 'AlturaPlanta' ? 0.1 : 1, min: 0 }}
                    />
                  ) : '-'}
                </TableCell>
              ))}
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  };
  // Tabla de promedios por LOTE + promedio general del turno
  const renderTablaTurnoConLotes = (semanaData, tipo) => {
    if (!semanaData || !semanaData.lotes || semanaData.lotes.length === 0) {
      return <Alert severity="info">No hay datos disponibles</Alert>;
    }

    const color = '#CD0A0A';

    return (
      <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: 'max-content' }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{
              fontWeight: 700,
              bgcolor: color,
              color: 'white',
              width: 100,
              minWidth: 100,
              position: 'sticky',
              top: 0,
              zIndex: 3,
              textAlign: 'center'
            }}>
              Lote
            </TableCell>

            <TableCell sx={{
              fontWeight: 700,
              bgcolor: color,
              color: 'white',
              width: 110,
              minWidth: 110,
              position: 'sticky',
              top: 0,
              zIndex: 3,
              textAlign: 'center'
            }}>
              Fecha
            </TableCell>

            {camposEditables.filter(c => c.key !== 'Muestra').map(campo => (
              <TableCell
                key={campo.key}
                sx={{
                  fontWeight: 700,
                  bgcolor: color,
                  color: 'white',
                  width: campo.width,
                  minWidth: campo.width,
                  textAlign: 'center',
                  position: 'sticky',
                  top: 0,
                  zIndex: 3
                }}
              >
                {campo.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Filas de cada lote */}
          {semanaData.lotes.map((lote, idx) => (
            <TableRow key={lote.idLote} sx={{
              bgcolor: idx % 2 === 0 ? 'white' : 'rgba(0,0,0,0.02)',
              height: '48px',
              '&:hover': { bgcolor: 'rgba(205, 10, 10, 0.05)' }
            }}>
              <TableCell sx={{
                width: 100,
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}>
                {lote.Lote}
              </TableCell>

              <TableCell sx={{
                width: 110,
                textAlign: 'center',
                fontSize: '0.9rem'
              }}>
                {lote.fecha ? new Date(lote.fecha + 'T00:00:00').toLocaleDateString('es-PE') : '-'}
              </TableCell>

              {camposEditables.filter(c => c.key !== 'Muestra').map(campo => (
                <TableCell
                  key={campo.key}
                  sx={{
                    width: campo.width,
                    textAlign: 'center',
                    fontSize: '0.9rem'
                  }}
                >
                  {campo.tipo === 'numero' ? (lote.promedios[campo.key] ?? '0.00') : '-'}
                </TableCell>
              ))}
            </TableRow>
          ))}

          {/* Fila de PROMEDIO GENERAL DEL TURNO (sticky) */}
          <TableRow sx={{
            bgcolor: color,
            position: 'sticky',
            bottom: 0,
            zIndex: 10,
            boxShadow: '0px -2px 8px rgba(0,0,0,0.15)'
          }}>
            <TableCell sx={{
              fontWeight: 700,
              color: 'white',
              fontSize: '1rem',
              textAlign: 'center'
            }}>
              TURNO
            </TableCell>

            <TableCell sx={{
              fontWeight: 700,
              color: 'white',
              fontSize: '1rem',
              textAlign: 'center'
            }}>
              -
            </TableCell>

            {camposEditables.filter(c => c.key !== 'Muestra').map(campo => (
              <TableCell
                key={campo.key}
                sx={{
                  fontWeight: 700,
                  color: 'white',
                  fontSize: '0.95rem',
                  textAlign: 'center'
                }}
              >
                {campo.tipo === 'numero' ? (semanaData.promedioGeneral[campo.key] ?? '0.00') : '-'}
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    );
  };


  const renderTablaModal = (datos, promedios, editable = false) => {
    if (!datos || datos.length === 0) {
      return <Alert severity="info">No hay datos disponibles</Alert>;
    }

    return (
      <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: 'max-content' }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{
              fontWeight: 700,
              bgcolor: editable ? '#4CAF50' : '#CD0A0A',
              color: 'white',
              width: 50,
              minWidth: 50,
              maxWidth: 50,
              position: 'sticky',
              top: 0,
              zIndex: 3,
              textAlign: 'center'
            }}>
              #
            </TableCell>
            <TableCell sx={{
              fontWeight: 700,
              bgcolor: editable ? '#4CAF50' : '#CD0A0A',
              color: 'white',
              width: 110,
            }}>
              Fecha
            </TableCell>
            <TableCell sx={{
              fontWeight: 700,
              bgcolor: editable ? '#4CAF50' : '#CD0A0A',
              color: 'white',
              width: 198,
              minWidth: 198,
              maxWidth: 198,
              position: 'sticky',
              top: 0,
              zIndex: 3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              Evaluador
            </TableCell>
            {camposEditables.map(campo => (
              <TableCell
                key={campo.key}
                sx={{
                  fontWeight: 700,
                  bgcolor: editable ? '#4CAF50' : '#CD0A0A',
                  color: 'white',
                  width: campo.width,
                  minWidth: campo.width,
                  textAlign: 'center',
                  position: 'sticky',
                  top: 0,
                  zIndex: 3
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
                bgcolor: idx % 2 === 0 ? 'white' : 'rgba(0,0,0,0.02)',
                '&:hover': { bgcolor: editable ? 'rgba(76, 175, 80, 0.08)' : 'rgba(205, 10, 10, 0.05)' },
                height: '48px',
                '& td': {
                  height: '48px',
                  maxHeight: '48px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  padding: '4px 8px'
                }
              }}
            >
              <TableCell sx={{
                width: 50,
                minWidth: 50,
                maxWidth: 50,
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: '#666'
              }}>
                {idx + 1}
              </TableCell>
              <TableCell sx={{
                width: 110,
                minWidth: 110,
                maxWidth: 110,
                fontSize: '0.875rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {registro.Fecha.split('T')[0].split('-').reverse().join('/')}
              </TableCell>
              <TableCell sx={{
                width: 198,
                minWidth: 198,
                maxWidth: 198,
                fontSize: '0.85rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {registro.Nombre}
              </TableCell>
              {camposEditables.map(campo => (
                <TableCell
                  key={campo.key}
                  sx={{
                    width: campo.width,
                    minWidth: campo.width,
                    maxWidth: campo.width,
                    textAlign: 'center',
                    padding: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
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
                        }
                      }}
                      inputProps={{
                        step: campo.key === 'AlturaPlanta' ? 0.1 : 1,
                        min: 0
                      }}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                      {registro[campo.key] ?? '-'}
                    </Typography>
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}

          {/* Fila de promedios STICKY */}
          <TableRow sx={{
            bgcolor: editable ? '#4CAF50' : '#CD0A0A',
            position: 'sticky',
            bottom: 0,
            zIndex: 10,
            boxShadow: '0px -2px 8px rgba(0,0,0,0.15)'
          }}>
            <TableCell colSpan={3} sx={{
              fontWeight: 700,
              color: 'white',
              fontSize: '1rem',
              position: 'sticky',
              bottom: 0,
              bgcolor: editable ? '#4CAF50' : '#CD0A0A'
            }}>
              PROMEDIOS
            </TableCell>
            {camposEditables.map(campo => (
              <TableCell
                key={campo.key}
                sx={{
                  fontWeight: 700,
                  color: 'white',
                  fontSize: '0.95rem',
                  textAlign: 'center',
                  position: 'sticky',
                  bottom: 0,
                  bgcolor: editable ? '#4CAF50' : '#CD0A0A'
                }}
              >
                {campo.tipo === 'numero' ? (promedios[campo.key] ?? '0.00') : '-'}
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    );
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#F1F3DE', minHeight: 'calc(100vh - 80px)', position: 'relative' }}>

      {/* Botón flotante Volver al Inicio */}
      <IconButton
        onClick={() => window.location.href = '/'}
        sx={{
          position: 'fixed',
          top: 90,
          left: 20,
          bgcolor: '#CD0A0A',
          color: 'white',
          width: 56,
          height: 56,
          boxShadow: '0px 4px 12px rgba(205, 10, 10, 0.3)',
          zIndex: 1000,
          '&:hover': {
            bgcolor: '#EC0101',
            transform: 'scale(1.1)',
            transition: 'all 0.3s ease'
          }
        }}
      >
        <HomeIcon sx={{ fontSize: 28 }} />
      </IconButton>
      {/* Header con branding */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          background: 'linear-gradient(135deg, #CD0A0A 0%, #EC0101 100%)',
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
          <SpaIcon sx={{ fontSize: 40 }} />
          Fenología - Edición de Datos
        </Typography>
        <Typography variant="body1" sx={{ color: 'white', opacity: 0.95, fontWeight: 500 }}>
          Corrección de registros de evaluación fenológica por lote
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
        minHeight: '360px',
        alignItems: 'start'
      }}>

        {/* COLUMNA 1: Selectores */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            borderRadius: 3,
            border: '1px solid #E0E0E0',
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(10px)',
            height: '360px',
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
                bgcolor: '#CD0A0A',
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
                {modulos.map((mod) => (
                  <MenuItem
                    key={mod.idModulo}
                    value={mod.idModulo}
                    sx={{
                      // Lógica de color: si es rojo, aplicamos fondo suave y texto rojo
                      backgroundColor: mod.Color === 'rojo' ? '#ffebee !important' : 'inherit',
                      color: mod.Color === 'rojo' ? '#d32f2f' : 'inherit',
                      fontWeight: mod.Color === 'rojo' ? 'bold' : 'normal',
                      '&:hover': {
                        backgroundColor: mod.Color === 'rojo' ? '#ffcdd2 !important' : '#f5f5f5'
                      }
                    }}
                  >
                    {mod.Modulo} {mod.Color === 'rojo' && '⚠️'}
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
                  <MenuItem
                    key={turno.idTurno}
                    value={turno.idTurno}
                    sx={{
                      // Aplicamos el color rojo si el backend lo indica
                      backgroundColor: turno.Color === 'rojo' ? '#ffebee !important' : 'inherit',
                      color: turno.Color === 'rojo' ? '#d32f2f' : 'inherit',
                      fontWeight: turno.Color === 'rojo' ? 'bold' : 'normal',
                      '&:hover': {
                        backgroundColor: turno.Color === 'rojo' ? '#ffcdd2 !important' : '#f5f5f5'
                      }
                    }}
                  >
                    {turno.Turno} {turno.SubTurno ? `- ${turno.SubTurno}` : ''}
                    {turno.Color === 'rojo' && ' ⚠️'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* COLUMNA 2: Lotes - SIEMPRE VISIBLE */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            borderRadius: 3,
            border: '1px solid #E0E0E0',
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(10px)',
            height: '360px',
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
                bgcolor: '#CD0A0A',
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
                    bgcolor: selectedLote?.idLote === lote.idLote
                      ? (lote.Color === 'rojo' ? '#CD0A0A' : '#4CAF50')
                      : (lote.Color === 'rojo' ? '#FFCDD2' : '#C8E6C9'),
                    color: selectedLote?.idLote === lote.idLote ? 'white' : '#424242',
                    border: 'none',
                    '&:hover': {
                      bgcolor: lote.Color === 'rojo' ? '#B71C1C' : '#45A049',
                      color: 'white',
                      transform: 'scale(1.05)',
                      boxShadow: '0px 4px 12px rgba(0,0,0,0.2)',
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

        {/* COLUMNA 3: Info Lote - SIEMPRE VISIBLE */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 3,
            background: selectedLote
              ? 'linear-gradient(135deg, rgba(227, 24, 55, 0.05) 0%, rgba(183, 28, 28, 0.05) 100%)'
              : 'rgba(0,0,0,0.02)',
            border: selectedLote ? '2px solid #CD0A0A' : '1px solid #E0E0E0',
            height: '360px',
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
                    bgcolor: '#CD0A0A',
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
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#CD0A0A', mb: 2 }}>
                  {moduloNombre} | {turnoNombre} | {selectedLote.Lote}
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

              {/* 3 Botones para abrir modales */}
              {datosFenologia && (
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(205, 10, 10, 0.2)', display: 'flex', gap: 1 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="small"
                    onClick={async () => {
                      await cargarDatosNivelTurno(selectedTurno);
                      setModalTipo('turno');
                      setModalAbierto(true);
                    }}
                    sx={{ bgcolor: '#CD0A0A', '&:hover': { bgcolor: '#B71C1C' }, fontSize: '0.75rem', py: 1 }}
                  >
                    📊 Turno
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    size="small"
                    onClick={async () => {
                      await cargarDatosNivelLote(selectedLote.idLote);
                      setModalTipo('lote');
                      setModalAbierto(true);
                    }}
                    sx={{ bgcolor: '#CD0A0A', '&:hover': { bgcolor: '#B71C1C' }, fontSize: '0.75rem', py: 1 }}
                  >
                    📊 Lote
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    size="small"
                    onClick={() => {
                      setModalTipo('muestra');
                      setModalAbierto(true);
                    }}
                    sx={{ bgcolor: '#CD0A0A', '&:hover': { bgcolor: '#B71C1C' }, fontSize: '0.75rem', py: 1 }}
                  >
                    📊 Muestra
                  </Button>
                </Box>
              )}
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

      {/* Datos de Fenología - REMOVIDO, ahora solo en modal */}
      {false && datosFenologia && !loading && (
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
                datosFenologia.penultimaSemana.datos,
                datosFenologia.penultimaSemana.promedios,
                false,
                "Datos Bloqueados",
                datosFenologia.penultimaSemana.semana
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
                datosFenologia.ultimaSemana.datos,
                promediosDinamicos,
                true,
                "Datos Editables",
                datosFenologia.ultimaSemana.semana
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

      {/* Modal de Comparación de Tablas */}
      <Dialog
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            width: '90vw',
            height: '92vh',
            maxHeight: '92vh',
            m: 'auto'
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: '#CD0A0A',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2
        }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
            {modalTipo === 'turno' && `Fundo: ${fundos.find(f => f.idFundo == selectedFundo)?.Fundo} | Módulo: ${moduloNombre} | Turno: ${turnoNombre}`}
            {modalTipo === 'lote' && `Fundo: ${fundos.find(f => f.idFundo == selectedFundo)?.Fundo} | Módulo: ${moduloNombre} | Turno: ${turnoNombre}`}
            {modalTipo === 'muestra' && `Fundo: ${fundos.find(f => f.idFundo == selectedFundo)?.Fundo} | Módulo: ${moduloNombre} | Turno: ${turnoNombre} | Lote: ${selectedLote?.Lote}`}
          </Typography>
          <IconButton
            onClick={() => setModalAbierto(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{
          p: 0,
          bgcolor: '#F1F3DE',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(95vh - 80px)',
          overflow: 'hidden'
        }}>
          {/* MODAL TIPO MUESTRA */}
          {modalTipo === 'muestra' && datosFenologia && (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflow: 'hidden'
            }}>
              <Box sx={{
                overflowX: 'auto',
                overflowY: 'hidden',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                '&::-webkit-scrollbar': {
                  height: '14px'
                },
                '&::-webkit-scrollbar-track': {
                  background: '#E0E0E0',
                  borderRadius: '7px'
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#CD0A0A',
                  borderRadius: '7px',
                  '&:hover': {
                    background: '#B71C1C'
                  }
                }
              }}>
                <Box sx={{
                  p: 3,
                  minWidth: 'max-content',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  height: '100%',
                  overflow: 'hidden'
                }}>

                  {/* Penúltima Semana */}
                  <Paper elevation={3} sx={{
                    bgcolor: '#FFE5E5',
                    overflow: 'hidden',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, pb: 1 }}>
                      <LockIcon sx={{ color: '#CD0A0A' }} />
                      <Chip label={`Semana ${datosFenologia.penultimaSemana.semana}`} sx={{ bgcolor: '#CD0A0A', color: 'white', fontWeight: 600 }} />
                      <Typography variant="caption" sx={{ color: '#666' }}>Solo Lectura</Typography>
                    </Box>
                    <Box sx={{
                      flex: 1,
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      position: 'relative',

                    }}>
                      <TableContainer sx={{ maxHeight: '100%' }}>
                        {renderTablaModal(
                          datosFenologia.penultimaSemana.datos,
                          datosFenologia.penultimaSemana.promedios,
                          false
                        )}
                      </TableContainer>
                    </Box>
                  </Paper>

                  {/* Última Semana */}
                  <Paper elevation={3} sx={{
                    bgcolor: '#E8F5E9',
                    overflow: 'hidden',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, pb: 1 }}>
                      <EditIcon sx={{ color: '#4CAF50' }} />
                      <Chip label={`Semana ${datosFenologia.ultimaSemana.semana}`} sx={{ bgcolor: '#4CAF50', color: 'white', fontWeight: 600 }} />
                      <Typography variant="caption" sx={{ color: '#666' }}>Editable</Typography>
                    </Box>
                    <Box sx={{
                      flex: 1,
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      position: 'relative',

                    }}>
                      <TableContainer sx={{ maxHeight: '100%' }}>
                        {renderTablaModal(
                          datosFenologia.ultimaSemana.datos,
                          promediosDinamicos,
                          true
                        )}
                      </TableContainer>
                    </Box>
                  </Paper>

                  {/* Botón Guardar + Botones de navegación */}
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center', pt: 2 }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={async () => {
                        await cargarDatosNivelTurno(selectedTurno);
                        setModalTipo('turno');
                      }}
                      sx={{ bgcolor: '#CD0A0A', '&:hover': { bgcolor: '#B71C1C' }, minWidth: 150 }}
                    >
                      📊 Ver Nivel Turno
                    </Button>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={async () => {
                        await cargarDatosNivelLote(selectedLote.idLote);
                        setModalTipo('lote');
                      }}
                      sx={{ bgcolor: '#EC0101', '&:hover': { bgcolor: '#CD0A0A' }, minWidth: 150 }}
                    >
                      📊 Ver Nivel Lote
                    </Button>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<SaveIcon />}
                      onClick={guardarCambios}
                      disabled={loading || Object.keys(datosEditados).length === 0}
                      sx={{
                        bgcolor: '#4CAF50',
                        '&:hover': { bgcolor: '#45A049' },
                        minWidth: 200
                      }}
                    >
                      {Object.keys(datosEditados).length > 0
                        ? `Guardar Cambios (${Object.keys(datosEditados).length})`
                        : 'Guardar Cambios'
                      }
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          {/* MODAL TIPO TURNO - SOLO PROMEDIOS */}
          {modalTipo === 'turno' && datosNivelTurno && (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflow: 'hidden'
            }}>
              <Box sx={{
                overflowX: 'auto',
                overflowY: 'hidden',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                '&::-webkit-scrollbar': {
                  height: '14px'
                },
                '&::-webkit-scrollbar-track': {
                  background: '#E0E0E0',
                  borderRadius: '7px'
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#CD0A0A',
                  borderRadius: '7px',
                  '&:hover': {
                    background: '#B71C1C'
                  }
                }
              }}>
                <Box sx={{
                  p: 3,
                  minWidth: 'max-content',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  height: '100%',
                  overflow: 'hidden'
                }}>

                  {/* Lotes del Turno */}
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#CD0A0A' }}>
                      Lotes del Turno {turnoNombre}
                    </Typography>
                    <Box sx={{
                      display: 'flex',
                      gap: 1,
                      flexWrap: 'wrap',
                      justifyContent: 'center'
                    }}>
                      {lotes.map(lote => (
                        <Chip
                          key={lote.idLote}
                          label={lote.Lote}
                          onClick={async () => {
                            setSelectedLote(lote);
                            await cargarDatosNivelLote(lote.idLote);
                            setModalTipo('lote');
                          }}
                          sx={{
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            height: '36px',
                            fontWeight: 500,
                            bgcolor: lote.Color === 'rojo' ? '#FFCDD2' : '#C8E6C9',
                            color: '#424242',
                            border: 'none',
                            '&:hover': {
                              bgcolor: lote.Color === 'rojo' ? '#B71C1C' : '#45A049',
                              color: 'white',
                              transform: 'scale(1.05)',
                              transition: 'all 0.3s ease'
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Penúltima Semana */}
                  <Paper elevation={3} sx={{
                    bgcolor: '#FFE5E5',
                    overflow: 'hidden',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, pb: 1 }}>
                      <LockIcon sx={{ color: '#CD0A0A' }} />
                      <Chip label={`Semana ${datosNivelTurno.penultimaSemana.semana}`} sx={{ bgcolor: '#CD0A0A', color: 'white', fontWeight: 600 }} />
                      <Typography variant="body2" sx={{ color: '#666', fontSize: '1rem', fontWeight: 'bold' }}>
                        Promedio de todos los lotes del turno
                      </Typography>
                    </Box>
                    <Box sx={{
                      flex: 1,
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      position: 'relative',
                      '&::-webkit-scrollbar': { width: '8px' },
                      '&::-webkit-scrollbar-track': { background: '#f1f1f1' },
                      '&::-webkit-scrollbar-thumb': { background: '#CD0A0A', borderRadius: '4px' }
                    }}>
                      <TableContainer>
                        {renderTablaTurnoConLotes(datosNivelTurno.penultimaSemana, 'turno')}
                      </TableContainer>
                    </Box>
                  </Paper>

                  {/* Última Semana */}
                  <Paper elevation={3} sx={{
                    bgcolor: '#FFE5E5',
                    overflow: 'hidden',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, pb: 1 }}>
                      <LockIcon sx={{ color: '#CD0A0A' }} />
                      <Chip label={`Semana ${datosNivelTurno.ultimaSemana.semana}`} sx={{ bgcolor: '#CD0A0A', color: 'white', fontWeight: 600 }} />
                      <Typography variant="body2" sx={{ color: '#666', fontSize: '1rem', fontWeight: 'bold' }}>
                        Promedio de todos los lotes del turno
                      </Typography>
                    </Box>
                    <Box sx={{
                      flex: 1,
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      position: 'relative',
                      '&::-webkit-scrollbar': { width: '8px' },
                      '&::-webkit-scrollbar-track': { background: '#f1f1f1' },
                      '&::-webkit-scrollbar-thumb': { background: '#CD0A0A', borderRadius: '4px' }
                    }}>
                      <TableContainer>
                        {renderTablaTurnoConLotes(datosNivelTurno.ultimaSemana, 'turno')}
                      </TableContainer>
                    </Box>
                  </Paper>

                  {/* Botones de navegación */}
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', pt: 3 }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={async () => {
                        await cargarDatosNivelLote(selectedLote.idLote);
                        setModalTipo('lote');
                      }}
                      sx={{ bgcolor: '#EC0101', '&:hover': { bgcolor: '#CD0A0A' }, minWidth: 150 }}
                    >
                      📊 Ver Nivel Lote
                    </Button>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => setModalTipo('muestra')}
                      sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#45A049' }, minWidth: 150 }}
                    >
                      📊 Ver Nivel Muestra
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          {/* MODAL TIPO LOTE - SOLO PROMEDIOS */}
          {modalTipo === 'lote' && datosNivelLote && (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflow: 'hidden'
            }}>
              <Box sx={{
                overflowX: 'auto',
                overflowY: 'hidden',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                '&::-webkit-scrollbar': {
                  height: '14px'
                },
                '&::-webkit-scrollbar-track': {
                  background: '#E0E0E0',
                  borderRadius: '7px'
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#EC0101',
                  borderRadius: '7px',
                  '&:hover': {
                    background: '#CD0A0A'
                  }
                }
              }}>
                <Box sx={{ p: 3, minWidth: 'max-content', display: 'flex', flexDirection: 'column', gap: 0 }}>

                  {/* Lotes del Turno */}
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ mb: 0.5, fontWeight: 600, color: '#CD0A0A', fontSize: '0.9rem' }}>
                      Lotes del Turno {turnoNombre}
                    </Typography>
                    <Box sx={{
                      display: 'flex',
                      gap: 1.5,
                      flexWrap: 'wrap'
                    }}>
                      {lotes.map(lote => (
                        <Chip
                          key={lote.idLote}
                          label={lote.Lote}
                          onClick={async () => {
                            setSelectedLote(lote);
                            await cargarDatosNivelLote(lote.idLote);
                            setModalTipo('lote');
                          }}
                          sx={{
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            height: '36px',
                            fontWeight: 500,
                            bgcolor: lote.Color === 'rojo' ? '#FFCDD2' : '#C8E6C9',
                            color: '#424242',
                            border: 'none',
                            '&:hover': {
                              bgcolor: lote.Color === 'rojo' ? '#B71C1C' : '#45A049',
                              color: 'white',
                              transform: 'scale(1.05)',
                              transition: 'all 0.3s ease'
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Penúltima Semana */}
                  <Paper elevation={3} sx={{ bgcolor: '#FFEBEE', p: 2, mt: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <LockIcon sx={{ color: '#EC0101' }} />
                      <Chip label={`Semana ${datosNivelLote.penultimaSemana.semana}`} sx={{ bgcolor: '#EC0101', color: 'white', fontWeight: 600 }} />
                      <Typography variant="subtitle1" sx={{ mb: 0.5, fontWeight: 600, color: '#CD0A0A', fontSize: '0.9rem' }}> Promedio de todas las muestras del Lote {selectedLote?.Lote}
                      </Typography>
                    </Box>
                    <TableContainer>
                      {renderTablaPromedios(datosNivelLote.penultimaSemana.promedios, 'lote', false)}
                    </TableContainer>
                  </Paper>

                  {/* Última Semana */}
                  <Paper elevation={3} sx={{ bgcolor: '#FFEBEE', p: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <LockIcon sx={{ color: '#EC0101' }} />
                      <Chip label={`Semana ${datosNivelLote.ultimaSemana.semana}`} sx={{ bgcolor: '#EC0101', color: 'white', fontWeight: 600 }} />
                      <Typography variant="body1" sx={{ color: '#666', fontWeight: 600 }}> Promedio de todas las muestras del Lote {selectedLote?.Lote}
                      </Typography>
                    </Box>
                    <TableContainer>
                      {renderTablaPromedios(datosNivelLote.ultimaSemana.promedios, 'lote', false)}
                    </TableContainer>
                  </Paper>

                  {/* Botones unificados */}
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', pt: 2 }}>
                    {!modoEdicionLote ? (
                      <>
                        {/* Ver Nivel Turno */}
                        <Button
                          variant="contained"
                          size="large"
                          onClick={async () => {
                            await cargarDatosNivelTurno(selectedTurno);
                            setModalTipo('turno');
                          }}
                          sx={{ bgcolor: '#CD0A0A', '&:hover': { bgcolor: '#B71C1C' }, minWidth: 150 }}
                        >
                          📊 Ver Nivel Turno
                        </Button>

                        {/* Editar Promedios */}
                        <Button
                          variant="contained"
                          size="large"
                          startIcon={<EditIcon />}
                          onClick={() => setModoEdicionLote(true)}
                          disabled={!loteEsEditable}
                          sx={{
                            bgcolor: loteEsEditable ? '#FF9800' : '#BDBDBD',
                            '&:hover': { bgcolor: loteEsEditable ? '#F57C00' : '#BDBDBD' },
                            minWidth: 200
                          }}
                        >
                          {loteEsEditable ? 'Editar Promedios' : '🔒 No Editable'}
                        </Button>

                        {/* Ver Nivel Muestra */}
                        <Button
                          variant="contained"
                          size="large"
                          onClick={() => setModalTipo('muestra')}
                          sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#45A049' }, minWidth: 150 }}
                        >
                          📊 Ver Nivel Muestra
                        </Button>
                      </>
                    ) : (
                      <>
                        {/* Guardar y Distribuir */}
                        <Button
                          variant="contained"
                          size="large"
                          startIcon={<SaveIcon />}
                          onClick={guardarCambiosPromediosLote}
                          disabled={Object.keys(promediosEditadosLote).length === 0}
                          sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#45A049' }, minWidth: 250 }}
                        >
                          Guardar y Distribuir ({Object.keys(promediosEditadosLote).length})
                        </Button>

                        {/* Cancelar */}
                        <Button
                          variant="outlined"
                          size="large"
                          onClick={() => {
                            setModoEdicionLote(false);
                            setPromediosEditadosLote({});
                            setValoresMinLote({});
                            setValoresMaxLote({});
                          }}
                          sx={{ minWidth: 150 }}
                        >
                          Cancelar
                        </Button>
                      </>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
      {/* Footer */}
      <Box
        component="footer"
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          py: 1.5,
          px: 2,
          bgcolor: '#CD0A0A',
          boxShadow: '0px -2px 10px rgba(0,0,0,0.1)',
          zIndex: 999,
        }}
      >
        <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
          © 2026 Sistema de Proyecciones Agrícolas Pimiento
        </Typography>
      </Box>
    </Box>
  );
}

export default Fenologia;