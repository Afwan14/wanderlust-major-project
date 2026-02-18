// ============================================
// BOOKING CREATION CONTROLLER
// Handles booking creation and validation
// ============================================

const Booking = require("../models/booking");
const Listing = require("../models/listing");
const {
  sendBookingConfirmationEmail,
  sendHostBookingNotificationEmail,
} = require("../utils/emailService");

// ============================================
// CREATE: Process new booking request
// ============================================
module.exports.createBooking = async (req, res) => {
  const { id } = req.params;
  const { checkIn, checkOut } = req.body.booking;

  // Fetch listing for price calculation
  const listing = await Listing.findById(id).populate(
    "owner",
    "email username fullName"
  );

  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }

  // Basic presence check
  if (!checkIn || !checkOut) {
    req.flash("error", "??? Please select both check-in and check-out dates.");
    return res.redirect(`/listings/${id}/myBooking`);
  }

  const parseLocalDate = dateStr => {
    const [y, m, d] = dateStr.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  };

  const checkInDate = parseLocalDate(checkIn);
  const checkOutDate = parseLocalDate(checkOut);

  if (!checkInDate || !checkOutDate) {
    req.flash("error", "??? Invalid date format.");
    return res.redirect(`/listings/${id}/myBooking`);
  }

  const today = new Date();
  const todayLocal = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  // Validate date range (no past, check-out after check-in)
  if (checkInDate < todayLocal) {
    req.flash("error", "??? Check-in cannot be in the past.");
    return res.redirect(`/listings/${id}/myBooking`);
  }

  if (checkOutDate <= checkInDate) {
    req.flash(
      "error",
      "??? Invalid booking dates. Check-out must be after check-in."
    );
    return res.redirect(`/listings/${id}/myBooking`);
  }

  // Check for overlapping bookings
  const existingBookings = await Booking.find({
    listing: id,
    status: { $ne: "cancelled" },
  });
  const hasOverlap = existingBookings.some(b => {
    const existingCheckIn = new Date(b.checkIn);
    const existingCheckOut = new Date(b.checkOut);
    return checkInDate < existingCheckOut && checkOutDate > existingCheckIn;
  });

  if (hasOverlap) {
    req.flash(
      "error",
      "??? These dates are already reserved. Please choose different dates."
    );
    return res.redirect(`/listings/${id}/myBooking`);
  }

  // Calculate number of days
  const days = (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24);

  // Calculate total price
  const totalPrice = days * listing.price;

  // Create booking record
  const booking = await Booking.create({
    listing: id,
    user: req.user._id,
    checkIn,
    checkOut,
    totalPrice,
  });

  if (req.user?.email) {
    const location = [listing.location, listing.country]
      .filter(Boolean)
      .join(", ");

    try {
      await sendBookingConfirmationEmail({
        guestEmail: req.user.email,
        guestName: req.user.fullName || req.user.username,
        listingTitle: listing.title,
        location,
        checkIn,
        checkOut,
        nights: days,
        totalPrice,
        bookingId: booking._id,
      });
    } catch (emailError) {
      console.error("Booking confirmation email failed:", emailError.message);
    }
  }

  if (listing.owner?.email) {
    const location = [listing.location, listing.country]
      .filter(Boolean)
      .join(", ");

    try {
      await sendHostBookingNotificationEmail({
        hostEmail: listing.owner.email,
        hostName: listing.owner.fullName || listing.owner.username,
        guestName: req.user.fullName || req.user.username,
        guestEmail: req.user.email,
        listingTitle: listing.title,
        location,
        checkIn,
        checkOut,
        nights: days,
        totalPrice,
        bookingId: booking._id,
        listingId: listing._id,
      });
    } catch (emailError) {
      console.error(
        "Host booking notification email failed:",
        emailError.message
      );
    }
  }

  req.flash("success", "🎉 Booking confirmed! Check your bookings page.");
  res.redirect(`/bookings`);
};
