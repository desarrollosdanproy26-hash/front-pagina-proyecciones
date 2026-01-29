import React, { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import TableChartIcon from '@mui/icons-material/TableChart';
import { getTables } from '../services/api';

function TableSelector({ onTableSelect, selectedTable }) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTables();
      if (response.success) {
        setTables(response.tables);
      }
    } catch (err) {
      setError('Error al cargar las tablas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    onTableSelect(event.target.value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={24} />
        <span>Cargando tablas...</span>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <FormControl fullWidth>
        <InputLabel id="table-select-label">Seleccionar Tabla</InputLabel>
        <Select
          labelId="table-select-label"
          id="table-select"
          value={selectedTable || ''}
          label="Seleccionar Tabla"
          onChange={handleChange}
        >
          {tables.map((table) => (
            <MenuItem key={table} value={table}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TableChartIcon fontSize="small" />
                {table}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {selectedTable && (
        <Box sx={{ mt: 2 }}>
          <Chip
            label={`Tabla activa: ${selectedTable}`}
            color="primary"
            variant="outlined"
            onDelete={() => onTableSelect(null)}
          />
        </Box>
      )}
    </Box>
  );
}

export default TableSelector;
