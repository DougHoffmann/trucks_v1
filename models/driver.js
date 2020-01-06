const mongoose = require("mongoose");

const driverSchema = mongoose.Schema({
  name: String,
  license: String,
  salary: Number,
  status: Boolean
});

module.exports = mongoose.model("Driver", driverSchema);
