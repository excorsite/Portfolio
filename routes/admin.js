const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const requireAuth = require("../middleware/auth");
const Profile = require("../models/Profile");
const Project = require("../models/Project");
const Experience = require("../models/Experience");
const Message = require("../models/Message");

const router = express.Router();
router.use(requireAuth);

const uploadsDir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-z0-9._-]/gi, "-");
    cb(null, `cv-${Date.now()}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed"));
  }
});

router.get("/dashboard", async (req, res, next) => {
  try {
    const [profile, projects, experiences, messages, unread] = await Promise.all([
      Profile.findOne(),
      Project.find(),
      Experience.find(),
      Message.find().sort({ createdAt: -1 }),
      Message.countDocuments({ read: false })
    ]);
    res.json({ profile, projects, experiences, messages, unread });
  } catch (error) {
    next(error);
  }
});

router.put("/profile", async (req, res, next) => {
  try {
    const allowed = ["name", "title", "bio", "location", "email", "phone", "github", "linkedin", "website", "cvUrl", "skills"];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    if (typeof updates.skills === "string") updates.skills = updates.skills.split(",").map((item) => item.trim()).filter(Boolean);
    const profile = await Profile.findOneAndUpdate({}, updates, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true });
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

router.post("/cv", upload.single("cv"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "A PDF CV is required" });
    const cvUrl = `/uploads/${req.file.filename}`;
    const profile = await Profile.findOneAndUpdate({}, { cvUrl }, { new: true, upsert: true, setDefaultsOnInsert: true });
    res.json({ cvUrl, profile });
  } catch (error) {
    next(error);
  }
});

router.post("/projects", async (req, res, next) => {
  try {
    res.status(201).json(await Project.create(req.body));
  } catch (error) {
    next(error);
  }
});

router.put("/projects/:id", async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (error) {
    next(error);
  }
});

router.delete("/projects/:id", async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.post("/experiences", async (req, res, next) => {
  try {
    res.status(201).json(await Experience.create(req.body));
  } catch (error) {
    next(error);
  }
});

router.put("/experiences/:id", async (req, res, next) => {
  try {
    const experience = await Experience.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!experience) return res.status(404).json({ message: "Experience not found" });
    res.json(experience);
  } catch (error) {
    next(error);
  }
});

router.delete("/experiences/:id", async (req, res, next) => {
  try {
    const experience = await Experience.findByIdAndDelete(req.params.id);
    if (!experience) return res.status(404).json({ message: "Experience not found" });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.patch("/messages/:id/read", async (req, res, next) => {
  try {
    const message = await Message.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!message) return res.status(404).json({ message: "Message not found" });
    res.json(message);
  } catch (error) {
    next(error);
  }
});

router.delete("/messages/:id", async (req, res, next) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ message: "Message not found" });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
