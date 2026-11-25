const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  image: { type: String, default: "" },
  technologies: [{ type: String, trim: true }],
  githubUrl: { type: String, default: "" },
  liveUrl: { type: String, default: "" },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Project", projectSchema);
