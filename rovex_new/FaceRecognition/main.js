// -------------------- Configuration --------------------
const ROSBRIDGE_URL = "ws://192.168.100.9:9090";
const FACE_VIDEO_URL = "http://192.168.100.9:8090/video";
const FACE_STATUS_TOPIC = "/face_detection/status";

// -------------------- Camera Feed --------------------
function setCameraFeedURL(url) {
  const camImg = document.getElementById("live-camera-feed");
  const placeholderText = document.getElementById("camera-placeholder-text");

  if (url) {
    camImg.src = url;
    camImg.style.display = "block";

    if (placeholderText) {
      placeholderText.style.display = "none";
    }

    camImg.onerror = () => {
      console.error("Failed to load camera feed:", url);

      if (placeholderText) {
        placeholderText.innerText = "Camera stream error";
        placeholderText.style.display = "block";
      }

      camImg.style.display = "none";
    };
  }
}

setCameraFeedURL(FACE_VIDEO_URL);

// -------------------- ROSBridge Connection --------------------
function setupROSBridge() {
  if (typeof ROSLIB === "undefined") {
    console.error("ROSLIB is not loaded. Check roslibjs script in HTML.");
    return;
  }

  const rosStatusDiv = document.getElementById("ros-connection-status");
  const faceStatusDiv = document.getElementById("face-detection-status");

  const ros = new ROSLIB.Ros({
    url: ROSBRIDGE_URL,
  });

  ros.on("connection", () => {
    console.log("Connected to ROSBridge:", ROSBRIDGE_URL);

    if (rosStatusDiv) {
      rosStatusDiv.innerText = "ROS: Connected";
      rosStatusDiv.className = "ros-status connected";
    }
  });

  ros.on("error", (error) => {
    console.error("ROSBridge error:", error);

    if (rosStatusDiv) {
      rosStatusDiv.innerText = "ROS: Connection Error";
      rosStatusDiv.className = "ros-status disconnected";
    }
  });

  ros.on("close", () => {
    console.warn("ROSBridge connection closed");

    if (rosStatusDiv) {
      rosStatusDiv.innerText = "ROS: Disconnected";
      rosStatusDiv.className = "ros-status disconnected";
    }
  });

  const faceStatusTopic = new ROSLIB.Topic({
    ros: ros,
    name: FACE_STATUS_TOPIC,
    messageType: "std_msgs/String",
  });

  faceStatusTopic.subscribe((message) => {
    console.log("Face topic:", message.data);

    if (!faceStatusDiv) return;

    const status = message.data;

    if (!status || status === "none") {
      faceStatusDiv.className = "face-detection-status no-face";
      faceStatusDiv.innerHTML = `
                <i class="fa-solid fa-circle-xmark"></i>
                <span>No face detected</span>
            `;
      document.getElementById("targetCard").classList.remove("visible");
    } else if (status === "Unknown") {
      faceStatusDiv.className = "face-detection-status unknown";
      faceStatusDiv.innerHTML = `
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span>Unknown face detected</span>
            `;
      document.getElementById("targetCard").classList.remove("visible");
    } else {
      faceStatusDiv.className = "face-detection-status detected";
      faceStatusDiv.innerHTML = `
                <i class="fa-solid fa-circle-check"></i>
                <span>Face detected: ${status}</span>
            `;

      const name = uploadedFilename ? uploadedFilename.innerText : status;
      const imageSrc = uploadedFaceImg ? uploadedFaceImg.src : "";

      // Step 1: show card + play sound
      document.getElementById("targetCard").classList.add("visible");
      playAlertSound();

      // Step 2: after 3 seconds hide card and add to eliminated list
      setTimeout(() => {
        document.getElementById("targetCard").classList.remove("visible");
        addEliminatedTarget(name, imageSrc);
      }, 3000);
    }
  });
}

setupROSBridge();

// -------------------- Upload Photo Preview --------------------
const photoUploadInput = document.getElementById("photo-upload");
const facePreviewContainer = document.getElementById("face-preview-container");
const uploadedFaceImg = document.getElementById("uploaded-face-img");
const uploadedFilename = document.getElementById("uploaded-filename");
const confidenceVal = document.getElementById("val-confidence");

if (photoUploadInput) {
  photoUploadInput.addEventListener("change", function (event) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        uploadedFaceImg.src = e.target.result;
        uploadedFilename.innerText = file.name.replace(/\.[^/.]+$/, "");

        facePreviewContainer.style.display = "flex";

        fetchConfidenceSensorData();
      };

      reader.readAsDataURL(file);
    }
  });
}

function fetchConfidenceSensorData() {
  const simulatedSensorReading = (Math.random() * (99.9 - 85.0) + 85.0).toFixed(
    1,
  );

  if (confidenceVal) {
    confidenceVal.innerText = simulatedSensorReading + "%";
    confidenceVal.style.color = "#00A890";
  }
}

// -------------------- Control Panel Buttons --------------------
const startRecognitionBtn = document.getElementById("btn-start-rec");
const stopRecognitionBtn = document.getElementById("btn-stop-rec");

if (startRecognitionBtn) {
  startRecognitionBtn.addEventListener("click", () => {
    console.log("Starting Face Recognition model...");
  });
}

if (stopRecognitionBtn) {
  stopRecognitionBtn.addEventListener("click", () => {
    console.log("Stopping Face Recognition model...");

    if (facePreviewContainer) {
      facePreviewContainer.style.display = "none";
    }

    if (photoUploadInput) {
      photoUploadInput.value = "";
    }

    document.getElementById("targetCard").classList.remove("visible");
  });
}

// -------------------- Eliminated Targets --------------------
function addEliminatedTarget(name, imageSrc) {
  const list = document.querySelector(".eliminated-list");
  if (!list) return;

  const item = document.createElement("div");
  item.classList.add("eliminated-item");

  item.innerHTML = `
        <img src="${imageSrc}" alt="Target" class="eliminated-avatar">
        <div class="eliminated-info">
            <div class="eliminated-name">TARGET: ${name.toUpperCase()}</div>
            <div class="eliminated-status">STATUS: <span>ELIMINATED</span></div>
        </div>
    `;

  list.appendChild(item);
}

// -------------------- Alert Sound --------------------
function playAlertSound() {
  const audio = new Audio(
    "https://www.myinstants.com/media/sounds/gun-shot.mp3",
  );
  audio.volume = 0.1;
  audio.play();
}

// -------------------- Telemetry Example --------------------
function updateTelemetry(data) {
  if (data.temperature)
    document.getElementById("val-temp").innerText = data.temperature + "°C";
  if (data.humidity)
    document.getElementById("val-hum").innerText = data.humidity + "%";
  if (data.gps) document.getElementById("val-gps").innerText = data.gps;
  if (data.airQuality)
    document.getElementById("val-air").innerText = data.airQuality + "%";
  if (data.co2) document.getElementById("val-co2").innerText = data.co2 + "%";
  if (data.mpu) document.getElementById("val-mpu").innerText = data.mpu;
}

// -------------------- TESTING ONLY - remove later --------------------
const testBtn = document.createElement("button");
testBtn.innerText = "Test Eliminated";
testBtn.style.cssText =
  "position:fixed; bottom:20px; left:20px; z-index:9999; padding:10px; background:red; color:white; border:none; cursor:pointer; border-radius:6px;";
document.body.appendChild(testBtn);

testBtn.addEventListener("click", () => {
  const name = uploadedFilename ? uploadedFilename.innerText : "Test Target";
  const imageSrc =
    uploadedFaceImg && uploadedFaceImg.src ? uploadedFaceImg.src : "";

  // Step 1: show card + play sound
  document.getElementById("targetCard").classList.add("visible");
  playAlertSound();

  // Step 2: after 3 seconds hide card and add to eliminated list
  setTimeout(() => {
    document.getElementById("targetCard").classList.remove("visible");
    addEliminatedTarget(name, imageSrc);
  }, 3000);
});
