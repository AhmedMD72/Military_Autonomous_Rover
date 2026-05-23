/* ── State ── */
let currentPos = { lat: 35.5, lon: 109.3 }; // overridden by ROS GPS
let destPos = null;

let currentMarker = null;
let destMarker = null;
let routeLine = null;

/* ── Init Leaflet map ── */
const map = L.map("map-frame", {
  center: [currentPos.lat, currentPos.lon],
  zoom: 14,
  zoomControl: true,
  attributionControl: false,
});

L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
  maxZoom: 19,
  subdomains: "abcd",
}).addTo(map);

/* ── Custom dot markers ── */
function makeDotIcon(color) {
  return L.divIcon({
    className: "",
    html: `<div style="
            width: 13px;
            height: 13px;
            background: ${color};
            border: 2px solid #fff;
            border-radius: 50%;
            box-shadow: 0 0 8px ${color};
        "></div>`,
    iconSize: [13, 13],
    iconAnchor: [6, 6],
  });
}

const iconCurrent = makeDotIcon("#00A890"); // teal — rover
const iconDest = makeDotIcon("#E53935"); // red  — destination

/* CORE MAP FUNCTIONS*/

function setCurrentPosition(lat, lon) {
  currentPos = { lat, lon };

  if (currentMarker) map.removeLayer(currentMarker);

  currentMarker = L.marker([lat, lon], { icon: iconCurrent })
    .addTo(map)
    .bindTooltip("Rover", {
      permanent: true,
      direction: "top",
      className: "map-tooltip",
    });

  // Update position display
  document.getElementById("val-current-pos-lat").textContent =
    `Lat: ${lat.toFixed(5)}`;
  document.getElementById("val-current-pos-lon").textContent =
    `Lon: ${lon.toFixed(5)}`;

  // Recalculate route if destination is already set
  if (destPos) updateRoute();
}

function setDestination(lat, lon) {
  destPos = { lat, lon };

  if (destMarker) map.removeLayer(destMarker);

  destMarker = L.marker([lat, lon], { icon: iconDest })
    .addTo(map)
    .bindTooltip("Destination", {
      permanent: true,
      direction: "top",
      className: "map-tooltip",
    });

  updateRoute();
}

/**
 * Redraw the dashed travel line between current pos and destination,
 * fit the map to show both, and update the distance label.
 */
function updateRoute() {
  if (routeLine) map.removeLayer(routeLine);
  if (!destPos) return;

  routeLine = L.polyline(
    [
      [currentPos.lat, currentPos.lon],
      [destPos.lat, destPos.lon],
    ],
    {
      color: "#00A890",
      weight: 2,
      dashArray: "7 5",
      opacity: 0.85,
    },
  ).addTo(map);

  map.fitBounds(routeLine.getBounds(), { padding: [30, 30] });

  // Update distance display
  const metres = haversine(
    currentPos.lat,
    currentPos.lon,
    destPos.lat,
    destPos.lon,
  );
  document.getElementById("val-distance").textContent = formatDist(metres);
}

/* ── Haversine formula — returns distance in metres ── */
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ── Format metres to human-readable string ── */
function formatDist(m) {
  return m >= 1000 ? (m / 1000).toFixed(2) + " km" : Math.round(m) + " meters";
}

/* ── Place initial rover marker ── */
setCurrentPosition(currentPos.lat, currentPos.lon);

/* Parse input and set destination */
function applyDestInput() {
  const raw = document.getElementById("input-destination").value.trim();
  const parts = raw.split(",").map((s) => parseFloat(s.trim()));

  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    setDestination(parts[0], parts[1]);
  } else {
    alert("Enter valid coordinates: lat, lon  (e.g. 35.5, 109.3)");
  }
}

document
  .getElementById("btn-send-coords")
  .addEventListener("click", applyDestInput);

document
  .getElementById("input-destination")
  .addEventListener("keydown", (e) => {
    if (e.key === "Enter") applyDestInput();
  });

/* Go to Destination */
document.getElementById("btn-go-destination").addEventListener("click", () => {
  if (!destPos) {
    alert("Set a destination first.");
    return;
  }
  console.log("[NAV] Go to destination:", destPos);

  // ── ROS: publish goal ──
  // goalTopic.publish(new ROSLIB.Message({
  //     latitude:  destPos.lat,
  //     longitude: destPos.lon
  // }));
});

/* Return to Origin */
document.getElementById("btn-return-origin").addEventListener("click", () => {
  console.log("[NAV] Return to origin");

  // ── ROS: publish return command ──
  // returnTopic.publish(new ROSLIB.Message({ data: true }));
});

/* ================================================================
   ROS INTEGRATION
   Uncomment and configure once your ROS bridge is running.
   ================================================================

const ros = new ROSLIB.Ros({ url: 'ws://localhost:9090' });

ros.on('connection', () => console.log('[ROS] Connected'));
ros.on('error',      e  => console.error('[ROS] Error:', e));
ros.on('close',      () => console.warn('[ROS] Connection closed'));

// ── GPS topic → update rover position on map ──
const gpsTopic = new ROSLIB.Topic({
    ros,
    name:        '/fix',                       // your GPS topic name
    messageType: 'sensor_msgs/NavSatFix'
});

gpsTopic.subscribe(msg => {
    setCurrentPosition(msg.latitude, msg.longitude);
});

// ── Publish navigation goal ──
const goalTopic = new ROSLIB.Topic({
    ros,
    name:        '/nav_goal',                  // your goal topic name
    messageType: 'geographic_msgs/GeoPoint'
});

// ── Publish return-to-origin command ──
const returnTopic = new ROSLIB.Topic({
    ros,
    name:        '/return_origin',             // your return topic name
    messageType: 'std_msgs/Bool'
});

================================================================ */
