const { pool } = require('../config/database');

class Movimiento {
  static async create(movimiento) {
    const { producto_id, tipo, cantidad, cantidad_anterior, cantidad_nueva, motivo } = movimiento;
    const result = await pool.query(
      `INSERT INTO movimientos (producto_id, tipo, cantidad, cantidad_anterior, cantidad_nueva, motivo)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [producto_id, tipo, cantidad, cantidad_anterior, cantidad_nueva, motivo]
    );
    return result.rows[0];
  }

  static async getByProducto(producto_id) {
    const result = await pool.query(
      'SELECT * FROM movimientos WHERE producto_id = $1 ORDER BY fecha DESC',
      [producto_id]
    );
    return result.rows;
  }

  static async getAll() {
    const result = await pool.query(`
      SELECT m.*, p.nombre as producto_nombre 
      FROM movimientos m
      LEFT JOIN productos p ON m.producto_id = p.id
      ORDER BY m.fecha DESC
    `);
    return result.rows;
  }
}

module.exports = Movimiento;
