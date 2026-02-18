const ExpressError = require("../utils/ExpressError");
const Booking = require("../models/booking");
const Listing = require("../models/listing");

//Booking Page
module.exports.bookingPage = async (req, res) => {
  res.locals.hideNavbarExtras = true;

  const now = new Date();
  const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  await Booking.updateMany(
    {
      user: req.user._id,
      status: "upcoming",
      checkOut: { $lt: todayLocal },
    },
    { $set: { status: "completed" } }
  );

  const bookings = await Booking.find({ user: req.user._id }).populate(
    "listing"
  );

  const validBookings = bookings.filter(b => b.listing);

  const bookingCards = validBookings.map(booking => {
    const isCancelled = booking.status === "cancelled";
    const isCompleted = !isCancelled && new Date(booking.checkOut) < todayLocal;

    const statusLabel = isCancelled
      ? "Cancelled"
      : isCompleted
        ? "Completed"
        : "Upcoming";

    const statusClass = isCancelled
      ? "status-cancelled"
      : isCompleted
        ? "status-completed"
        : "status-upcoming";

    const startLabel = new Date(booking.checkIn).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const endLabel = new Date(booking.checkOut).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const nights = Math.max(
      1,
      Math.round(
        (new Date(booking.checkOut) - new Date(booking.checkIn)) /
          (1000 * 60 * 60 * 24)
      )
    );

    const listingTitle = booking.listing?.title || "Listing unavailable";
    const locationText = booking.listing
      ? `${booking.listing.location}, ${booking.listing.country}`
      : "";

    return {
      id: booking._id,
      listingHref: `/bookings/${booking._id}`,
      listingTitle,
      locationText,
      totalPrice: booking.totalPrice,
      statusLabel,
      statusClass,
      startLabel,
      endLabel,
      nights,
      imageUrl: booking.listing?.image?.url || "",
      imageAlt: listingTitle,
      hasImage: !!booking.listing?.image?.url,
    };
  });

  res.render("bookings/index.ejs", {
    bookings: bookingCards,
  });
};

// Host Reservations Page
module.exports.hostReservationsPage = async (req, res) => {
  res.locals.hideNavbarExtras = true;

  const hostListings = await Listing.find({ owner: req.user._id }).select(
    "_id"
  );

  if (!hostListings.length) {
    req.flash("error", "Only hosts can access Guest Reservations.");
    return res.redirect("/profile");
  }

  const listingIds = hostListings.map(listing => listing._id);

  const now = new Date();
  const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  await Booking.updateMany(
    {
      listing: { $in: listingIds },
      status: "upcoming",
      checkOut: { $lt: todayLocal },
    },
    { $set: { status: "completed" } }
  );

  const reservations = await Booking.find({ listing: { $in: listingIds } })
    .populate("listing")
    .populate("user", "username fullName email phone createdAt")
    .sort({ createdAt: -1 });

  const validReservations = reservations.filter(r => r.listing);

  const reservationCards = validReservations.map(reservation => {
    const isCancelled = reservation.status === "cancelled";
    const isCompleted =
      !isCancelled && new Date(reservation.checkOut) < todayLocal;

    const statusLabel = isCancelled
      ? "Cancelled"
      : isCompleted
        ? "Completed"
        : "Upcoming";

    const statusClass = isCancelled
      ? "status-cancelled"
      : isCompleted
        ? "status-completed"
        : "status-upcoming";

    const checkInLabel = new Date(reservation.checkIn).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );

    const checkOutLabel = new Date(reservation.checkOut).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );

    const bookingDate = new Date(reservation.createdAt).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );

    const guestName =
      reservation.user?.fullName || reservation.user?.username || "Guest";
    const guestEmail = reservation.user?.email || "Not available";

    return {
      id: reservation._id,
      listingTitle: reservation.listing?.title || "Listing unavailable",
      imageUrl: reservation.listing?.image?.url || "",
      hasImage: !!reservation.listing?.image?.url,
      imageAlt: reservation.listing?.title || "Listing image",
      statusLabel,
      statusClass,
      guestName,
      guestEmail,
      checkInLabel,
      checkOutLabel,
      totalPrice: reservation.totalPrice,
      bookingDate,
      detailsHref: `/bookings/host/reservations/${reservation._id}`,
    };
  });

  res.render("bookings/host-index.ejs", {
    reservations: reservationCards,
  });
};

// Host Reservation Detail Page
module.exports.hostReservationDetail = async (req, res) => {
  const { id } = req.params;

  const reservation = await Booking.findById(id)
    .populate("listing")
    .populate("user", "username fullName email phone createdAt");

  if (!reservation || !reservation.listing) {
    throw new ExpressError(404, "Reservation not found");
  }

  if (!reservation.listing.owner.equals(req.user._id)) {
    req.flash("error", "You are not allowed to view this reservation");
    return res.redirect("/bookings/host/reservations");
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const isCancelled = reservation.status === "cancelled";
  const isCompleted = !isCancelled && new Date(reservation.checkOut) < today;
  const isUpcoming = !isCancelled && !isCompleted;

  const statusLabel = isCancelled
    ? "Cancelled"
    : isCompleted
      ? "Completed"
      : "Upcoming";

  const statusClass = isCancelled
    ? "status-cancelled"
    : isCompleted
      ? "status-completed"
      : "status-upcoming";

  const checkInLabel = new Date(reservation.checkIn).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

  const checkOutLabel = new Date(reservation.checkOut).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

  const bookingDate = new Date(reservation.createdAt).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

  const guest = reservation.user;
  const guestName = guest?.fullName || guest?.username || "Guest";
  const guestEmail = guest?.email || "Not available";
  const guestPhone = guest?.phone || "Not provided";
  const memberSince = guest?.createdAt
    ? new Date(guest.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "N/A";

  const canMarkCompleted = isUpcoming && new Date(reservation.checkOut) < today;
  const canCancel = isUpcoming;

  res.render("bookings/host-show.ejs", {
    reservation,
    listing: reservation.listing,
    guestName,
    guestEmail,
    guestPhone,
    memberSince,
    statusLabel,
    statusClass,
    isCancelled,
    isCompleted,
    isUpcoming,
    canMarkCompleted,
    canCancel,
    checkInLabel,
    checkOutLabel,
    bookingDate,
  });
};

// Host Action: Mark Reservation Completed
module.exports.markReservationCompleted = async (req, res) => {
  const { id } = req.params;

  const reservation = await Booking.findById(id).populate("listing");

  if (!reservation || !reservation.listing) {
    throw new ExpressError(404, "Reservation not found");
  }

  if (!reservation.listing.owner.equals(req.user._id)) {
    req.flash("error", "You are not allowed to update this reservation");
    return res.redirect("/bookings/host/reservations");
  }

  if (reservation.status === "cancelled") {
    req.flash("error", "Cancelled reservations cannot be marked completed.");
    return res.redirect(`/bookings/host/reservations/${reservation._id}`);
  }

  reservation.status = "completed";
  await reservation.save();

  req.flash("success", "Reservation marked as completed.");
  res.redirect(`/bookings/host/reservations/${reservation._id}`);
};

// Host Action: Cancel Reservation
module.exports.hostCancelReservation = async (req, res) => {
  const { id } = req.params;

  const reservation = await Booking.findById(id).populate("listing");

  if (!reservation || !reservation.listing) {
    throw new ExpressError(404, "Reservation not found");
  }

  if (!reservation.listing.owner.equals(req.user._id)) {
    req.flash("error", "You are not allowed to cancel this reservation");
    return res.redirect("/bookings/host/reservations");
  }

  if (reservation.status === "cancelled") {
    req.flash("info", "This reservation is already cancelled.");
    return res.redirect(`/bookings/host/reservations/${reservation._id}`);
  }

  reservation.status = "cancelled";
  reservation.cancelledAt = new Date();
  await reservation.save();

  req.flash("success", "Reservation cancelled successfully.");
  res.redirect(`/bookings/host/reservations/${reservation._id}`);
};

// Review Page
module.exports.reviewPage = async (req, res) => {
  const { id } = req.params;

  const booking = await Booking.findById(id).populate({
    path: "listing",
    populate: { path: "reviews", populate: { path: "author" } },
  });

  if (!booking) {
    throw new ExpressError(404, "Booking not found");
  }

  if (!booking.user.equals(req.user._id)) {
    req.flash("error", "You are not allowed to review this booking");
    return res.redirect("/bookings");
  }

  if (booking.status === "cancelled") {
    req.flash("error", "This booking was cancelled.");
    return res.redirect("/bookings");
  }

  const isCompleted = new Date(booking.checkOut) < new Date();
  if (!isCompleted) {
    req.flash("info", "You can review after your stay is completed.");
    return res.redirect(`/listings/${booking.listing._id}`);
  }

  const listing = booking.listing;
  const alreadyReviewed = listing.reviews.some(r =>
    r.author?._id?.equals(req.user._id)
  );

  if (alreadyReviewed) {
    req.flash("info", "You have already reviewed this listing.");
    return res.redirect(`/listings/${listing._id}`);
  }

  const ratingData = {
    cleanliness: [],
    accuracy: [],
    checkIn: [],
    communication: [],
    location: [],
    value: [],
  };

  listing.reviews.forEach(r => {
    ratingData.cleanliness.push(r.cleanliness);
    ratingData.accuracy.push(r.accuracy);
    ratingData.checkIn.push(r.checkIn);
    ratingData.communication.push(r.communication);
    ratingData.location.push(r.location);
    ratingData.value.push(r.value);
  });

  const allAverages = Object.values(ratingData)
    .map(arr => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0))
    .filter(n => n > 0);

  const avgRating = allAverages.length
    ? allAverages.reduce((a, b) => a + b, 0) / allAverages.length
    : 0;

  res.render("bookings/review.ejs", {
    booking,
    listing,
    ratingData,
    avgRating,
  });
};

//Cancel Booking
module.exports.cancelBooking = async (req, res) => {
  const { id } = req.params;

  const booking = await Booking.findById(id);

  if (!booking) {
    throw new ExpressError(404, "Booking not found");
  }

  // ✅ Only booking owner can cancel
  if (!booking.user.equals(req.user._id)) {
    req.flash("error", "You are not allowed to cancel this booking");
    return res.redirect("/bookings");
  }

  if (booking.status === "cancelled") {
    req.flash("info", "This booking is already cancelled.");
    return res.redirect("/bookings");
  }

  booking.status = "cancelled";
  booking.cancelledAt = new Date();
  await booking.save();

  req.flash("success", "Booking cancelled successfully ❌");
  res.redirect("/bookings");
};

// Booking Detail Page
module.exports.bookingDetail = async (req, res) => {
  const { id } = req.params;

  const booking = await Booking.findById(id).populate({
    path: "listing",
    populate: { path: "reviews", populate: { path: "author" } },
  });

  if (!booking) {
    throw new ExpressError(404, "Booking not found");
  }

  if (!booking.user.equals(req.user._id)) {
    req.flash("error", "You are not allowed to view this booking");
    return res.redirect("/bookings");
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const isCancelled = booking.status === "cancelled";
  const isCompleted = !isCancelled && new Date(booking.checkOut) < today;
  const isUpcoming = !isCancelled && !isCompleted;

  const statusLabel = isCancelled
    ? "Cancelled"
    : isCompleted
      ? "Completed"
      : "Upcoming";

  const statusClass = isCancelled
    ? "status-cancelled"
    : isCompleted
      ? "status-completed"
      : "status-upcoming";

  const checkInLabel = new Date(booking.checkIn).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const checkOutLabel = new Date(booking.checkOut).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const nights = Math.max(
    1,
    Math.round(
      (new Date(booking.checkOut) - new Date(booking.checkIn)) /
        (1000 * 60 * 60 * 24)
    )
  );

  const listing = booking.listing;
  const listingTitle = listing ? listing.title : "Listing unavailable";
  const locationText = listing ? `${listing.location}, ${listing.country}` : "";
  const guestCount = listing?.maxGuests || 1;

  const userReview = listing
    ? listing.reviews.find(r => r.author && r.author._id.equals(req.user._id))
    : null;

  res.render("bookings/show.ejs", {
    booking,
    listing,
    listingTitle,
    locationText,
    statusLabel,
    statusClass,
    isCancelled,
    isCompleted,
    isUpcoming,
    checkInLabel,
    checkOutLabel,
    nights,
    guestCount,
    userReview,
  });
};
