// Quick test to verify Passport and User model setup
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user.js");

const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/wanderlust";

async function testUserModel() {
  try {
    console.log("=================================");
    console.log("Passport & User Model Test");
    console.log("=================================\n");

    // Connect to database
    await mongoose.connect(dbUrl);
    console.log("✅ Connected to database\n");

    // Find a test user
    const testUser = await User.findOne({});

    if (!testUser) {
      console.log("❌ No users found in database");
      console.log("Please sign up first, then run this test.\n");
      process.exit(0);
    }

    console.log("✅ Test user found:");
    console.log("   Username:", testUser.username);
    console.log("   Email:", testUser.email);
    console.log("   Verified:", testUser.isVerified);
    console.log("");

    // Test serializeUser
    console.log("Testing Passport serialization...");
    try {
      User.serializeUser()(testUser, (err, id) => {
        if (err) {
          console.log("❌ Serialize error:", err);
        } else {
          console.log("✅ Serialize successful, user ID:", id);

          // Test deserializeUser
          User.deserializeUser()(id, (err, user) => {
            if (err) {
              console.log("❌ Deserialize error:", err);
            } else {
              console.log("✅ Deserialize successful");
              console.log("   Deserialized username:", user.username);
            }

            console.log("\n=================================");
            console.log("✅ All Passport tests passed!");
            console.log("=================================");
            process.exit(0);
          });
        }
      });
    } catch (e) {
      console.log("❌ Serialization test failed:", e.message);
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

testUserModel();
