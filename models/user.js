// ============================================
// USER MODEL
// Defines the schema for user accounts
// Uses Passport.js for authentication
// ============================================

const { required } = require("joi");
const mongoose = require("mongoose");
const { default: passportLocalMongoose } = require("passport-local-mongoose");
const Schema = mongoose.Schema;
const PassportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
    },

    // Email verification fields
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    verificationExpires: {
      type: Date,
    },

    // Password reset fields
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },

    // Profile fields
    bio: {
      type: String,
      default: "",
    },
    fullName: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    languages: {
      type: String,
      default: "",
    },
    work: {
      type: String,
      default: "",
    },
    education: {
      type: String,
      default: "",
    },

    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Listing",
      },
    ],
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Add Passport.js plugin for local authentication
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
