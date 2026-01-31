import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InventarioActual from './pages/InventarioActual';
import AnadirProducto from './pages/AnadirProducto';
import Vender from './pages/Vender';
import EscanearCodigo from './pages/EscanearCodigo';
import Reportes from './pages/Reportes';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<InventarioActual />} />
        <Route path="/anadir" element={<AnadirProducto />} />
        <Route path="/vender" element={<Vender />} />
        <Route path="/escanear" element={<EscanearCodigo />} />
        <Route path="/reportes" element={<Reportes />} />
      </Routes>
    </Router>
  );
}

export default App;
