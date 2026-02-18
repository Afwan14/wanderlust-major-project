// ============================================
// USER AUTHENTICATION ROUTES
// Handles signup, login, and logout
// ============================================

const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const {
  saveRedirectUrl,
  validateSignup,
  validatePasswordReset,
} = require("../middleware");
const userController = require("../controllers/users.js");
const { isLoggedIn } = require("../middleware");

// ============================================
// SIGNUP ROUTES
// ============================================
router
  .route("/signup")
  // GET /signup - Display signup form
  .get(userController.renderSignupForm)
  // POST /signup - Create new user account with validation
  .post(validateSignup, wrapAsync(userController.signup));

// GET /verify-email-notice - Display verification notice page after signup
router.get("/verify-email-notice", userController.renderVerificationNoticePage);

// ============================================
// EMAIL VERIFICATION ROUTES
// ============================================
// GET /verify-email/:token - Verify user's email address
router.get("/verify-email/:token", wrapAsync(userController.verifyEmail));

// POST /resend-verification - Resend verification email
router.post(
  "/resend-verification",
  wrapAsync(userController.resendVerification)
);

// ============================================
// LOGIN ROUTES
// ============================================
router
  .route("/login")
  // GET /login - Display login form
  .get(userController.renderLoginForm)
  // POST /login - Authenticate user with passport
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    wrapAsync(userController.login)
  );

// ============================================
// PROFILE & REVIEWS ROUTES
// ============================================

// GET /profile - Display current user profile
router.get("/profile", isLoggedIn, wrapAsync(userController.renderProfile));

// GET /profile/complete - Display complete profile form
router.get(
  "/profile/complete",
  isLoggedIn,
  wrapAsync(userController.renderCompleteProfile)
);

// GET /reviews - Display user's written and received reviews
router.get("/reviews", isLoggedIn, wrapAsync(userController.renderReviewsPage));

// POST /profile - Update user profile
router.post("/profile", isLoggedIn, wrapAsync(userController.updateProfile));

// ============================================
// LOGOUT ROUTE
// ============================================
// GET /logout - Destroy user session and logout
router.get("/logout", userController.logout);

// ============================================
// PASSWORD RESET ROUTES
// ============================================
// GET /forgot-password - Display forgot password form
router.get("/forgot-password", userController.renderForgotPasswordForm);

// POST /forgot-password - Send password reset email
router.post("/forgot-password", wrapAsync(userController.forgotPassword));

// GET /reset-password/:token - Display reset password form
router.get(
  "/reset-password/:token",
  wrapAsync(userController.renderResetPasswordForm)
);

// POST /reset-password/:token - Reset password
router.post(
  "/reset-password/:token",
  validatePasswordReset,
  wrapAsync(userController.resetPassword)
);

// ============================================
// SESSION DIAGNOSTIC ROUTE (FOR DEBUGGING)
// ============================================
router.get("/test-session", userController.testSession);

module.exports = router;
