const Producto = require('../models/Producto');
const Movimiento = require('../models/Movimiento');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 60 }); // Cache de 60 segundos

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
