import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { api } from '../services/api';
import logo from '../assets/imagen1.png';
import { MdDeleteOutline } from 'react-icons/md';
import { BiSearch } from 'react-icons/bi';
import { MdQrCodeScanner } from 'react-icons/md';


const Vender = () => {
  const [productos, setProductos] = useState([]);
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [notificacion, setNotificacion] = useState(null);
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [sugerenciasProductos, setSugerenciasProductos] = useState([]);
  const [mostrarSugerenciasProductos, setMostrarSugerenciasProductos] = useState(false);
  const scannerRef = useRef(null);
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


  const iniciarEscaneo = () => {
    setScanning(true);

    setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode("barcode-reader");
        scannerRef.current = scanner;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.777778,
        };

        await scanner.start(
          { facingMode: "environment" },
          config,
          (decodedText, decodedResult) => {
            console.log('Código detectado:', decodedText);
            detenerEscaneo();
            handleCodigoEscaneado(decodedText);
          },
          (errorMessage) => {
            // Silenciar errores de escaneo continuo
          }
        );
      } catch (err) {
        console.error('Error iniciando scanner:', err);
        mostrarNotificacion('Error al iniciar cámara', 'error');
        setScanning(false);
      }
    }, 100);
  };


  const detenerEscaneo = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error('Error deteniendo scanner:', err);
      }
    }
    setScanning(false);
  };


  const handleCodigoEscaneado = async (codigoBarras) => {
    try {
      const productoEncontrado = await api.getProductoByBarcode(codigoBarras);
      setProductoSeleccionado(productoEncontrado);
      setProductoId(productoEncontrado.id.toString());
      setCantidad('1');
      mostrarNotificacion(`Producto encontrado: ${productoEncontrado.nombre}`);
    } catch (error) {
      console.error('Error buscando producto:', error);
      mostrarNotificacion(`No encontrado. Código: ${codigoBarras}`, 'error');
    }
  };


  const mostrarNotificacion = (mensaje, tipo = 'success') => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => setNotificacion(null), 3000);
  };


  const handleBusquedaProducto = (e) => {
    const valor = e.target.value;
    setBusquedaProducto(valor);

    if (valor.trim() === '') {
      setSugerenciasProductos([]);
      setMostrarSugerenciasProductos(false);
      return;
    }

    const productosFiltrados = productos.filter(p => 
      p.nombre.toLowerCase().startsWith(valor.toLowerCase())
    );

    setSugerenciasProductos(productosFiltrados.slice(0, 5));
    setMostrarSugerenciasProductos(productosFiltrados.length > 0);
  };


  const seleccionarProductoBusqueda = (producto) => {
    setProductoSeleccionado(producto);
    setProductoId(producto.id.toString());
    setCantidad('1');
    setBusquedaProducto('');
    setMostrarSugerenciasProductos(false);
  };


  const agregarAlCarrito = () => {
    if (!productoSeleccionado || !cantidad) {
      mostrarNotificacion('Selecciona producto y cantidad', 'error');
      return;
    }

    const cantidadNum = parseInt(cantidad);
    const subtotal = productoSeleccionado.precio * cantidadNum;

    const itemCarrito = {
      id: productoSeleccionado.id,
      nombre: productoSeleccionado.nombre,
      cantidad: cantidadNum,
      precio_unitario: productoSeleccionado.precio,
      subtotal: subtotal,
      imagen_url: productoSeleccionado.imagen_url,
      unidad: productoSeleccionado.unidad
    };

    setCarrito([...carrito, itemCarrito]);
    mostrarNotificacion('Producto agregado al carrito');
    
    setProductoSeleccionado(null);
    setProductoId('');
    setCantidad('');
  };


  const eliminarDelCarrito = (index) => {
    const nuevoCarrito = carrito.filter((_, i) => i !== index);
    setCarrito(nuevoCarrito);
    mostrarNotificacion('Producto eliminado del carrito');
  };


  const calcularTotalCarrito = () => {
    return carrito.reduce((total, item) => total + item.subtotal, 0);
  };


  const handleVenta = async (e) => {
    e.preventDefault();
    
    if (carrito.length === 0) {
      mostrarNotificacion('Agrega productos al carrito', 'error');
      return;
    }
    
    try {
      for (const item of carrito) {
        await api.registrarVenta({
          producto_id: item.id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          total: item.subtotal
        });
      }
      
      mostrarNotificacion('Venta registrada correctamente');
      
      setCarrito([]);
      setProductoSeleccionado(null);
      setProductoId('');
      setCantidad('');
    } catch (error) {
      console.error(error);
      mostrarNotificacion('Producto acabado', 'error');
    }
  };


  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        detenerEscaneo();
      }
    };
  }, []);


  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <img src={logo} alt="Aura Verde" className="logo-img" />
        </div>

        <div className="nav-buttons">
          <button className="nav-btn" onClick={() => navigate('/')}>
            INVENTARIO
          </button>
          <button className="nav-btn" style={{background: '#6EAA7F', color: 'white'}}>
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
            REGISTRAR VENTA
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

        <button 
          type="button"
          className="btn-primary"
          onClick={iniciarEscaneo}
          disabled={scanning}
          style={{
            background: scanning ? '#ccc' : '#6EAA7F',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <MdQrCodeScanner style={{ fontSize: '20px' }} />
          {scanning ? 'ESCANEANDO...' : 'ESCANEAR CÓDIGO'}
        </button>

        {scanning && (
          <div style={{ marginBottom: '20px' }}>
            <div 
              id="barcode-reader"
              style={{
                border: '3px solid #6EAA7F',
                borderRadius: '10px',
                overflow: 'hidden',
                marginBottom: '15px',
                minHeight: '300px'
              }}
            />
            
            <button 
              className="btn-primary"
              onClick={detenerEscaneo}
              style={{ background: '#999' }}
            >
              CANCELAR
            </button>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); agregarAlCarrito(); }}>
          
          {productoSeleccionado ? (
            <div style={{
              background: '#f0f9f4',
              padding: '15px',
              borderRadius: '10px',
              marginBottom: '15px',
              border: '2px solid #6EAA7F'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {productoSeleccionado.imagen_url && (
                  <img 
                    src={productoSeleccionado.imagen_url}
                    alt={productoSeleccionado.nombre}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '8px',
                      objectFit: 'cover'
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>
                    {productoSeleccionado.nombre}
                  </h3>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                    Stock: {productoSeleccionado.cantidad} {productoSeleccionado.unidad}
                  </p>
                  <p style={{ margin: '5px 0 0 0', color: '#6EAA7F', fontWeight: 'bold' }}>
                    Bs {productoSeleccionado.precio}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setProductoSeleccionado(null);
                  setProductoId('');
                  setCantidad('');
                }}
                style={{
                  marginTop: '10px',
                  padding: '8px',
                  background: '#999',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Cambiar producto
              </button>
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">O selecciona manualmente</label>
              
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Buscar producto..."
                  value={busquedaProducto}
                  onChange={handleBusquedaProducto}
                  onFocus={() => sugerenciasProductos.length > 0 && setMostrarSugerenciasProductos(true)}
                  style={{
                    paddingLeft: '40px',
                    borderRadius: '10px',
                    border: '2px solid #6EAA7F'
                  }}
                />
                <BiSearch style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '20px',
                  color: '#999'
                }} />

                {mostrarSugerenciasProductos && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '2px solid #6EAA7F',
                    borderRadius: '10px',
                    marginTop: '5px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {sugerenciasProductos.map((producto) => (
                      <div
                        key={producto.id}
                        onClick={() => seleccionarProductoBusqueda(producto)}
                        style={{
                          padding: '12px 15px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #eee',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                      >
                        <div style={{ fontWeight: '600', marginBottom: '3px' }}>
                          {producto.nombre}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          Stock: {producto.cantidad} {producto.unidad} • Bs {producto.precio}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label">Cantidad</label>
            <input 
              className="form-input" 
              type="number" 
              value={cantidad} 
              onChange={(e) => setCantidad(e.target.value)}
              min="1"
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={!productoSeleccionado || !cantidad}
            style={{
              background: productoSeleccionado && cantidad ? '#6EAA7F' : '#ccc',
              marginBottom: '20px'
            }}
          >
            + AGREGAR AL CARRITO
          </button>
        </form>

        {carrito.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '15px', color: '#333' }}>
              Carrito ({carrito.length} {carrito.length === 1 ? 'producto' : 'productos'})
            </h3>
            
            {carrito.map((item, index) => (
              <div key={index} style={{
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '10px',
                padding: '12px',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                {item.imagen_url && (
                  <img 
                    src={item.imagen_url}
                    alt={item.nombre}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '8px',
                      objectFit: 'cover'
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 5px 0', fontWeight: '600', color: '#333' }}>
                    {item.nombre}
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                    {item.cantidad} {item.unidad} × Bs {item.precio_unitario} = <strong>Bs {item.subtotal.toFixed(2)}</strong>
                  </p>
                </div>
                <button
                  onClick={() => eliminarDelCarrito(index)}
                  style={{
                    background: '#FF3B30',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '18px'
                  }}
                >
                  <MdDeleteOutline />
                </button>
              </div>
            ))}

            <div style={{
              background: '#6EAA7F',
              color: 'white',
              padding: '20px',
              borderRadius: '10px',
              textAlign: 'center',
              marginTop: '15px'
            }}>
              <h3 style={{ margin: '0 0 10px 0' }}>Total</h3>
              <p style={{fontSize: '32px', fontWeight: 'bold', margin: 0}}>
                Bs {calcularTotalCarrito().toFixed(2)}
              </p>
            </div>

            <button 
              onClick={handleVenta}
              className="btn-primary"
              style={{
                background: '#6EAA7F',
                marginTop: '15px'
              }}
            >
              FINALIZAR VENTA
            </button>
          </div>
        )}
        
        <button 
          type="button" 
          className="btn-primary" 
          style={{marginTop: '10px', background: '#999'}}
          onClick={() => navigate('/')}
        >
          VOLVER
        </button>
      </div>

      {notificacion && (
        <div className={`notification ${notificacion.tipo}`}>
          {notificacion.tipo === 'success' ? '✓' : '⚠'} {notificacion.mensaje}
        </div>
      )}
    </div>
  );
};


export default Vender;
