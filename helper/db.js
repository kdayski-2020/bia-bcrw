const mongoose = require("mongoose");
const conf = require("../conf");
const db = conf.mongo_url;
module.exports.connectDb = () => {
  mongoose.connect(db, { useNewUrlParser: true });
  return mongoose.connection;
};
