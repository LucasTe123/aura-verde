import axios from 'axios';

// Usar el proxy - ahora todas las peticiones van a /api
const API_URL = 'https://aura-verde.onrender.com/api';


export const api = {
  getProductos: () => axios.get(`${API_URL}/productos`),
  getProductoById: (id) => axios.get(`${API_URL}/productos/${id}`),
  buscarPorCodigo: (codigo) => axios.get(`${API_URL}/productos/barcode/${codigo}`),
  getProductoByBarcode: async (codigo) => {
    const response = await axios.get(`${API_URL}/productos/barcode/${codigo}`);
    return response.data;
  },
  createProducto: (data) => axios.post(`${API_URL}/productos`, data),
  updateProducto: (id, data) => axios.put(`${API_URL}/productos/${id}`, data),
  deleteProducto: (id) => axios.delete(`${API_URL}/productos/${id}`),
  getInventarioBajo: (limite) => axios.get(`${API_URL}/productos/bajo-stock?limite=${limite}`),
  registrarVenta: (data) => axios.post(`${API_URL}/ventas`, data),
  getVentas: () => axios.get(`${API_URL}/ventas`),
  getVentasDiarias: () => axios.get(`${API_URL}/reportes/ventas-diarias`),
  getProductosMasVendidos: (limite) => axios.get(`${API_URL}/reportes/mas-vendidos?limite=${limite}`),
  getHistorialMovimientos: () => axios.get(`${API_URL}/reportes/movimientos`),
};
