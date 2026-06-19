// ==================== CONFIG ====================
const ROBOT_IP = CONFIG.ROBOT_IP;

const ROSBRIDGE_URL     = `ws://${ROBOT_IP}:9090`;
const FACE_VIDEO_URL    = `http://${ROBOT_IP}:8091/video`;
const OBJECT_SERVER_URL = `http://${ROBOT_IP}:8090`;
const OBJECT_VIDEO_URL  = `${OBJECT_SERVER_URL}/video`;
const MAPPING_VIDEO_URL = `http://${ROBOT_IP}:6080/vnc.html?autoconnect=true&resize=scale`;

const MAPPING_STATUS_TOPIC = "/mapping/status";
const MAPPING_START_TOPIC  = "/mapping/start";
const MAPPING_STOP_TOPIC   = "/mapping/stop";
const FACE_CONTROL_TOPIC   = "/face_recognition/control";
const OBJECT_CONTROL_TOPIC = "/object_detection/control";


// ==================== STATE ====================
let ros               = null;
let mappingStartTopic = null;
let mappingStopTopic  = null;
let faceControlTopic  = null;
let objectControlTopic = null;

let faceRunning   = false;
let objectRunning = false;


// ==================== CAMERA FEEDS ====================
function setCameraFeed(elementId, url) {
    const el = document.getElementById(elementId);
    if (!el || !url) return;

    el.src = url;
    el.style.display = "block";

    el.onerror = () => {
        console.error("Failed to load feed:", url);
        el.style.display = "none";
    };
}

setCameraFeed("feed-face",    FACE_VIDEO_URL);
setCameraFeed("feed-objects", OBJECT_VIDEO_URL);

// mapping هي iframe مش img
const mappingFrame = document.getElementById("feed-mapping");
if (mappingFrame) {
    mappingFrame.src = MAPPING_VIDEO_URL;
    mappingFrame.style.display = "block";
}


// ==================== ROS ====================
function setupROSBridge() {

    if (typeof ROSLIB === "undefined") {
        console.error("ROSLIB not loaded");
        return;
    }

    ros = new ROSLIB.Ros({ url: ROSBRIDGE_URL });

    ros.on("connection", () => {
        console.log("Connected to ROSBridge");

        const dot = document.querySelector(".dot");
        if (dot) dot.style.backgroundColor = "#00A890";

        // --- subscribe to mapping status ---
        subscribeToMappingStatus();

        // --- mapping control topics ---
        mappingStartTopic = new ROSLIB.Topic({
            ros,
            name:        MAPPING_START_TOPIC,
            messageType: "std_msgs/String"
        });

        mappingStopTopic = new ROSLIB.Topic({
            ros,
            name:        MAPPING_STOP_TOPIC,
            messageType: "std_msgs/String"
        });

        // --- face + object control topics ---
        faceControlTopic = new ROSLIB.Topic({
            ros,
            name:        FACE_CONTROL_TOPIC,
            messageType: "std_msgs/String"
        });

        objectControlTopic = new ROSLIB.Topic({
            ros,
            name:        OBJECT_CONTROL_TOPIC,
            messageType: "std_msgs/String"
        });

        console.log("All topics ready");
    });

    ros.on("error",  (e) => console.error("ROSBridge error:", e));

    ros.on("close", () => {
        console.warn("ROSBridge closed");
        mappingStartTopic  = null;
        mappingStopTopic   = null;
        faceControlTopic   = null;
        objectControlTopic = null;
    });
}

setupROSBridge();


// ==================== MAPPING STATUS ====================
function subscribeToMappingStatus() {

    const mappingStatusEl = document.getElementById("mapping-status");
    if (!ros || !mappingStatusEl) return;

    const topic = new ROSLIB.Topic({
        ros,
        name:        MAPPING_STATUS_TOPIC,
        messageType: "std_msgs/String"
    });

    topic.subscribe((msg) => {
        const status = msg.data;

        if (status === "running") {
            mappingStatusEl.innerText   = "Mapping: Running";
            mappingStatusEl.style.color = "#00A890";
        } else if (status === "stopped") {
            mappingStatusEl.innerText   = "Mapping: Stopped";
            mappingStatusEl.style.color = "#E53935";
        } else {
            mappingStatusEl.innerText   = "Mapping: " + status;
            mappingStatusEl.style.color = "#FBC02D";
        }
    });
}


// ==================== PUBLISH HELPER ====================
function publishControl(topic, command) {
    if (!topic) {
        console.error("Topic not ready — wait for ROS connection");
        return;
    }
    topic.publish(new ROSLIB.Message({ data: command }));
    console.log("Published:", command, "→", topic.name);
}


// ==================== MAPPING BUTTONS ====================
const startMappingBtn = document.getElementById("btn-start-rec");
const stopMappingBtn  = document.getElementById("btn-stop-rec");

if (startMappingBtn) {
    startMappingBtn.addEventListener("click", () => {
        publishControl(mappingStartTopic, "start");
    });
}

if (stopMappingBtn) {
    stopMappingBtn.addEventListener("click", () => {
        publishControl(mappingStopTopic, "stop");
    });
}


// ==================== AI MODEL BUTTONS (face + object) ====================
const aiButtons = document.querySelectorAll(".btn-ai");

// الزر الأول = Face Recognition
if (aiButtons[0]) {
    aiButtons[0].addEventListener("click", () => {
        faceRunning = !faceRunning;
        publishControl(faceControlTopic, faceRunning ? "start" : "stop");
        aiButtons[0].style.borderColor = faceRunning
            ? "rgba(0, 168, 144, 0.6)"
            : "rgba(251, 192, 45, 0.3)";
        console.log("Face:", faceRunning ? "start" : "stop");
    });
}

// الزر التاني = Object Detection
if (aiButtons[1]) {
    aiButtons[1].addEventListener("click", () => {
        objectRunning = !objectRunning;
        publishControl(objectControlTopic, objectRunning ? "start" : "stop");
        aiButtons[1].style.borderColor = objectRunning
            ? "rgba(0, 168, 144, 0.6)"
            : "rgba(251, 192, 45, 0.3)";
        console.log("Object:", objectRunning ? "start" : "stop");
    });
}


