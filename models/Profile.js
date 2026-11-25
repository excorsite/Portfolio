const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, default: "Arpan" },
  title: { type: String, trim: true, default: "Full-Stack Developer" },
  bio: { type: String, default: "" },
  location: { type: String, default: "" },
  email: { type: String, lowercase: true, trim: true, default: "" },
  phone: { type: String, default: "" },
  github: { type: String, default: "" },
  linkedin: { type: String, default: "" },
  website: { type: String, default: "" },
  cvUrl: { type: String, default: "" },
  skills: [{ type: String, trim: true }]
}, { timestamps: true });

module.exports = mongoose.model("Profile", profileSchema);
