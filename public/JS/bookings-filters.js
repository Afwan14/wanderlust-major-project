document.addEventListener("DOMContentLoaded", () => {
  const filters = document.querySelectorAll(".booking-filter");
  const items = document.querySelectorAll(".booking-item");
  const emptyState =
    document.getElementById("bookingFilterEmpty") ||
    document.getElementById("reservationFilterEmpty");

  if (!filters.length || !items.length) return;

  const applyFilter = status => {
    let visible = 0;

    items.forEach(item => {
      const matches = status === "all" || item.dataset.status === status;
      item.classList.toggle("d-none", !matches);
      if (matches) visible += 1;
    });

    if (emptyState) {
      emptyState.classList.toggle("d-none", visible > 0);
    }
  };

  filters.forEach(filter => {
    filter.addEventListener("click", () => {
      filters.forEach(btn => btn.classList.remove("active"));
      filter.classList.add("active");
      applyFilter(filter.dataset.filter);
    });
  });
});
