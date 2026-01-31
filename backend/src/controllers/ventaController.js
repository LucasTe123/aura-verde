const Venta = require('../models/Venta');
const Producto = require('../models/Producto');
const Movimiento = require('../models/Movimiento');

exports.registrarVenta = async (req, res) => {
  try {
    const { producto_id, cantidad, precio_unitario } = req.body;

    const producto = await Producto.getById(producto_id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    if (producto.cantidad < cantidad) {
      return res.status(400).json({ error: 'Stock insuficiente' });
    }

    const total = precio_unitario * cantidad;
    const venta = await Venta.create({
      producto_id,
      cantidad,
      precio_unitario: precio_unitario,
      total
    });

    const nuevaCantidad = producto.cantidad - cantidad;
    await Producto.update(producto_id, {
      ...producto,
      cantidad: nuevaCantidad
    });

    await Movimiento.create({
      producto_id,
      tipo: 'salida',
      cantidad,
      cantidad_anterior: producto.cantidad,
      cantidad_nueva: nuevaCantidad,
      motivo: 'Venta'
    });

    res.status(201).json(venta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getVentas = async (req, res) => {
  try {
    const ventas = await Venta.getAll();
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
