const express = require("express");
const rateLimit = require("express-rate-limit");
const Message = require("../models/Message");

const router = express.Router();
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many messages. Please try again later." }
});

router.post("/", contactLimiter, async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email, and message are required" });
    }
    const created = await Message.create({ name, email, subject, message });
    res.status(201).json({ message: "Your message has been sent", id: created._id });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
