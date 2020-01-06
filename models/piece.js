const mongoose = require("mongoose");

const pieceSchema = mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  stock: Number
});

module.exports = mongoose.model("Piece", pieceSchema);
