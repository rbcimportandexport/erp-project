const dotenv = require("dotenv");
const connectDB = require("../config/db");
const User = require("../models/User");

dotenv.config();

const users = [
  {
    name: "RBC Master Admin",
    email: process.env.SEED_ADMIN_EMAIL || "admin@rbc.com",
    password: process.env.SEED_ADMIN_PASSWORD || "Admin@12345",
    role: "masterAdmin",
    isActive: true,
  },
  {
    name: "RBC User",
    email: process.env.SEED_USER_EMAIL || "user@rbc.com",
    password: process.env.SEED_USER_PASSWORD || "User@12345",
    role: "user",
    isActive: true,
  },
];

const seedUsers = async () => {
  try {
    await connectDB();

    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });

      if (existingUser) {
        existingUser.name = userData.name;
        existingUser.role = userData.role;
        existingUser.isActive = true;
        existingUser.password = userData.password;
        await existingUser.save();
        console.log(`Updated user: ${userData.email}`);
      } else {
        await User.create(userData);
        console.log(`Created user: ${userData.email}`);
      }
    }

    console.log("Seed users ready");
    console.log("Admin: admin@rbc.com / Admin@12345");
    console.log("User : user@rbc.com / User@12345");
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed users:", error.message);
    process.exit(1);
  }
};

seedUsers();
