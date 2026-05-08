// Server/routes/invoices.js
const express = require('express');
const router = express.Router();
const { getAllInvoices, getInvoiceDetail } = require('../controllers/invoiceController');

router.get('/', getAllInvoices);
router.get('/:id', getInvoiceDetail);

module.exports = router;