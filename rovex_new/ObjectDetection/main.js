// dynamic Camera URL
function setCameraFeedURL(url) {
  const camImg = document.getElementById("live-camera-feed");
  const placeholderText = document.getElementById("camera-placeholder-text");

  if (url) {
    camImg.src = url;
    camImg.style.display = "block";
    placeholderText.style.display = "none";
  }
}
setCameraFeedURL("http://192.168.1.37:8080/video");

// Control Panel Buttons
document.getElementById("btn-start-det").addEventListener("click", () => {
  console.log("Starting Object Detection model...");
});

document.getElementById("btn-stop-det").addEventListener("click", () => {
  console.log("Stopping Object Detection model...");
});

// Function to parse inbound API/Telemetry payload adjustments
function updateTelemetry(data) {
  if (data.battery)
    document.getElementById("val-battery").innerText = data.battery + "%";
  if (data.signal)
    document.getElementById("val-signal").innerText = data.signal + "%";

  if (data.temperature)
    document.getElementById("val-temp").innerText = data.temperature + "°C";
  if (data.gps) document.getElementById("val-gps").innerText = data.gps;
  if (data.mpu) document.getElementById("val-mpu").innerText = data.mpu;

  if (data.detectedObjects) {
    if (data.detectedObjects.cars !== undefined)
      document.getElementById("count-cars").innerText =
        data.detectedObjects.cars;
    if (data.detectedObjects.rocks !== undefined)
      document.getElementById("count-rocks").innerText =
        data.detectedObjects.rocks;
    if (data.detectedObjects.trees !== undefined)
      document.getElementById("count-trees").innerText =
        data.detectedObjects.trees;
  }

  const alarmPanel = document.querySelector(".alarm-panel");
  const alarmText = document.getElementById("val-alarm");
  if (data.obstacleDetected) {
    alarmPanel.style.display = "block";
    alarmText.innerText = data.obstacleMessage || "Obstacle detected nearby.";
  }
}
