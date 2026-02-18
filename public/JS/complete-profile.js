(() => {
  const minBioLength = 10;
  const form = document.getElementById("completeProfileForm");
  const bioField = document.getElementById("bioField");
  const bioCounter = document.getElementById("bioCounter");
  const bioError = document.getElementById("bioError");

  if (!form || !bioField || !bioCounter || !bioError) return;

  const updateBioState = () => {
    const trimmedLength = bioField.value.trim().length;
    bioCounter.textContent = `${trimmedLength} / ${minBioLength} characters`;

    if (trimmedLength < minBioLength) {
      bioField.classList.add("bio-has-error");
      bioError.classList.add("show");
    } else {
      bioField.classList.remove("bio-has-error");
      bioError.classList.remove("show");
    }
  };

  bioField.addEventListener("input", updateBioState);

  form.addEventListener("submit", event => {
    const trimmedLength = bioField.value.trim().length;
    if (trimmedLength < minBioLength) {
      event.preventDefault();
      bioField.classList.add("bio-has-error");
      bioError.classList.add("show");
      bioField.focus();
    }
  });

  updateBioState();
})();
