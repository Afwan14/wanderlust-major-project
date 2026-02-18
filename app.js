// ============================================
// WANDERLUST - Main Application Entry Point
// ============================================

// Load environment variables
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// ============================================
// IMPORTS: Core Dependencies
// ============================================
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

// ============================================
// IMPORTS: Session & Authentication
// ============================================
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// ============================================
// IMPORTS: Route Handlers
// ============================================
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const bookingRoutes = require("./routes/booking.js");
const bookingCreateRoutes = require("./routes/bookingCreate.js");
const wishlistRoutes = require("./routes/wishlist.js");
const helpRouter = require("./routes/help.js");

const localDbUrl = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.DB_URL || localDbUrl;

async function connectDatabase() {
  try {
    await mongoose.connect(dbUrl);
    const dbType = dbUrl.includes("127.0.0.1")
      ? "Local MongoDB"
      : "Cloud MongoDB (Atlas)";
    console.info(`✅ Connected to ${dbType} successfully`);
  } catch (err) {
    const isSrvDnsIssue =
      err?.message?.includes("querySrv") ||
      err?.message?.includes("ENOTFOUND") ||
      err?.message?.includes("ECONNREFUSED");

    if (
      process.env.NODE_ENV !== "production" &&
      dbUrl.startsWith("mongodb+srv://") &&
      isSrvDnsIssue
    ) {
      console.warn(
        "⚠️ Atlas SRV DNS lookup failed locally. Falling back to local MongoDB at mongodb://127.0.0.1:27017/wanderlust"
      );

      try {
        await mongoose.connect(localDbUrl);
        console.info("✅ Connected to Local MongoDB successfully");
        return;
      } catch (localErr) {
        console.error("❌ Local MongoDB fallback failed:", localErr.message);
      }
    }

    console.error("❌ Database connection error:", err.message);
    process.exit(1); // Exit immediately when DB is unavailable
  }
}

// ============================================
// VIEW ENGINE & STATIC FILES SETUP
// ============================================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Middleware: Parse request bodies and handle HTTP methods
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

// Serve static files from public directory
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));

const upperJsDir = path.join(publicDir, "JS");
const lowerJsDir = path.join(publicDir, "js");

if (fs.existsSync(upperJsDir)) {
  app.use("/JS", express.static(upperJsDir));
  app.use("/js", express.static(upperJsDir));
} else if (fs.existsSync(lowerJsDir)) {
  app.use("/JS", express.static(lowerJsDir));
  app.use("/js", express.static(lowerJsDir));
}

// ============================================
// SESSION & STORE CONFIGURATION
// ============================================
let store;
const canUseMongoSessionStore = !dbUrl.startsWith("mongodb+srv://");

if (canUseMongoSessionStore) {
  store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
      secret: process.env.SESSION_SECRET,
    },
    touchAfter: 24 * 3600, // Lazy session update
  });

  store.on("error", err => {
    console.error("❌ Mongo Session Store Error:", err.message || err);
  });
} else {
  console.warn(
    "⚠️ Session store fallback: using MemoryStore because SRV DNS may be blocked locally"
  );
}

const sessionOptions = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, // Prevents client-side JS from accessing the cookie
    secure: process.env.NODE_ENV === "production", // Only send cookie over HTTPS in production
    sameSite: "lax", // CSRF protection
  },
};

if (store) {
  sessionOptions.store = store;
}

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(session(sessionOptions));
app.use(flash());

// ============================================
// PASSPORT AUTHENTICATION SETUP
// ============================================
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ============================================
// GLOBAL MIDDLEWARE: Flash Messages & Local Variables
// ============================================
app.use((req, res, next) => {
  // Make flash messages and current user available in templates
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  res.locals.currentPage = req.path;
  res.locals.currentRoute = req.path;

  // Hide navbar extras on specific routes (auth pages, dashboard)
  const hideNavbarPatterns = [
    /^\/login/,
    /^\/signup/,
    /^\/bookings/,
    /^\/listings\/my/,
    /^\/listings\/new/,
    /^\/listings\/.*\/edit/,
  ];

  res.locals.hideNavbarExtras = hideNavbarPatterns.some(pattern =>
    pattern.test(req.originalUrl)
  );

  next();
});

// ============================================
// ROUTES
// ============================================

// Homepage - hero only
app.get("/", (req, res) => {
  res.render("home.ejs");
});

// Bookings Management Routes
app.use("/bookings", bookingRoutes);

// Booking Creation Routes
app.use("/listings/:id", bookingCreateRoutes);

// Listings Management Routes
app.use("/listings", listingRouter);

// Reviews Management Routes
app.use("/listings/:id/reviews", reviewRouter);

// User Authentication Routes
app.use("/", userRouter);

// Wishlist Management Routes
app.use(wishlistRoutes);

// Help Centre Routes
app.use(helpRouter);

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// 404 - Page Not Found Handler
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong!";

  // If request expects JSON â†’ return JSON
  if (req.headers.accept?.includes("application/json")) {
    return res.status(statusCode).json({ error: message });
  }

  // Otherwise â†’ render error page
  res.status(statusCode).render("error.ejs", { message });
});

// ============================================
// START SERVER
// ============================================
connectDatabase()
  .then(() => {
    app.listen(8080, () => {
      console.info("🚀 Server is active at http://localhost:8080");
    });
  })
  .catch(err => {
    console.error("❌ Unable to start server due to database issue:", err);
    process.exit(1);
  });
