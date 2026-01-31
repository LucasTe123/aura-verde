const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');

router.get('/ventas-diarias', reporteController.getVentasDiarias);
router.get('/mas-vendidos', reporteController.getProductosMasVendidos);
router.get('/movimientos', reporteController.getHistorialMovimientos);

module.exports = router;
