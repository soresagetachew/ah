const fs = require('fs');
const path = require('path');

// All backend TypeScript files that may still have $N placeholders
const files = [
  'src/utils/serialNumber.ts',
  'src/routes/goodsReceivingNotes.ts',
  'src/routes/purchaseRequisitions.ts',
  'src/routes/paymentRequests.ts',
  'src/routes/storeIssuedVouchers.ts',
  'src/routes/users.ts',
  'src/routes/auth.ts',
  'src/services/notificationService.ts',
  'src/services/approvalService.ts',
];

files.forEach(f => {
  try {
    const full = path.join(__dirname, '..', f);
    let c = fs.readFileSync(full, 'utf8');
    const count = (c.match(/\$\d+/g) || []).length;
    if (count > 0) {
      c = c.replace(/\$\d+/g, '?');
      fs.writeFileSync(full, c);
      console.log(`Fixed ${f} (${count} replacements)`);
    }
  } catch (e) {
    // file doesn't exist, skip
  }
});
console.log('Done.');
