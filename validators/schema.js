// ============================================
// JOI VALIDATION SCHEMAS
// Defines data validation rules for listings
// and reviews using Joi validation library
// ============================================

const joi = require("joi");

// ============================================
// LISTING VALIDATION SCHEMA
// ============================================
/**
 * Validates listing data before saving to database
 * Ensures all required fields are present and valid
 */
module.exports.listingSchema = joi.object({
  listing: joi
    .object({
      // Basic information
      title: joi.string().required(),
      description: joi.string().required(),

      // Pricing and location
      price: joi.number().min(0).required(),
      country: joi.string().required(),
      location: joi.string().required(),

      // Property details
      maxGuests: joi.number().min(1).required(),
      bedrooms: joi.number().min(0).required(),
      beds: joi.number().min(0).required(),
      bathrooms: joi.number().min(0).required(),

      // Category selection (Airbnb-style)
      category: joi
        .array()
        .items(
          joi
            .string()
            .valid(
              "Iconic Cities",
              "Penthouses",
              "Design Homes",
              "Oceanfront",
              "Villas",
              "Mountains",
              "Wellness",
              "For Two",
              "Rooms",
              "Heritage",
              "Islands",
              "Waterfront",
              "Chalets",
              "Desert",
              "Forest",
              "Vineyards"
            )
        )
        .min(1)
        .required(),

      // Image is handled by Cloudinary upload
      image: joi.any(),
    })
    .required(),
});

// ============================================
// REVIEW VALIDATION SCHEMA
// ============================================
/**
 * Validates review data before saving to database
 * Ensures rating is valid and comment is provided
 */
module.exports.reviewSchema = joi.object({
  review: joi
    .object({
      cleanliness: joi.number().min(1).max(5).required(),
      accuracy: joi.number().min(1).max(5).required(),
      checkIn: joi.number().min(1).max(5).required(),
      communication: joi.number().min(1).max(5).required(),
      location: joi.number().min(1).max(5).required(),
      value: joi.number().min(1).max(5).required(),
      comment: joi.string().trim().required(),
    })
    .required(),
});

// ============================================
// USER PROFILE VALIDATION SCHEMA
// ============================================
/**
 * Validates user profile data before saving to database
 * Ensures all required fields for host profiles are present
 */
module.exports.profileSchema = joi
  .object({
    username: joi.string().alphanum().min(3).max(30).required(),
    fullName: joi.string().min(2).max(100).required(),
    bio: joi.string().trim().min(10).max(500).required().messages({
      "string.min": "Please write at least 10 characters in your bio.",
      "string.empty": "Please write at least 10 characters in your bio.",
      "any.required": "Please write at least 10 characters in your bio.",
    }),
    location: joi.string().min(3).max(100).required(),
    languages: joi.string().min(2).max(200).required(),
    work: joi.string().min(2).max(100).required(),
    education: joi.string().min(2).max(100).required(),
    phone: joi.string().allow("").optional(),
  })
  .required();

// ============================================
// USER SIGNUP VALIDATION SCHEMA
// ============================================
/**
 * Validates user signup data
 * Enforces strong password requirements and email format
 */
module.exports.signupSchema = joi
  .object({
    username: joi.string().alphanum().min(3).max(30).required().messages({
      "string.alphanum": "Username must only contain letters and numbers",
      "string.min": "Username must be at least 3 characters long",
      "string.max": "Username cannot exceed 30 characters",
      "any.required": "Username is required",
    }),
    email: joi.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
    password: joi
      .string()
      .min(8)
      .pattern(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]+$"
        )
      )
      .required()
      .messages({
        "string.min": "Password must be at least 8 characters long",
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#)",
        "any.required": "Password is required",
      }),
    confirmPassword: joi
      .string()
      .valid(joi.ref("password"))
      .required()
      .messages({
        "any.only": "Passwords do not match",
        "any.required": "Please confirm your password",
      }),
  })
  .required();

// ============================================
// PASSWORD RESET VALIDATION SCHEMA
// ============================================
/**
 * Validates password reset data
 * Ensures new password meets strength requirements
 */
module.exports.resetPasswordSchema = joi
  .object({
    password: joi
      .string()
      .min(8)
      .pattern(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]+$"
        )
      )
      .required()
      .messages({
        "string.min": "Password must be at least 8 characters long",
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#)",
        "any.required": "Password is required",
      }),
    confirmPassword: joi
      .string()
      .valid(joi.ref("password"))
      .required()
      .messages({
        "any.only": "Passwords do not match",
        "any.required": "Please confirm your password",
      }),
  })
  .required();
