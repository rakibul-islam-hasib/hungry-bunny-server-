const express = require('express');
const generateInvoicePDF = require('../middleware/generateInvoicePDF');
const router = express.Router();

router.get('/pdf', async (req, res) => {

    const invoiceData = {
        invoiceNumber: 'INV-001',
        // ... Other invoice data ...
    };

    const pdfBuffer = await generateInvoicePDF(invoiceData);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=invoice.pdf');

    // Send the PDF buffer as the response
    res.send(pdfBuffer);
});

module.exports = router;