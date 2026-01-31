const { pool } = require('../config/database');

class Venta {
  static async create(venta) {
    const { producto_id, cantidad, precio_unitario, total } = venta;
    const result = await pool.query(
      `INSERT INTO ventas (producto_id, cantidad, precio_unitario, total)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [producto_id, cantidad, precio_unitario, total]
    );
    return result.rows[0];
  }

  static async getVentasDiarias() {
    const result = await pool.query(`
      SELECT DATE(fecha) as fecha, SUM(total) as total_ventas, COUNT(*) as num_ventas
      FROM ventas
      WHERE fecha >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(fecha)
      ORDER BY fecha DESC
    `);
    return result.rows;
  }

  static async getProductosMasVendidos(limite = 5) {
    const result = await pool.query(`
      SELECT p.nombre, p.id, SUM(v.cantidad) as total_vendido, SUM(v.total) as ingresos
      FROM ventas v
      JOIN productos p ON v.producto_id = p.id
      GROUP BY p.id, p.nombre
      ORDER BY total_vendido DESC
      LIMIT $1
    `, [limite]);
    return result.rows;
  }

  static async getAll() {
    const result = await pool.query(`
      SELECT v.*, p.nombre as producto_nombre 
      FROM ventas v
      LEFT JOIN productos p ON v.producto_id = p.id
      ORDER BY v.fecha DESC
    `);
    return result.rows;
  }
}

module.exports = Venta;
