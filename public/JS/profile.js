document.addEventListener("DOMContentLoaded", () => {
  // Profile Modal Elements
  const profileModal = document.getElementById("profileModal");
  const editBtn = document.getElementById("editProfileBtn");
  const completeProfileBtn = document.getElementById("completeProfileBtn");
  const closeX = document.getElementById("closeProfileModal");
  const closeBtn = document.getElementById("closeProfileModalBtn");
  const openConfirmSaveBtn = document.getElementById("openConfirmSave");

  // Confirm Save Modal Elements
  const confirmSaveModalEl = document.getElementById("confirmSaveModal");
  let confirmSaveModal = null;

  // Initialize Bootstrap modal if it exists
  if (confirmSaveModalEl) {
    confirmSaveModal = new bootstrap.Modal(confirmSaveModalEl);
  }

  // Edit Profile Modal - Open
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      profileModal.style.display = "flex";
    });
  }

  // Complete Profile Button - Open
  if (completeProfileBtn) {
    completeProfileBtn.addEventListener("click", () => {
      profileModal.style.display = "flex";
    });
  }

  // Edit Profile Modal - Close with X
  if (closeX) {
    closeX.addEventListener("click", () => {
      profileModal.style.display = "none";
    });
  }

  // Edit Profile Modal - Close with Cancel button
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      profileModal.style.display = "none";
    });
  }

  // Open Confirm Save Modal
  if (openConfirmSaveBtn) {
    openConfirmSaveBtn.addEventListener("click", () => {
      profileModal.style.display = "none";
      if (confirmSaveModal) {
        confirmSaveModal.show();
      }
    });
  }

  // Cancel Confirm Save - go back to edit modal
  const cancelConfirmSaveBtn = document.getElementById("cancelConfirmSave");
  if (cancelConfirmSaveBtn) {
    cancelConfirmSaveBtn.addEventListener("click", () => {
      if (confirmSaveModal) {
        confirmSaveModal.hide();
      }
      profileModal.style.display = "flex";
    });
  }

  // Confirm Save - submit the form
  const confirmSaveBtn = document.getElementById("confirmSaveBtn");
  if (confirmSaveBtn) {
    confirmSaveBtn.addEventListener("click", () => {
      if (confirmSaveModal) {
        confirmSaveModal.hide();
      }
      setTimeout(() => {
        const editProfileForm = document.getElementById("editProfileForm");
        if (editProfileForm) {
          editProfileForm.submit();
        }
      }, 150);
    });
  }

  // Click outside modal closes it
  if (profileModal) {
    profileModal.addEventListener("click", e => {
      if (e.target === profileModal) {
        profileModal.style.display = "none";
      }
    });
  }
});
