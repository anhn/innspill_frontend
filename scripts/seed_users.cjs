/*
  Seed script for MongoDB:
  - Database: ai4edu_database
  - Collection: ai4edu_user
  - Creates 5 test users with hashed passwords and demographics

  Usage:
    1) Ensure MongoDB is running locally or set MONGO_URI env var
    2) From project root, run: node scripts/seed_users.cjs

  Env:
    MONGO_URI (optional) e.g. mongodb://127.0.0.1:27017/ai4edu_database
*/

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ai4edu_database";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["teacher", "student", "admin", "researcher", "guest"],
    },
    country: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    collection: "ai4edu_user",
    timestamps: true,
  },
);

const User = mongoose.model("Ai4EduUser", userSchema);

async function seed() {
  console.log(`Connecting to: ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI, { dbName: "ai4edu_database" });

  const users = [
    {
      username: "tester",
      password: "Test123",
      role: "teacher",
      country: "Norway",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      username: "linh",
      password: "Test123",
      role: "student",
      country: "Vietnam",
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      username: "oslo_admin",
      password: "Test123",
      role: "admin",
      country: "Norway",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      username: "research_uio",
      password: "Test123",
      role: "researcher",
      country: "Norway",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      username: "guest_bi",
      password: "Test123",
      role: "guest",
      country: "Norway",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const update = {
      username: u.username,
      passwordHash,
      role: u.role,
      country: u.country,
      createdAt: u.createdAt,
    };
    const res = await User.findOneAndUpdate(
      { username: u.username },
      { $set: update },
      { upsert: true, new: true },
    );
    console.log(`Upserted user: ${res.username}`);
  }

  await mongoose.disconnect();
  console.log("Seeding completed.");
}

seed().catch(async (err) => {
  console.error("Seeding failed:", err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
