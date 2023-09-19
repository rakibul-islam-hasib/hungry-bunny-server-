const puppeteer = require('puppeteer');

async function generateInvoicePDF(invoiceData) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Create an HTML template for your invoice using invoiceData
    const htmlContent = `
    <html>
      <head>
        <style>
          /* Your CSS styles here */
        </style>
      </head>
      <body>
        <!-- Your invoice content here -->
        <h1>Invoice</h1>
        <p>Invoice Number: ${invoiceData.invoiceNumber}</p>
        <!-- ... Other invoice details ... -->
      </body>
    </html>
  `;

    await page.setContent(htmlContent);

    // Adjust page settings for high quality PDF
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
    });

    await browser.close();

    return pdfBuffer;
}

module.exports = generateInvoicePDF;