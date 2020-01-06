const mongoose = require("mongoose");

const usedTireSchema = mongoose.Schema({
  cod: String,
  brand: String,
  mileage: Number,
  truck: String,
  removeDate: Date
});

module.exports = mongoose.model("usedTire", usedTireSchema);
