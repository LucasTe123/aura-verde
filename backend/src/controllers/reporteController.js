const Producto = require('../models/Producto');
const Venta = require('../models/Venta');
const Movimiento = require('../models/Movimiento');

exports.getVentasDiarias = async (req, res) => {
  try {
    const ventas = await Venta.getVentasDiarias();
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductosMasVendidos = async (req, res) => {
  try {
    const productos = await Venta.getProductosMasVendidos(req.query.limite || 5);
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getHistorialMovimientos = async (req, res) => {
  try {
    const movimientos = await Movimiento.getAll();
    res.json(movimientos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
