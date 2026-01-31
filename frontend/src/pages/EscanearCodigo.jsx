import { useNavigate } from 'react-router-dom';

const EscanearCodigo = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <div className="logo">🌿</div>
          <h1 className="title">Aura Verde</h1>
        </div>
        
        <div className="scan-area">
          <div className="scan-box">📱</div>
          <h2 className="section-title">ESCANEAR CÓDIGO</h2>
          <p>Función próximamente disponible</p>
        </div>
        
        <button className="add-btn" onClick={() => navigate('/')}>←</button>
      </div>
    </div>
  );
};

export default EscanearCodigo;
