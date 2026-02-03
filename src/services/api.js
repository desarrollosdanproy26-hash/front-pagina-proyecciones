import axios from 'axios';

//const API_URL = 'http://localhost:5000/api';
const API_URL='http://147.93.190.116:500/api'

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('Error del servidor:', error.response.data);
      if (error.response.status === 401 || error.response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    } else if (error.request) {
      console.error('No hay respuesta del servidor');
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const login = async (username, password) => {
  try {
    const response = await apiClient.post('/auth/login', { username, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyToken = async () => {
  try {
    const response = await apiClient.get('/auth/verify');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getTables = async () => {
  try {
    const response = await apiClient.get('/tables');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTableSchema = async (tableName) => {
  try {
    const response = await apiClient.get(`/tables/${tableName}/schema`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTableData = async (tableName, params = {}) => {
  try {
    const response = await apiClient.get(`/tables/${tableName}/data`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getRecord = async (tableName, id) => {
  try {
    const response = await apiClient.get(`/tables/${tableName}/records/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createRecord = async (tableName, data) => {
  try {
    const response = await apiClient.post(`/tables/${tableName}/records`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateRecord = async (tableName, id, data) => {
  try {
    const response = await apiClient.put(`/tables/${tableName}/records/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteRecord = async (tableName, id) => {
  try {
    const response = await apiClient.delete(`/tables/${tableName}/records/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getRelatedData = async (tableName, columnName) => {
  try {
    const response = await apiClient.get(`/tables/${tableName}/related/${columnName}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const executeQuery = async (query) => {
  try {
    const response = await apiClient.post('/query', { query });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  login,
  verifyToken,
  logout,
  getTables,
  getTableSchema,
  getTableData,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  getRelatedData,
  executeQuery,
  healthCheck
};