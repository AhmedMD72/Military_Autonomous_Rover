// =====================================================
// CONFIGURATION
// =====================================================

const ROBOT_IP = CONFIG.ROBOT_IP;

const ROSBRIDGE_URL = `ws://${ROBOT_IP}:9090`;

// Camera Stream
const CAMERA_SERVER_URL = `http://${ROBOT_IP}:8090`;
const CAMERA_VIDEO_URL = `http://${ROBOT_IP}:8082/stream?topic=/image_raw`;

// ROS Topics
const GPS_TOPIC = "/gps/fix";
const SENSOR_TOPIC = "/sensor_data";
const IMU_TOPIC = "/imu_data";

const NAV_GOAL_TOPIC = "/nav_goal";
const RETURN_TOPIC = "/return_origin";

// =====================================================
// CAMERA FEED
// =====================================================

function setCameraFeedURL(url) {
  const camImg = document.getElementById("live-camera-feed");
  const placeholderText = document.getElementById("camera-placeholder-text");

  if (!camImg) return;

  camImg.src = url;
  camImg.style.display = "block";

  if (placeholderText) {
    placeholderText.style.display = "none";
  }

  camImg.onerror = () => {
    camImg.style.display = "none";
    if (placeholderText) {
      placeholderText.style.display = "block";
      placeholderText.innerText = "Camera Stream Error";
    }
  };
}

setCameraFeedURL(CAMERA_VIDEO_URL);

// =====================================================
// MAP VARIABLES
// =====================================================

let currentPos = { lat: 30.5867317, lon: 31.4829121 }; 
let destPos = null;

let currentMarker = null;
let destMarker = null;
let routeLine = null;
let isFirstGPSFix = true;
// =====================================================
// MAP (OPENSTREETMAP STANDARD)
// =====================================================

const map = L.map("map-frame", {
  center: [currentPos.lat, currentPos.lon],
  zoom: 15,
  zoomControl: true,
  attributionControl: false,
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// =====================================================
// CUSTOM ICONS
// =====================================================

function makeDotIcon(color) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 14px;
        height: 14px;
        background:${color};
        border-radius:50%;
        border:2px solid white;
        box-shadow:0 0 10px ${color};
      "></div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

const iconCurrent = makeDotIcon("#00A890");
const iconDest = makeDotIcon("#E53935");

// =====================================================
// REVERSE GEOCODING (OSM NOMINATIM)
// =====================================================

async function reverseGeocode(lat, lon) {
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;

    const res = await fetch(url);
    const data = await res.json();

    const name = data.display_name || "Unknown location";

    const shortName =
      name.length > 45 ? name.slice(0, 45) + "..." : name;

    const el = document.getElementById("location-name");
    if (el) {
      el.innerText = shortName;
    }

    console.log("Location:", name);
  } catch (err) {
    console.error("Reverse geocoding error:", err);
  }
}

// =====================================================
// POSITION FUNCTIONS
// =====================================================

function setCurrentPosition(lat, lon) {
  currentPos = { lat, lon };

  if (currentMarker) {
    map.removeLayer(currentMarker);
  }

  currentMarker = L.marker([lat, lon], {
    icon: iconCurrent,
  })
    .addTo(map)
    .bindTooltip("ROVER", {
      permanent: true,
      direction: "top",
      className: "map-tooltip",
    });

  document.getElementById("val-current-pos-lat").innerText =
    `Lat: ${lat.toFixed(5)}`;

  document.getElementById("val-current-pos-lon").innerText =
    `Lon: ${lon.toFixed(5)}`;

  // 🔥 Reverse geocoding update
  reverseGeocode(lat, lon);

  if (destPos) {
    updateRoute();
  }
}

function setDestination(lat, lon) {
  destPos = { lat, lon };

  if (destMarker) {
    map.removeLayer(destMarker);
  }

  destMarker = L.marker([lat, lon], {
    icon: iconDest,
  })
    .addTo(map)
    .bindTooltip("DESTINATION", {
      permanent: true,
      direction: "top",
      className: "map-tooltip",
    });

  updateRoute();
}

// =====================================================
// ROUTE
// =====================================================

function updateRoute() {
  if (!destPos) return;

  if (routeLine) {
    map.removeLayer(routeLine);
  }

  routeLine = L.polyline(
    [
      [currentPos.lat, currentPos.lon],
      [destPos.lat, destPos.lon],
    ],
    {
      color: "#00A890",
      weight: 3,
      dashArray: "8 6",
    }
  ).addTo(map);

  map.fitBounds(routeLine.getBounds(), {
    padding: [40, 40],
  });

  const distance = haversine(
    currentPos.lat,
    currentPos.lon,
    destPos.lat,
    destPos.lon
  );

  document.getElementById("val-distance").innerText =
    formatDistance(distance);
}

// =====================================================
// DISTANCE
// =====================================================

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(m) {
  return m >= 1000
    ? `${(m / 1000).toFixed(2)} km`
    : `${Math.round(m)} meters`;
}

// =====================================================
// INPUT DESTINATION
// =====================================================

function applyDestInput() {
  const raw = document.getElementById("input-destination").value.trim();

  const parts = raw.split(",").map((x) => parseFloat(x.trim()));

  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    setDestination(parts[0], parts[1]);
  } else {
    alert("Invalid coordinates");
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

// =====================================================
// ROS
// =====================================================

let ros = null;
let navGoalTopic = null;
let returnTopic = null;

function setupROSBridge() {
  if (typeof ROSLIB === "undefined") return;

  ros = new ROSLIB.Ros({
    url: ROSBRIDGE_URL,
  });

  const gpsTopic = new ROSLIB.Topic({
    ros,
    name: GPS_TOPIC,
    messageType: "sensor_msgs/NavSatFix",
  });

  gpsTopic.subscribe((msg) => {
  const lat = msg.latitude;
  const lon = msg.longitude;

 
  if (isFirstGPSFix) {
    map.setView([lat, lon], 17); 
    isFirstGPSFix = false;

    console.log("[GPS] Initial fix acquired:", lat, lon);
  }

  setCurrentPosition(lat, lon);
});

  const sensorTopic = new ROSLIB.Topic({
    ros,
    name: SENSOR_TOPIC,
    messageType: "std_msgs/String",
  });

  sensorTopic.subscribe((msg) => {
    try {
      updateTelemetry(JSON.parse(msg.data));
    } catch (e) {
      console.error("Sensor parse error", e);
    }
  });

  const imuTopic = new ROSLIB.Topic({
    ros,
    name: IMU_TOPIC,
    messageType: "sensor_msgs/Imu",
  });

  imuTopic.subscribe((msg) => {
    document.getElementById("val-pitch").innerText =
      msg.orientation.x.toFixed(2);
    document.getElementById("val-roll").innerText =
      msg.orientation.y.toFixed(2);
    document.getElementById("val-yaw").innerText =
      msg.orientation.z.toFixed(2);
  });

  navGoalTopic = new ROSLIB.Topic({
    ros,
    name: NAV_GOAL_TOPIC,
    messageType: "geographic_msgs/GeoPoint",
  });

  returnTopic = new ROSLIB.Topic({
    ros,
    name: RETURN_TOPIC,
    messageType: "std_msgs/Bool",
  });
}

setupROSBridge();

// =====================================================
// TELEMETRY
// =====================================================

function updateTelemetry(data) {
  if (data.temperature !== undefined)
    document.getElementById("val-temp").innerText =
      `${data.temperature}°C`;

  if (data.humidity !== undefined)
    document.getElementById("val-hum").innerText =
      `${data.humidity}%`;

  if (data.airQuality !== undefined)
    document.getElementById("val-air").innerText =
      `${data.airQuality}%`;

  if (data.co2 !== undefined)
    document.getElementById("val-co2").innerText =
      `${data.co2}%`;
}

// =====================================================
// BUTTONS
// =====================================================

document.getElementById("btn-go-destination")
  .addEventListener("click", () => {
    if (!destPos) return alert("Set destination first");

    navGoalTopic.publish(
      new ROSLIB.Message({
        latitude: destPos.lat,
        longitude: destPos.lon,
        altitude: 0,
      })
    );
  });

document.getElementById("btn-return-origin")
  .addEventListener("click", () => {
    returnTopic.publish(
      new ROSLIB.Message({ data: true })
    );
  });

// =====================================================
// INIT
// =====================================================

setCurrentPosition(currentPos.lat, currentPos.lon);