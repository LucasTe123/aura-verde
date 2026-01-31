const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

router.get('/', productoController.getProductos);
router.get('/bajo-stock', productoController.getInventarioBajo);
router.get('/barcode/:codigo', productoController.buscarPorCodigoBarras); // ← Mover ANTES de /:id
router.get('/:id', productoController.getProductoById);
router.post('/', productoController.createProducto);
router.put('/:id', productoController.updateProducto);
router.delete('/:id', productoController.deleteProducto);

// Nueva ruta para borrar imágenes huérfanas al cancelar
router.delete('/imagen/:publicId', productoController.deleteImagenHuerfana);

module.exports = router;
