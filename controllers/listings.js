// ============================================
// LISTINGS CONTROLLER
// Handles all listing-related operations
// ============================================

const Listing = require("../models/listing");
const Booking = require("../models/booking");
const User = require("../models/user");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const { sendHostMessageEmail } = require("../utils/emailService.js");

// Initialize Mapbox geocoding client
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const LISTING_CATEGORIES = [
  "Iconic Cities",
  "Penthouses",
  "Design Homes",
  "Oceanfront",
  "Villas",
  "Mountains",
  "Wellness",
  "For Two",
  "Rooms",
  "Heritage",
  "Islands",
  "Waterfront",
  "Chalets",
  "Desert",
  "Forest",
  "Vineyards",
];

const escapeHtml = value =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const listingCategoryOptionsMarkup = LISTING_CATEGORIES.map(category => {
  const safeCategory = escapeHtml(category);
  return `
                <label class="category-option">
                  <input
                    type="checkbox"
                    value="${safeCategory}"
                    class="categoryCheckbox"
                    name="listing[category][]"
                  />
                  <span>${safeCategory}</span>
                </label>`;
}).join("\n");

// ============================================
// INDEX: Display all listings with filters
// ============================================

module.exports.index = async (req, res) => {
  const { search, minPrice, maxPrice, country, category } = req.query;
  let query = {};

  // Apply category filter
  if (category) {
    query.category = { $in: [category] };
  }

  // Apply text search across multiple fields
  if (search && search.trim() !== "") {
    query.$or = [
      { title: new RegExp(search, "i") },
      { description: new RegExp(search, "i") },
      { location: new RegExp(search, "i") },
      { country: new RegExp(search, "i") },
    ];
  }

  // Apply price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = minPrice;
    if (maxPrice) query.price.$lte = maxPrice;
  }

  // Apply country filter
  if (country) {
    query.country = country;
  }

  const allListings = await Listing.find(query).populate({
    path: "reviews",
    select: "overall",
  });

  // Get user's wishlist if logged in
  let userWishlist = [];
  if (req.isAuthenticated()) {
    const user = await User.findById(req.user._id).select("wishlist");
    userWishlist = user.wishlist.map(id => id.toString());
  }

  res.render("listings/index.ejs", {
    allListings,
    search,
    minPrice,
    maxPrice,
    country,
    category,
    userWishlist,
  });
};

// ============================================
// RENDER NEW FORM: Display listing creation form
// ============================================

module.exports.renderNewForm = (req, res) => {
  // Check if we should show the profile warning modal
  const showProfileWarningModal = req.query.incomplete === "true" || false;

  res.render("listings/new.ejs", {
    showProfileWarningModal,
    listingCategoryOptionsMarkup,
  });
};

// ============================================
// SHOW: Display single listing details
// ============================================

module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing does not exist!");
    return res.redirect("/listings");
  }

  const bookings = await Booking.find({
    listing: id,
    status: { $ne: "cancelled" },
  });

  const bookingRanges = bookings.map(b => ({
    checkIn: b.checkIn,
    checkOut: b.checkOut,
  }));

  /* ========================================
     BUILD RATING DATA (SOURCE OF TRUTH)
  ======================================== */

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

    const reviewComment = r.comment || "";
    r.previewComment =
      reviewComment.length > 140
        ? reviewComment.slice(0, 140) + "..."
        : reviewComment;
    r.hasLongComment = reviewComment.length > 140;
    r.filledStars = Math.round(r.overall || 0);
    r.emptyStars = Math.max(0, 5 - r.filledStars);
    r.canDelete =
      !!req.user &&
      !!r.author &&
      !!r.author._id &&
      r.author._id.equals(req.user._id);
  });

  /* ========================================
     OVERALL AVERAGE (AIRBNB STYLE)
  ======================================== */

  const allAverages = Object.values(ratingData)
    .map(arr => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0))
    .filter(n => n > 0);

  const avgRating = allAverages.length
    ? allAverages.reduce((a, b) => a + b, 0) / allAverages.length
    : 0;

  const reviewCount = listing.reviews.length;
  const hasReviews = reviewCount > 0;
  const showRatingBadge = hasReviews;
  const showNewBadge = !hasReviews;
  const showNoReviews = reviewCount === 0;
  const reviewCountLabel = reviewCount === 1 ? "Review" : "Reviews";
  const reviewCountLabelLower = reviewCount === 1 ? "review" : "reviews";
  const guestLabel = listing.maxGuests === 1 ? "guest" : "guests";
  const bedroomLabel = listing.bedrooms === 1 ? "bedroom" : "bedrooms";
  const bedLabel = listing.beds === 1 ? "bed" : "beds";
  const bathroomLabel = listing.bathrooms === 1 ? "bathroom" : "bathrooms";
  const ratingScoreDisplay = reviewCount > 0 ? avgRating.toFixed(1) : "New";
  const ratingTitle =
    reviewCount === 0
      ? "No ratings yet"
      : avgRating >= 4.5
        ? "Guest favourite"
        : avgRating >= 4.0
          ? "Highly rated"
          : "Rated by guests";
  const ratingRounded = Math.round(avgRating);
  const avgRatingDisplay = avgRating.toFixed(1);
  const breakdownRating = avgRating.toFixed(1);
  const locationRating = (avgRating - 0.1).toFixed(1);

  /* ========================================
     RESERVATION STATUS
  ======================================== */

  const today = new Date();
  const todayLocal = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const futureBookings = bookings.filter(
    b => new Date(b.checkOut) >= todayLocal
  );

  const reservedUntil = futureBookings.length
    ? new Date(
        Math.max(...futureBookings.map(b => new Date(b.checkOut).getTime()))
      )
    : null;

  const isReserved = futureBookings.some(
    b => new Date(b.checkIn) <= todayLocal && new Date(b.checkOut) >= todayLocal
  );
  const showReservationStrip = isReserved && !!reservedUntil;

  const reservedUntilFormatted = reservedUntil
    ? new Date(reservedUntil).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  /* ========================================
     CAN USER REVIEW?
  ======================================== */

  let canReview = false;
  let reviewBooking = null;

  if (req.user) {
    const completedBooking = bookings.some(
      b => b.user.equals(req.user._id) && new Date(b.checkOut) < new Date()
    );

    reviewBooking = bookings.find(
      b =>
        b.user &&
        b.user.equals(req.user._id) &&
        new Date(b.checkOut) < new Date()
    );

    const alreadyReviewed = listing.reviews.some(r =>
      r.author._id.equals(req.user._id)
    );

    canReview = completedBooking && !alreadyReviewed;
  }

  const showReviewCta = canReview && !!req.user && !!reviewBooking;

  /* ========================================
     GET USER'S WISHLIST
  ======================================== */

  let userWishlist = [];
  if (req.isAuthenticated()) {
    const user = await User.findById(req.user._id).select("wishlist");
    userWishlist = user.wishlist.map(id => id.toString());
  }

  const isSaved = userWishlist.includes(listing._id.toString());

  /* ========================================
     HOST LOGIC
  ======================================== */

  const host = listing.owner || null;
  const showHostSection = !!host;
  const hostUsername = host && host.username ? host.username : "Host";
  const hostFullName = host && host.fullName ? host.fullName : hostUsername;
  const hostBio = host && host.bio ? host.bio : "";
  const hostLocation = host && host.location ? host.location : "";
  const hostLanguages = host
    ? typeof host.languages === "string"
      ? host.languages
          .split(",")
          .map(s => s.trim())
          .filter(Boolean)
      : Array.isArray(host.languages)
        ? host.languages
        : []
    : [];
  const hostWork = host && host.work ? host.work : "";
  const hostEducation = host && host.education ? host.education : "";
  const hostJoinedAt = host && host.createdAt ? host.createdAt : null;
  const monthsHosting = hostJoinedAt
    ? Math.floor(
        (Date.now() - new Date(hostJoinedAt).getTime()) /
          (30 * 24 * 60 * 60 * 1000)
      )
    : 0;
  const hostInitial =
    hostUsername && hostUsername.length
      ? hostUsername.trim()[0].toUpperCase()
      : "H";
  const hostReviews = listing.reviews.length || 0;
  const hostRating =
    listing.reviews.length > 0
      ? (
          listing.reviews.reduce((sum, r) => sum + (r.rating || 5), 0) /
          listing.reviews.length
        ).toFixed(2)
      : null;
  const hostRatingDisplay = hostRating || "New";
  const hostLanguagesDisplay = hostLanguages.join(", ");
  const hasHostRating = !!hostRating;
  const isSuperhost = hostRating >= 4.8 && hostReviews >= 10;
  const showSuperhostBadge = isSuperhost;
  const showHostBio = !!hostBio;
  const showHostWork = !!hostWork;
  const showHostEducation = !!hostEducation;
  const showHostLanguages = hostLanguages.length > 0;
  const showHostLocation = !!hostLocation;
  const isOwner =
    !!req.user && !!host && !!host._id && host._id.equals(req.user._id);
  const showManageListing = isOwner;
  const showBookingForm = !!req.user && !isOwner;
  const showLoginPrompt = !req.user;
  const showHostMessageLoginPrompt = !req.user;
  const showHostMessageOwnerDisabled = isOwner;
  const showHostMessageForm = !!req.user && !isOwner;

  const galleryImage1 =
    listing.additionalImages && listing.additionalImages[0]
      ? listing.additionalImages[0].url
      : listing.image.url;
  const galleryImage2 =
    listing.additionalImages && listing.additionalImages[1]
      ? listing.additionalImages[1].url
      : listing.image.url;

  /* ========================================
     RENDER
  ======================================== */

  res.render("listings/show.ejs", {
    listing,
    bookings,
    avgRating,
    reviewCount,
    hasReviews,
    showRatingBadge,
    showNewBadge,
    showNoReviews,
    reviewCountLabel,
    reviewCountLabelLower,
    guestLabel,
    bedroomLabel,
    bedLabel,
    bathroomLabel,
    ratingScoreDisplay,
    ratingTitle,
    ratingRounded,
    avgRatingDisplay,
    breakdownRating,
    locationRating,
    ratingData, // 🔥 THIS FIXES NaN
    canReview,
    reviewBooking,
    showReviewCta,
    isReserved,
    showReservationStrip,
    reservedUntil,
    reservedUntilFormatted,
    bookingRanges,
    userWishlist,
    isSaved,
    host,
    showHostSection,
    hostUsername,
    hostFullName,
    hostBio,
    hostLocation,
    hostLanguages,
    hostLanguagesDisplay,
    hostWork,
    hostEducation,
    hostJoinedAt,
    monthsHosting,
    hostInitial,
    hostReviews,
    hostRating,
    hostRatingDisplay,
    hasHostRating,
    isSuperhost,
    showSuperhostBadge,
    showHostBio,
    showHostWork,
    showHostEducation,
    showHostLanguages,
    showHostLocation,
    isOwner,
    showManageListing,
    showBookingForm,
    showLoginPrompt,
    showHostMessageLoginPrompt,
    showHostMessageOwnerDisabled,
    showHostMessageForm,
    galleryImage1,
    galleryImage2,
  });
};

// ============================================
// CREATE: Save new listing to database
// ============================================

module.exports.createListing = async (req, res, next) => {
  // Check if user's profile is complete
  const user = await User.findById(req.user._id);
  const isProfileComplete =
    user.fullName &&
    user.bio &&
    user.location &&
    user.languages &&
    user.work &&
    user.education;

  if (!isProfileComplete) {
    // Profile incomplete - redirect with query param to show modal
    return res.redirect("/listings/new?incomplete=true");
  }

  // Geocode the location
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  // Extract main image details
  let url = req.files["listing[image]"][0].path;
  let filename = req.files["listing[image]"][0].filename;

  // Extract additional images if provided
  let additionalImages = [];
  if (req.files["listing[additionalImages]"]) {
    additionalImages = req.files["listing[additionalImages]"].map(file => ({
      url: file.path,
      filename: file.filename,
    }));
  }

  // Create new listing object
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  newListing.additionalImages = additionalImages;
  newListing.geometry = response.body.features[0].geometry;

  // Save to database
  await newListing.save();

  req.flash("success", "✅ New Listing Created Successfully!");
  res.redirect("/listings");
};

// ============================================
// RENDER EDIT FORM: Display listing edit form
// ============================================

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing does not exist!");
    return res.redirect("/listings");
  }

  // Optimize image URL for preview
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// ============================================
// UPDATE: Update existing listing
// ============================================

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  // Update main image if new one was uploaded
  if (req.files && req.files["listing[image]"]) {
    let url = req.files["listing[image]"][0].path;
    let filename = req.files["listing[image]"][0].filename;
    listing.image = { url, filename };
  }

  // Update additional images if new ones were uploaded
  if (req.files && req.files["listing[additionalImages]"]) {
    listing.additionalImages = req.files["listing[additionalImages]"].map(
      file => ({
        url: file.path,
        filename: file.filename,
      })
    );
  }

  await listing.save();

  req.flash("success", "✅ Listing Updated Successfully!");
  res.redirect(`/listings/my`);
};

// ============================================
// DELETE: Remove listing from database
// ============================================

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;

  const deletedListing = await Listing.findByIdAndDelete(id);

  if (!deletedListing) {
    return res.status(404).json({ error: "Listing not found" });
  }

  res.json({
    success: true,
    listingId: id,
    message: "✅ Listing deleted successfully",
  });
};

// ============================================
// MESSAGE HOST: Send message to listing owner
// ============================================

module.exports.messageHost = async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  const trimmedMessage = (message || "").trim();

  if (!trimmedMessage) {
    req.flash("error", "Please enter a message before sending.");
    return res.redirect(`/listings/${id}#host-message`);
  }

  const listing = await Listing.findById(id).populate("owner");

  if (!listing) {
    req.flash("error", "Listing does not exist!");
    return res.redirect("/listings");
  }

  const host = listing.owner;
  if (!host || !host.email) {
    req.flash("error", "Host contact is not available for this listing.");
    return res.redirect(`/listings/${id}`);
  }

  // Prevent messaging yourself
  if (req.user && host._id && host._id.equals(req.user._id)) {
    req.flash("error", "You can't message yourself as the host.");
    return res.redirect(`/listings/${id}`);
  }

  const guestName = req.user.fullName || req.user.username || "Guest";
  const guestEmail = req.user.email;

  if (!guestEmail) {
    req.flash(
      "error",
      "Your account email is missing. Please update your profile and try again."
    );
    return res.redirect(`/listings/${id}`);
  }

  await sendHostMessageEmail({
    hostEmail: host.email,
    hostName: host.fullName || host.username || "Host",
    guestName,
    guestEmail,
    listingTitle: listing.title,
    listingId: listing._id,
    message: trimmedMessage,
  });

  req.flash(
    "success",
    "✅ Message sent to host! Check your email for replies."
  );
  return res.redirect(`/listings/${id}#host-message`);
};
