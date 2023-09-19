const puppeteer = require('puppeteer');

async function generateInvoicePDF(invoiceData) {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // Create an HTML template for your invoice using invoiceData
    const htmlContent = `
   
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice</title>
    <style>
body,html{padding:.5in}header span,td,th{position:relative}.add,.cut,td,th{border-width:1px}*],.add,.cut,header input{cursor:pointer}#invoice,h1{text-transform:uppercase;text-align:center}#bottom-text,#invoice,.add,.cut,h1{text-align:center}*{border:0;box-sizing:content-box;color:inherit;font-family:inherit;font-size:inherit;font-style:inherit;font-weight:inherit;line-height:inherit;list-style:none;margin:0;padding:0;text-decoration:none;vertical-align:top}*],header h1,td,th{border-radius:.25em}*]{min-width:1em;outline:0}*]:focus,*]:hover,img.hover,td:focus *],td:hover *]{background:#def;box-shadow:0 0 1em .5em #def}span]{display:inline-block}h1{font:bold 100% sans-serif;letter-spacing:.5em}table{font-size:75%;table-layout:fixed;width:100%;border-collapse:separate;border-spacing:2px}td,th{padding:.5em;text-align:left;border-style:solid}th{background:#fdba74;border-color:#bbb}td{border-color:#ddd}html{font:16px/1 'Open Sans',sans-serif;overflow:auto;background:#999;cursor:default}body{box-sizing:border-box;height:11in;margin:0 auto;overflow:hidden;width:8.5in;background:#fff;border-radius:1px;box-shadow:0 0 1in -.25in rgba(0,0,0,.5)}article,article address,header,table.inventory,table.meta{margin:0 0 3em}article:after,header:after,table.balance:after,table.meta:after{clear:both;content:"";display:table}header h1{background:#f97316;color:#fff;margin:0 0 1em;padding:.5em 0}header address{float:left;font-size:75%;font-style:normal;line-height:1.25;margin:0 1em 1em 0}header address p{margin:0 0 .25em}header img,header span{display:block;float:right}.add,.cut,article address{float:left;font-weight:700}header span{margin:0 0 1em 1em;max-height:25%;max-width:60%}.cut,article h1,header input{position:absolute}header img{max-height:100%;max-width:100%}header input{height:100%;left:0;opacity:0;top:0;width:100%}article h1{clip:rect(0 0 0 0)}article address{font-size:125%}table.balance,table.meta{float:right;width:36%}table.meta th{width:40%}table.meta td{width:60%}table.inventory{clear:both;width:100%}table.inventory th{font-weight:700;text-align:center}table.inventory td:first-child{width:26%}table.inventory td:nth-child(2){width:38%}table.inventory td:nth-child(3),table.inventory td:nth-child(4),table.inventory td:nth-child(5){text-align:right;width:12%}table.balance td,table.balance th{width:50%}table.balance td{text-align:right}aside h1{border:#999;border-width:0 0 1px;margin:0 0 1em;border-bottom-style:solid}.add,.cut{display:block;font-size:.8rem;padding:.25em .5em;width:.6em;background:#9af;box-shadow:0 1px 2px rgba(0,0,0,.2);background-image:-moz-linear-gradient(#00adee 5%,#0078a5 100%);background-image:-webkit-linear-gradient(#00adee 5%,#0078a5 100%);border-radius:.5em;border-color:#0076a3;color:#fff;text-shadow:0 -1px 2px rgba(0,0,0,.333)}.add{margin:-2.5em 0 0}.add:hover{background:#00adee}.cut{opacity:0;top:0;left:-1.5em;-webkit-transition:opacity .1s ease-in}tr:hover .cut{opacity:1}@media print{*{-webkit-print-color-adjust:exact}html{background:0 0;padding:0}body{box-shadow:none;margin:0}.add,.cut,span:empty{display:none}}@page{margin:0}#paid{color:green}#invoice{padding:6px 0;width:100%;color:#fff;background-color:#9ca3af;font-size:15px;letter-spacing:1rem;border-radius:6px;margin-bottom:1rem}#bottom-text{font-size:12px;color:#9ca3af}
    </style>
</head>
<body>
    <header>
    <h1>Hungry Bunny</h1>
    <div id='invoice'>
        <p>Invoice</p>
    </div>
        <address>
            <p>Invoice to : </p>
            <p>${invoiceData.name}</p>
            <p>${invoiceData.email}</p>
        </address>
        <span><img alt="" src="https://hungry-bunny-web.web.app/assets/dark-logo-9529fd8e.png"><input type="file" accept="image/*"></span>
    </header>
    <article>
        <h1>Recipient</h1>
        <address>
            <p id='paid'>Paid</p>
        </address>
        <table class="meta">
            <tr>
                <th><span>Invoice #</span></th>
                <td><span>101138</span></td>
            </tr>
            <tr>
                <th><span>Date</span></th>
                <td><span>${invoiceData.date}</span></td>
            </tr>
            <tr>
                <th><span>Amount Due</span></th>
                <td><span id="prefix">$</span><span>${invoiceData.amountDue}</span></td>
            </tr>
        </table>
        <table class="inventory">
            <thead>
                <tr>
                    <th><span>Item</span></th>
                    <th><span>Description</span></th>
                    <th><span>Rate</span></th>
                    <th><span>Quantity</span></th>
                    <th><span>Price</span></th>
                </tr>
            </thead>
            <tbody>
               <!-- <tr>
                    <td><a class="cut">-</a><span>Front End Consultation</span></td>
                    <td><span>Experience Review</span></td>
                    <td><span data-prefix>$</span><span>150.00</span></td>
                    <td><span>4</span></td>
                    <td><span data-prefix>$</span><span>600.00</span></td>
                </tr> -->
                ${invoiceData.items.map(item => `
                    <tr>
                        <td><a class="cut">-</a><span>${item.name}</span></td>
                        <td><span>${item.description}</span></td>
                        <td><span data-prefix>$</span><span>${item.rate}</span></td>
                        <td><span>${item.quantity}</span></td>
                        <td><span data-prefix>$</span><span>${item.price}</span></td>
                    </tr>
                `).join('')
        }

            </tbody>
        </table>
        <a class="add">+</a>
        <table class="balance">
            <tr>
                <th><span>Total</span></th>
                <td><span data-prefix>$</span><span>${invoiceData.totalPaid}</span></td>
            </tr>
            <tr>
                <th><span>Amount Paid</span></th>
                <td><span data-prefix>$</span><span>${invoiceData.totalPaid}</span></td>
            </tr>
            <tr>
                <th><span>Balance Due</span></th>
                <td><span data-prefix>$</span><span>00</span></td>
            </tr>
        </table>
    </article>
    <aside>
        <h1><span>Additional Notes</span></h1>
        <div>
            <p id='bottom-text'>A finance charge of 1.5% will be made on unpaid balances after 30 days.</p>
        </div>
    </aside>
</body>
</html>
  `;
        

    await page.setContent(htmlContent);

    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,

    });

    await browser.close();

    return pdfBuffer;
}

module.exports = generateInvoicePDF;