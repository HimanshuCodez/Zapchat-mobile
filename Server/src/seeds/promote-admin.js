// One-off script: grants the admin role to a single account by email.
// Run with: node src/seeds/promote-admin.js someone@example.com
import { config } from "dotenv";
import mongoose from "mongoose";
import User from "../models/user.model.js";

config();

const email = process.argv[2];

if (!email) {
  console.error("Usage: node src/seeds/promote-admin.js <email>");
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(process.env.URI);

  const user = await User.findOneAndUpdate({ email }, { role: "admin" }, { new: true });

  if (!user) {
    console.error(`No user found with email ${email}`);
  } else {
    console.log(`${user.email} is now an admin.`);
  }

  await mongoose.disconnect();
};

run().catch((error) => {
  console.error("Failed to promote admin:", error);
  process.exit(1);
});
