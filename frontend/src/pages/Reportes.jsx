import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import logo from '../assets/imagen1.png';

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
        datos: response.data
      });
    } catch (error) {
      console.error(error);
      setResultado({ titulo: 'Error', datos: [] });
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <img src={logo} alt="Aura Verde" className="logo-img" />
        </div>
        
        <h2 className="section-title">REPORTES</h2>
        
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
            <h3>{resultado.titulo}</h3>
            {resultado.datos.length === 0 ? (
              <p>No hay datos disponibles</p>
            ) : (
              <div style={{maxHeight: '300px', overflow: 'auto'}}>
                {resultado.datos.map((item, index) => (
                  <div key={index} style={{padding: '10px', borderBottom: '1px solid #ddd'}}>
                    <pre style={{fontSize: '12px', margin: 0}}>
                      {JSON.stringify(item, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        <button className="add-btn" onClick={() => navigate('/')}>←</button>
      </div>
    </div>
  );
};

export default Reportes;
