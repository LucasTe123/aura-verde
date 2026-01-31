const { pool } = require('../config/database');

class Producto {
  static async getAll() {
    const result = await pool.query(
      'SELECT * FROM productos ORDER BY fecha_creacion DESC'
    );
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query(
      'SELECT * FROM productos WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async getByCodigoBarras(codigo) {
    const result = await pool.query(
      'SELECT * FROM productos WHERE codigo_barras = $1',
      [codigo]
    );
    return result.rows[0];
  }

  static async create(producto) {
    const { nombre, cantidad, unidad, precio, codigo_barras, imagen_url, categoria } = producto;
    const result = await pool.query(
      `INSERT INTO productos (nombre, cantidad, unidad, precio, codigo_barras, imagen_url, categoria)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [nombre, cantidad, unidad, precio, codigo_barras, imagen_url, categoria]
    );
    return result.rows[0];
  }

  static async update(id, producto) {
    const { nombre, cantidad, unidad, precio, codigo_barras, imagen_url, categoria } = producto;
    const result = await pool.query(
      `UPDATE productos 
       SET nombre = $1, cantidad = $2, unidad = $3, precio = $4, 
           codigo_barras = $5, imagen_url = $6, categoria = $7,
           fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [nombre, cantidad, unidad, precio, codigo_barras, imagen_url, categoria, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM productos WHERE id = $1', [id]);
  }

  static async getInventarioBajo(limite = 10) {
    const result = await pool.query(
      'SELECT * FROM productos WHERE cantidad < $1 ORDER BY cantidad ASC',
      [limite]
    );
    return result.rows;
  }
}

module.exports = Producto;
