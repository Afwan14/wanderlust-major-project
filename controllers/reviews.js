// ============================================
// REVIEWS CONTROLLER
// Handles all review-related operations
// ============================================

const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");

// ============================================
// CREATE: Add new review to listing
// ============================================

module.exports.createReview = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "You must be logged in" });
    }

    if (!req.body?.review) {
      return res.status(400).json({ error: "Review data missing" });
    }

    const {
      cleanliness,
      accuracy,
      checkIn,
      communication,
      location,
      value,
      comment,
    } = req.body.review;

    const categories = [
      cleanliness,
      accuracy,
      checkIn,
      communication,
      location,
      value,
    ];

    if (categories.some(r => !r || r < 1 || r > 5) || !comment) {
      return res.status(400).json({
        error: "All rating categories and comment are required",
      });
    }

    const listing = await Listing.findById(req.params.id).populate({
      path: "reviews",
      select: "author",
    });

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    const bookings = await Booking.find({ listing: listing._id });

    const completedBooking = bookings.some(
      b => b.user.equals(req.user._id) && new Date(b.checkOut) < new Date()
    );

    if (!completedBooking) {
      return res.status(403).json({
        error: "You can only review places you have stayed at",
      });
    }

    const alreadyReviewed = listing.reviews.some(
      r => r.author && r.author.equals(req.user._id)
    );

    if (alreadyReviewed) {
      return res.status(409).json({
        error: "You have already reviewed this listing",
      });
    }

    const overall =
      categories.reduce((sum, r) => sum + Number(r), 0) / categories.length;

    const newReview = new Review({
      overall: Number(overall.toFixed(1)),
      cleanliness,
      accuracy,
      checkIn,
      communication,
      location,
      value,
      comment,
      author: req.user._id,
      listing: listing._id,
    });

    await newReview.save();
    await Listing.findByIdAndUpdate(listing._id, {
      $push: { reviews: newReview._id },
    });

    // ===== RE-CALCULATE AVERAGE RATING (AJAX SUPPORT) =====

    // Re-fetch listing with populated reviews
    const populatedListing = await Listing.findById(listing._id).populate(
      "reviews"
    );

    const ratingFields = [
      "cleanliness",
      "accuracy",
      "checkIn",
      "communication",
      "location",
      "value",
    ];

    let sum = 0;
    let count = 0;

    populatedListing.reviews.forEach(r => {
      ratingFields.forEach(field => {
        sum += Number(r[field]);
        count++;
      });
    });

    const avgRating = count ? sum / count : 0;

    return res.status(201).json({
      review: {
        _id: newReview._id,
        overall: newReview.overall,
        cleanliness,
        accuracy,
        checkIn,
        communication,
        location,
        value,
        comment,
        author: req.user.username,
        isAuthor: true,
      },
      avgRating,
      totalReviews: listing.reviews.length,
    });
  } catch (err) {
    console.error("❌ Review Creation Error:", err);
    return res.status(500).json({
      error: "Server error while creating review",
    });
  }
};

// ============================================
// DELETE: Remove review from listing
// ============================================

module.exports.destroyReview = async (req, res) => {
  try {
    const { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    // If AJAX delete later, return JSON
    if (req.headers.accept?.includes("application/json")) {
      return res.json({ success: true });
    }

    req.flash("success", "✅ Review Deleted Successfully!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.error("❌ Review Deletion Error:", err);
    res.status(500).json({ error: "Failed to delete review" });
  }
};
