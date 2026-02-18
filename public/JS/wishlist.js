// ===============================
// Wishlist Toast Helper
// ===============================
function showWishlistToast(message) {
  const toast = document.getElementById("wishlist-toast");
  const text = document.getElementById("wishlist-toast-text");

  if (!toast || !text) return;

  text.textContent = message;
  toast.classList.add("show");

  clearTimeout(toast.hideTimeout);
  toast.hideTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

// ===============================
// Wishlist Click Handler
// ===============================
document.addEventListener("click", async e => {
  const btn = e.target.closest(".save-btn, .remove-wishlist-btn");
  if (!btn) return;

  // Stop link navigation & bubbling
  e.preventDefault();
  e.stopPropagation();

  const listingId = btn.dataset.id;
  if (!listingId) return;

  try {
    const res = await fetch(`/listings/${listingId}/wishlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    // Not logged in → redirect
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }

    const data = await res.json();

    // ❤️ Heart toggle (home / listings pages)
    if (btn.classList.contains("save-btn")) {
      btn.classList.toggle("saved", data.saved);

      // Update button text if it has a span element
      const textSpan = btn.querySelector("span");
      if (textSpan) {
        textSpan.textContent = data.saved ? "Saved" : "Save";
      }

      showWishlistToast(
        data.saved ? "Added to wishlist ❤️" : "Removed from wishlist"
      );
    }

    // ❌ Remove from wishlist page
    if (btn.classList.contains("remove-wishlist-btn")) {
      const card = btn.closest("[data-wishlist-card]");
      if (card) card.remove();

      showWishlistToast("Removed from wishlist");

      // Optional: show empty state if last item removed
      const remainingCards = document.querySelectorAll("[data-wishlist-card]");
      if (remainingCards.length === 0) {
        const container = document.querySelector(".wishlist-page");
        if (container) {
          container.innerHTML = `
            <div class="wishlist-empty text-center mt-5">
              <div class="empty-icon mb-3">
                <i class="fa-regular fa-heart"></i>
              </div>
              <h4 class="mb-2">Your wishlist is empty</h4>
              <p class="text-muted mb-4">
                Save places you love by tapping the ❤️ on a listing.
              </p>
              <a href="/listings" class="btn btn-dark px-4">
                Explore listings
              </a>
            </div>
          `;
        }
      }
    }
  } catch (err) {
    console.error("Wishlist error:", err);
  }
});
