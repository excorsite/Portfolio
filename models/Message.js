const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, lowercase: true, trim: true },
  subject: { type: String, trim: true, maxlength: 150, default: "" },
  message: { type: String, required: true, trim: true, maxlength: 5000 },
  read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);
