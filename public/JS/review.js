console.log("Review JS loaded");

/* ======================================================
   REVIEW SUBMISSION LOGIC
====================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const reviewDataEl = document.getElementById("reviewPageData");
  if (reviewDataEl) {
    const listingId = reviewDataEl.dataset.listingId;
    const ratingDataRaw = reviewDataEl.dataset.ratingData;

    if (listingId && !window.REVIEW_DATA) {
      window.REVIEW_DATA = { listingId };
    }

    if (ratingDataRaw && !window.RATING_DATA) {
      try {
        window.RATING_DATA = JSON.parse(decodeURIComponent(ratingDataRaw));
      } catch (error) {
        console.error("Failed to parse review page data", error);
      }
    }
  }

  const reviewForm = document.getElementById("reviewForm");
  if (!reviewForm) return;

  const ratingError = document.getElementById("ratingError");
  const commentError = document.getElementById("commentError");
  const reviewsContainer = document.getElementById("reviews");

  // From EJS
  const listingId = window.REVIEW_DATA?.listingId;
  const ratingData = window.RATING_DATA;

  if (!listingId || !ratingData) {
    console.warn("Listing ID or rating data missing");
    return;
  }

  /* ========= INITIAL RENDER ========= */
  updateOverallRatingUI();
  updateCategoryRatings();

  /* ========= OVERALL RATING QUICK SET ========= */
  const overallInputs = reviewForm.querySelectorAll(
    'input[name="overallRating"]'
  );
  overallInputs.forEach(input => {
    input.addEventListener("change", e => {
      const val = Number(e.target.value);
      const categories = [
        "cleanliness",
        "accuracy",
        "checkIn",
        "communication",
        "location",
        "value",
      ];

      categories.forEach(cat => {
        const target = reviewForm.querySelector(
          `input[name="review[${cat}]"][value="${val}"]`
        );
        if (target) target.checked = true;
      });
    });
  });

  /* ========= SUBMIT REVIEW ========= */
  reviewForm.addEventListener("submit", async e => {
    e.preventDefault();

    const review = {};
    let valid = true;

    const overallInput = reviewForm.querySelector(
      'input[name="overallRating"]:checked'
    );
    const overall = overallInput ? Number(overallInput.value) : null;

    if (!overall) valid = false;

    const visibleCategories = [
      "cleanliness",
      "communication",
      "accuracy",
      "location",
      "value",
    ];

    visibleCategories.forEach(cat => {
      const checked = reviewForm.querySelector(
        `input[name="review[${cat}]"]:checked`
      );
      if (checked) {
        review[cat] = Number(checked.value);
      } else if (overall) {
        review[cat] = overall;
      }
    });

    if (overall) {
      review.checkIn = overall;
    }

    const commentField = reviewForm.querySelector(
      'textarea[name="review[comment]"]'
    );
    const comment = commentField.value.trim();

    if (!comment) valid = false;

    if (!valid) {
      if (ratingError) {
        ratingError.classList.toggle("d-none", Boolean(overall));
      }
      if (commentError) {
        commentError.classList.toggle("d-none", Boolean(comment));
      }
      return;
    }

    if (ratingError) ratingError.classList.add("d-none");
    if (commentError) commentError.classList.add("d-none");

    try {
      const response = await fetch(`/listings/${listingId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          review: { ...review, comment },
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("Server returned invalid JSON");
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      const redirectUrl = `/listings/${listingId}#reviews`;

      /* ===== INSERT REVIEW CARD ===== */
      /* ===== INSERT REVIEW CARD ===== */

      if (reviewsContainer && data.review) {
        const comment = data.review.comment; // ✅ DEFINE FIRST

        const shortText =
          comment.length > 140 ? comment.slice(0, 140) + "..." : comment;

        const showBtn =
          comment.length > 140
            ? `<button type="button" class="show-more-btn btn btn-link p-0">Show more</button>`
            : "";

        reviewsContainer.insertAdjacentHTML(
          "afterbegin",
          `
  <div class="review-card enhanced">
    <div class="review-header">
      <div class="review-author-info">
        <h5 class="review-author mb-1">${data.review.author}</h5>
        <p class="review-date text-muted small">Guest verified</p>
      </div>
    </div>

    <div class="review-rating mb-3">
      ${'<i class="fa-solid fa-star"></i>'.repeat(Math.round(data.review.overall))}
      ${'<i class="fa-regular fa-star"></i>'.repeat(5 - Math.round(data.review.overall))}
    </div>

    <p class="review-text">${data.review.comment}</p>

    ${
      data.review.isAuthor
        ? `
        <button class="btn btn-sm btn-outline-dark mt-2 delete-review-btn"
                data-review-id="${data.review._id}">
          <i class="fa-solid fa-trash"></i> Delete
        </button>
        `
        : ""
    }
  </div>
  `
        );

        // Remove empty state
        const noReviews = document.getElementById("noReviews");
        if (noReviews) noReviews.remove();

        // Update review count
        const countEl = document.getElementById("reviewCount");
        if (countEl) countEl.textContent = data.totalReviews;

        // Hide review form
        const reviewFormSection = document.querySelector(
          ".review-form-section"
        );
        if (reviewFormSection) reviewFormSection.style.display = "none";
      }
      // Remove "No reviews yet"
      const noReviews = document.getElementById("noReviews");
      if (noReviews) noReviews.remove();

      // Update review count
      const countEl = document.getElementById("reviewCount");
      if (countEl) countEl.textContent = data.totalReviews;

      // ===== UPDATE GUEST FAVOURITE SECTION =====
      const ratingScore = document.querySelector(".rating-score-xl");
      const ratingTitle = document.querySelector(".rating-title");

      if (ratingScore && ratingTitle && data.avgRating) {
        ratingScore.textContent = data.avgRating.toFixed(1);

        if (data.avgRating >= 4.5) {
          ratingTitle.textContent = "Guest favourite";
        } else if (data.avgRating >= 4.0) {
          ratingTitle.textContent = "Highly rated";
        } else {
          ratingTitle.textContent = "Rated by guests";
        }
      }

      /* ===== UPDATE FRONTEND DATA ===== */
      [
        "cleanliness",
        "accuracy",
        "checkIn",
        "communication",
        "location",
        "value",
      ].forEach(cat => {
        ratingData[cat].push(data.review[cat]);
      });

      /* ===== UPDATE UI ===== */
      updateOverallRatingUI();
      updateCategoryRatings();

      reviewForm.reset();
      showToast("✅ Review added successfully!", "success");
      window.location.assign(redirectUrl);
    } catch (err) {
      console.error(err);
      showToast(err.message || "❌ Failed to submit review", "error");
    }
  });
});

/* ======================================================
   HELPERS
====================================================== */

function average(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return "0.0";
  const sum = arr.reduce((a, b) => a + Number(b), 0);
  return (sum / arr.length).toFixed(1);
}

/* ===== OVERALL RATING ===== */

function updateOverallRatingUI() {
  const d = window.RATING_DATA;
  if (!d) return;

  const allAverages = [
    average(d.cleanliness),
    average(d.accuracy),
    average(d.checkIn),
    average(d.communication),
    average(d.location),
    average(d.value),
  ]
    .map(Number)
    .filter(n => !isNaN(n));

  if (!allAverages.length) return;

  const overall = allAverages.reduce((a, b) => a + b, 0) / allAverages.length;

  const avg = overall.toFixed(1);

  const scoreEl = document.querySelector(".rating-score-xl");
  const titleEl = document.querySelector(".rating-title");

  if (!scoreEl || !titleEl) return; // 👈 PREVENT CRASH

  scoreEl.textContent = avg;

  if (avg >= 4.5) titleEl.textContent = "Guest favourite";
  else if (avg >= 4.0) titleEl.textContent = "Highly rated";
  else titleEl.textContent = "Rated by guests";
}

/* ===== CATEGORY AVERAGES ===== */

function updateCategoryRatings() {
  const data = window.RATING_DATA;
  if (!data) return;

  const map = {
    cleanliness: "cleanliness-score",
    accuracy: "accuracy-score",
    checkIn: "checkin-score",
    communication: "communication-score",
    location: "location-score",
    value: "value-score",
  };

  Object.entries(map).forEach(([key, id]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = average(data[key]);
  });
}
