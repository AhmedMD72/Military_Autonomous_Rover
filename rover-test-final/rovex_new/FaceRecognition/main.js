// -------------------- Configuration --------------------
const ROBOT_IP = CONFIG.ROBOT_IP;

const ROSBRIDGE_URL = `ws://${ROBOT_IP}:9090`;
const FACE_SERVER_URL = `http://${ROBOT_IP}:8091`;
const FACE_VIDEO_URL = `${FACE_SERVER_URL}/video`;

const FACE_STATUS_TOPIC = "/face_detection/status";
const FACE_CONTROL_TOPIC = "/face_recognition/control";
const LASER_DETECTED_TOPIC = "/laser_detected";
const GPS_TOPIC = "/gps/fix";
const IMU_TOPIC = "/imu_data";

let faceControlTopic = null;


// -------------------- Camera Feed --------------------
function setCameraFeedURL(url) {
    const camImg = document.getElementById("live-camera-feed");
    const placeholderText = document.getElementById("camera-placeholder-text");

    if (!camImg) {
        console.error("live-camera-feed element not found");
        return;
    }

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
        alert("ROSLIB is not loaded. Check internet/CDN or use local roslib.min.js");
        return;
    }

    const rosStatusText = document.getElementById("ros-status");
    const rosDot = document.getElementById("ros-dot");
    const faceStatusDiv = document.getElementById("face-detection-status");

    const ros = new ROSLIB.Ros({
        url: ROSBRIDGE_URL
    });

    ros.on("connection", () => {
        console.log("Connected to ROSBridge:", ROSBRIDGE_URL);

        if (rosStatusText) {
            rosStatusText.innerText = "Connected";
        }

        if (rosDot) {
            rosDot.style.backgroundColor = "lime";
        }
    });

    ros.on("error", (error) => {
        console.error("ROSBridge error:", error);

        if (rosStatusText) {
            rosStatusText.innerText = "Connection Error";
        }

        if (rosDot) {
            rosDot.style.backgroundColor = "red";
        }
    });

    ros.on("close", () => {
        console.warn("ROSBridge connection closed");

        if (rosStatusText) {
            rosStatusText.innerText = "Disconnected";
        }

        if (rosDot) {
            rosDot.style.backgroundColor = "red";
        }
    });

    // باقي كود الـ topics زي ما هو

  
    const faceStatusTopic = new ROSLIB.Topic({
        ros: ros,
        name: FACE_STATUS_TOPIC,
        messageType: "std_msgs/String"
    });

    faceStatusTopic.subscribe((message) => {
        console.log("Face topic:", message.data);

        if (!faceStatusDiv) {
            return;
        }

        const status = message.data;

        if (!status || status === "none") {
            faceStatusDiv.className = "face-detection-status no-face";
            faceStatusDiv.innerHTML = `
                <i class="fa-solid fa-circle-xmark"></i>
                <span>No face detected</span>
            `;
        } else if (status === "Unknown") {
            faceStatusDiv.className = "face-detection-status unknown";
            faceStatusDiv.innerHTML = `
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span>Unknown face detected</span>
            `;
        } else if (status === "stopped") {
            faceStatusDiv.className = "face-detection-status no-face";
            faceStatusDiv.innerHTML = `
                <i class="fa-solid fa-stop"></i>
                <span>Recognition stopped</span>
            `;
        } else if (status === "no_encodings") {
            faceStatusDiv.className = "face-detection-status unknown";
            faceStatusDiv.innerHTML = `
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span>No encodings loaded</span>
            `;
        } else {
            faceStatusDiv.className = "face-detection-status detected";
            faceStatusDiv.innerHTML = `
                <i class="fa-solid fa-circle-check"></i>
                <span>Face detected: ${status}</span>
            `;
        }
    });

   
    faceControlTopic = new ROSLIB.Topic({
        ros: ros,
        name: FACE_CONTROL_TOPIC,
        messageType: "std_msgs/String"
    });

    // -------------------- Laser Detected Topic --------------------
    const laserDetectedTopic = new ROSLIB.Topic({
        ros: ros,
        name: LASER_DETECTED_TOPIC,
        messageType: "std_msgs/Bool"
    });

    laserDetectedTopic.subscribe((message) => {
        console.log("laser_detected:", message.data);

        if (message.data === true) {
            const targetCard = document.getElementById("targetCard");
            if (!targetCard) return;

            targetCard.classList.add("visible");

            setTimeout(() => {
                targetCard.classList.remove("visible");

                const name = uploadedFilename ? uploadedFilename.innerText : "Unknown Target";
                const imageSrc = uploadedFaceImg && uploadedFaceImg.src ? uploadedFaceImg.src : "";
                addEliminatedTarget(name, imageSrc);
            }, 3500);
        }
    });
    // -------------------- SENSOR DATA (NEW) --------------------
const sensorTopic = new ROSLIB.Topic({
    ros: ros,
    name: "/sensor_data",
    messageType: "std_msgs/String"
});

sensorTopic.subscribe((message) => {
    try {
        const data = JSON.parse(message.data);

        updateTelemetry(data);

        console.log("Sensor Data:", data);

    } catch (err) {
        console.error("Failed to parse sensor_data:", err);
    }
});
}

setupROSBridge();


// -------------------- Upload Photo to Face Server --------------------
const photoUploadInput = document.getElementById("photo-upload");
const facePreviewContainer = document.getElementById("face-preview-container");
const uploadedFaceImg = document.getElementById("uploaded-face-img");
const uploadedFilename = document.getElementById("uploaded-filename");
const confidenceVal = document.getElementById("val-confidence");

if (photoUploadInput) {
    photoUploadInput.addEventListener("change", async function (event) {
        const file = event.target.files[0];

        if (!file) {
            return;
        }

    
        const reader = new FileReader();

        reader.onload = function (e) {
            if (uploadedFaceImg) {
                uploadedFaceImg.src = e.target.result;
            }

            if (uploadedFilename) {
                uploadedFilename.innerText = file.name;
            }

            if (facePreviewContainer) {
                facePreviewContainer.style.display = "flex";
            }
        };

        reader.readAsDataURL(file);

        const defaultName = file.name.split(".")[0].replace(/_/g, " ");
        const personName = prompt("Enter person name:", defaultName);

        if (!personName) {
            alert("Upload cancelled. Person name is required.");
            return;
        }

        const formData = new FormData();
        formData.append("photo", file);
        formData.append("name", personName);

        try {
            if (confidenceVal) {
                confidenceVal.innerText = "Encoding...";
                confidenceVal.style.color = "#FBC02D";
            }

            const response = await fetch(`${FACE_SERVER_URL}/upload_face`, {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                console.log("Face uploaded and encoded:", data);
                alert("Face uploaded and encoded successfully.");

                if (uploadedFilename) {
                    uploadedFilename.innerText = personName;
                }

                if (confidenceVal) {
                    confidenceVal.innerText = "Ready";
                    confidenceVal.style.color = "#00A890";
                }
            } else {
                console.error("Encoding failed:", data);
                alert("Encoding failed: " + data.message);

                if (confidenceVal) {
                    confidenceVal.innerText = "Failed";
                    confidenceVal.style.color = "#E53935";
                }
            }
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed. Check face server connection.");

            if (confidenceVal) {
                confidenceVal.innerText = "Upload Error";
                confidenceVal.style.color = "#E53935";
            }
        }
    });
}


// -------------------- Control Panel Buttons --------------------
const startRecognitionBtn = document.getElementById("btn-start-rec");
const stopRecognitionBtn = document.getElementById("btn-stop-rec");

function publishFaceControl(command) {
    if (!faceControlTopic) {
        console.error("Face control topic is not ready yet.");
        alert("ROSBridge is not connected yet.");
        return;
    }

    console.log(`Sending face recognition command: ${command}`);

    faceControlTopic.publish(new ROSLIB.Message({
        data: command
    }));
}

if (startRecognitionBtn) {
    startRecognitionBtn.addEventListener("click", () => {
        publishFaceControl("start");
    });
}

if (stopRecognitionBtn) {
    stopRecognitionBtn.addEventListener("click", () => {
        publishFaceControl("stop");

        if (facePreviewContainer) {
            facePreviewContainer.style.display = "none";
        }

        if (photoUploadInput) {
            photoUploadInput.value = "";
        }
    });
}


// -------------------- Eliminated Targets --------------------
function addEliminatedTarget(name, imageSrc) {
    const list = document.querySelector('.eliminated-list');
    if (!list) return;

    const item = document.createElement('div');
    item.classList.add('eliminated-item');

    item.innerHTML = `
        <img src="${imageSrc}" alt="Target" class="eliminated-avatar">
        <div class="eliminated-info">
            <div class="eliminated-name">TARGET: ${name.toUpperCase()}</div>
            <div class="eliminated-status">STATUS: <span>ELIMINATED</span></div>
        </div>
    `;

    list.appendChild(item);
}


// -------------------- Telemetry Example --------------------
function updateTelemetry(data) {
    if (data.temperature !== undefined)
        document.getElementById("val-temp").innerText = `${data.temperature}°C`;

    if (data.humidity !== undefined)
        document.getElementById("val-hum").innerText = `${data.humidity}%`;

    if (data.airQuality !== undefined)
        document.getElementById("val-air").innerText = `${data.airQuality}%`;

    if (data.co2 !== undefined)
        document.getElementById("val-co2").innerText = `${data.co2}%`;
    if (data.mpu) document.getElementById("val-mpu").innerText = data.mpu;

    const alarmPanel = document.querySelector(".alarm-panel");
    const alarmText = document.getElementById("val-alarm");

    if (data.obstacleDetected && alarmPanel && alarmText) {
        alarmPanel.style.display = "block";
        alarmText.innerText = data.obstacleMessage || "Obstacle detected nearby.";
    }
}