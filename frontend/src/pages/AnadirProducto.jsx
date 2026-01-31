import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import logo from '../assets/imagen1.png';
import Barcode from 'react-barcode';

const AnadirProducto = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    cantidad: '',
    unidad: 'kg',
    precio: '',
    codigo_barras: '',
    imagen_url: '',
    categoria: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [notificacion, setNotificacion] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);

  useEffect(() => {
    generarCodigoBarras();
  }, []);

  const generarCodigoBarras = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    const codigo = timestamp + random;
    
    setFormData(prev => ({
      ...prev,
      codigo_barras: codigo
    }));
  };

  const mostrarNotificacion = (mensaje, tipo = 'success') => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => setNotificacion(null), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Subir imagen a Cloudinary CON COMPRESIÓN
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    
    const formDataImg = new FormData();
    formDataImg.append('file', file);
    formDataImg.append('upload_preset', 'aura_verde');
    formDataImg.append('quality', 'auto:eco');
    formDataImg.append('fetch_format', 'auto');
    
    try {
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dntafqtp3/image/upload',
        {
          method: 'POST',
          body: formDataImg
        }
      );
      
      const data = await response.json();
      
      // Usar URL optimizada con transformaciones
      const optimizedUrl = data.secure_url.replace('/upload/', '/upload/q_auto:eco,f_auto,w_800/');
      
      setFormData(prev => ({
        ...prev,
        imagen_url: optimizedUrl
      }));
      
      setImagenPreview(optimizedUrl);
      mostrarNotificacion('Imagen subida y optimizada correctamente');
    } catch (error) {
      console.error('Error al subir imagen:', error);
      mostrarNotificacion('Error al subir imagen', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.createProducto(formData);
      mostrarNotificacion('Producto agregado exitosamente');
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      console.error('Error al agregar producto:', error);
      mostrarNotificacion('Error al agregar el producto', 'error');
    } finally {
      setLoading(false);
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
            INVENTARIO ACTUAL
          </button>
          <button className="nav-btn" onClick={() => navigate('/vender')}>
            VENDER
          </button>
          <button className="nav-btn" onClick={() => navigate('/reportes')}>
            REPORTES
          </button>
        </div>

        <h2 className="section-title">AÑADIR PRODUCTO</h2>

        <form onSubmit={handleSubmit}>
          
          {/* Subir Imagen */}
          <div className="form-group">
            <label className="form-label">Imagen del Producto</label>
            
            {imagenPreview && (
              <div style={{
                width: '120px',
                height: '120px',
                margin: '0 auto 15px',
                borderRadius: '15px',
                overflow: 'hidden',
                border: '2px solid #6EAA7F'
              }}>
                <img 
                  src={imagenPreview} 
                  alt="Preview" 
                  style={{width: '100%', height: '100%', objectFit: 'cover'}}
                />
              </div>
            )}
            
            <label 
              htmlFor="file-upload" 
              className="btn-primary"
              style={{
                display: 'block',
                textAlign: 'center',
                cursor: uploadingImage ? 'not-allowed' : 'pointer',
                background: uploadingImage ? '#999' : '#6EAA7F'
              }}
            >
              {uploadingImage ? 'SUBIENDO...' : 'SUBE TU IMAGEN'}
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              disabled={uploadingImage}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Producto *</label>
            <input
              type="text"
              name="nombre"
              className="form-input"
              value={formData.nombre}
              onChange={handleChange}
              required
              placeholder="Nombre del producto"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cantidad *</label>
            <input
              type="number"
              name="cantidad"
              className="form-input"
              value={formData.cantidad}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="0"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Unidad *</label>
            <select
              name="unidad"
              className="form-select"
              value={formData.unidad}
              onChange={handleChange}
              required
            >
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="unidades">unidades</option>
              <option value="litros">litros</option>
              <option value="ml">ml</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Precio (Bs) *</label>
            <input
              type="number"
              name="precio"
              className="form-input"
              value={formData.precio}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label className="form-label"></label>
            
            {formData.codigo_barras && (
              <div style={{ 
                background: 'white', 
                padding: '15px', 
                borderRadius: '10px',
                border: '1px solid #ddd',
                marginBottom: '10px',
                textAlign: 'center'
              }}>
                <Barcode value={formData.codigo_barras} height={60} fontSize={14} />
              </div>
            )}
            
            <button
              type="button"
              onClick={generarCodigoBarras}
              className="btn-primary"
              style={{ 
                width: '100%',
                background: '#6EAA7F',
                marginTop: '5px'
              }}
            >
            GENERAR CÓDIGO
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Categoría</label>
            <input
              type="text"
              name="categoria"
              className="form-input"
              value={formData.categoria}
              onChange={handleChange}
              placeholder="Ej: Verduras"
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading || uploadingImage}
            style={{ marginBottom: '10px' }}
          >
            {loading ? 'GUARDANDO...' : 'GUARDAR PRODUCTO'}
          </button>

          <button 
            type="button" 
            className="btn-primary"
            onClick={() => navigate('/')}
            disabled={loading}
            style={{ background: '#999' }}
          >
            CANCELAR
          </button>

        </form>
      </div>

      {notificacion && (
        <div className={`notification ${notificacion.tipo}`}>
          {notificacion.tipo === 'success' ? '✓' : '⚠'} {notificacion.mensaje}
        </div>
      )}
    </div>
  );
};

export default AnadirProducto;
