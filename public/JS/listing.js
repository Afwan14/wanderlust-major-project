/* ========================================
   LISTING PAGE JAVASCRIPT
   ======================================== */

/* ========================================
   TOAST NOTIFICATION HELPER
   ======================================== */

/**
 * Displays a temporary toast notification message
 * @param {string} message - The message to display
 * @param {string} type - Type of notification: 'success' or 'error' (default: 'success')
 *
 * The toast appears for 2.5 seconds then automatically fades out
 */
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");

  // Set message text and apply styling based on type
  toastMessage.textContent = message;
  toast.className = `toast-notification show ${type}`;

  // Auto-hide toast after 2.5 seconds
  setTimeout(() => {
    toast.className = "toast-notification";
  }, 2500);
}

window.shareListingCard = function shareListingCard(
  event,
  listingPath,
  listingTitle
) {
  event.preventDefault();
  event.stopPropagation();

  const url = window.location.origin + listingPath;

  if (navigator.share) {
    navigator
      .share({
        title: listingTitle,
        text: "Check out this amazing listing on Wanderlust!",
        url,
      })
      .catch(err => console.log("Error sharing:", err));
    return;
  }

  navigator.clipboard
    .writeText(url)
    .then(() => {
      if (typeof showWishlistToast === "function") {
        showWishlistToast("Link copied to clipboard!");
        return;
      }
      alert("Link copied to clipboard!");
    })
    .catch(err => {
      console.error("Failed to copy:", err);
      alert("Link: " + url);
    });
};

/* ========================================
   LISTING DELETION FUNCTIONALITY
   ======================================== */

// Store the ID of the listing to be deleted
let deleteListingId = null;

/**
 * Initialize delete listing functionality when DOM is loaded
 * - Sets up delete button event listeners
 * - Handles confirmation modal
 * - Performs API deletion and UI updates
 */
document.addEventListener("DOMContentLoaded", () => {
  // Check if delete modal exists on this page
  const deleteModalElement = document.getElementById("deleteModal");
  if (!deleteModalElement) {
    return; // Exit if modal doesn't exist on this page
  }

  // Initialize Bootstrap modal for delete confirmation
  const modal = new bootstrap.Modal(deleteModalElement);

  /* -------- Delete Button Listeners -------- */

  /**
   * Attach click listeners to all delete listing buttons
   * Opens confirmation modal and stores listing ID
   */
  document.querySelectorAll(".delete-listing-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      deleteListingId = btn.dataset.id;
      modal.show();
    });
  });

  /* -------- Confirm Delete Handler -------- */

  /**
   * Handle delete confirmation button click
   * - Makes DELETE API request to backend
   * - Removes listing from DOM on success
   * - Shows empty state if no listings remain
   * - Displays appropriate toast notification
   */
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", async () => {
      // Send DELETE request to server
      const res = await fetch(`/listings/${deleteListingId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      // Parse response
      let data = {};

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        throw new Error("Invalid server response");
      }

      // Handle successful deletion
      if (data.success) {
        // Remove listing card from DOM
        document.getElementById(`listing-${deleteListingId}`).remove();
        showToast("Listing deleted successfully 🗑️");

        // Show empty state if no listings left
        if (document.querySelectorAll("#my-listings > div").length === 0) {
          document.getElementById("my-listings").remove();
          const emptyState = document.getElementById("empty-state");
          if (emptyState) {
            emptyState.classList.remove("d-none");
          }
        }
      } else {
        // Show error notification
        showToast(data.error || "Failed to delete listing", "error");
      }

      // Close confirmation modal
      modal.hide();
    });
  }
});
