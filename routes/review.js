// ============================================
// REVIEW ROUTES
// Handles all review-related endpoints
// ============================================

const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
const reviewController = require("../controllers/reviews.js");

// ============================================
// CREATE REVIEW ROUTE - JSON REQUESTS
// ============================================
// POST /listings/:id/reviews - Create new review (AJAX/JSON)
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview)
);

// ============================================
// DELETE REVIEW ROUTE
// ============================================
// DELETE /listings/:id/reviews/:reviewId - Delete review
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewController.destroyReview)
);

module.exports = router;
