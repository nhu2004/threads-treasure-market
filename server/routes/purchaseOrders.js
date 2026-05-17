// server/route/purchaseOrders.js
const express = require('express');
const router = express.Router();
const poController = require('../controllers/purchaseOrderController');

router.get('/', poController.getAllPurchaseOrders);
router.get('/:id/details', poController.getPODetails);
router.post('/', poController.createPurchaseOrder);
router.put('/:id/status', poController.updatePOStatus);
router.put('/:id/complete', poController.completePurchaseOrder);

module.exports = router;
