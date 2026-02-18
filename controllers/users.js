// ========================================
// User Controller
// Handles user authentication: signup, login, and logout
// ========================================

const User = require("../models/user.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { profileSchema } = require("../validators/schema.js");
const crypto = require("crypto");
const {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
} = require("../utils/emailService.js");

// ========================================
// SIGNUP CONTROLLER
// ========================================

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
  res.locals.hideNavbarExtras = true;

  try {
    const { username, email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      req.flash("error", "An account with this email already exists");
      return res.redirect("/signup");
    }

    // Generate verification token (32 random bytes)
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create new user with verification token
    const newUser = new User({
      email: email.toLowerCase(),
      username,
      verificationToken,
      verificationExpires,
      isVerified: false,
    });

    // Register user with passport-local-mongoose
    await User.register(newUser, password);

    // Send verification email
    await sendVerificationEmail(email, username, verificationToken);

    // Store email in session for verification notice page
    req.session.verificationEmail = email;

    // Save session and redirect to verification notice page
    req.session.save(err => {
      if (err) {
        console.error("❌ Session save error:", err);
      }
      res.redirect("/verify-email-notice");
    });
  } catch (e) {
    // Handle registration errors
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

// ========================================
// EMAIL VERIFICATION NOTICE PAGE
// ========================================

module.exports.renderVerificationNoticePage = (req, res) => {
  // Get email from session
  const email = req.session.verificationEmail;

  if (!email) {
    // If no email in session, redirect to signup
    req.flash("error", "Please sign up to create an account");
    return res.redirect("/signup");
  }

  // Keep email in session (don't delete) so user can refresh or resend
  res.render("users/verify-email-notice.ejs", { email });
};

// ========================================
// EMAIL VERIFICATION CONTROLLER
// ========================================

module.exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Find user with this verification token
    let user = await User.findOne({
      verificationToken: token,
      verificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      req.flash("error", "Verification link is invalid or has expired");
      return res.redirect("/signup");
    }

    // Mark user as verified and clear verification fields
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    // Send welcome email (don't await to avoid blocking)
    sendWelcomeEmail(user.email, user.username).catch(err =>
      console.error("Welcome email error:", err)
    );

    // Auto-login the user after verification

    // Clear verification email from session (user is verified now)
    delete req.session.verificationEmail;

    req.login(user, err => {
      if (err) {
        console.error("❌ Auto-login error:", err);
        console.error("Error details:", JSON.stringify(err, null, 2));
        req.flash(
          "success",
          "Email verified successfully! Please log in to continue."
        );
        return res.redirect("/login");
      }

      // IMPORTANT: Save session before redirecting to ensure user stays logged in
      req.session.save(err => {
        if (err) {
          console.error("❌ Session save error:", err);
          req.flash(
            "success",
            "Email verified successfully! Please log in to continue."
          );
          return res.redirect("/login");
        }
        req.flash(
          "success",
          `🎉 Welcome to Wanderlust, ${user.username}! Your email has been verified successfully.`
        );
        res.redirect("/listings");
      });
    });
  } catch (e) {
    console.error("❌ Verification error:", e);
    req.flash("error", "An error occurred during verification");
    res.redirect("/signup");
  }
};

// ========================================
// RESEND VERIFICATION EMAIL
// ========================================

module.exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    // Find unverified user with this email
    const user = await User.findOne({
      email: email.toLowerCase(),
      isVerified: false,
    });

    if (!user) {
      req.flash("error", "No unverified account found with this email address");
      return res.redirect("/login");
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    user.verificationToken = verificationToken;
    user.verificationExpires = verificationExpires;
    await user.save();

    // Send new verification email
    await sendVerificationEmail(user.email, user.username, verificationToken);

    // Store email in session to stay on verification notice page
    req.session.verificationEmail = email;
    req.flash(
      "success",
      "Verification email has been resent! Please check your inbox."
    );

    req.session.save(err => {
      if (err) {
        console.error("❌ Session save error:", err);
      }
      res.redirect("/verify-email-notice");
    });
  } catch (e) {
    req.flash("error", "Failed to send verification email");
    res.redirect("/login");
  }
};

// ========================================
// LOGIN CONTROLLER
// ========================================

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  res.locals.hideNavbarExtras = true;

  // Check if user's email is verified
  if (!req.user.isVerified) {
    req.logout(err => {
      if (err) {
        req.flash("error", "An error occurred");
        return res.redirect("/login");
      }

      req.flash(
        "error",
        "Please verify your email before logging in. Check your inbox for the verification link."
      );
      res.redirect("/login");
    });
    return;
  }

  req.flash("success", "Welcome back to Wanderlust!");

  // Redirect to the page user was trying to access, or default to listings
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

// ========================================
// PROFILE CONTROLLERS
// ========================================

module.exports.renderProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  const hostedCount = await Listing.countDocuments({ owner: req.user._id });

  const reviews = await Review.find({
    author: req.user._id,
    listing: { $exists: true },
  }).populate("listing");

  res.render("users/profile", {
    user,
    currUser: user,
    reviews,
    hostedCount,
  });
};

module.exports.renderCompleteProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.render("users/complete-profile", {
    user,
    currUser: user,
    profileFormData: user,
    bioError: null,
  });
};

module.exports.renderReviewsPage = async (req, res) => {
  const user = await User.findById(req.user._id);

  const reviewsWritten = await Review.find({
    author: req.user._id,
    listing: { $exists: true },
  }).populate("listing");

  const userListings = await Listing.find({ owner: req.user._id });
  const listingIds = userListings.map(listing => listing._id);

  const reviewsAboutUser = await Review.find({
    listing: { $in: listingIds },
  })
    .populate("listing")
    .populate("author");

  res.render("users/reviews", {
    user,
    currUser: user,
    reviewsWritten,
    reviewsAboutUser,
  });
};

module.exports.updateProfile = async (req, res, next) => {
  const { error, value } = profileSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const bioValidationError = error.details.find(detail =>
      detail.path.includes("bio")
    );

    if (bioValidationError) {
      const user = await User.findById(req.user._id);
      return res.status(422).render("users/complete-profile", {
        user,
        currUser: user,
        profileFormData: req.body,
        bioError:
          "Please write at least 10 characters in your bio before saving.",
      });
    }

    const errMsg = error.details.map(detail => detail.message).join(", ");
    req.flash("error", errMsg);
    return res.redirect("/profile/complete");
  }

  const {
    username,
    bio,
    fullName,
    phone,
    location,
    languages,
    work,
    education,
  } = value;

  const user = await User.findById(req.user._id);

  user.username = username;
  user.bio = bio.trim();
  user.fullName = fullName || "";
  user.phone = phone || "";
  user.location = location || "";
  user.languages = languages || "";
  user.work = work || "";
  user.education = education || "";

  await user.save();

  req.login(user, err => {
    if (err) return next(err);
    req.flash("success", "Profile updated successfully");
    res.redirect("/profile");
  });
};

module.exports.testSession = (req, res) => {
  req.session.testData = "Hello from session!";
  req.session.testTime = new Date().toISOString();

  req.session.save(err => {
    if (err) {
      console.error("❌ SESSION SAVE ERROR:", err);
      return res.send(`
        <h1>Session Test FAILED</h1>
        <p><strong>Error:</strong> ${err.message}</p>
        <p>Check server console for details</p>
      `);
    }

    res.send(`
      <h1>Session Diagnostic Results</h1>
      <p><strong>Session ID:</strong> ${req.sessionID}</p>
      <p><strong>Session saved:</strong> ✅ Success</p>
      <p><strong>Test data:</strong> ${req.session.testData}</p>
      <hr>
      <h3>Next Steps:</h3>
      <ol>
        <li>Open browser console (F12)</li>
        <li>Type: <code>document.cookie</code></li>
        <li>You should see a session cookie (connect.sid)</li>
        <li>Share the console output with me</li>
      </ol>
      <hr>
      <p><a href="/test-session">Refresh this page</a> to verify session persists</p>
    `);
  });
};

// ========================================
// LOGOUT CONTROLLER
// ========================================

module.exports.logout = (req, res, next) => {
  req.logout(err => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out!");
    res.redirect("/listings");
  });
};

// ========================================
// FORGOT PASSWORD CONTROLLER
// ========================================

module.exports.renderForgotPasswordForm = (req, res) => {
  res.render("users/forgot-password.ejs");
};

module.exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if email exists or not for security
      req.flash(
        "success",
        "If an account with that email exists, a password reset link has been sent."
      );
      return res.redirect("/login");
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    // Send password reset email
    await sendPasswordResetEmail(user.email, user.username, resetToken);

    req.flash(
      "success",
      "If an account with that email exists, a password reset link has been sent."
    );
    res.redirect("/login");
  } catch (e) {
    req.flash("error", "An error occurred. Please try again.");
    res.redirect("/forgot-password");
  }
};

// ========================================
// RESET PASSWORD CONTROLLER
// ========================================

module.exports.renderResetPasswordForm = async (req, res) => {
  try {
    const { token } = req.params;

    // Verify that token is valid
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      req.flash("error", "Password reset link is invalid or has expired");
      return res.redirect("/forgot-password");
    }

    res.render("users/reset-password.ejs", { token });
  } catch (e) {
    req.flash("error", "An error occurred");
    res.redirect("/forgot-password");
  }
};

module.exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      req.flash("error", "Password reset link is invalid or has expired");
      return res.redirect("/forgot-password");
    }

    // Reset password using passport-local-mongoose method
    await user.setPassword(password);

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    req.flash(
      "success",
      "Password has been reset successfully! You can now log in with your new password."
    );
    res.redirect("/login");
  } catch (e) {
    req.flash("error", "An error occurred. Please try again.");
    res.redirect("back");
  }
};
