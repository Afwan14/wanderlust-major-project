// ============================================
// BOOKING CREATION ROUTES
// Handles new booking submission
// ============================================

const express = require("express");
const router = express.Router({ mergeParams: true });
const { isLoggedIn } = require("../middleware");
const wrapAsync = require("../utils/wrapAsync");
const bookingCreateController = require("../controllers/bookingCreate.js");

// ============================================
// CREATE BOOKING
// ============================================
// POST /listings/:id/book - Create new booking
router.post(
  "/book",
  isLoggedIn,
  wrapAsync(bookingCreateController.createBooking)
);

module.exports = router;
