import puppeteer from 'puppeteer';

export const generatePDF = async (htmlContent: string) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  
  const pdfBuffer = await page.pdf({
    format: 'A4',
    margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
    printBackground: true
  });
  
  await browser.close();
  
  return pdfBuffer;
};

// HTML templates for different documents
export const getPRTemplate = (data: any) => {
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: bold; text-decoration: underline; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 50px; }
          .sig-box { border-top: 1px solid #000; padding-top: 5px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">Purchase Requisition</h1>
          <p>Serial No: <strong>${data.serial_no}</strong></p>
        </div>
        
        <div class="info-grid">
          <div><p><strong>Requested By:</strong> ${data.requester_name}</p></div>
          <div><p><strong>Department:</strong> ${data.department_name}</p></div>
          <div><p><strong>Date:</strong> ${new Date(data.created_at).toLocaleDateString()}</p></div>
          <div><p><strong>Reason:</strong> ${data.reason}</p></div>
        </div>
        
        <table>
          <thead>
            <tr><th>Description</th><th>Unit</th><th>Qty</th><th>Unit Price</th><th>Total Amount</th></tr>
          </thead>
          <tbody>
            ${data.items.map((item: any) => `
              <tr>
                <td>${item.description}</td>
                <td>${item.unit}</td>
                <td>${item.quantity}</td>
                <td>ETB ${Number(item.unit_price).toLocaleString()}</td>
                <td>ETB ${Number(item.requested_amount).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" style="text-align: right; font-weight: bold;">Total:</td>
              <td style="font-weight: bold;">ETB ${Number(data.total_requested).toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
        
        <div class="signatures">
          <div class="sig-box">Requested By<br><br>${data.requester_name}</div>
          <div class="sig-box">Checked By<br><br>_________________</div>
          <div class="sig-box">Approved By<br><br>_________________</div>
        </div>
      </body>
    </html>
  `;
};

export const getGRNTemplate = (data: any) => {
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: bold; text-decoration: underline; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 50px; }
          .sig-box { border-top: 1px solid #000; padding-top: 5px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">Goods Receiving Note</h1>
          <p>Serial No: <strong>${data.serial_no}</strong></p>
        </div>
        <div class="info-grid">
          <div><p><strong>Supplier:</strong> ${data.supplier_name}</p></div>
          <div><p><strong>Invoice No:</strong> ${data.invoice_no}</p></div>
          <div><p><strong>Date:</strong> ${new Date(data.created_at).toLocaleDateString()}</p></div>
          <div><p><strong>Received By:</strong> ${data.receiver_name}</p></div>
        </div>
        <table>
          <thead>
            <tr><th>Description</th><th>Unit</th><th>Qty Received</th><th>Unit Cost</th><th>Total Cost</th></tr>
          </thead>
          <tbody>
            ${data.items.map((item: any) => `
              <tr>
                <td>${item.description}</td>
                <td>${item.unit}</td>
                <td>${item.quantity_received}</td>
                <td>ETB ${Number(item.unit_cost).toLocaleString()}</td>
                <td>ETB ${Number(item.total_cost).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="signatures">
          <div class="sig-box">Storekeeper Signature<br><br>${data.receiver_name}</div>
          <div class="sig-box">Checked By<br><br>_________________</div>
        </div>
      </body>
    </html>
  `;
};

export const getSIVTemplate = (data: any) => {
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: bold; text-decoration: underline; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 50px; }
          .sig-box { border-top: 1px solid #000; padding-top: 5px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">Store Issued Voucher</h1>
          <p>Serial No: <strong>${data.serial_no}</strong></p>
        </div>
        <div class="info-grid">
          <div><p><strong>Issued To:</strong> ${data.issued_to_name}</p></div>
          <div><p><strong>Cost Center:</strong> ${data.cost_center}</p></div>
          <div><p><strong>Date:</strong> ${new Date(data.created_at).toLocaleDateString()}</p></div>
          <div><p><strong>Issued By:</strong> ${data.issued_by_name}</p></div>
        </div>
        <table>
          <thead>
            <tr><th>Description</th><th>Unit</th><th>Qty Issued</th><th>Unit Cost</th><th>Total Cost</th></tr>
          </thead>
          <tbody>
            ${data.items.map((item: any) => `
              <tr>
                <td>${item.description}</td>
                <td>${item.unit}</td>
                <td>${item.qty_issued}</td>
                <td>ETB ${Number(item.unit_cost).toLocaleString()}</td>
                <td>ETB ${Number(item.total_cost).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="signatures">
          <div class="sig-box">Issued By<br><br>${data.issued_by_name}</div>
          <div class="sig-box">Received By<br><br>${data.issued_to_name}</div>
        </div>
      </body>
    </html>
  `;
};

export const getPRFTemplate = (data: any) => {
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: bold; text-decoration: underline; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
          .total-box { border: 2px solid #000; padding: 15px; margin-bottom: 30px; background: #f9f9f9; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 50px; }
          .sig-box { border-top: 1px solid #000; padding-top: 5px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">Payment Request Form</h1>
          <p>Serial No: <strong>${data.serial_no}</strong></p>
        </div>
        <div class="info-grid">
          <div><p><strong>Requested By:</strong> ${data.requester_name}</p></div>
          <div><p><strong>Department:</strong> ${data.department_name}</p></div>
          <div><p><strong>Business Unit:</strong> ${data.business_unit}</p></div>
          <div><p><strong>Project/Site:</strong> ${data.project_site}</p></div>
          <div><p><strong>Payment Mode:</strong> ${data.mode}</p></div>
          <div><p><strong>Date:</strong> ${new Date(data.created_at).toLocaleDateString()}</p></div>
        </div>
        <div style="margin-bottom: 20px;">
          <p><strong>Purpose of Payment:</strong></p>
          <p>${data.purpose}</p>
        </div>
        <div class="total-box">
          <p><strong>Amount in Figures:</strong> ETB ${Number(data.amount_figure).toLocaleString('en-ET', { minimumFractionDigits: 2 })}</p>
          <p><strong>Amount in Words:</strong> ${data.amount_words}</p>
        </div>
        <div class="signatures">
          <div class="sig-box">Requested By<br><br>${data.requester_name}</div>
          <div class="sig-box">Checked By<br><br>_________________</div>
          <div class="sig-box">Authorized By<br><br>_________________</div>
        </div>
        <div style="margin-top: 40px; border: 1px dashed #ccc; padding: 15px;">
          <p style="text-align: center; font-size: 10px; color: #666;">FOR DISBURSEMENT SECTION ONLY</p>
          <div class="signatures" style="margin-top: 20px;">
            <div class="sig-box">Account Checked</div>
            <div class="sig-box">Approved By</div>
            <div class="sig-box">Budget Approved</div>
          </div>
        </div>
      </body>
    </html>
  `;
};
