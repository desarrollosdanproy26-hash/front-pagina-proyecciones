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
  Checkbox,
  FormControlLabel
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';

//const API_URL = 'http://localhost:5000/api';
const API_URL = "http://portal-web-proyecciones-apipagina-ecn8tf-ddab49-147-93-190-116.traefik.me/api";


function Fenologia() {
  const [fundos, setFundos] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [turnos, setTurnos] = useState([]);

  const [selectedFundo, setSelectedFundo] = useState('');
  const [selectedModulo, setSelectedModulo] = useState('');
  const [selectedTurno, setSelectedTurno] = useState('');

  const [datosTurno, setDatosTurno] = useState(null);
  const [variedad, setVariedad] = useState('');
  const [moduloNombre, setModuloNombre] = useState('');
  const [turnoNombre, setTurnoNombre] = useState('');

  const [modoEdicionTurno, setModoEdicionTurno] = useState(false);
  const [promediosEditadosTurno, setPromediosEditadosTurno] = useState({});
  const [valoresMinTurno, setValoresMinTurno] = useState({});
  const [valoresMaxTurno, setValoresMaxTurno] = useState({});
  const [promediosEditadosPorLote, setPromediosEditadosPorLote] = useState({});

  const [modalLoteAbierto, setModalLoteAbierto] = useState(false);
  const [datosLote, setDatosLote] = useState(null);
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);

  const [modoEdicionLote, setModoEdicionLote] = useState(false);
  const [promediosEditadosLote, setPromediosEditadosLote] = useState({});
  const [valoresMinLote, setValoresMinLote] = useState({});
  const [valoresMaxLote, setValoresMaxLote] = useState({});

  const [modalMuestraAbierto, setModalMuestraAbierto] = useState(false);
  const [datosMuestra, setDatosMuestra] = useState(null);
  const [datosEditados, setDatosEditados] = useState({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const camposEditables = [
    { key: 'AlturaPlanta', label: 'Alt. Planta', width: 110 },
    { key: 'Botones', label: 'Botones', width: 100 },
    { key: 'Flores', label: 'Flores', width: 100 },
    { key: 'Cuajas', label: 'Cuajas', width: 100 },
    { key: 'PreCuajas', label: 'Pre Cuajas', width: 100 },
    { key: 'CuajaDeforme', label: 'Cuaja Def.', width: 100 },
    { key: 'CuajasDañoAlternaria', label: 'C. Daño Alt.', width: 100 },
    { key: 'CuajaDañoProdi', label: 'C. Daño Prod.', width: 100 },
    { key: 'FrutoNivel1', label: 'Frutos', width: 100 },
    { key: 'FrutosQuemados', label: 'F. Quemados', width: 100 },
    { key: 'FrutosDeformes', label: 'F. Deformes', width: 100 },
    { key: 'DeformeLeve', label: 'Def. Leve', width: 100 },
    { key: 'TipoAji', label: 'Tipo Ají', width: 100 },
    { key: 'FormaAji', label: 'Forma Ají', width: 100 },
    { key: 'DañoAlternaria', label: 'Daño Alt.', width: 100 },
    { key: 'DañoProdiplosis', label: 'Daño Prod.', width: 100 },
    { key: 'FrutosDescompuestos', label: 'F. Descomp.', width: 100 },
    { key: 'DiametroMenor', label: 'Diám. Men.', width: 100 },
    { key: 'DañoRoedores', label: 'Daño Roed.', width: 100 },
    { key: 'DañoPajaros', label: 'Daño Páj.', width: 100 }
  ];
  // CAMPOS DE CONTEOS (NO EDITABLES, SOLO VISTA)
  const camposConteos = [
    { key: 'VI', label: 'VI', width: 80 },
    { key: 'VT', label: 'VT', width: 80 },
    { key: 'MARRON', label: 'MARRÓN', width: 90 },
    { key: 'PINTON', label: 'PINTÓN', width: 90 },
    { key: 'ROJO', label: 'ROJO', width: 80 },
    { key: 'FRUTO_VIABLE', label: 'FRUTO VIABLE', width: 120 },
    { key: 'FRUTO_COSECHABLE', label: 'FRUTO COSECH.', width: 120 },
    { key: 'DESCARTE', label: 'DESCARTE', width: 100 },
    { key: 'FRUTOS_TOTALES', label: 'FRUTOS TOT.', width: 110 }
  ];

  const validarDatosEdicion = () => {
    const errores = [];
    const camposEditados = new Set(
      Object.keys(promediosEditadosPorLote).map(key => key.split('_')[1])
    );


    camposEditados.forEach(campo => {
      const min = parseFloat(valoresMinTurno[campo] || 0);
      const max = parseFloat(valoresMaxTurno[campo] || 0);

      if (!valoresMinTurno[campo] || !valoresMaxTurno[campo]) {
        errores.push(`❌ ${campo}: Debes definir MIN y MAX`);
        return;
      }

      if (min >= max) {
        errores.push(`❌ ${campo}: MIN (${min}) debe ser menor que MAX (${max})`);
      }

      Object.entries(promediosEditadosPorLote).forEach(([key, valor]) => {
        if (key.endsWith(`_${campo}`)) {
          const promLote = parseFloat(valor);
          const loteNombre = key.split('_')[0];

          if (min > promLote) {
            errores.push(`❌ ${campo} (Lote ${loteNombre}): MIN (${min}) no puede ser mayor que promedio (${promLote})`);
          }

          if (max < promLote) {
            errores.push(`❌ ${campo} (Lote ${loteNombre}): MAX (${max}) no puede ser menor que promedio (${promLote})`);
          }
        }
      });

      const limites = {
        'AlturaPlanta': 200,
        'Botones': 200,
        'Flores': 100,
        'Cuajas': 100
      };

      if (limites[campo] && max > limites[campo]) {
        errores.push(`⚠️ ${campo}: MAX (${max}) excede límite físico de ${limites[campo]}`);
      }

      if (campo === 'AlturaPlanta' && (max - min) > 50) {
        errores.push(`⚠️ AlturaPlanta: Rango de ${(max - min).toFixed(1)} cm es muy amplio`);
      }
    });

    return errores;
  };

  const calcularCamposConteos = (datos) => {
    const n_frutos = parseFloat(datos.FrutoNivel1) || 0;
    const vi = parseFloat(datos.VI) || 0;
    const vt = parseFloat(datos.VT) || 0;
    const m30 = parseFloat(datos.M30) || 0;
    const m50 = parseFloat(datos.M50) || 0;
    const m75 = parseFloat(datos.M75) || 0;
    const p30 = parseFloat(datos.P30) || 0;
    const p50 = parseFloat(datos.P50) || 0;
    const p75 = parseFloat(datos.P75) || 0;
    const vmp30 = parseFloat(datos.VMP30) || 0;
    const vmp50 = parseFloat(datos.VMP50) || 0;
    const vmp75 = parseFloat(datos.VMP75) || 0;
    const pn = parseFloat(datos.PN) || 0;
    const np = parseFloat(datos.NP) || 0;
    const n = parseFloat(datos.N) || 0;
    const rm = parseFloat(datos.RM) || 0;
    const r = parseFloat(datos.R) || 0;

    // FRUTO VIABLE
    const frutoViable = n_frutos !== 0 ? n_frutos :
      vi + vt + m30 + m50 + m75 + p30 + p50 + p75 + vmp30 + vmp50 + vmp75 + pn + np + n + rm + r;

    // MARRÓN, PINTÓN, ROJO
    const marron = m30 + m50 + m75 + rm;
    const pinton = p30 + p50 + p75 + pn;
    const rojo = r + n;

    // FRUTO COSECHABLE
    const craking = parseFloat(datos.Craking) || 0;
    const rajL = parseFloat(datos.RajL) || 0;
    const deforL = parseFloat(datos.DeformeLeve) || 0;
    const tipoAji = parseFloat(datos.TipoAji) || 0;
    const deshL = parseFloat(datos.DeshL) || 0;
    const rajMod = parseFloat(datos.RajMod) || 0;

    const frutoCosechable = frutoViable + craking + rajL + deforL + tipoAji + deshL + rajMod;

    // DESCARTE
    const deforS = parseFloat(datos.FrutosDeformes) || 0;
    const alternaria = parseFloat(datos.DañoAlternaria) || 0;
    const descomp = parseFloat(datos.FrutosDescompuestos) || 0;
    const pajaro = parseFloat(datos.DañoPajaros) || 0;
    const roedores = parseFloat(datos.DañoRoedores) || 0;
    const rajS = parseFloat(datos.RajS) || 0;
    const deshS = parseFloat(datos.DeshS) || 0;
    const formaAji = parseFloat(datos.FormaAji) || 0;
    const diaMenor = parseFloat(datos.DiametroMenor) || 0;
    const quemado = parseFloat(datos.FrutosQuemados) || 0;
    const virus = parseFloat(datos.Virus) || 0;
    const trips = parseFloat(datos.Trips) || 0;
    const pudBasal = parseFloat(datos.PudBasal) || 0;
    const defCalcio = parseFloat(datos.DeficienciaCalcio) || 0;

    const descarte = deforS + alternaria + descomp + pajaro + roedores + rajMod + rajS + deshS + formaAji + diaMenor + quemado + virus + trips + pudBasal + virus + defCalcio;

    // FRUTOS TOTALES
    const frutosTotales = frutoCosechable + descarte;

    return {
      VI: vi.toFixed(2),
      VT: vt.toFixed(2),
      MARRON: marron.toFixed(2),
      PINTON: pinton.toFixed(2),
      ROJO: rojo.toFixed(2),
      FRUTO_VIABLE: frutoViable.toFixed(2),
      FRUTO_COSECHABLE: frutoCosechable.toFixed(2),
      DESCARTE: descarte.toFixed(2),
      FRUTOS_TOTALES: frutosTotales.toFixed(2)
    };
  };

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

  const cargarFundos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/fenologia/fundos`, getAuthHeaders());
      setFundos(response.data.data);
    } catch (err) {
      setError('Error al cargar fundos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarModulos = async (idFundo, mantenerSeleccion = false) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/fenologia/fundos/${idFundo}/modulos`, getAuthHeaders());
      setModulos(response.data.data);

      if (!mantenerSeleccion) {
        setTurnos([]);
        setSelectedModulo('');
        setSelectedTurno('');
        setDatosTurno(null);
      }
    } catch (err) {
      setError('Error al cargar módulos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarTurnos = async (idModulo, mantenerSeleccion = false) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/fenologia/modulos/${idModulo}/turnos`, getAuthHeaders());
      setTurnos(response.data.data);

      if (!mantenerSeleccion) {
        setSelectedTurno('');
        setDatosTurno(null);
      }
    } catch (err) {
      setError('Error al cargar turnos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarDatosTurno = async (idTurno) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/fenologia/turnos/${idTurno}/tres-semanas`, getAuthHeaders());
      setDatosTurno(response.data);
      setVariedad(response.data.variedad);
      setModuloNombre(response.data.modulo);
      setTurnoNombre(`${response.data.turno}${response.data.subturno ? ' - ' + response.data.subturno : ''}`);
    } catch (err) {
      setError('Error al cargar datos del turno: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarDatosLote = async (idLote) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/fenologia/lotes/${idLote}/tres-semanas`, getAuthHeaders());
      setDatosLote(response.data);
    } catch (err) {
      setError('Error al cargar datos del lote: ' + err.message);
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
    }
  };

  const handleModuloChange = (e) => {
    const idModulo = e.target.value;
    setSelectedModulo(idModulo);
    if (idModulo) {
      cargarTurnos(idModulo);
    } else {
      setTurnos([]);
    }
  };

  const handleTurnoChange = (e) => {
    const idTurno = e.target.value;
    setSelectedTurno(idTurno);
    if (idTurno) {
      cargarDatosTurno(idTurno);
    } else {
      setDatosTurno(null);
    }
  };

  const guardarCambiosTurno = async () => {
    if (Object.keys(promediosEditadosPorLote).length === 0) {
      alert('⚠️ No has modificado ningún promedio');
      return;
    }

    const hayAlturaPlantaCero = Object.entries(promediosEditadosPorLote).some(([key, valor]) => {
      return key.includes('_AlturaPlanta') && parseFloat(valor) === 0;
    });

    if (hayAlturaPlantaCero) {
      const confirmarCero = window.confirm(
        '⚠️ ADVERTENCIA: Has puesto AlturaPlanta en 0 en al menos un lote.\n\n' +
        'Esto pondrá TODAS las muestras de TODOS los lotes del turno en 0 para altura.\n\n' +
        '¿Estás seguro? (Esto indica que ya no se mide altura en fenología)'
      );
      if (!confirmarCero) return;
    }

    const errores = validarDatosEdicion();
    if (errores.length > 0) {
      alert('⚠️ ERRORES DE VALIDACIÓN:\n\n' + errores.join('\n\n'));
      return;
    }

    const confirmar = window.confirm(
      `¿Está seguro de editar los promedios del turno?\n\n` +
      `Esto modificará todas las muestras de todos los lotes.`
    );

    if (!confirmar) return;

    try {
      setLoading(true);

      // Agrupar promedios por lote: { idLote: { campo: valor } }
      const promedioPorLote = {};
      Object.entries(promediosEditadosPorLote).forEach(([key, valor]) => {
        const [idLote, campo] = key.split('_');
        if (!promedioPorLote[idLote]) {
          promedioPorLote[idLote] = {};
        }
        promedioPorLote[idLote][campo] = parseFloat(valor);
      });

      // Llamar al endpoint de TURNO (una sola vez)
      await axios.put(
        `${API_URL}/fenologia/turnos/${selectedTurno}/editar-promedios`,
        {
          promediosEditados: promedioPorLote,
          valoresMin: valoresMinTurno,
          valoresMax: valoresMaxTurno
        },
        getAuthHeaders()
      );

      alert('✅ Cambios guardados exitosamente');

      // Recargar datos SIN perder selecciones
      await cargarDatosTurno(selectedTurno);
      await cargarModulos(selectedFundo, true);
      await cargarTurnos(selectedModulo, true);

      setModoEdicionTurno(false);
      setPromediosEditadosPorLote({});
      setValoresMinTurno({});
      setValoresMaxTurno({});
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const marcarSoloRevisado = async () => {
    const confirmar = window.confirm(
      '¿Marcar este turno como revisado SIN modificar datos?\n\n' +
      'La validación cambiará de 2 (rojo) a 1 (verde).'
    );

    if (!confirmar) return;

    try {
      setLoading(true);
      await axios.put(
        `${API_URL}/fenologia/turnos/${selectedTurno}/marcar-revisado`,
        {},
        getAuthHeaders()
      );

      alert('✅ Turno marcado como revisado');
      await cargarDatosTurno(selectedTurno);
      await cargarModulos(selectedFundo, true);
      await cargarTurnos(selectedModulo, true);
    } catch (err) {
      alert('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const guardarCambiosLote = async () => {
    if (Object.keys(promediosEditadosLote).length === 0) {
      alert('⚠️ No has modificado ningún promedio');
      return;
    }

    const confirmar = window.confirm(
      `¿Está seguro de editar las muestras del lote?\n\n` +
      `Esto modificará todas las muestras del lote.`
    );

    if (!confirmar) return;

    try {
      setLoading(true);
      await axios.put(
        `${API_URL}/fenologia/lotes/${loteSeleccionado.idLote}/editar-promedios`,
        {
          promediosEditados: promediosEditadosLote,
          valoresMin: valoresMinLote,
          valoresMax: valoresMaxLote
        },
        getAuthHeaders()
      );

      alert('✅ Promedios del lote actualizados correctamente');
      await cargarDatosLote(loteSeleccionado.idLote);
      await cargarDatosTurno(selectedTurno);
      setModoEdicionLote(false);
      setPromediosEditadosLote({});
      setValoresMinLote({});
      setValoresMaxLote({});
    } catch (err) {
      alert('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const guardarCambiosMuestra = async () => {
    if (Object.keys(datosEditados).length === 0) {
      alert('⚠️ No has modificado ningún dato');
      return;
    }

    const confirmar = window.confirm(
      `¿Guardar cambios en ${Object.keys(datosEditados).length} muestra(s)?`
    );

    if (!confirmar) return;

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
      alert('✅ Cambios guardados correctamente');
      await cargarDatosLote(loteSeleccionado.idLote);
      await cargarDatosTurno(selectedTurno);
      setDatosEditados({});
    } catch (err) {
      alert('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCampoChange = (registroId, campo, valor) => {
    let valorProcesado;
    if (campo === 'AlturaPlanta') {
      valorProcesado = parseFloat(valor) || 0;
    } else {
      valorProcesado = Math.round(parseFloat(valor)) || 0;
    }

    setDatosEditados({
      ...datosEditados,
      [registroId]: {
        ...(datosEditados[registroId] || {}),
        [campo]: valorProcesado
      }
    });
  };

  const renderTablaTurno = () => {
    if (!datosTurno || !datosTurno.semanas || datosTurno.semanas.length === 0) return null;

    const ultimaSemana = datosTurno.semanas[datosTurno.semanas.length - 1];
    const esEditable = ultimaSemana && ultimaSemana.editable;

    return (
      <>
        <Paper elevation={3} sx={{ mb: 2 }}>
          <TableContainer sx={{ maxHeight: '90vh', overflowX: 'auto', overflowY: 'auto' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: '#4CAF50', color: 'white', fontWeight: 700, width: 80, position: 'sticky', left: 0, zIndex: 3 }}>Semana</TableCell>
                  <TableCell sx={{ bgcolor: '#4CAF50', color: 'white', fontWeight: 700, width: 100, position: 'sticky', left: 80, zIndex: 3 }}>Lote</TableCell>
                  <TableCell sx={{ bgcolor: '#4CAF50', color: 'white', fontWeight: 700, width: 110 }}>Fecha</TableCell>
                  <TableCell sx={{ bgcolor: '#FF9800', color: 'white', fontWeight: 700, width: 100, textAlign: 'center' }}>Edad Cultivo</TableCell>
                  <TableCell sx={{ bgcolor: '#FF9800', color: 'white', fontWeight: 700, width: 100, textAlign: 'center' }}>Umbral Alt.</TableCell>
                  {camposEditables.map(campo => (
                    <TableCell key={campo.key} sx={{ bgcolor: '#4CAF50', color: 'white', fontWeight: 700, minWidth: 120, textAlign: 'center' }}>
                      {campo.label}
                    </TableCell>
                  ))}
                  {/* COLUMNAS DE CONTEOS */}
                  {camposConteos.map(campo => (
                    <TableCell key={campo.key} sx={{ bgcolor: '#2196F3', color: 'white', fontWeight: 700, minWidth: campo.width, textAlign: 'center' }}>
                      {campo.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {datosTurno.semanas.map((semana, semanaIdx) => (
                  <React.Fragment key={semana.semana}>
                    {semana.lotes.map((lote, loteIdx) => (
                      <TableRow key={`${semana.semana}-${lote.idLote}`} sx={{ bgcolor: loteIdx % 2 === 0 ? 'white' : 'rgba(0,0,0,0.02)' }}>
                        {loteIdx === 0 && (
                          <TableCell rowSpan={semana.lotes.length + 1} sx={{
                            fontWeight: 700,
                            fontSize: '1rem',
                            bgcolor: '#E8F5E9',
                            position: 'sticky',
                            left: 0,
                            zIndex: 2,
                            borderRight: '2px solid #4CAF50'
                          }}>
                            {semana.semana}
                          </TableCell>
                        )}
                        <TableCell sx={{ fontWeight: 600, position: 'sticky', left: 80, bgcolor: loteIdx % 2 === 0 ? 'white' : 'rgba(0,0,0,0.02)', zIndex: 1 }}>
                          {lote.Lote}
                        </TableCell>
                        <TableCell>{lote.fecha ? new Date(lote.fecha + 'T00:00:00').toLocaleDateString('es-PE') : '-'}</TableCell>
                        <TableCell sx={{ textAlign: 'center', fontWeight: 600, color: '#F57C00' }}>{lote.EdadCultivo || '-'}</TableCell>
                        <TableCell sx={{ textAlign: 'center', fontWeight: 600, color: '#F57C00' }}>{lote.UmbralAltura ? parseFloat(lote.UmbralAltura).toFixed(2) : '-'}</TableCell>
                        {camposEditables.map(campo => {
                          const esUltima = semanaIdx === datosTurno.semanas.length - 1;
                          const key = `${lote.idLote}_${campo.key}`;
                          return (
                            <TableCell key={campo.key} sx={{ textAlign: 'center', p: 1 }}>
                              {esUltima && semana.editable && modoEdicionTurno ? (
                                <TextField
                                  type="number"
                                  size="small"
                                  value={promediosEditadosPorLote[key] ?? lote.promedios[campo.key] ?? '0.00'}
                                  onChange={(e) => {
                                    setPromediosEditadosPorLote({
                                      ...promediosEditadosPorLote,
                                      [key]: e.target.value
                                    });
                                  }}
                                  sx={{ width: '90%', '& input': { textAlign: 'center', bgcolor: '#FFF3CD', color: '#000', fontWeight: 600 } }}
                                  inputProps={{ step: campo.key === 'AlturaPlanta' ? 0.1 : 1 }}
                                />
                              ) : (
                                lote.promedios[campo.key] || '0.00'
                              )}
                            </TableCell>
                          );
                        })}
                        {/* COLUMNAS DE CONTEOS (NO EDITABLES) */}
                        {(() => {
                          const calculados = calcularCamposConteos(lote.promedios);
                          return camposConteos.map(campo => (
                            <TableCell key={campo.key} sx={{ textAlign: 'center', bgcolor: '#E3F2FD', fontWeight: 600, color: '#1565C0' }}>
                              {calculados[campo.key] || '0.00'}
                            </TableCell>
                          ));
                        })()}
                      </TableRow>
                    ))}

                    <TableRow sx={{ bgcolor: '#4CAF50' }}>
                      <TableCell sx={{ fontWeight: 700, color: 'white', position: 'sticky', left: 80, bgcolor: '#4CAF50', zIndex: 1 }}>
                        PROMEDIO
                      </TableCell>
                      <TableCell sx={{ color: 'white' }}>-</TableCell>
                      <TableCell sx={{ color: 'white', textAlign: 'center' }}>-</TableCell>
                      <TableCell sx={{ color: 'white', textAlign: 'center' }}>-</TableCell>
                      {camposEditables.map(campo => {
                        const esUltima = semanaIdx === datosTurno.semanas.length - 1;
                        let promedioCalculado = semana.promedioGeneral[campo.key];

                        if (esUltima && modoEdicionTurno) {
                          const valoresLotes = semana.lotes.map(lote => {
                            const key = `${lote.idLote}_${campo.key}`;
                            return parseFloat(promediosEditadosPorLote[key] ?? lote.promedios[campo.key]) || 0;
                          });

                          if (valoresLotes.length > 0) {
                            const suma = valoresLotes.reduce((a, b) => a + b, 0);
                            promedioCalculado = (suma / valoresLotes.length).toFixed(2);
                          }
                        }

                        return (
                          <TableCell key={campo.key} sx={{ fontWeight: 700, color: 'white', textAlign: 'center' }}>
                            {promedioCalculado}
                          </TableCell>
                        );
                      })}
                      {/* COLUMNAS DE CONTEOS EN MISMA FILA PROMEDIO */}
                      {(() => {
                        const calculados = calcularCamposConteos(semana.promedioGeneral);
                        return camposConteos.map(campo => (
                          <TableCell key={campo.key} sx={{ fontWeight: 700, bgcolor: '#2196F3', color: 'white', textAlign: 'center' }}>
                            {calculados[campo.key] || '0.00'}
                          </TableCell>
                        ));
                      })()}
                    </TableRow>
                    {semanaIdx === datosTurno.semanas.length - 1 && semana.editable && modoEdicionTurno && (
                      <>
                        <TableRow sx={{ bgcolor: '#FFEBEE' }}>
                          <TableCell sx={{ fontWeight: 700, position: 'sticky', left: 80, bgcolor: '#FFEBEE', zIndex: 1 }}>
                            MÍNIMO
                          </TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>-</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>-</TableCell>
                          {camposEditables.map(campo => (
                            <TableCell key={campo.key} sx={{ textAlign: 'center', p: 1 }}>
                              <TextField
                                type="number"
                                size="small"
                                placeholder="Min"
                                value={valoresMinTurno[campo.key] ?? ''}
                                onChange={(e) => setValoresMinTurno({ ...valoresMinTurno, [campo.key]: e.target.value })}
                                sx={{ width: '100%', '& input': { textAlign: 'center', fontSize: '0.75rem' } }}
                                inputProps={{ step: campo.key === 'AlturaPlanta' ? 0.1 : 1 }}
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                        {/* FILA PROMEDIO CONTEOS */}
                        <TableRow sx={{ bgcolor: '#E8F5E9' }}>
                          <TableCell sx={{ fontWeight: 700, position: 'sticky', left: 80, bgcolor: '#E8F5E9', zIndex: 1 }}>
                            MÁXIMO
                          </TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>-</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>-</TableCell>
                          {camposEditables.map(campo => (
                            <TableCell key={campo.key} sx={{ textAlign: 'center', p: 1 }}>
                              <TextField
                                type="number"
                                size="small"
                                placeholder="Max"
                                value={valoresMaxTurno[campo.key] ?? ''}
                                onChange={(e) => setValoresMaxTurno({ ...valoresMaxTurno, [campo.key]: e.target.value })}
                                sx={{ width: '100%', '& input': { textAlign: 'center', fontSize: '0.75rem' } }}
                                inputProps={{ step: campo.key === 'AlturaPlanta' ? 0.1 : 1 }}
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      </>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2, mb: 2 }}>
          {esEditable && !modoEdicionTurno && (
            <>
              <Button
                variant="contained"
                size="large"
                startIcon={<EditIcon />}
                onClick={() => setModoEdicionTurno(true)}
                sx={{ bgcolor: '#FF9800', '&:hover': { bgcolor: '#F57C00' }, minWidth: 200 }}
              >
                ✏️ Editar Promedios del Turno
              </Button>
              <Button
                variant="contained"
                size="large"
                startIcon={<CheckCircleIcon />}
                onClick={marcarSoloRevisado}
                sx={{ bgcolor: '#2196F3', '&:hover': { bgcolor: '#1976D2' }, minWidth: 200 }}
              >
                ✅ Solo Revisar (Sin Cambios)
              </Button>
            </>
          )}

          {esEditable && modoEdicionTurno && (
            <>
              <Button
                variant="contained"
                size="large"
                startIcon={<SaveIcon />}
                onClick={() => {
                  const errores = validarDatosEdicion();
                  if (errores.length > 0) {
                    alert('⚠️ ERRORES DE VALIDACIÓN:\n\n' + errores.join('\n\n'));
                    return;
                  }
                  guardarCambiosTurno();
                }}
                disabled={
                  Object.keys(promediosEditadosPorLote).length === 0 ||
                  Object.keys(promediosEditadosPorLote).some(key => {
                    const campo = key.split('_')[1];
                    return !valoresMinTurno[campo] || !valoresMaxTurno[campo];
                  })
                }
                sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#45A049' }, minWidth: 250 }}
              >
                💾 Guardar y Distribuir
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => {
                  setModoEdicionTurno(false);
                  setPromediosEditadosPorLote({});
                  setValoresMinTurno({});
                  setValoresMaxTurno({});
                }}
                sx={{ minWidth: 150 }}
              >
                ❌ Cancelar
              </Button>
            </>
          )}
        </Box>
      </>
    );
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#F1F3DE', minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: '#CD0A0A', color: 'white' }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          📊 Fenología - Sistema de Edición
        </Typography>
        <Typography variant="body1">
          Corrección de registros de evaluación fenológica
        </Typography>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Fundo</InputLabel>
          <Select value={selectedFundo} onChange={handleFundoChange} label="Fundo" disabled={loading}>
            <MenuItem value=""><em>Seleccionar...</em></MenuItem>
            {fundos.map(fundo => (
              <MenuItem key={fundo.idFundo} value={fundo.idFundo}>{fundo.Fundo}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth disabled={!selectedFundo}>
          <InputLabel>Módulo</InputLabel>
          <Select value={selectedModulo} onChange={handleModuloChange} label="Módulo">
            <MenuItem value=""><em>Seleccionar...</em></MenuItem>
            {modulos.map(mod => (
              <MenuItem key={mod.idModulo} value={mod.idModulo}>
                {mod.Modulo} {mod.Color === 'rojo' && '🔴'} {mod.Color === 'verde' && '✅'}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth disabled={!selectedModulo}>
          <InputLabel>Turno</InputLabel>
          <Select value={selectedTurno} onChange={handleTurnoChange} label="Turno">
            <MenuItem value=""><em>Seleccionar...</em></MenuItem>
            {turnos.map(turno => (
              <MenuItem key={turno.idTurno} value={turno.idTurno}>
                {turno.Turno} {turno.SubTurno ? `- ${turno.SubTurno}` : ''} {turno.Color === 'rojo' && '🔴'} {turno.Color === 'verde' && '✅'}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {datosTurno && datosTurno.semanas && datosTurno.semanas.length > 0 && (
        <Box sx={{ maxWidth: '98%', margin: '0 auto' }}>
          <Paper elevation={3} sx={{ p: 2, mb: 2, bgcolor: '#FFF9C4' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#CD0A0A' }}>
              📊 {moduloNombre} | {turnoNombre} | Variedad: {variedad}
            </Typography>
          </Paper>

          {renderTablaTurno()}
        </Box>
      )}
    </Box>
  );
}

export default Fenologia;