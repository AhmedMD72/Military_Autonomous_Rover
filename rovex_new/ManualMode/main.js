document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Camera
  const cameraStreamDiv = document.getElementById("camera-stream");
  // Example: cameraStreamDiv.innerHTML = '<img src="YOUR_CAMERA_IP_URL" style="width:100%; height:100%; object-fit:cover;">';
  const img = document.createElement("img");
  img.src = "http://192.168.1.37:8080/video"; // replace with your IP
  cameraStreamDiv.appendChild(img);
  const TELEMETRY_API_URL = "API_ENDPOINT";

  async function updateTelemetry() {
    try {
      /*
            const response = await fetch(TELEMETRY_API_URL);
            const data = await response.json();
            
            document.getElementById("val-temp").innerText = `${data.temp} °C`;
            document.getElementById("val-hum").innerText = `${data.hum} %`;
            document.getElementById("val-co2").innerText = `${data.co2} %`;
            document.getElementById("val-air").innerText = `${data.airQuality} %`;
            document.getElementById("val-gyro").innerText = `X: ${data.gyro.x} | Y: ${data.gyro.y} | Z: ${data.gyro.z}`;
            document.getElementById("val-gps").innerText = `${data.gps.lat}, ${data.gps.long}`;
            document.getElementById("val-batt-txt").innerText = `${data.battery}%`;
            document.getElementById("val-batt-fill").style.width = `${data.battery}%`;
            document.getElementById("val-prox").innerText = `${data.proximity}M`;
            */

      console.log("Telemetry polling... (API URL not set)");
    } catch (error) {
      console.error("Error fetching telemetry data:", error);
    }
  }

  // --- 3. Manual Drive UI binding ---
  const startBtn = document.querySelector(".start-motor");
  const stopBtn = document.querySelector(".stop-motor");

  startBtn.addEventListener("click", () => {
    console.log("Start Motors command sent.");
  });

  stopBtn.addEventListener("click", () => {
    console.log("Stop Motors command sent.");
  });
});
