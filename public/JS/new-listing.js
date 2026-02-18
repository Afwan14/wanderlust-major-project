document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.getElementById("wlNavbar");
  if (navbar && !navbar.querySelector(".wl-search-desktop")) {
    navbar.classList.add("nav-no-search");
  }

  const pageData = document.getElementById("newListingPageData");
  const showModal = pageData?.dataset?.showProfileWarningModal === "true";

  if (showModal) {
    const modal = new bootstrap.Modal(
      document.getElementById("profileWarningModal")
    );
    modal.show();
  }

  const cancelBtn = document.getElementById("cancelProfileWarningBtn");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      window.location.href = "/listings?incomplete=true";
    });
  }

  const byId = id => document.getElementById(id);

  const titleInput = byId("titleInput");
  const locationInput = byId("locationInput");
  const countryInput = byId("countryInput");
  const priceInput = byId("priceInput");
  const imageInput = byId("imageInput");

  const previewTitle = byId("previewTitle");
  const previewLocation = byId("previewLocation");
  const previewCountry = byId("previewCountry");
  const previewPrice = byId("previewPrice");
  const previewImage = byId("previewImage");
  const previewPlaceholder = byId("previewPlaceholder");
  const previewBadges = byId("previewBadges");

  const applyCategory = byId("applyCategory");
  const clearCategory = byId("clearCategory");
  const categorySummary = byId("categorySummary");

  const categoryCheckboxes = Array.from(
    document.querySelectorAll(".categoryCheckbox")
  );

  function setText(el, value, fallback) {
    if (!el) return;
    const v = (value || "").toString().trim();
    el.textContent = v.length ? v : fallback;
  }

  function formatPrice(v) {
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0) return "0";
    return Math.round(n).toString();
  }

  function getSelectedCategories() {
    return categoryCheckboxes.filter(cb => cb.checked).map(cb => cb.value);
  }

  function updateCategorySummary(selected) {
    if (!categorySummary) return;
    categorySummary.textContent = selected.length
      ? `(${selected.length} selected)`
      : "";
  }

  function setBadges(values) {
    if (!previewBadges) return;
    const cats = (values || []).filter(Boolean);
    previewBadges.innerHTML = "";

    if (!cats.length) {
      const badge = document.createElement("span");
      badge.className = "badge-soft";
      badge.textContent = "Category";
      previewBadges.appendChild(badge);
      return;
    }

    cats.slice(0, 5).forEach(category => {
      const badge = document.createElement("span");
      badge.className = "badge-soft";
      badge.textContent = category;
      previewBadges.appendChild(badge);
    });

    if (cats.length > 5) {
      const more = document.createElement("span");
      more.className = "badge-soft";
      more.textContent = `+${cats.length - 5} more`;
      previewBadges.appendChild(more);
    }
  }

  function refreshCategoriesUI() {
    const selected = getSelectedCategories();
    setBadges(selected);
    updateCategorySummary(selected);
  }

  setText(previewTitle, titleInput?.value, "Your listing title");
  setText(previewLocation, locationInput?.value, "City or area");
  setText(previewCountry, countryInput?.value, "Country");
  if (previewPrice && priceInput) {
    previewPrice.textContent = formatPrice(priceInput.value);
  }
  refreshCategoriesUI();

  titleInput?.addEventListener("input", event =>
    setText(previewTitle, event.target.value, "Your listing title")
  );
  locationInput?.addEventListener("input", event =>
    setText(previewLocation, event.target.value, "City or area")
  );
  countryInput?.addEventListener("input", event =>
    setText(previewCountry, event.target.value, "Country")
  );
  priceInput?.addEventListener("input", event => {
    if (previewPrice) {
      previewPrice.textContent = formatPrice(event.target.value);
    }
  });

  categoryCheckboxes.forEach(cb =>
    cb.addEventListener("change", refreshCategoriesUI)
  );
  applyCategory?.addEventListener("click", refreshCategoriesUI);
  clearCategory?.addEventListener("click", () => {
    categoryCheckboxes.forEach(cb => {
      cb.checked = false;
    });
    refreshCategoriesUI();
  });

  imageInput?.addEventListener("change", () => {
    const file = imageInput.files && imageInput.files[0];

    if (!file) {
      if (previewImage) {
        previewImage.removeAttribute("src");
        previewImage.style.display = "none";
      }
      if (previewPlaceholder) previewPlaceholder.style.display = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (!previewImage) return;
      previewImage.src = reader.result;
      previewImage.style.display = "block";
      if (previewPlaceholder) previewPlaceholder.style.display = "none";
    };
    reader.readAsDataURL(file);
  });
});
