import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BarcodeScanner from "react-qr-barcode-scanner";
import { api } from '../services/api';
import logo from '../assets/imagen1.png';

const EscanearCodigo = () => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [producto, setProducto] = useState(null);

  const handleScan = async (err, result) => {
    if (result) {
      const codigoBarras = result.text;
      console.log('Código escaneado:', codigoBarras);
      setResultado(codigoBarras);
      setScanning(false);

      // Buscar producto en el backend
      try {
        const productoEncontrado = await api.getProductoByBarcode(codigoBarras);
        setProducto(productoEncontrado);
        setError(null);
      } catch (error) {
        console.error('Error buscando producto:', error);
        setError('Producto no encontrado');
        setProducto(null);
      }
    }

    if (err) {
      console.error('Error escaneando:', err);
    }
  };

  const iniciarEscaneo = () => {
    setScanning(true);
    setResultado(null);
    setError(null);
    setProducto(null);
  };

  const verDetalles = () => {
    if (producto) {
      navigate(`/producto/${producto.id}`);
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
            ← VOLVER
          </button>
        </div>

        <h2 className="section-title">ESCANEAR CÓDIGO DE BARRAS</h2>

        {!scanning && !resultado && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ 
              fontSize: '80px', 
              marginBottom: '20px',
              color: '#6EAA7F' 
            }}>
              📱
            </div>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              Escanea el código de barras de un producto para ver su información
            </p>
            <button 
              className="btn-primary"
              onClick={iniciarEscaneo}
              style={{ background: '#6EAA7F' }}
            >
              INICIAR ESCANEO
            </button>
          </div>
        )}

        {scanning && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              border: '3px solid #6EAA7F',
              borderRadius: '10px',
              overflow: 'hidden',
              marginBottom: '15px'
            }}>
              <BarcodeScannerComponent
                width="100%"
                height={300}
                onUpdate={handleScan}
              />
            </div>
            <button 
              className="btn-primary"
              onClick={() => setScanning(false)}
              style={{ background: '#999' }}
            >
              CANCELAR ESCANEO
            </button>
          </div>
        )}

        {resultado && (
          <div style={{
            background: '#f5f5f5',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '20px'
          }}>
            <h3 style={{ 
              color: '#6EAA7F', 
              marginBottom: '10px',
              fontSize: '18px'
            }}>
              ✓ Código Escaneado
            </h3>
            <p style={{ 
              fontSize: '16px', 
              fontWeight: 'bold',
              marginBottom: '15px',
              color: '#333'
            }}>
              {resultado}
            </p>

            {producto && (
              <div style={{
                background: 'white',
                padding: '15px',
                borderRadius: '8px',
                marginTop: '15px'
              }}>
                {producto.imagen_url && (
                  <div style={{
                    width: '100px',
                    height: '100px',
                    margin: '0 auto 15px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: '2px solid #6EAA7F'
                  }}>
                    <img 
                      src={producto.imagen_url} 
                      alt={producto.nombre}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}
                <h4 style={{ color: '#333', marginBottom: '10px' }}>
                  {producto.nombre}
                </h4>
                <p style={{ color: '#666', marginBottom: '5px' }}>
                  Cantidad: {producto.cantidad} {producto.unidad}
                </p>
                <p style={{ color: '#666', marginBottom: '15px' }}>
                  Precio: {producto.precio} Bs
                </p>
                <button
                  className="btn-primary"
                  onClick={verDetalles}
                  style={{ background: '#6EAA7F', marginBottom: '10px' }}
                >
                  VER DETALLES
                </button>
              </div>
            )}

            {error && (
              <div style={{
                background: '#ffebee',
                padding: '15px',
                borderRadius: '8px',
                marginTop: '15px',
                color: '#c62828'
              }}>
                ⚠ {error}
              </div>
            )}

            <button
              className="btn-primary"
              onClick={iniciarEscaneo}
              style={{ background: '#6EAA7F', marginTop: '10px' }}
            >
              ESCANEAR OTRO
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EscanearCodigo;
