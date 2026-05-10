const http = require('http');

async function testHttp() {
  console.log('Logging in...');
  const resAuth = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@ahg.com', password: 'Admin@123' })
  });
  const authData = await resAuth.json();
  if (!authData.token) {
    console.log('Login failed', authData);
    return;
  }
  const token = authData.token;
  console.log('Token acquired');

  console.log('Creating PR...');
  const resPr = await fetch('http://localhost:5000/api/purchase-requisitions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      project_id: '',
      reason: 'test',
      cheque_no: '',
      items: [{ description: 'test', unit: 'Pcs', quantity: '1', unit_price: '1' }]
    })
  });
  
  const prText = await resPr.text();
  console.log('PR Response Status:', resPr.status);
  console.log('PR Response:', prText);
}

testHttp().catch(console.error);
