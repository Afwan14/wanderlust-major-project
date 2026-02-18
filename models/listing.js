// ============================================
// LISTING MODEL
// Defines the schema for property listings
// Includes details like price, location, reviews
// ============================================

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const listingSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    image: {
      url: {
        type: String,
        default:
          "https://images.unsplash.com/photo-1502673530728-f79b4cab31b1?q=80&w=1200&auto=format&fit=crop",
      },
      filename: {
        type: String,
        default: "default",
      },
    },
    // Additional images for gallery (optional)
    additionalImages: [
      {
        url: {
          type: String,
        },
        filename: {
          type: String,
        },
      },
    ],
    price: {
      type: Number,
    },
    maxGuests: {
      type: Number,
      required: true,
    },
    bedrooms: {
      type: Number,
      required: true,
    },
    beds: {
      type: Number,
      required: true,
    },
    bathrooms: {
      type: Number,
      required: true,
    },

    location: {
      type: String,
    },
    country: {
      type: String,
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    geometry: {
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ["Point"], // 'location.type' must be 'Point'
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    category: {
      type: [String],
      enum: [
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
      ],
    },
  },
  { timestamps: true }
);

listingSchema.post("findOneAndDelete", async listing => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

listingSchema.post("findOneAndDelete", async function (listing) {
  if (listing) {
    await mongoose.model("Booking").deleteMany({
      listing: listing._id,
    });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
