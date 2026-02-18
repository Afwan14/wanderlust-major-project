// ============================================
// LISTINGS ROUTES
// Handles all listing-related endpoints
// ============================================

const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {
  isLoggedIn,
  isOwner,
  validateListing,
  isProfileComplete,
} = require("../middleware");
const listingController = require("../controllers/listings.js");
const Listing = require("../models/listing.js");
const multer = require("multer");
const { storage } = require("../config/cloudConfig.js");

// Configure image upload
const upload = multer({ storage });

// ============================================
// INDEX & CREATE ROUTES
// ============================================
router
  .route("/")
  // GET /listings - Display all listings with filters
  .get(wrapAsync(listingController.index))
  // POST /listings - Create new listing (with image upload)
  .post(
    isLoggedIn,
    isProfileComplete,
    upload.fields([
      { name: "listing[image]", maxCount: 1 },
      { name: "listing[additionalImages]", maxCount: 2 },
    ]),
    validateListing,
    wrapAsync(listingController.createListing)
  );

// ============================================
// NEW FORM ROUTE
// ============================================
// GET /listings/new - Display listing creation form
router.get(
  "/new",
  isLoggedIn,
  isProfileComplete,
  listingController.renderNewForm
);

// ============================================
// MY LISTINGS ROUTE
// ============================================
// GET /listings/my - Display user's listings
router.get(
  "/my",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    res.locals.hideNavbarExtras = true;
    const myListings = await Listing.find({ owner: req.user._id });
    res.render("listings/my.ejs", { myListings });
  })
);

// ============================================
// SHOW, UPDATE, DELETE ROUTES
// ============================================

// GET /listings/:id/message-host - Require login, then open message section
router.get("/:id/message-host", isLoggedIn, (req, res) => {
  const { id } = req.params;
  return res.redirect(`/listings/${id}#host-message`);
});

// POST /listings/:id/message-host - Send a message to the listing host
router.post(
  "/:id/message-host",
  isLoggedIn,
  wrapAsync(listingController.messageHost)
);

router
  .route("/:id")
  // GET /listings/:id - Display listing details
  .get(wrapAsync(listingController.showListing))
  // PUT /listings/:id - Update listing (with optional image)
  .put(
    isLoggedIn,
    isOwner,
    upload.fields([
      { name: "listing[image]", maxCount: 1 },
      { name: "listing[additionalImages]", maxCount: 2 },
    ]),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  // DELETE /listings/:id - Delete listing
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// ============================================
// EDIT FORM ROUTE
// ============================================
// GET /listings/:id/edit - Display listing edit form
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
