"use strict";

/* ========================================
   MAIN APPLICATION SCRIPT
   ======================================== */

/* ========================================
   BOOTSTRAP FORM VALIDATION
   ======================================== */

/**
 * Enable Bootstrap client-side form validation
 * - Prevents form submission if validation fails
 * - Adds 'was-validated' class for styling feedback
 * - Applied to all forms with 'needs-validation' class
 */
(() => {
  const forms = document.querySelectorAll(".needs-validation");

  Array.from(forms).forEach(form => {
    form.addEventListener(
      "submit",
      event => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add("was-validated");
      },
      false
    );
  });
})();

/* ========================================
   DOM CONTENT LOADED - MAIN INITIALIZATION
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {
  /* ========================================
     CATEGORY FILTER DROPDOWN
     ======================================== */

  /**
   * Manages category selection dropdown
   * - Toggle dropdown visibility
   * - Handle category selection/deselection
   * - Update summary text and hidden form inputs
   * - Close dropdown on outside click
   */
  const categoryBtn = document.getElementById("categoryBtn");
  const categoryDropdown = document.getElementById("categoryDropdown");
  const applyCategory = document.getElementById("applyCategory");
  const clearCategory = document.getElementById("clearCategory");
  const categorySummary = document.getElementById("categorySummary");
  const hiddenCategories = document.getElementById("hiddenCategories");

  if (categoryBtn && categoryDropdown && hiddenCategories) {
    /**
     * Toggle dropdown visibility on button click
     */
    categoryBtn.addEventListener("click", () => {
      categoryDropdown.style.display =
        categoryDropdown.style.display === "block" ? "none" : "block";
    });

    /**
     * Close dropdown when clicking outside of it
     */
    document.addEventListener("click", e => {
      if (
        !categoryBtn.contains(e.target) &&
        !categoryDropdown.contains(e.target)
      ) {
        categoryDropdown.style.display = "none";
      }
    });

    /**
     * Update category summary and hidden inputs
     * - Summary shows selected categories (or +X if more than 2)
     * - Hidden inputs are created for form submission
     */
    function updateCategory() {
      const selected = Array.from(
        categoryDropdown.querySelectorAll("input:checked")
      ).map(cb => cb.value);

      // Update summary text
      if (categorySummary) {
        if (selected.length === 0) {
          categorySummary.textContent = "";
        } else if (selected.length <= 2) {
          categorySummary.textContent = selected.join(", ");
        } else {
          categorySummary.textContent = `${selected.slice(0, 2).join(", ")} +${selected.length - 2}`;
        }
      }

      // Create hidden form inputs for submission
      hiddenCategories.innerHTML = "";
      selected.forEach(cat => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = "listing[category][]";
        input.value = cat;
        hiddenCategories.appendChild(input);
      });
    }

    updateCategory();

    /**
     * Apply selected categories and close dropdown
     */
    applyCategory?.addEventListener("click", () => {
      updateCategory();
      categoryDropdown.style.display = "none";
    });

    /**
     * Clear all category selections
     */
    clearCategory?.addEventListener("click", () => {
      categoryDropdown
        .querySelectorAll("input")
        .forEach(cb => (cb.checked = false));
      hiddenCategories.innerHTML = "";
      if (categorySummary) categorySummary.textContent = "";
    });

    /**
     * Update on individual checkbox change
     */
    categoryDropdown.querySelectorAll("input").forEach(cb => {
      cb.addEventListener("change", updateCategory);
    });
  }

  /* ========================================
     FILTER SCROLL BUTTONS
     ======================================== */

  /**
   * Manage horizontal filter scroll with arrow buttons
   * - Show/hide scroll buttons based on scroll position
   * - Smooth scroll on button click
   */
  const filters = document.getElementById("filters");
  const leftBtn = document.querySelector(".scroll-btn.left");
  const rightBtn = document.querySelector(".scroll-btn.right");

  if (filters && leftBtn && rightBtn) {
    /**
     * Global function to scroll filters horizontally
     * @param {number} amount - Pixels to scroll (positive = right, negative = left)
     */
    window.scrollFilters = function (amount) {
      filters.scrollBy({
        left: amount,
        behavior: "smooth",
      });
    };

    /**
     * Toggle scroll button visibility based on scroll position
     */
    function toggleButtons() {
      leftBtn.style.display = filters.scrollLeft <= 0 ? "none" : "flex";

      rightBtn.style.display =
        filters.scrollLeft + filters.clientWidth >= filters.scrollWidth
          ? "none"
          : "flex";
    }

    filters.addEventListener("scroll", toggleButtons);
    window.addEventListener("load", toggleButtons);
  }

  /* ========================================
     FILTER BOX TOGGLE
     ======================================== */

  /**
   * Toggle filter panel visibility on mobile
   * - Show/hide filter box
   * - Update button text and icon
   */
  const filterToggle = document.getElementById("filterToggle");
  const filterBox = document.getElementById("filterBox");

  if (filterToggle && filterBox) {
    filterToggle.addEventListener("click", () => {
      filterBox.classList.toggle("d-none");
      filterToggle.innerHTML = filterBox.classList.contains("d-none")
        ? '<i class="fa-solid fa-sliders"></i> Filters'
        : '<i class="fa-solid fa-xmark"></i> Close Filters';
    });
  }

  /* ========================================
     TAX TOGGLE
     ======================================== */

  /**
   * Toggle tax display on price cards
   * - Adds 'show-tax' class to body when enabled
   * - CSS handles visibility of tax-related elements
   */
  const taxToggle = document.getElementById("switchCheckDefault");

  if (taxToggle) {
    taxToggle.addEventListener("change", () => {
      document.body.classList.toggle("show-tax", taxToggle.checked);
    });
  }

  /* ========================================
     BOOKING PRICE CALCULATION
     ======================================== */

  /**
   * Calculate total price based on check-in/check-out dates
   * - Calculates number of nights
   * - Multiplies by price per night
   * - Formats price in Indian Rupees
   * - Only runs if pricePerNight variable is defined
   */
  if (typeof pricePerNight !== "undefined") {
    const checkIn = document.getElementById("checkIn");
    const checkOut = document.getElementById("checkOut");
    const totalPrice = document.getElementById("totalPrice");

    /**
     * Calculate and display total price
     */
    function calculateTotal() {
      if (!checkIn?.value || !checkOut?.value) return;

      const start = new Date(checkIn.value);
      const end = new Date(checkOut.value);

      if (end > start) {
        const days = (end - start) / (1000 * 60 * 60 * 24);
        const total = days * pricePerNight;
        totalPrice.textContent = "₹ " + total.toLocaleString("en-IN");
      } else {
        totalPrice.textContent = "₹ 0";
      }
    }

    checkIn?.addEventListener("change", calculateTotal);
    checkOut?.addEventListener("change", calculateTotal);
  }

  /* ========================================
     NAVBAR HAMBURGER MENU
     ======================================== */

  /**
   * Responsive navbar interactions
   * - Desktop dropdown menu
   * - Mobile slide-in menu panel
   * - Mobile full-screen search modal
   * - Optional navbar shrink on scroll
   */
  const navbar = document.getElementById("wlNavbar");
  const menuBtn = document.getElementById("menuBtn");
  const menuDropdown = document.getElementById("menuDropdown");
  const mobileMenuBackdrop = document.getElementById("mobileMenuBackdrop");
  const mobileMenuPanel = document.getElementById("mobileMenuPanel");
  const closeMobileMenu = document.getElementById("closeMobileMenu");
  const mobileSearchBtn = document.getElementById("mobileSearchBtn");
  const mobileSearchModal = document.getElementById("mobileSearchModal");
  const closeMobileSearch = document.getElementById("closeMobileSearch");
  const mobileSearchInput = document.getElementById("mobileSearchInput");

  const isMobileView = () => window.innerWidth < 768;

  const closeDesktopDropdown = () => {
    if (menuDropdown) menuDropdown.style.display = "none";
    menuBtn?.setAttribute("aria-expanded", "false");
  };

  const openMobileMenu = () => {
    closeDesktopDropdown();
    document.body.classList.add("mobile-menu-open");
    mobileMenuPanel?.setAttribute("aria-hidden", "false");
    menuBtn?.setAttribute("aria-expanded", "true");
  };

  const closeMobileMenuPanel = () => {
    document.body.classList.remove("mobile-menu-open");
    mobileMenuPanel?.setAttribute("aria-hidden", "true");
    menuBtn?.setAttribute("aria-expanded", "false");
  };

  const openMobileSearchModal = () => {
    document.body.classList.add("mobile-search-open");
    mobileSearchModal?.setAttribute("aria-hidden", "false");
    setTimeout(() => mobileSearchInput?.focus(), 100);
  };

  const closeMobileSearchModal = () => {
    document.body.classList.remove("mobile-search-open");
    mobileSearchModal?.setAttribute("aria-hidden", "true");
  };

  if (menuBtn && menuDropdown) {
    menuBtn.addEventListener("click", e => {
      e.stopPropagation();
      if (isMobileView()) {
        if (document.body.classList.contains("mobile-menu-open")) {
          closeMobileMenuPanel();
        } else {
          openMobileMenu();
        }
        return;
      }

      const isOpen = menuDropdown.style.display === "block";
      menuDropdown.style.display = isOpen ? "none" : "block";
      menuBtn.setAttribute("aria-expanded", isOpen ? "false" : "true");
    });

    document.addEventListener("click", e => {
      if (!isMobileView()) {
        if (!menuDropdown.contains(e.target) && !menuBtn.contains(e.target)) {
          closeDesktopDropdown();
        }
      }
    });

    window.addEventListener("resize", () => {
      if (!isMobileView()) {
        closeMobileMenuPanel();
      } else {
        closeDesktopDropdown();
      }
    });
  }

  if (mobileMenuBackdrop) {
    mobileMenuBackdrop.addEventListener("click", closeMobileMenuPanel);
  }

  closeMobileMenu?.addEventListener("click", closeMobileMenuPanel);

  if (mobileSearchBtn && mobileSearchModal) {
    mobileSearchBtn.addEventListener("click", openMobileSearchModal);

    mobileSearchModal.addEventListener("click", e => {
      if (e.target === mobileSearchModal) {
        closeMobileSearchModal();
      }
    });

    closeMobileSearch?.addEventListener("click", closeMobileSearchModal);
  }

  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    closeDesktopDropdown();
    closeMobileMenuPanel();
    closeMobileSearchModal();
  });

  if (navbar) {
    const syncNavbarScrollState = () => {
      navbar.classList.toggle("is-scrolled", window.scrollY > 12);
    };

    syncNavbarScrollState();
    window.addEventListener("scroll", syncNavbarScrollState, { passive: true });
  }

  /* ========================================
     REVIEW TEXT TRUNCATION
     ======================================== */

  /**
   * Manage review text "Read more / Show less" functionality
   * - Uses smooth max-height expansion
   * - Keeps luxury gradient fade in collapsed state
   */
  document.addEventListener("click", e => {
    if (!e.target.classList.contains("show-more-btn")) return;

    const card = e.target.closest(".review-card");
    if (!card) return;

    const textWrap = card.querySelector(".review-text-wrap");
    if (!textWrap) return;

    const willExpand = textWrap.classList.contains("is-collapsed");
    textWrap.classList.toggle("is-collapsed", !willExpand);
    textWrap.classList.toggle("is-expanded", willExpand);
    e.target.textContent = willExpand ? "Show less" : "Read more";
    e.target.setAttribute("aria-expanded", willExpand ? "true" : "false");
  });

  const reviewsSection = document.getElementById("reviewsSection");
  if (reviewsSection && "IntersectionObserver" in window) {
    const reviewCards = reviewsSection.querySelectorAll(".review-card");

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          reviewsSection.classList.add("is-inview");
          reviewCards.forEach((card, index) => {
            card.style.transitionDelay = `${Math.min(index * 45, 220)}ms`;
          });
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.18 }
    );

    observer.observe(reviewsSection);
  } else if (reviewsSection) {
    reviewsSection.classList.add("is-inview");
  }
});
