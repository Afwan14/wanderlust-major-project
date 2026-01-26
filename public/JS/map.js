mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: "mapbox://styles/mapbox/streets-v12",
    center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 10 // starting zoom
});

// Chat GPT Start
// Create wrapper
const el = document.createElement("div");
el.className = "marker-wrapper";

// Red radius + icon
el.innerHTML = `
  <div class="marker-ring"></div>
  <div class="marker-dot"></div>
`;

new mapboxgl.Marker(el)
  .setLngLat(listing.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 })
      .setHTML(`<h4>${listing.title}</h4><p>Exact location will be provided after booking</p>`)
  )
  .addTo(map);



// Create a default Marker and add it to the map.
    // const marker = new mapboxgl.Marker({ color: "red"})
    //     .setLngLat(listing.geometry.coordinates)
    //     .setPopup(new mapboxgl.Popup({offset: 25})
    //         .setHTML(`<h4>${listing.title}</h4><P>Exact location will be provided after booking</p>`))
    //     .addTo(map);

        