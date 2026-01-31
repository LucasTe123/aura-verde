import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import logo from '../assets/imagen1.png';

const Vender = () => {
  const [productos, setProductos] = useState([]);
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null); // NUEVO
  const navigate = useNavigate();

  useEffect(() => {
    const cargar = async () => {
      try {
        const response = await api.getProductos();
        setProductos(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    cargar();
  }, []);

  // Manejar selección de producto
  const handleProductoChange = (e) => {
    const selectedId = e.target.value;
    setProductoId(selectedId);
    
    if (selectedId) {
      const producto = productos.find(p => p.id === parseInt(selectedId));
      setProductoSeleccionado(producto);
      console.log('Producto seleccionado:', producto); // Para verificar qué campos tiene
    } else {
      setProductoSeleccionado(null);
    }
  };

  // Calcular total automáticamente
  const calcularTotal = () => {
    if (!productoSeleccionado || !cantidad) return 0;
    
    // Usa el campo correcto: puede ser "costo", "precio", "precio_venta", etc.
    const precioUnitario = productoSeleccionado.costo 
                        || productoSeleccionado.precio 
                        || productoSeleccionado.precio_venta 
                        || productoSeleccionado.precio_unitario 
                        || 0;
    
    return precioUnitario * parseInt(cantidad);
  };

  const handleVenta = async (e) => {
    e.preventDefault();
    
    if (!productoSeleccionado) {
      alert('Selecciona un producto');
      return;
    }

    const precioUnitario = productoSeleccionado.costo 
                        || productoSeleccionado.precio 
                        || productoSeleccionado.precio_venta 
                        || productoSeleccionado.precio_unitario;
    
    const total = calcularTotal();
    
    try {
      await api.registrarVenta({
        producto_id: parseInt(productoId),
        cantidad: parseInt(cantidad),
        precio_unitario: parseFloat(precioUnitario),
        total: total
      });
      alert('Venta registrada correctamente');
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('Error al registrar venta: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <img src={logo} alt="Aura Verde" className="logo-img" />
        </div>
        
        <h2 className="section-title">REGISTRAR VENTA</h2>
        
        <form onSubmit={handleVenta}>
          <div className="form-group">
            <label className="form-label">Producto</label>
            <select 
              className="form-select" 
              value={productoId} 
              onChange={handleProductoChange}
              required
            >
              <option value="">Selecciona un producto</option>
              {productos.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nombre} (Stock: {p.cantidad} {p.unidad})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Cantidad a Vender</label>
            <input 
              className="form-input" 
              type="number" 
              value={cantidad} 
              onChange={(e) => setCantidad(e.target.value)}
              min="1"
              required
            />
          </div>

          {/* CAMPO DE PRECIO UNITARIO ELIMINADO */}

          {cantidad && productoSeleccionado && (
            <div className="result-box">
              <h3>Total a Cobrar</h3>
              <p style={{fontSize: '24px', fontWeight: 'bold', color: '#6EAA7F'}}>
                Bs {calcularTotal().toFixed(2)}
              </p>
            </div>
          )}
          
          <button type="submit" className="btn-primary">REGISTRAR VENTA</button>
          <button 
            type="button" 
            className="btn-primary" 
            style={{marginTop: '10px', background: '#999'}}
            onClick={() => navigate('/')}
          >
            CANCELAR
          </button>
        </form>
      </div>
    </div>
  );
};

export default Vender;
