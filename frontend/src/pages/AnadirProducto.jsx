import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import logo from '../assets/imagen1.png';
import Barcode from 'react-barcode';
import imageCompression from 'browser-image-compression';

const AnadirProducto = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const productoEditar = location.state?.producto;
  const esEdicion = !!productoEditar;

  const [formData, setFormData] = useState({
    nombre: productoEditar?.nombre || '',
    cantidad: productoEditar?.cantidad || '',
    unidad: productoEditar?.unidad || 'kg',
    precio: productoEditar?.precio || '',
    codigo_barras: productoEditar?.codigo_barras || '',
    imagen_url: productoEditar?.imagen_url || '',
    categoria: productoEditar?.categoria || ''
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [notificacion, setNotificacion] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(productoEditar?.imagen_url || null);

  useEffect(() => {
    if (!esEdicion) {
      generarCodigoBarras();
    }
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

  const getPublicIdFromUrl = (url) => {
    if (!url || !url.includes('cloudinary')) return null;
    
    try {
      const parts = url.split('/');
      const uploadIndex = parts.indexOf('upload');
      
      if (uploadIndex === -1) return null;
      
      const publicIdWithExtension = parts.slice(uploadIndex + 2).join('/');
      const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');
      
      return publicId;
    } catch (error) {
      console.error('Error extrayendo public_id:', error);
      return null;
    }
  };

  const deleteImageFromCloudinary = async (url) => {
    if (!url) return;
    
    try {
      const publicId = getPublicIdFromUrl(url);
      
      if (!publicId) {
        console.error('No se pudo extraer el public_id');
        return;
      }
      
      console.log('🗑️ Eliminando imagen con public_id:', publicId);
      
      const encodedPublicId = encodeURIComponent(publicId);
      
      const response = await fetch(`/api/productos/imagen/${encodedPublicId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      console.log('✅ Respuesta:', result);
    } catch (error) {
      console.error('❌ Error eliminando imagen:', error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    
    try {
      const options = {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 1000,
        useWebWorker: true,
        fileType: 'image/jpeg'
      };
      
      console.log('📸 Tamaño original:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      
      const compressedFile = await imageCompression(file, options);
      
      console.log('✅ Tamaño comprimido:', (compressedFile.size / 1024).toFixed(2), 'KB');
      
      // Subir nueva imagen (NO eliminar la anterior aquí)
      const formDataImg = new FormData();
      formDataImg.append('file', compressedFile);
      formDataImg.append('upload_preset', 'aura_verde');
      formDataImg.append('folder', 'productos');
      
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dntafqtp3/image/upload',
        {
          method: 'POST',
          body: formDataImg
        }
      );
      
      const data = await response.json();
      
      console.log('✅ Imagen subida. Public ID:', data.public_id);
      
      setFormData(prev => ({
        ...prev,
        imagen_url: data.secure_url
      }));
      
      setImagenPreview(data.secure_url);
      mostrarNotificacion('✓ Imagen subida correctamente');
      
    } catch (error) {
      console.error('Error al subir imagen:', error);
      mostrarNotificacion('⚠ Error al subir imagen', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCancelar = async () => {
    // Si es EDICIÓN y cambió la imagen, eliminar la NUEVA (no la original)
    if (esEdicion && formData.imagen_url !== productoEditar.imagen_url && formData.imagen_url) {
      console.log('🗑️ Cancelando edición: Eliminando imagen nueva...');
      await deleteImageFromCloudinary(formData.imagen_url);
    }
    
    // Si es NUEVO producto y tiene imagen, eliminarla
    if (!esEdicion && formData.imagen_url) {
      console.log('🗑️ Cancelando: Eliminando imagen nueva...');
      await deleteImageFromCloudinary(formData.imagen_url);
    }
    
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (esEdicion) {
        await api.updateProducto(productoEditar.id, formData);
        mostrarNotificacion('✓ Producto actualizado correctamente');
      } else {
        await api.createProducto(formData);
        mostrarNotificacion('✓ Producto agregado exitosamente');
      }
      
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      console.error('Error al guardar producto:', error);
      mostrarNotificacion('⚠ Error al guardar el producto', 'error');
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
            {esEdicion ? 'EDITAR PRODUCTO' : 'AÑADIR PRODUCTO'}
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

        <form onSubmit={handleSubmit}>
          
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
              {uploadingImage ? 'COMPRIMIENDO Y SUBIENDO...' : (imagenPreview ? 'CAMBIAR IMAGEN' : 'SUBIR IMAGEN')}
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
            <label className="form-label">Código de Barras</label>
            
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
            
            {!esEdicion && (
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
            )}
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
            {loading ? 'GUARDANDO...' : (esEdicion ? 'ACTUALIZAR PRODUCTO' : 'GUARDAR PRODUCTO')}
          </button>

          <button 
            type="button" 
            className="btn-primary"
            onClick={handleCancelar}
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
