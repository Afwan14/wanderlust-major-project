document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");

  if (!form || !password || !confirmPassword) return;

  form.addEventListener("submit", e => {
    if (password.value !== confirmPassword.value) {
      e.preventDefault();
      e.stopPropagation();
      confirmPassword.setCustomValidity("Passwords must match");
      confirmPassword.classList.add("is-invalid");
    } else {
      confirmPassword.setCustomValidity("");
    }
  });

  confirmPassword.addEventListener("input", () => {
    if (password.value === confirmPassword.value) {
      confirmPassword.setCustomValidity("");
      confirmPassword.classList.remove("is-invalid");
    }
  });
});
