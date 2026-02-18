// ============================================
// WISHLIST ROUTES
// Handles wishlist viewing and save/unsave actions
// ============================================

const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware");
const wrapAsync = require("../utils/wrapAsync.js");
const wishlistController = require("../controllers/wishlist.js");

// ============================================
// WISHLIST PAGE ROUTE
// ============================================
// GET /wishlist - Display current user's wishlist
router.get("/wishlist", isLoggedIn, wrapAsync(wishlistController.index));

// ============================================
// WISHLIST TOGGLE ROUTE
// ============================================
// POST /listings/:id/wishlist - Save or unsave a listing
router.post(
  "/listings/:id/wishlist",
  isLoggedIn,
  wrapAsync(wishlistController.toggle)
);

module.exports = router;
