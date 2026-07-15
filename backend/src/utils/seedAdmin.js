const dotenv = require("dotenv");
const connectDB = require("../config/db");
const User = require("../models/User");

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const email = process.env.SEED_ADMIN_EMAIL || "admin@rbc.com";
    const password = process.env.SEED_ADMIN_PASSWORD || "Admin@12345";

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`Master admin already exists: ${email}`);
      process.exit(0);
    }

    await User.create({
      name: "RBC Master Admin",
      email,
      password,
      role: "masterAdmin",
      isActive: true,
    });

    console.log("Master admin created successfully");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed master admin:", error.message);
    process.exit(1);
  }
};

seedAdmin();
