const { createPurchaseRequisition } = require('./src/controllers/purchaseRequisitionController');

const req = {
  body: {
    project_id: null,
    reason: 'Testing',
    cheque_no: '',
    items: [{ description: 'Test', unit: 'Pcs', quantity: 1, unit_price: 100 }]
  },
  user: {
    id: 'f18d7de7-b087-4d92-a128-40b9c3fdfa8c',
    department_id: 'e69a039b-fc43-41ec-b0cf-5cc2d18cb3e2',
    role: 'Staff'
  }
};

const res = {
  status: function(code) {
    console.log('Status:', code);
    return this;
  },
  json: function(data) {
    console.log('JSON:', JSON.stringify(data));
    return this;
  }
};

(async () => {
  // We have to use ts-node or register to run typescript code
})();
