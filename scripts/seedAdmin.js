require("dotenv").config();
const connectDatabase = require("../config/db");
const env = require("../config/env");
const User = require("../models/User");

async function seed() {
  await connectDatabase(env.mongoUri);
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const name = process.env.ADMIN_NAME || "Portfolio Admin";

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
  } else {
    await User.create({ name, email, password });
    console.log(`Admin created: ${email}`);
    console.log(`Temporary password: ${password}`);
  }
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
