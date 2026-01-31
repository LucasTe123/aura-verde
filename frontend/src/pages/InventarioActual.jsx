import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import logo from '../assets/imagen1.png';



const InventarioActual = () => {
  const [productos, setProductos] = useState([]);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [cantidadAEliminar, setCantidadAEliminar] = useState('');
  const [notificacion, setNotificacion] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const navigate = useNavigate();


  const cargarProductos = async () => {
    try {
      const response = await api.getProductos();
      setProductos(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };


  useEffect(() => {
    cargarProductos();
  }, []);


  const mostrarNotificacion = (mensaje, tipo = 'success') => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => setNotificacion(null), 3000);
  };


  const handleEliminar = (producto, e) => {
    e.stopPropagation();
    setProductoAEliminar(producto);
    setCantidadAEliminar('');
  };


  const confirmarEliminacion = async () => {
    if (!productoAEliminar) return;


    const cantidad = parseFloat(cantidadAEliminar);
    
    if (!cantidad || cantidad <= 0) {
      mostrarNotificacion('Por favor ingresa una cantidad válida', 'error');
      return;
    }


    if (cantidad >= productoAEliminar.cantidad) {
      setMostrarConfirmacion(true);
    } else {
      try {
        const nuevaCantidad = productoAEliminar.cantidad - cantidad;
        await api.updateProducto(productoAEliminar.id, {
          ...productoAEliminar,
          cantidad: nuevaCantidad
        });
        mostrarNotificacion(`Se eliminaron ${cantidad} ${productoAEliminar.unidad}`);
        cargarProductos();
        setProductoAEliminar(null);
      } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al actualizar el producto', 'error');
      }
    }
  };


  const eliminarCompletamente = async () => {
    try {
      await api.deleteProducto(productoAEliminar.id);
      mostrarNotificacion('Producto eliminado completamente');
      cargarProductos();
      setProductoAEliminar(null);
      setMostrarConfirmacion(false);
    } catch (error) {
      console.error('Error:', error);
      mostrarNotificacion('Error al eliminar el producto', 'error');
    }
  };


  return (
    <div className="container">
      <div className="card">
        
        <div className="header">
          <img src={logo} alt="Aura Verde" className="logo-img" />
        </div>


        <div className="nav-buttons">
          <button className="nav-btn active" onClick={() => navigate('/')}>
            INVENTARIO
          </button>
          <button className="nav-btn" onClick={() => navigate('/vender')}>
            VENDER
          </button>
          <button className="nav-btn" onClick={() => navigate('/reportes')}>
            REPORTES
          </button>
        </div>


        <h2 className="section-title">INVENTARIO ACTUAL</h2>


        <div className="products-grid">
          {productos.map((producto) => (
            <div key={producto.id} className="product-card">
              
              <button 
                className="delete-product-btn"
                onClick={(e) => handleEliminar(producto, e)}
                title="Eliminar producto"
              >
                🗑️
              </button>
              
              <div className="product-image">
                {producto.imagen_url ? (
                  <img src={producto.imagen_url} alt={producto.nombre} style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '15px'}} />
                ) : (
                  '🥬'
                )}
              </div>
              <div className="product-name">{producto.nombre}</div>
              <div className="product-info">
                <div>CANTIDAD:</div>
                <div className="product-quantity">{producto.cantidad}</div>
                <div>{producto.unidad}</div>
              </div>
            </div>
          ))}
        </div>


        <button className="add-btn" onClick={() => navigate('/anadir')}>+</button>
      </div>


      {/* Notificación */}
      {notificacion && (
        <div className={`notification ${notificacion.tipo}`}>
          {notificacion.tipo === 'success' ? '✓' : '⚠'} {notificacion.mensaje}
        </div>
      )}


      {/* Modal de eliminación */}
      {productoAEliminar && !mostrarConfirmacion && (
        <div className="modal-overlay" onClick={() => setProductoAEliminar(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Eliminar: {productoAEliminar.nombre}</h3>
            <p>Cantidad disponible: {productoAEliminar.cantidad} {productoAEliminar.unidad}</p>
            
            <div className="form-group" style={{ marginTop: '20px' }}>
              <label className="form-label">¿Cuánto quieres eliminar?</label>
              <input
                type="number"
                className="form-input"
                value={cantidadAEliminar}
                onChange={(e) => setCantidadAEliminar(e.target.value)}
                min="0"
                step="0.01"
                placeholder="0"
                autoFocus
              />
            </div>


            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                className="btn-primary" 
                onClick={confirmarEliminacion}
                style={{ flex: 1 }}
              >
                CONFIRMAR
              </button>
              <button 
                className="btn-primary" 
                onClick={() => setProductoAEliminar(null)}
                style={{ flex: 1, background: '#999' }}
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Modal de confirmación final */}
      {mostrarConfirmacion && (
        <div className="modal-overlay" onClick={() => setMostrarConfirmacion(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Confirmar eliminación</h3>
            <p>¿Estás seguro de eliminar completamente este producto?</p>
            <p style={{ fontWeight: 'bold', marginTop: '10px' }}>{productoAEliminar.nombre}</p>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
              <button 
                className="btn-primary" 
                onClick={eliminarCompletamente}
                style={{ flex: 1, background: '#FF3B30' }}
              >
                SÍ, ELIMINAR
              </button>
              <button 
                className="btn-primary" 
                onClick={() => {
                  setMostrarConfirmacion(false);
                  setProductoAEliminar(null);
                }}
                style={{ flex: 1, background: '#999' }}
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default InventarioActual;
