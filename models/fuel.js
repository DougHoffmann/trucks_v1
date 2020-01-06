const mongoose = require("mongoose");

const fuelSchema = mongoose.Schema({
  price: Number
});

module.exports = mongoose.model("Fuel", fuelSchema);
