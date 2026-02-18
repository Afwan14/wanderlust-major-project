document.addEventListener("DOMContentLoaded", () => {
  if (!window.mapToken || !window.listing) return;

  if (
    !window.listing.geometry ||
    !Array.isArray(window.listing.geometry.coordinates) ||
    window.listing.geometry.coordinates.length !== 2
  ) {
    console.error("Invalid listing coordinates", window.listing.geometry);
    return;
  }

  mapboxgl.accessToken = window.mapToken;

  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    center: window.listing.geometry.coordinates,
    zoom: 12,
    attributionControl: false,
  });

  // UX controls
  map.scrollZoom.disable();
  map.keyboard.disable();
  map.dragRotate.disable();
  map.touchZoomRotate.disableRotation();

  if (window.innerWidth > 768) {
    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right"
    );
  }

  if (window.innerWidth <= 768) {
    map.dragPan.disable();
    map.doubleClickZoom.disable();

    const overlay = document.createElement("div");
    overlay.className = "map-overlay";
    overlay.innerText = "Tap to interact with map";
    document.getElementById("map").appendChild(overlay);

    overlay.addEventListener("click", () => {
      map.dragPan.enable();
      map.doubleClickZoom.enable();
      overlay.remove();
    });
  }

  map.on("load", () => {
    const el = document.createElement("div");
    el.className = "marker-wrapper";
    el.innerHTML = `
      <div class="marker-ring"></div>
      <div class="marker-dot"></div>
    `;

    new mapboxgl.Marker({
      element: el,
      anchor: "center",
    })
      .setLngLat(window.listing.geometry.coordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <h4>${window.listing.title}</h4>
          <p>Exact location provided after booking</p>
        `)
      )
      .addTo(map);
  });
});
