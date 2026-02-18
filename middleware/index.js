// ============================================
// MIDDLEWARE: Authentication & Authorization
// ============================================

const Listing = require("../models/listing");
const Review = require("../models/review.js");
const {
  listingSchema,
  reviewSchema,
  profileSchema,
  signupSchema,
  resetPasswordSchema,
} = require("../validators/schema.js");
const ExpressError = require("../utils/ExpressError.js");

/**
 * Middleware: Check if user is logged in
 * Redirects to login page if not authenticated
 * Saves the original URL for redirect after login
 */
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to perform this action!");
    return res.redirect("/login");
  }
  next();
};

/**
 * Middleware: Save redirect URL from session to response locals
 * Used to redirect user to their original page after login
 */
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

/**
 * Middleware: Check if current user is the owner of a listing
 * Prevents unauthorized users from editing/deleting listings
 */
module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);

  if (!listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this listing!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

/**
 * Middleware: Validate listing data against schema
 * Ensures data integrity before saving to database
 */
module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map(el => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

/**
 * Middleware: Validate review data against schema
 * Ensures review data integrity before saving
 */
module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map(el => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

/**
 * Middleware: Validate user profile data against schema
 * Ensures profile data integrity before saving
 */
module.exports.validateProfile = (req, res, next) => {
  let { error } = profileSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map(el => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

/**
 * Middleware: Check if current user is the author of a review
 * Prevents unauthorized users from deleting reviews
 */
module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);

  if (!review.author._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the author of this review!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

/**
 * Middleware: Check if user's profile is complete
 * Required for hosting a listing
 */
module.exports.isProfileComplete = async (req, res, next) => {
  const User = require("../models/user.js");
  const user = await User.findById(req.user._id);

  // Check if all required profile fields are filled
  const isComplete =
    user.fullName &&
    user.bio &&
    user.location &&
    user.languages &&
    user.work &&
    user.education;

  if (!isComplete) {
    req.flash(
      "error",
      "You need to complete your profile in order to become a host on Wanderlust!"
    );
    return res.redirect("/profile/complete");
  }

  next();
};

/**
 * Middleware: Validate signup data against schema
 * Ensures password strength and data integrity
 */
module.exports.validateSignup = (req, res, next) => {
  let { error } = signupSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map(el => el.message).join(", ");
    req.flash("error", errMsg);
    return res.redirect("/signup");
  } else {
    next();
  }
};

/**
 * Middleware: Validate password reset data against schema
 * Ensures new password meets strength requirements
 */
module.exports.validatePasswordReset = (req, res, next) => {
  let { error } = resetPasswordSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map(el => el.message).join(", ");
    req.flash("error", errMsg);
    return res.redirect("back");
  } else {
    next();
  }
};

/**
 * Middleware: Check if user's email is verified
 * Prevents unverified users from accessing certain features
 */
module.exports.isEmailVerified = (req, res, next) => {
  if (req.isAuthenticated() && !req.user.isVerified) {
    req.flash(
      "error",
      "Please verify your email address to access this feature. Check your inbox for the verification link."
    );
    return res.redirect("/listings");
  }
  next();
};
