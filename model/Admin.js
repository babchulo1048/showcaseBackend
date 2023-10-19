const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    minLength: 5,
    required: true,
  },
});

const Admin = mongoose.model("admin", adminSchema);

module.exports = Admin;
