import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import logo from '../assets/imagen1.png';
import { BiSearch } from 'react-icons/bi';
import { MdDeleteOutline } from 'react-icons/md';




const InventarioActual = () => {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [cantidadAEliminar, setCantidadAEliminar] = useState('');
  const [notificacion, setNotificacion] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const navigate = useNavigate();

  const cargarProductos = async () => {
    try {
      const response = await api.getProductos();
      setProductos(response.data);
      setProductosFiltrados(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // Función de búsqueda con autocompletado
  // Función de búsqueda con autocompletado
const handleBusqueda = (e) => {
  const valor = e.target.value;
  setBusqueda(valor);

  if (valor.trim() === '') {
    setProductosFiltrados(productos);
    setSugerencias([]);
    setMostrarSugerencias(false);
    return;
  }

  // Filtrar productos que COMIENCEN con la búsqueda
  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().startsWith(valor.toLowerCase())
  );

  // Generar sugerencias únicas
  const sugerenciasUnicas = [...new Set(
    productosFiltrados.map(p => p.nombre)
  )].slice(0, 5);

  setSugerencias(sugerenciasUnicas);
  setProductosFiltrados(productosFiltrados);
  setMostrarSugerencias(sugerenciasUnicas.length > 0);
};


  // Seleccionar sugerencia
  const seleccionarSugerencia = (nombreProducto) => {
    setBusqueda(nombreProducto);
    const filtrados = productos.filter(p => 
      p.nombre.toLowerCase() === nombreProducto.toLowerCase()
    );
    setProductosFiltrados(filtrados);
    setMostrarSugerencias(false);
  };

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

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
  <h2 style={{
    fontSize: '24px',
    fontWeight: '600',
    letterSpacing: '4px',
    color: '#333',
    marginBottom: '0'
  }}>
    INVENTARIO ACTUAL
  </h2>
  <svg width="250" height="20" viewBox="0 0 250 20" style={{ display: 'block', margin: '0 auto' }}>
    <path 
      d="M 10 10 Q 125 2, 240 10" 
      stroke="#6EAA7F" 
      strokeWidth="3" 
      fill="transparent"
      strokeLinecap="round"
    />
  </svg>
</div>



        {/* Barra de búsqueda con autocompletado */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <div style={{
            position: 'relative',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <input
              type="text"
              className="form-input"
              placeholder="buscar..."
              value={busqueda}
              onChange={handleBusqueda}
              onFocus={() => sugerencias.length > 0 && setMostrarSugerencias(true)}
              style={{
                paddingLeft: '45px',
                borderRadius: '25px',
                border: '2px solid #6EAA7F',
                fontSize: '16px'
              }}
            />
            <span style={{
              position: 'absolute',
              left: '15px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '20px',
              color: '#999'
            }}>
              <BiSearch style={{
                position: 'absolute',
                left: '1px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '22px',
                color: '#999'
               }} />

            </span>
          </div>

          {/* Sugerencias de autocompletado */}
          {mostrarSugerencias && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              maxWidth: '600px',
              width: '100%',
              backgroundColor: 'white',
              border: '2px solid #6EAA7F',
              borderRadius: '15px',
              marginTop: '5px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              zIndex: 1000,
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {sugerencias.map((sugerencia, index) => (
                <div
                  key={index}
                  onClick={() => seleccionarSugerencia(sugerencia)}
                  style={{
                    padding: '12px 20px',
                    cursor: 'pointer',
                    borderBottom: index < sugerencias.length - 1 ? '1px solid #eee' : 'none',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  {sugerencia}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="products-grid">
          {productosFiltrados.map((producto) => (
            <div key={producto.id} className="product-card">
              
              <button 
  className="delete-product-btn"
  onClick={(e) => handleEliminar(producto, e)}
  title="Eliminar producto"
  style={{
     position: 'absolute',      // ← AGREGAR
  top: '-10px',              // ← AGREGAR
  right: '-13px',  
    backgroundColor: '#6EAA7F',
    borderRadius: '60%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    color: 'white'
  }}
>
  <MdDeleteOutline />
</button>
{/* BOTÓN EDITAR */}
<button 
  className="delete-product-btn"
  onClick={(e) => {
    e.stopPropagation();
    navigate('/anadir', { state: { producto } });
  }}
  title="Editar producto"
  style={{
    position: 'absolute',
    top: '-10px',
    right: '35px',
    backgroundColor: '#FFFAFA',
    borderRadius: '60%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    color: 'white'
  }}
>
  ✏️
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

        {productosFiltrados.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            No se encontraron productos
          </div>
        )}

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
