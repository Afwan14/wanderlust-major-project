document.addEventListener("DOMContentLoaded", () => {
  const pageData = document.getElementById("showOldPageData");
  if (pageData) {
    const listingRaw = pageData.dataset.listing;
    const mapTokenRaw = pageData.dataset.mapToken;

    if (mapTokenRaw && !window.mapToken) {
      window.mapToken = mapTokenRaw;
    }

    if (listingRaw && !window.listing) {
      try {
        window.listing = JSON.parse(decodeURIComponent(listingRaw));
      } catch (error) {
        console.error("Failed to parse show_old listing data", error);
      }
    }
  }

  const reviewForm = document.getElementById("reviewForm");
  const ratingError = document.getElementById("ratingError");
  const commentError = document.getElementById("commentError");

  if (!reviewForm) return;

  const listingId = reviewForm.dataset.listingId;

  reviewForm.addEventListener("submit", async event => {
    event.preventDefault();

    const ratingChecked = document.querySelector(
      'input[name="review[rating]"]:checked'
    );
    const commentField = document.querySelector(
      'textarea[name="review[comment]"]'
    );
    const comment = commentField ? commentField.value.trim() : "";

    let isValid = true;

    if (!ratingChecked) {
      if (ratingError) ratingError.classList.remove("d-none");
      isValid = false;
    } else if (ratingError) {
      ratingError.classList.add("d-none");
    }

    if (!comment) {
      if (commentError) commentError.classList.remove("d-none");
      isValid = false;
    } else if (commentError) {
      commentError.classList.add("d-none");
    }

    if (!isValid || !listingId) return;

    try {
      const response = await fetch(`/listings/${listingId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          review: {
            rating: parseInt(ratingChecked.value, 10),
            comment,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const reviewsContainer = document.getElementById("reviews");
      const reviewsText = document.querySelector("h4.mb-4");
      const ratingBadge = document.querySelector(".rating-number");
      const ratingText = document.querySelector(".rating-text");
      const ratingLaurel = document.querySelectorAll(".laurel")[1];

      const reviewHTML = `
        <div class="review-card border-bottom pb-2 mb-3">
          <strong>${data.review.author}</strong>
          <div class="text-muted">
            ${"★".repeat(data.review.rating)}${"☆".repeat(5 - data.review.rating)}
          </div>
          <p>${data.review.comment}</p>
          <form method="POST" action="/listings/${listingId}/reviews/${data.review._id}?_method=DELETE">
            <button class="btn btn-sm btn-outline-dark">Delete</button>
          </form>
        </div>
      `;

      if (
        !reviewsContainer ||
        reviewsContainer.parentElement.style.display === "none"
      ) {
        if (!reviewsContainer && reviewsText && reviewsText.parentElement) {
          const hr = document.createElement("hr");
          hr.className = "my-4";
          const heading = document.createElement("h4");
          heading.className = "mb-4";
          heading.textContent = "Reviews";
          const container = document.createElement("div");
          container.id = "reviews";
          container.className = "reviews-grid";
          container.innerHTML = reviewHTML;

          reviewsText.parentElement.insertBefore(hr, reviewsText);
          reviewsText.parentElement.insertBefore(heading, reviewsText);
          reviewsText.parentElement.insertBefore(container, reviewsText);
        }
      } else {
        reviewsContainer.insertAdjacentHTML("afterbegin", reviewHTML);
      }

      if (ratingBadge) ratingBadge.textContent = data.avgRating;
      if (ratingLaurel) ratingLaurel.classList.remove("opacity-25");

      if (ratingText) {
        if (data.avgRating >= 4.0) {
          ratingText.innerHTML = "Highly rated by guests";
        } else {
          ratingText.innerHTML = "Rated by guests";
        }
      }

      reviewForm.reset();
      if (ratingError) ratingError.classList.add("d-none");
      if (commentError) commentError.classList.add("d-none");

      const toast = document.getElementById("toast");
      const toastMessage = document.getElementById("toast-message");
      if (toast && toastMessage) {
        toastMessage.textContent = "✅ Review added successfully!";
        toast.className = "toast-notification show success";
        setTimeout(() => {
          toast.className = "toast-notification";
        }, 2500);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      const toast = document.getElementById("toast");
      const toastMessage = document.getElementById("toast-message");
      if (toast && toastMessage) {
        toastMessage.textContent = "❌ Failed to submit review";
        toast.className = "toast-notification show error";
        setTimeout(() => {
          toast.className = "toast-notification";
        }, 2500);
      }
    }
  });
});
