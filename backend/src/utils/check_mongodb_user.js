const mongoose = require("mongoose");

const MONGO_URI = "mongodb+srv://rbc_user:RbcPassword123@cluster0.fwfsu0z.mongodb.net/rbc_erp?retryWrites=true&w=majority&appName=Cluster0";

const check = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const users = await mongoose.connection.db.collection("users").find({}).toArray();
    console.log("Users in MongoDB:", users.map(u => ({ id: u._id, email: u.email, role: u.role, isActive: u.isActive })));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

check();
