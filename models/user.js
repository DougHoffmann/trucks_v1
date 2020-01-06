const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  user: String,
  password: String
});

module.exports = mongoose.model("User", userSchema);
