// -------------------- Configuration --------------------
const ROSBRIDGE_URL = "ws://192.168.100.9:9090";

const FACE_VIDEO_URL    = "http://192.168.100.9:8090/video";
const OBJ_VIDEO_URL     = "http://192.168.100.9:8091/video";
const MAPPING_VIDEO_URL = "http://192.168.100.9:8092/video";

const START_MAPPING_TOPIC = "/mapping/start";
const STOP_MAPPING_TOPIC  = "/mapping/stop";
const MAPPING_STATUS_TOPIC = "/mapping/status";


// -------------------- Camera Feeds --------------------
function setCameraFeed(elementId, url) {
    const img = document.getElementById(elementId);
    if (!img || !url) return;

    img.src = url;
    img.style.display = "block";

    img.onerror = () => {
        console.error("Failed to load camera feed:", url);
        img.style.display = "none";
    };
}

setCameraFeed("feed-face",    FACE_VIDEO_URL);
setCameraFeed("feed-objects", OBJ_VIDEO_URL);
setCameraFeed("feed-mapping", MAPPING_VIDEO_URL);


// -------------------- ROSBridge Connection --------------------
let ros = null;

function setupROSBridge() {
    if (typeof ROSLIB === "undefined") {
        console.error("ROSLIB is not loaded. Add roslibjs <script> to your HTML.");
        return;
    }

    const rosStatusEl = document.getElementById("ros-connection-status");

    ros = new ROSLIB.Ros({ url: ROSBRIDGE_URL });

    ros.on("connection", () => {
        console.log("Connected to ROSBridge:", ROSBRIDGE_URL);
        if (rosStatusEl) {
            rosStatusEl.innerText = "Connected";
            rosStatusEl.className = "ros-status connected";
        }
        // Update header dot to green
        const dot = document.querySelector(".dot");
        if (dot) dot.style.backgroundColor = "#00A890";

        subscribeToMappingStatus();
    });

    ros.on("error", (error) => {
        console.error("ROSBridge error:", error);
        if (rosStatusEl) {
            rosStatusEl.innerText = "Connection Error";
            rosStatusEl.className = "ros-status disconnected";
        }
        const dot = document.querySelector(".dot");
        if (dot) dot.style.backgroundColor = "#E53935";
    });

    ros.on("close", () => {
        console.warn("ROSBridge connection closed");
        if (rosStatusEl) {
            rosStatusEl.innerText = "Disconnected";
            rosStatusEl.className = "ros-status disconnected";
        }
        const dot = document.querySelector(".dot");
        if (dot) dot.style.backgroundColor = "#E53935";
    });
}

setupROSBridge();


// -------------------- Mapping Status Subscriber --------------------
function subscribeToMappingStatus() {
    if (!ros) return;

    const mappingStatusEl = document.getElementById("mapping-status");

    const statusTopic = new ROSLIB.Topic({
        ros: ros,
        name: MAPPING_STATUS_TOPIC,
        messageType: "std_msgs/String"
    });

    statusTopic.subscribe((message) => {
        console.log("Mapping status:", message.data);
        if (!mappingStatusEl) return;

        const status = message.data;

        if (status === "running") {
            mappingStatusEl.innerText = "Mapping: Running";
            mappingStatusEl.style.color = "#00A890";
        } else if (status === "stopped") {
            mappingStatusEl.innerText = "Mapping: Stopped";
            mappingStatusEl.style.color = "#E53935";
        } else {
            mappingStatusEl.innerText = "Mapping: " + status;
            mappingStatusEl.style.color = "#FBC02D";
        }
    });
}


// -------------------- Publish ROS Topic --------------------
function publishTopic(topicName, messageType, data) {
    if (!ros) {
        console.error("ROS not connected.");
        return;
    }

    const topic = new ROSLIB.Topic({
        ros: ros,
        name: topicName,
        messageType: messageType
    });

    const message = new ROSLIB.Message(data);
    topic.publish(message);
    console.log("Published to", topicName, data);
}


// -------------------- Start / Stop Mapping Buttons --------------------
const startMappingBtn = document.getElementById("btn-start-rec");
const stopMappingBtn  = document.getElementById("btn-stop-rec");

if (startMappingBtn) {
    startMappingBtn.addEventListener("click", () => {
        console.log("Starting mapping...");

        publishTopic(START_MAPPING_TOPIC, "std_msgs/String", { data: "start" });

        // Visual feedback
        startMappingBtn.style.filter = "brightness(1.4)";
        setTimeout(() => startMappingBtn.style.filter = "", 300);

        const mappingStatusEl = document.getElementById("mapping-status");
        if (mappingStatusEl) {
            mappingStatusEl.innerText = "Mapping: Starting...";
            mappingStatusEl.style.color = "#FBC02D";
        }
    });
}

if (stopMappingBtn) {
    stopMappingBtn.addEventListener("click", () => {
        console.log("Stopping mapping...");

        publishTopic(STOP_MAPPING_TOPIC, "std_msgs/String", { data: "stop" });

        // Visual feedback
        stopMappingBtn.style.filter = "brightness(1.4)";
        setTimeout(() => stopMappingBtn.style.filter = "", 300);

        const mappingStatusEl = document.getElementById("mapping-status");
        if (mappingStatusEl) {
            mappingStatusEl.innerText = "Mapping: Stopped";
            mappingStatusEl.style.color = "#E53935";
        }
    });
}


