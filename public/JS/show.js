(() => {
  const pageData = document.getElementById("showPageData");
  if (!pageData) return;

  const decodeJson = value => {
    if (!value) return null;
    try {
      return JSON.parse(decodeURIComponent(value));
    } catch (error) {
      console.error("Failed to decode show page data", error);
      return null;
    }
  };

  const ratingData = decodeJson(pageData.dataset.ratingData);
  const listingData = decodeJson(pageData.dataset.listing);
  const bookingRanges = decodeJson(pageData.dataset.bookingRanges) || [];
  const reservedUntil = decodeJson(pageData.dataset.reservedUntil);

  if (pageData.dataset.listingId) {
    window.REVIEW_DATA = { listingId: pageData.dataset.listingId };
  }

  if (ratingData) {
    window.RATING_DATA = ratingData;
  }

  if (pageData.dataset.mapToken) {
    window.mapToken = pageData.dataset.mapToken;
  }

  if (listingData) {
    window.listing = listingData;
  }

  window.bookingRanges = bookingRanges;
  window.reservedUntil = reservedUntil;
  window.isReserved = pageData.dataset.isReserved === "true";

  document
    .querySelectorAll(".reviews-breakdown-fill[data-score]")
    .forEach(bar => {
      const score = Number(bar.dataset.score);
      const normalized = Number.isFinite(score)
        ? Math.max(0, Math.min(100, score))
        : 0;
      bar.style.setProperty("--score-width", `${normalized}%`);
    });

  window.shareButton = function shareButton() {
    const url = window.location.href;
    const title = pageData.dataset.shareTitle || "Wanderlust Listing";

    if (navigator.share) {
      navigator
        .share({
          title,
          text: "Check out this amazing listing on Wanderlust!",
          url,
        })
        .catch(err => console.log("Error sharing:", err));
      return;
    }

    navigator.clipboard
      .writeText(url)
      .then(() => {
        alert("Link copied to clipboard!");
      })
      .catch(err => {
        console.error("Failed to copy:", err);
      });
  };
})();

// Booking date picker initialization
(function initBookingPickers() {
  const checkInInput = document.getElementById("bookingCheckIn");
  const checkOutInput = document.getElementById("bookingCheckOut");
  if (!checkInInput || !checkOutInput) return;

  if (typeof flatpickr === "undefined") {
    checkInInput.type = "date";
    checkOutInput.type = "date";
    return;
  }

  const rawRanges = window.bookingRanges || [];
  const parseLocalDate = value => {
    if (!value) return null;
    const dateOnly = String(value).split("T")[0];
    const parts = dateOnly.split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]);
  };

  const disableRanges = rawRanges
    .map(r => {
      const start = parseLocalDate(r.checkIn);
      const end = parseLocalDate(r.checkOut);
      if (!start || !end) return null;
      return end >= start ? { from: start, to: end } : null;
    })
    .filter(Boolean);

  const reservedUntil = parseLocalDate(window.reservedUntil);
  if (reservedUntil && window.isReserved) {
    const now = new Date();
    const todayLocal = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    if (reservedUntil >= todayLocal) {
      disableRanges.push({ from: todayLocal, to: reservedUntil });
    }
  }

  const checkOutPicker = flatpickr(checkOutInput, {
    dateFormat: "Y-m-d",
    minDate: "today",
    allowInput: true,
    disable: disableRanges,
    onChange: function () {
      if (typeof window.updateBookingBreakdown === "function") {
        window.updateBookingBreakdown();
      }
    },
  });

  const checkInPicker = flatpickr(checkInInput, {
    dateFormat: "Y-m-d",
    minDate: "today",
    allowInput: true,
    disable: disableRanges,
    onChange: function (selectedDates) {
      if (!selectedDates.length) {
        checkOutPicker.set("minDate", "today");
        if (typeof window.updateBookingBreakdown === "function") {
          window.updateBookingBreakdown();
        }
        return;
      }
      const minCheckout = new Date(selectedDates[0]);
      minCheckout.setDate(minCheckout.getDate() + 1);
      checkOutPicker.set("minDate", minCheckout);
      if (typeof window.updateBookingBreakdown === "function") {
        window.updateBookingBreakdown();
      }
    },
  });

  checkInInput.readOnly = false;
  checkOutInput.readOnly = false;

  const dateRange = document.querySelector(".date-range");
  if (dateRange) {
    dateRange.addEventListener("click", event => {
      const target = event.target.closest(".check-in, .check-out");
      if (!target) return;
      if (target.classList.contains("check-in")) {
        checkInInput.focus();
        checkInPicker.open();
        return;
      }
      checkOutInput.focus();
      checkOutPicker.open();
    });
  }
})();

(function initBookingPricing() {
  const form = document.querySelector(".booking-form");
  const checkInInput = document.getElementById("bookingCheckIn");
  const checkOutInput = document.getElementById("bookingCheckOut");
  const breakdown = document.getElementById("priceBreakdown");
  if (!form || !checkInInput || !checkOutInput || !breakdown) return;

  const nightlyPrice = Number(
    form.dataset.nightlyPrice || window.listing?.price || 0
  );
  const serviceFeeRate = Number(breakdown.dataset.serviceFee || 0.08);
  const taxRate = Number(breakdown.dataset.taxRate || 0.1);
  const formatter = new Intl.NumberFormat("en-IN");

  const parseLocalDate = value => {
    if (!value) return null;
    const dateOnly = String(value).split("T")[0];
    const parts = dateOnly.split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]);
  };

  const renderBreakdown = ({ nights, subtotal, serviceFee, taxes, total }) => {
    breakdown.innerHTML = `
      <div class="breakdown-row">
        <span>₹${formatter.format(nightlyPrice)} × ${nights} night${nights > 1 ? "s" : ""}</span>
        <span>₹${formatter.format(subtotal)}</span>
      </div>
      <div class="breakdown-row">
        <span>Service fee</span>
        <span>₹${formatter.format(serviceFee)}</span>
      </div>
      <div class="breakdown-row">
        <span>Taxes</span>
        <span>₹${formatter.format(taxes)}</span>
      </div>
      <div class="breakdown-divider"></div>
      <div class="breakdown-row">
        <strong>Total</strong>
        <strong>₹${formatter.format(total)}</strong>
      </div>
    `;
    breakdown.classList.add("is-visible");
  };

  const clearBreakdown = () => {
    breakdown.classList.remove("is-visible");
    breakdown.innerHTML = "";
  };

  const updateBreakdown = () => {
    const checkIn = parseLocalDate(checkInInput.value);
    const checkOut = parseLocalDate(checkOutInput.value);
    if (
      !checkIn ||
      !checkOut ||
      checkOut <= checkIn ||
      !Number.isFinite(nightlyPrice)
    ) {
      clearBreakdown();
      return;
    }

    const nights = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    if (!Number.isFinite(nights) || nights <= 0) {
      clearBreakdown();
      return;
    }

    const subtotal = nightlyPrice * nights;
    const serviceFee = Math.round(subtotal * serviceFeeRate);
    const taxes = Math.round(subtotal * taxRate);
    const total = subtotal + serviceFee + taxes;
    renderBreakdown({ nights, subtotal, serviceFee, taxes, total });
  };

  window.updateBookingBreakdown = updateBreakdown;
  checkInInput.addEventListener("change", updateBreakdown);
  checkOutInput.addEventListener("change", updateBreakdown);
  checkInInput.addEventListener("input", updateBreakdown);
  checkOutInput.addEventListener("input", updateBreakdown);

  const submitButton = form.querySelector(".btn-book");
  form.addEventListener("submit", () => {
    if (!submitButton) return;
    submitButton.classList.add("is-loading");
    submitButton.setAttribute("aria-busy", "true");
    submitButton.disabled = true;
  });

  updateBreakdown();
})();

(function initMobileGallerySlider() {
  if (window.matchMedia("(min-width: 769px)").matches) return;

  const slider = document.getElementById("mobileGallerySlider");
  const counter = document.getElementById("mobileGalleryCounter");
  const dotsContainer = document.getElementById("mobileGalleryDots");
  if (!slider || !counter || !dotsContainer) return;

  const normalize = value =>
    String(value || "")
      .split("?")[0]
      .trim();

  const seen = new Set();
  Array.from(slider.querySelectorAll(".gallery-slide")).forEach(slide => {
    const img = slide.querySelector("img");
    const src = normalize(img?.currentSrc || img?.src);
    if (!img || !src || seen.has(src)) {
      slide.remove();
      return;
    }
    seen.add(src);
  });

  const slides = Array.from(slider.querySelectorAll(".gallery-slide"));
  const total = slides.length;
  if (!total) return;

  if (total === 1) {
    dotsContainer.style.display = "none";
  }

  dotsContainer.innerHTML = "";
  slides.forEach((_, index) => {
    const dot = document.createElement("span");
    dot.className = `gallery-slider-dot${index === 0 ? " is-active" : ""}`;
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(
    dotsContainer.querySelectorAll(".gallery-slider-dot")
  );

  const updateUI = currentIndex => {
    const safeIndex = Math.max(0, Math.min(total - 1, currentIndex));
    counter.textContent = `${safeIndex + 1} / ${total}`;
    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === safeIndex);
    });
  };

  let rafId = null;
  const onScroll = () => {
    if (rafId !== null) return;
    rafId = window.requestAnimationFrame(() => {
      const slideWidth = slider.clientWidth || 1;
      const index = Math.round(slider.scrollLeft / slideWidth);
      updateUI(index);
      rafId = null;
    });
  };

  slider.addEventListener("scroll", onScroll, { passive: true });
  updateUI(0);
})();
