const path = require("path");
const fs = require("fs");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const connectDatabase = require("./config/db");
const env = require("./config/env");
const sanitizeBody = require("./middleware/sanitize");
const errorHandler = require("./middleware/errorHandler");
const Profile = require("./models/Profile");

const app = express();
const uploadsDir = path.join(__dirname, "uploads");

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: env.clientUrl === "*" ? true : env.clientUrl, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(sanitizeBody);

app.use("/api/portfolio", require("./routes/portfolio"));
app.use("/api/contact", require("./routes/contact"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));

app.use("/uploads", express.static(uploadsDir));
app.get("/uploads/:filename", async (req, res, next) => {
  try {
    const profile = await Profile.findOne().select("cvUrl").lean();
    const configuredFilename = profile && profile.cvUrl &&
      profile.cvUrl.startsWith("/uploads/")
      ? path.basename(profile.cvUrl)
      : null;
    const configuredPath = configuredFilename && path.join(uploadsDir, configuredFilename);

    if (configuredPath && fs.existsSync(configuredPath)) {
      return res.redirect(`/uploads/${encodeURIComponent(configuredFilename)}`);
    }

    const pdfFiles = fs.readdirSync(uploadsDir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === ".pdf")
      .map((entry) => entry.name);

    if (pdfFiles.length === 1) {
      return res.type("application/pdf").sendFile(path.join(uploadsDir, pdfFiles[0]));
    }

    return res.status(404).json({
      message: pdfFiles.length
        ? "CV URL is missing or ambiguous. Upload the CV again from the admin dashboard."
        : "CV file not found. Upload a PDF from the admin dashboard."
    });
  } catch (error) {
    next(error);
  }
});
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use(errorHandler);

async function start() {
  await connectDatabase(env.mongoUri);
  app.listen(env.port, () => {
    console.log(`Portfolio server running at http://localhost:${env.port}`);
  });
}

if (require.main === module) start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

module.exports = app;
