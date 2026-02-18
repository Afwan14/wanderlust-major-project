// ============================================
// BOOKINGS ROUTES
// Handles user booking management
// ============================================

const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware");
const bookingController = require("../controllers/booking.js");
const wrapAsync = require("../utils/wrapAsync");

// ============================================
// MY BOOKINGS PAGE
// ============================================
// GET /bookings - Display user's bookings
router.get("/", isLoggedIn, wrapAsync(bookingController.bookingPage));

// ============================================
// HOST RESERVATIONS
// ============================================
// GET /bookings/host/reservations - Display reservations for host listings
router.get(
  "/host/reservations",
  isLoggedIn,
  wrapAsync(bookingController.hostReservationsPage)
);

// GET /bookings/host/reservations/:id - Host reservation detail page
router.get(
  "/host/reservations/:id",
  isLoggedIn,
  wrapAsync(bookingController.hostReservationDetail)
);

// POST /bookings/host/reservations/:id/complete - Mark reservation completed
router.post(
  "/host/reservations/:id/complete",
  isLoggedIn,
  wrapAsync(bookingController.markReservationCompleted)
);

// POST /bookings/host/reservations/:id/cancel - Cancel reservation
router.post(
  "/host/reservations/:id/cancel",
  isLoggedIn,
  wrapAsync(bookingController.hostCancelReservation)
);

// ============================================
// REVIEW PAGE
// ============================================
// GET /bookings/:id/review - Review a completed booking
router.get("/:id/review", isLoggedIn, wrapAsync(bookingController.reviewPage));

// ============================================
// BOOKING DETAIL
// ============================================
// GET /bookings/:id - Booking detail page
router.get("/:id", isLoggedIn, wrapAsync(bookingController.bookingDetail));

// ============================================
// CANCEL BOOKING
// ============================================
// DELETE /bookings/:id - Cancel a booking
router.delete("/:id", isLoggedIn, wrapAsync(bookingController.cancelBooking));

module.exports = router;
