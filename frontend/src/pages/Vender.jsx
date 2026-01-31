import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader } from '@zxing/library';
import { api } from '../services/api';
import logo from '../assets/imagen1.png';

const Vender = () => {
  const [productos, setProductos] = useState([]);
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [notificacion, setNotificacion] = useState(null);
  const webcamRef = useRef(null);
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

  // Escanear código de barras
  useEffect(() => {
    let intervalId;
    
    if (scanning) {
      const codeReader = new BrowserMultiFormatReader();
      
      intervalId = setInterval(async () => {
        if (webcamRef.current) {
          const imageSrc = webcamRef.current.getScreenshot();
          
          if (imageSrc) {
            try {
              const result = await codeReader.decodeFromImageUrl(imageSrc);
              if (result) {
                console.log('Código escaneado:', result.text);
                handleCodigoEscaneado(result.text);
                setScanning(false);
              }
            } catch (err) {
              // Sigue intentando escanear
            }
          }
        }
      }, 100);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [scanning]);

  const handleCodigoEscaneado = async (codigoBarras) => {
    try {
      const productoEncontrado = await api.getProductoByBarcode(codigoBarras);
      setProductoSeleccionado(productoEncontrado);
      setProductoId(productoEncontrado.id.toString());
      setCantidad('1');
      mostrarNotificacion(`✓ Producto encontrado: ${productoEncontrado.nombre}`);
    } catch (error) {
      console.error('Error buscando producto:', error);
      mostrarNotificacion('⚠ Producto no encontrado', 'error');
    }
  };

  const mostrarNotificacion = (mensaje, tipo = 'success') => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => setNotificacion(null), 3000);
  };

  const iniciarEscaneo = () => {
    setScanning(true);
  };

  const handleProductoChange = (e) => {
    const selectedId = e.target.value;
    setProductoId(selectedId);
    
    if (selectedId) {
      const producto = productos.find(p => p.id === parseInt(selectedId));
      setProductoSeleccionado(producto);
      setCantidad('1');
    } else {
      setProductoSeleccionado(null);
    }
  };

  const calcularTotal = () => {
    if (!productoSeleccionado || !cantidad) return 0;
    
    const precioUnitario = productoSeleccionado.precio || 0;
    return precioUnitario * parseInt(cantidad);
  };

  const handleVenta = async (e) => {
    e.preventDefault();
    
    if (!productoSeleccionado) {
      mostrarNotificacion('⚠ Selecciona un producto', 'error');
      return;
    }

    const precioUnitario = productoSeleccionado.precio;
    const total = calcularTotal();
    
    try {
      await api.registrarVenta({
        producto_id: parseInt(productoId),
        cantidad: parseInt(cantidad),
        precio_unitario: parseFloat(precioUnitario),
        total: total
      });
      mostrarNotificacion(' Venta registrada correctamente');
      
      // Limpiar formulario para siguiente venta
      setProductoSeleccionado(null);
      setProductoId('');
      setCantidad('');
    } catch (error) {
      console.error(error);
      mostrarNotificacion('⚠ Error al registrar venta', 'error');
    }
  };

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
        
        <h2 className="section-title">REGISTRAR VENTA</h2>

        {/* BOTÓN ESCANEAR */}
        <button 
          type="button"
          className="btn-primary"
          onClick={iniciarEscaneo}
          disabled={scanning}
          style={{
            background: '#6EAA7F',
            marginBottom: '20px'
          }}
        >
           {scanning ? 'ESCANEANDO...' : 'ESCANEAR CÓDIGO'}
        </button>

        {/* CÁMARA ESCÁNER */}
        {scanning && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              border: '3px solid #6EAA7F',
              borderRadius: '10px',
              overflow: 'hidden',
              marginBottom: '15px'
            }}>
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width="100%"
                videoConstraints={{
                  facingMode: 'environment'
                }}
              />
            </div>
            <p style={{textAlign: 'center', color: '#666', marginBottom: '10px'}}>
              Enfoca el código de barras
            </p>
            <button 
              className="btn-primary"
              onClick={() => setScanning(false)}
              style={{ background: '#999' }}
            >
              CANCELAR
            </button>
          </div>
        )}

        {/* FORMULARIO */}
        <form onSubmit={handleVenta}>
          
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
              <select 
                className="form-select" 
                value={productoId} 
                onChange={handleProductoChange}
              >
                <option value="">Selecciona un producto</option>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} (Stock: {p.cantidad} {p.unidad})
                  </option>
                ))}
              </select>
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
              required
            />
          </div>

          {cantidad && productoSeleccionado && (
            <div style={{
              background: '#6EAA7F',
              color: 'white',
              padding: '20px',
              borderRadius: '10px',
              textAlign: 'center',
              marginBottom: '15px'
            }}>
              <h3 style={{ margin: '0 0 10px 0' }}>Total</h3>
              <p style={{fontSize: '32px', fontWeight: 'bold', margin: 0}}>
                Bs {calcularTotal().toFixed(2)}
              </p>
            </div>
          )}
          
          <button 
            type="submit" 
            className="btn-primary"
            disabled={!productoSeleccionado || !cantidad}
            style={{
              background: productoSeleccionado && cantidad ? '#6EAA7F' : '#ccc'
            }}
          >
            REGISTRAR VENTA
          </button>
          
          <button 
            type="button" 
            className="btn-primary" 
            style={{marginTop: '10px', background: '#999'}}
            onClick={() => navigate('/')}
          >
            VOLVER
          </button>
        </form>
      </div>

      {/* NOTIFICACIÓN CON ANIMACIÓN CSS */}
      {notificacion && (
        <div className={`notification ${notificacion.tipo}`}>
          {notificacion.tipo === 'success' ? '✓' : '⚠'} {notificacion.mensaje}
        </div>
      )}
    </div>
  );
};

export default Vender;
