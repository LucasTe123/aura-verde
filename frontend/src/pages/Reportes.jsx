import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import logo from '../assets/imagen1.png';
import ZoomControl from '../components/ZoomControl';

const Reportes = () => {
  const navigate = useNavigate();
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  const verHistorialMovimientos = async () => {
    setLoading(true);
    try {
      const response = await api.getHistorialMovimientos();
      setResultado({
        titulo: 'HISTORIAL DE MOVIMIENTOS',
        tipo: 'movimientos',
        datos: response.data
      });
    } catch (error) {
      console.error(error);
      setResultado({ titulo: 'Error', datos: [] });
    }
    setLoading(false);
  };

  const verMasVendidos = async () => {
    setLoading(true);
    try {
      const response = await api.getProductosMasVendidos(10);
      setResultado({
        titulo: 'PRODUCTOS MÁS VENDIDOS',
        tipo: 'masVendidos',
        datos: response.data
      });
    } catch (error) {
      console.error(error);
      setResultado({ titulo: 'Error', datos: [] });
    }
    setLoading(false);
  };

  const verVentasDiarias = async () => {
    setLoading(true);
    try {
      const response = await api.getVentasDiarias();
      setResultado({
        titulo: 'VENTAS DIARIAS',
        tipo: 'ventasDiarias',
        datos: response.data
      });
    } catch (error) {
      console.error(error);
      setResultado({ titulo: 'Error', datos: [] });
    }
    setLoading(false);
  };

  const verInventarioBajo = async () => {
    setLoading(true);
    try {
      const response = await api.getInventarioBajo(20);
      setResultado({
        titulo: 'INVENTARIO BAJO (menos de 20 unidades)',
        tipo: 'inventarioBajo',
        datos: response.data
      });
    } catch (error) {
      console.error(error);
      setResultado({ titulo: 'Error', datos: [] });
    }
    setLoading(false);
  };

  // Función para formatear la fecha
  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Renderizar según el tipo de reporte
  const renderResultado = () => {
    if (!resultado || resultado.datos.length === 0) {
      return <p>No hay datos disponibles</p>;
    }

    switch (resultado.tipo) {
      case 'movimientos':
        return (
          <div style={{ overflowX: 'auto' }}>
            {resultado.datos.map((item, index) => (
              <div key={index} style={{
                background: 'white',
                padding: '15px',
                marginBottom: '10px',
                borderRadius: '10px',
                border: '1px solid #ddd'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong style={{ color: '#6EAA7F' }}>{item.producto_nombre || 'Producto'}</strong>
                  <span style={{ 
                    color: item.tipo === 'entrada' ? '#34C759' : '#FF3B30',
                    fontWeight: 'bold'
                  }}>
                    {item.tipo === 'entrada' ? '↑ ENTRADA' : '↓ SALIDA'}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  <p style={{ margin: '5px 0' }}>
                    Cantidad: <strong>{item.cantidad}</strong>
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    Stock anterior: {item.cantidad_anterior} → Nuevo: {item.cantidad_nueva}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    Motivo: {item.motivo}
                  </p>
                  <p style={{ margin: '5px 0', fontSize: '12px', color: '#999' }}>
                    {formatearFecha(item.fecha)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        );

      case 'masVendidos':
        return (
          <div>
            {resultado.datos.map((item, index) => (
              <div key={index} style={{
                background: 'white',
                padding: '15px',
                marginBottom: '10px',
                borderRadius: '10px',
                border: '1px solid #ddd',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}>
                <div style={{
                  background: '#6EAA7F',
                  color: 'white',
                  width: '35px',
                  height: '35px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '15px', color: '#333' }}>
                    {item.producto_nombre || item.nombre}
                  </strong>
                  <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#666' }}>
                    Vendidos: <strong>{item.total_vendido}</strong> unidades
                  </p>
                </div>
              </div>
            ))}
          </div>
        );

      case 'ventasDiarias':
        return (
          <div>
            {resultado.datos.map((item, index) => (
              <div key={index} style={{
                background: 'white',
                padding: '15px',
                marginBottom: '10px',
                borderRadius: '10px',
                border: '1px solid #ddd'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '15px', color: '#333' }}>
                      {item.producto_nombre}
                    </strong>
                    <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#666' }}>
                      Cantidad: {item.cantidad} • Precio: Bs {item.precio_unitario}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ fontSize: '18px', color: '#6EAA7F' }}>
                      Bs {item.total}
                    </strong>
                    <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: '#999' }}>
                      {formatearFecha(item.fecha)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div style={{
              background: '#6EAA7F',
              color: 'white',
              padding: '15px',
              borderRadius: '10px',
              textAlign: 'center',
              marginTop: '15px'
            }}>
              <p style={{ margin: 0, fontSize: '14px' }}>Total del día</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold' }}>
                Bs {resultado.datos.reduce((sum, item) => sum + parseFloat(item.total), 0).toFixed(2)}
              </p>
            </div>
          </div>
        );

      case 'inventarioBajo':
        return (
          <div>
            {resultado.datos.map((item, index) => (
              <div key={index} style={{
                background: 'white',
                padding: '15px',
                marginBottom: '10px',
                borderRadius: '10px',
                border: '2px solid #FF3B30'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '15px', color: '#333' }}>
                      {item.nombre}
                    </strong>
                    <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#666' }}>
                      Precio: Bs {item.precio}
                    </p>
                  </div>
                  <div style={{
                    background: '#FF3B30',
                    color: 'white',
                    padding: '8px 15px',
                    borderRadius: '20px',
                    fontWeight: 'bold'
                  }}>
                    {item.cantidad} {item.unidad}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return <p>Tipo de reporte desconocido</p>;
    }
  };

  return (
    <div className="container">
      <div className="card">
        <ZoomControl />

        <div className="header">
          <img src={logo} alt="Aura Verde" className="logo-img" />
        </div>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            letterSpacing: '4px',
            color: '#333',
            marginBottom: '0'
          }}>
            REPORTES
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
        
        <div className="report-grid">
          <button className="report-btn" onClick={verHistorialMovimientos}>
            HISTORIAL DE MOVIMIENTOS
          </button>
          <button className="report-btn" onClick={verMasVendidos}>
            MÁS VENDIDOS
          </button>
          <button className="report-btn" onClick={verVentasDiarias}>
            VENTAS DIARIAS
          </button>
          <button className="report-btn" onClick={verInventarioBajo}>
            INVENTARIO BAJO
          </button>
        </div>

        {loading && <p style={{marginTop: '20px', textAlign: 'center'}}>Cargando...</p>}

        {resultado && (
          <div className="result-box">
            <h3 style={{ marginBottom: '15px', color: '#6EAA7F' }}>{resultado.titulo}</h3>
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {renderResultado()}
            </div>
          </div>
        )}
        
        <button className="add-btn" onClick={() => navigate('/')}>←</button>
      </div>
    </div>
  );
};

export default Reportes;
