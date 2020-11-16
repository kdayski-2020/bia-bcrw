//new
const mongoose = require('mongoose'),
  db = mongoose.createConnection('mongodb://localhost/test', {useNewUrlParser: true, useUnifiedTopology: true}),
  sk_schema = new mongoose.Schema({
	bc_http: String,
	contract_address: String
  }),
  sk_model = db.model('SmartContract', sk_schema);
module.exports = sk_model;
