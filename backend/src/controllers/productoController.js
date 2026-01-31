const Producto = require('../models/Producto');
const Movimiento = require('../models/Movimiento');
const NodeCache = require('node-cache');
const cloudinary = require('cloudinary').v2;

const cache = new NodeCache({ stdTTL: 60 }); // Cache de 60 segundos

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: 'dntafqtp3',
  api_key: '714919128559335',
  api_secret: 'Kx5oc3Wox7hrsvPvhoIUt3g_Tyo'
});

// Función para extraer public_id de URL de Cloudinary
const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes('cloudinary')) return null;
  
  try {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const publicId = filename.split('.')[0];
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
    const producto = await Producto.update(req.params.id, req.body);
    
    // Registrar movimiento si cambió la cantidad
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
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProducto = async (req, res) => {
  try {
    // Primero obtener el producto para acceder a la URL de la imagen
    const producto = await Producto.getById(req.params.id);
    
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    // Si el producto tiene imagen, eliminarla de Cloudinary
    if (producto.imagen_url) {
      const publicId = getPublicIdFromUrl(producto.imagen_url);
      
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
          console.log('Imagen eliminada de Cloudinary:', publicId);
        } catch (cloudinaryError) {
          console.error('Error eliminando imagen de Cloudinary:', cloudinaryError);
          // Continuar con la eliminación del producto aunque falle Cloudinary
        }
      }
    }
    
    // Eliminar el producto de la base de datos
    await Producto.delete(req.params.id);
    cache.del('all_productos');
    
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
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
// Función para eliminar imagen huérfana de Cloudinary
exports.deleteImagenHuerfana = async (req, res) => {
  try {
    const { publicId } = req.params;
    const decodedPublicId = decodeURIComponent(publicId);
    
    console.log('🗑️ Eliminando imagen de Cloudinary:', decodedPublicId);
    
    const result = await cloudinary.uploader.destroy(decodedPublicId);
    
    console.log('✅ Resultado de Cloudinary:', result);
    
    res.json({ 
      success: true, 
      message: 'Imagen eliminada correctamente',
      result 
    });
  } catch (error) {
    console.error('❌ Error al eliminar imagen:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

