import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Box,
  Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { getTableData, updateRecord, createRecord, deleteRecord } from '../services/api';

function DataGrid({ tableName, schema, primaryKeys, userRole }) {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, row: null });
  const [newRowDialog, setNewRowDialog] = useState({ open: false });
  const [newRowData, setNewRowData] = useState({});

  // Cargar datos al montar el componente o cambiar la tabla
  useEffect(() => {
    if (tableName && schema) {
      loadData();
    }
  }, [tableName]);

  // Cargar datos de la tabla
  const loadData = async () => {
    setLoading(true);
    try {
      const response = await getTableData(tableName, { pageSize: 10000 });
      if (response.success) {
        setRowData(response.data);
      }
    } catch (error) {
      showSnackbar('Error al cargar datos: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Definir columnas basadas en el esquema
  const columnDefs = useMemo(() => {
    if (!schema || schema.length === 0) return [];

    return schema.map((col) => {
      const isPrimaryKey = primaryKeys.includes(col.name);
      const canEdit = !isPrimaryKey && userRole === 'Asistente';
      
      return {
        field: col.name,
        headerName: col.name,
        editable: canEdit,
        sortable: true,
        filter: true,
        resizable: true,
        width: 150,
        cellStyle: isPrimaryKey ? { backgroundColor: '#f0f0f0' } : (canEdit ? null : { backgroundColor: '#fafafa' }),
        cellEditor: getCellEditor(col.type),
        valueParser: getValueParser(col.type),
        tooltipField: col.name,
        headerTooltip: `${col.name} (${col.type})${isPrimaryKey ? ' - Primary Key' : ''}${!canEdit && !isPrimaryKey ? ' - Solo lectura' : ''}`
      };
    });
  }, [schema, primaryKeys, userRole]);

  // Configuración por defecto de la grid
  const defaultColDef = useMemo(() => ({
    flex: 1,
    minWidth: 100,
    filter: true,
    sortable: true,
    resizable: true
  }), []);

  // Cuando se edita una celda
  const onCellValueChanged = useCallback(async (params) => {
    const updatedRow = params.data;
    const primaryKey = primaryKeys[0];
    const id = updatedRow[primaryKey];

    try {
      const response = await updateRecord(tableName, id, updatedRow);
      if (response.success) {
        showSnackbar('Registro actualizado exitosamente', 'success');
        params.node.setData(response.data);
      }
    } catch (error) {
      showSnackbar('Error al actualizar: ' + error.message, 'error');
      loadData();
    }
  }, [tableName, primaryKeys]);

  // Cuando cambia la selección
  const onSelectionChanged = useCallback((event) => {
    const selected = event.api.getSelectedRows();
    setSelectedRows(selected);
  }, []);

  // Agregar nueva fila
  const handleAddRow = () => {
    const initialData = {};
    schema.forEach((col) => {
      if (!primaryKeys.includes(col.name)) {
        initialData[col.name] = getDefaultValue(col.type);
      }
    });
    setNewRowData(initialData);
    setNewRowDialog({ open: true });
  };

  // Guardar nueva fila
  const handleSaveNewRow = async () => {
    try {
      const response = await createRecord(tableName, newRowData);
      if (response.success) {
        showSnackbar('Registro creado exitosamente', 'success');
        setNewRowDialog({ open: false });
        setNewRowData({});
        loadData();
      }
    } catch (error) {
      showSnackbar('Error al crear registro: ' + error.message, 'error');
    }
  };

  // Eliminar filas seleccionadas
  const handleDeleteRows = () => {
    if (selectedRows.length === 0) {
      showSnackbar('Selecciona al menos un registro para eliminar', 'warning');
      return;
    }
    setDeleteDialog({ open: true, rows: selectedRows });
  };

  // Confirmar eliminación
  const confirmDelete = async () => {
    const primaryKey = primaryKeys[0];
    const deletePromises = selectedRows.map((row) => 
      deleteRecord(tableName, row[primaryKey])
    );

    try {
      await Promise.all(deletePromises);
      showSnackbar(`${selectedRows.length} registro(s) eliminado(s)`, 'success');
      setDeleteDialog({ open: false, rows: null });
      loadData();
    } catch (error) {
      showSnackbar('Error al eliminar: ' + error.message, 'error');
    }
  };

  // Mostrar snackbar
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {/* Barra de herramientas */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddRow}
          disabled={userRole !== 'Asistente'}
        >
          Agregar
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleDeleteRows}
          disabled={selectedRows.length === 0 || userRole !== 'Asistente'}
        >
          Eliminar ({selectedRows.length})
        </Button>
        <Tooltip title="Refrescar">
          <IconButton onClick={loadData} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        
        {loading && <CircularProgress size={24} />}
        
        {userRole !== 'Asistente' && (
          <Alert severity="warning" sx={{ ml: 2, py: 0 }}>
            Rol no autorizado
          </Alert>
        )}
        
        <Box sx={{ ml: 'auto' }}>
          <Typography variant="body2" color="text.secondary">
            Total: {rowData.length} registros
          </Typography>
        </Box>
      </Box>

      {/* AG-Grid */}
      <div className="ag-theme-alpine" style={{ height: 'calc(100vh - 250px)', width: '100%' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onCellValueChanged={onCellValueChanged}
          onSelectionChanged={onSelectionChanged}
          rowSelection="multiple"
          animateRows={true}
          pagination={true}
          paginationPageSize={100}
          paginationPageSizeSelector={[50, 100, 200, 500, 1000]}
          enableCellTextSelection={true}
          suppressRowClickSelection={true}
          tooltipShowDelay={500}
        />
      </div>

      {/* Diálogo para agregar nuevo registro */}
      <Dialog open={newRowDialog.open} onClose={() => setNewRowDialog({ open: false })} maxWidth="md" fullWidth>
        <DialogTitle>Agregar Nuevo Registro</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            {schema && schema
              .filter((col) => !primaryKeys.includes(col.name))
              .map((col) => (
                <Box key={col.name}>
                  <Typography variant="caption" color="text.secondary">
                    {col.name} ({col.type})
                  </Typography>
                  <input
                    type={getInputType(col.type)}
                    value={newRowData[col.name] || ''}
                    onChange={(e) => setNewRowData({ ...newRowData, [col.name]: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      fontSize: '14px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                </Box>
              ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewRowDialog({ open: false })}>Cancelar</Button>
          <Button onClick={handleSaveNewRow} variant="contained" startIcon={<SaveIcon />}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false })}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar {selectedRows.length} registro(s)?
          </Typography>
          <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false })}>Cancelar</Button>
          <Button onClick={confirmDelete} variant="contained" color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mensajes */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

// Funciones auxiliares

function getCellEditor(dataType) {
  const type = dataType.toLowerCase();
  if (type.includes('int') || type.includes('float') || type.includes('decimal')) {
    return 'agNumberCellEditor';
  }
  if (type.includes('date')) {
    return 'agDateCellEditor';
  }
  if (type.includes('bit') || type.includes('boolean')) {
    return 'agSelectCellEditor';
  }
  return 'agTextCellEditor';
}

function getValueParser(dataType) {
  const type = dataType.toLowerCase();
  if (type.includes('int')) {
    return (params) => parseInt(params.newValue) || null;
  }
  if (type.includes('float') || type.includes('decimal')) {
    return (params) => parseFloat(params.newValue) || null;
  }
  return null;
}

function getDefaultValue(dataType) {
  const type = dataType.toLowerCase();
  if (type.includes('int') || type.includes('float') || type.includes('decimal')) {
    return 0;
  }
  if (type.includes('bit') || type.includes('boolean')) {
    return false;
  }
  if (type.includes('date')) {
    return new Date().toISOString().split('T')[0];
  }
  return '';
}

function getInputType(dataType) {
  const type = dataType.toLowerCase();
  if (type.includes('int') || type.includes('float') || type.includes('decimal')) {
    return 'number';
  }
  if (type.includes('date')) {
    return 'date';
  }
  if (type.includes('datetime')) {
    return 'datetime-local';
  }
  return 'text';
}

export default DataGrid;
