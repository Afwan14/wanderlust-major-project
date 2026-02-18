document.addEventListener("DOMContentLoaded", () => {
  // Get tab items
  const tabItems = document.querySelectorAll(".tab-item");
  const tabContents = document.querySelectorAll(".tab-content");
  const pageTitle = document.getElementById("pageTitle");

  // Add click handlers to tabs
  tabItems.forEach(tab => {
    tab.addEventListener("click", e => {
      e.preventDefault();

      // Get the tab name
      const tabName = tab.getAttribute("data-tab");

      // Remove active class from all tabs
      tabItems.forEach(t => t.classList.remove("active"));
      // Hide all content
      tabContents.forEach(content => content.classList.add("d-none"));

      // Add active class to clicked tab
      tab.classList.add("active");

      // Show the corresponding content
      if (tabName === "about") {
        document.getElementById("about-section").classList.remove("d-none");
        pageTitle.textContent = "Reviews about you";
      } else if (tabName === "by-you") {
        document.getElementById("by-you-section").classList.remove("d-none");
        pageTitle.textContent = "Reviews by you";
      }
    });
  });
});
