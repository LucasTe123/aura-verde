const Producto = require('../models/Producto');
const Movimiento = require('../models/Movimiento');
const NodeCache = require('node-cache');
const cloudinary = require('cloudinary').v2;

const cache = new NodeCache({ stdTTL: 60 });

cloudinary.config({
  cloud_name: 'dntafqtp3',
  api_key: '714919128559335',
  api_secret: 'Kx5oc3Wox7hrsvPvhoIUt3g_Tyo'
});

const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes('cloudinary')) return null;
  
  try {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    
    if (uploadIndex === -1) return null;
    
    const publicIdWithExtension = parts.slice(uploadIndex + 2).join('/');
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');
    
    console.log('📝 URL completa:', url);
    console.log('📝 Public ID extraído:', publicId);
    
    return publicId;
  } catch (error) {
    console.error('Error extrayendo public_id:', error);
    return null;
  }
};

exports.getProductos = async (req, res) => {
  try {
    const cacheKey = 'all_productos';
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    const productos = await Producto.getAll();
    cache.set(cacheKey, productos);
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductoById = async (req, res) => {
  try {
    const producto = await Producto.getById(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.buscarPorCodigoBarras = async (req, res) => {
  try {
    const producto = await Producto.getByCodigoBarras(req.params.codigo);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createProducto = async (req, res) => {
  try {
    const producto = await Producto.create(req.body);
    cache.del('all_productos');
    res.status(201).json(producto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProducto = async (req, res) => {
  try {
    const productoAnterior = await Producto.getById(req.params.id);
    
    if (!productoAnterior) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    if (req.body.imagen_url && 
        productoAnterior.imagen_url && 
        req.body.imagen_url !== productoAnterior.imagen_url) {
      
      console.log('🔄 Imagen cambiada, eliminando la anterior...');
      console.log('   Anterior:', productoAnterior.imagen_url);
      console.log('   Nueva:', req.body.imagen_url);
      
      const publicId = getPublicIdFromUrl(productoAnterior.imagen_url);
      
      if (publicId) {
        try {
          const result = await cloudinary.uploader.destroy(publicId, {
            invalidate: true
          });
          console.log('✅ Imagen anterior eliminada:', result);
        } catch (cloudinaryError) {
          console.error('⚠️ Error eliminando imagen anterior:', cloudinaryError);
        }
      }
    }
    
    const producto = await Producto.update(req.params.id, req.body);
    
    if (productoAnterior.cantidad !== req.body.cantidad) {
      await Movimiento.create({
        producto_id: req.params.id,
        tipo: req.body.cantidad > productoAnterior.cantidad ? 'entrada' : 'salida',
        cantidad: Math.abs(req.body.cantidad - productoAnterior.cantidad),
        cantidad_anterior: productoAnterior.cantidad,
        cantidad_nueva: req.body.cantidad,
        motivo: 'Actualización manual'
      });
    }

    cache.del('all_productos');
    res.json(producto);
  } catch (error) {
    console.error('❌ Error en updateProducto:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProducto = async (req, res) => {
  try {
    const producto = await Producto.getById(req.params.id);
    
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    if (producto.imagen_url) {
      const publicId = getPublicIdFromUrl(producto.imagen_url);
      
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId, {
            invalidate: true
          });
          console.log('✅ Imagen eliminada de Cloudinary:', publicId);
        } catch (cloudinaryError) {
          console.error('⚠️ Error eliminando imagen de Cloudinary:', cloudinaryError);
        }
      }
    }
    
    await Producto.delete(req.params.id);
    cache.del('all_productos');
    
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar producto:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getInventarioBajo = async (req, res) => {
  try {
    const productos = await Producto.getInventarioBajo(req.query.limite || 10);
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteImagenHuerfana = async (req, res) => {
  try {
    const { publicId } = req.params;
    const decodedPublicId = decodeURIComponent(publicId);
    
    console.log('🗑️ Eliminando imagen de Cloudinary:', decodedPublicId);
    
    const result = await cloudinary.uploader.destroy(decodedPublicId, {
      invalidate: true
    });
    
    console.log('✅ Resultado de Cloudinary:', result);
    
    if (result.result === 'ok') {
      res.json({ 
        success: true, 
        message: 'Imagen eliminada correctamente',
        result 
      });
    } else if (result.result === 'not found') {
      res.status(404).json({ 
        success: false, 
        message: 'Imagen no encontrada en Cloudinary. Verifica el public_id',
        result,
        publicId: decodedPublicId
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Error desconocido al eliminar',
        result 
      });
    }
  } catch (error) {
    console.error('❌ Error al eliminar imagen:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
