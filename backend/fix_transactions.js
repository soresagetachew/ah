const fs = require('fs');
const files = [
  'src/controllers/purchaseRequisitionController.ts',
  'src/controllers/grnController.ts',
  'src/controllers/sivController.ts',
  'src/controllers/paymentRequestController.ts',
];

// MySQL2 doesn't have pool.connect() / client.release() pattern for transactions
// Instead we use: BEGIN, COMMIT, ROLLBACK directly on the pool
// Also replace: const client = await pool.connect() → (nothing, use pool directly)
// client.query → pool.query
// client.release() → (nothing)
// await client.query('BEGIN') → await pool.query('BEGIN')

files.forEach(f => {
  try {
    let c = fs.readFileSync(f, 'utf8');
    const before = c;

    // Remove: const client = await pool.connect();
    c = c.replace(/const client = await pool\.connect\(\);?\n?/g, '');
    // Replace: client.query → pool.query
    c = c.replace(/client\.query/g, 'pool.query');
    // Remove: client.release(); lines
    c = c.replace(/\s*client\.release\(\);?\n?/g, '\n');

    if (c !== before) {
      fs.writeFileSync(f, c);
      console.log(`Fixed transaction pattern in ${f}`);
    } else {
      console.log(`No changes needed: ${f}`);
    }
  } catch (e) {
    console.log('Skip:', f, e.message);
  }
});
console.log('Done.');
