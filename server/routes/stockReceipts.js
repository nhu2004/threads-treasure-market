const express = require('express');
const router = express.Router();
const stockReceiptController = require('../controllers/stockReceiptController');

router.post('/', stockReceiptController.createReceipt);
router.get('/supplier/:supplierId', stockReceiptController.getReceiptsBySupplier);

module.exports = router;