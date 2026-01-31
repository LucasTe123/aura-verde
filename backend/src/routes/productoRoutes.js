const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

router.get('/', productoController.getProductos);
router.get('/bajo-stock', productoController.getInventarioBajo);
router.get('/:id', productoController.getProductoById);
router.get('/barcode/:codigo', productoController.buscarPorCodigoBarras);
router.post('/', productoController.createProducto);
router.put('/:id', productoController.updateProducto);
router.delete('/:id', productoController.deleteProducto);

module.exports = router;
