const mongoose = require("mongoose");

const typeSchema = mongoose.Schema({
  name: String,
  color: String
});

module.exports = mongoose.model("types", typeSchema);
