(() => {
  const body = document.body;
  const mapTokenFromLayout = body?.dataset?.mapToken || "";

  if (typeof window.mapToken === "undefined" || !window.mapToken) {
    window.mapToken = mapTokenFromLayout;
  }

  if (typeof window.listing === "undefined") {
    window.listing = null;
  }
})();
