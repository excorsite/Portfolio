const express = require("express");
const Profile = require("../models/Profile");
const Project = require("../models/Project");
const Experience = require("../models/Experience");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const [profile, projects, experiences] = await Promise.all([
      Profile.findOne().lean(),
      Project.find().sort({ featured: -1, order: 1, createdAt: -1 }).lean(),
      Experience.find().sort({ current: -1, order: 1, startDate: -1 }).lean()
    ]);
    res.json({
      profile: profile || null,
      projects,
      experiences
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
