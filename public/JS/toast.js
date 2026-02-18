function removeToast(toast) {
  toast.classList.remove("show");
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300);
}

window.showToast =
  window.showToast ||
  function showToast(message, type, duration = 5000) {
    const toastContainer = document.getElementById("toast-container");
    if (!toastContainer || !message) return;

    const toast = document.createElement("div");
    toast.className = `toast-notification toast-${type}`;

    const isVerification =
      message.includes("verified") || message.includes("Welcome to Wanderlust");

    if (isVerification && type === "success") {
      duration = 8000;
      toast.style.fontSize = "1.2rem";
      toast.style.fontWeight = "600";
      toast.style.padding = "20px";
    }

    toast.innerHTML = `
      <div class="toast-content">
        <span>${message}</span>
        <button class="toast-close" aria-label="Close">&times;</button>
      </div>
    `;

    toastContainer.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 10);

    const closeBtn = toast.querySelector(".toast-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        removeToast(toast);
      });
    }

    setTimeout(() => {
      removeToast(toast);
    }, duration);
  };

document.addEventListener("DOMContentLoaded", () => {
  const flashData = document.getElementById("toast-flash-data");
  if (!flashData) return;

  const successRaw = flashData.dataset.success || "";
  const errorRaw = flashData.dataset.error || "";

  const successMsg = successRaw ? decodeURIComponent(successRaw) : "";
  const errorMsg = errorRaw ? decodeURIComponent(errorRaw) : "";

  if (successMsg) {
    window.showToast(successMsg, "success");
  }

  if (errorMsg) {
    window.showToast(errorMsg, "error");
  }
});
