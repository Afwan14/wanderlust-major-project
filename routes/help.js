// ============================================
// HELP ROUTES
// Handles help center and support form endpoints
// ============================================

const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const helpController = require("../controllers/help.js");

// ============================================
// HELP PAGE ROUTE
// ============================================
// GET /help - Display help center page
router.get("/help", helpController.renderHelpPage);

// ============================================
// SUPPORT SUBMISSION ROUTE
// ============================================
// POST /help - Handle support form submission
router.post("/help", wrapAsync(helpController.submitSupportForm));

module.exports = router;
