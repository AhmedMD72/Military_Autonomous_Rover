document.addEventListener("DOMContentLoaded", () => {

// ==================== CONFIG ====================
const ROBOT_IP = CONFIG.ROBOT_IP;
const ROSBRIDGE_URL = `ws://${ROBOT_IP}:9090`;
const CAMERA_URL = `http://${ROBOT_IP}:8082/stream?topic=/image_raw`;

// ==================== STATE ====================
let ros = null;
let cmdVelTopic = null;
let enabled = false;

// ==================== UI ====================
const statusText = document.getElementById("ros-status");
const manualStatus = document.getElementById("manual-status");

const startBtn = document.querySelector(".start-motor");
const stopBtn  = document.querySelector(".stop-motor");

// ==================== CAMERA ====================
function setupCamera() {
    const cam = document.getElementById("camera-stream");
    if (!cam) return;

    const img = document.createElement("img");
    img.src = CAMERA_URL;
    img.style.cssText = "width:100%; height:100%; object-fit:cover;";
    cam.appendChild(img);
}
setupCamera();

// ==================== ARROWS ====================
const arrows = {
    up: document.getElementById("arrow-up"),
    down: document.getElementById("arrow-down"),
    left: document.getElementById("arrow-left"),
    right: document.getElementById("arrow-right")
};

function clearArrows() {
    Object.values(arrows).forEach(el => el?.classList.remove("active"));
}

function highlightArrow(dir) {
    clearArrows();
    if (dir && arrows[dir]) arrows[dir].classList.add("active");
}

// ==================== TELEMETRY ====================
function updateTelemetry(data) {

    if (!data) return;

    const temp = document.getElementById("val-temp");
    const hum  = document.getElementById("val-hum");
    const air  = document.getElementById("val-air");
    const co2  = document.getElementById("val-co2");

    if (data.temperature !== undefined && temp)
        temp.innerText = `${data.temperature} °C`;

    if (data.humidity !== undefined && hum)
        hum.innerText = `${data.humidity} %`;

    if (data.airQuality !== undefined && air)
        air.innerText = `${data.airQuality} %`;

    if (data.co2 !== undefined && co2)
        co2.innerText = `${data.co2} %`;
}

// ==================== ROS ====================
function setupROS() {

    if (typeof ROSLIB === "undefined") {
        console.error("ROSLIB not loaded");
        return;
    }

    ros = new ROSLIB.Ros({
        url: ROSBRIDGE_URL
    });

    ros.on("connection", () => {
        console.log("ROS Connected");
        if (statusText) statusText.innerText = "Connected";
    });

    ros.on("error", () => {
        if (statusText) statusText.innerText = "Error";
    });

    ros.on("close", () => {
        if (statusText) statusText.innerText = "Disconnected";
    });

    // ==================== CMD_VEL ====================
    cmdVelTopic = new ROSLIB.Topic({
        ros: ros,
        name: "/cmd_vel",
        messageType: "geometry_msgs/Twist"
    });

    cmdVelTopic.subscribe((msg) => {

        if (!enabled) {
            clearArrows();
            return;
        }

        const lx = msg.linear?.x || 0;
        const az = msg.angular?.z || 0;

        const d = 0.05;

        let dir = null;

        if (lx > d) dir = "up";
        else if (lx < -d) dir = "down";
        else if (az > d) dir = "left";
        else if (az < -d) dir = "right";

        highlightArrow(dir);
    });

    // ==================== SENSOR DATA ====================
    const sensorTopic = new ROSLIB.Topic({
        ros: ros,
        name: "/sensor_data",
        messageType: "std_msgs/String"
    });

    sensorTopic.subscribe((msg) => {
        try {
            const data = JSON.parse(msg.data);
            updateTelemetry(data);
        } catch (e) {
            console.error("Sensor JSON error:", e);
        }
    });

    // ==================== GPS ====================
    const gpsTopic = new ROSLIB.Topic({
        ros: ros,
        name: "/gps/fix",
        messageType: "sensor_msgs/NavSatFix"
    });

    gpsTopic.subscribe((msg) => {

        const gpsElement = document.getElementById("val-gps");
        if (!gpsElement) return;

        const lat = msg.latitude;
        const lon = msg.longitude;

        const latDir = lat >= 0 ? "N" : "S";
        const lonDir = lon >= 0 ? "E" : "W";

        gpsElement.innerText =
            `${Math.abs(lat).toFixed(6)}° ${latDir}, ${Math.abs(lon).toFixed(6)}° ${lonDir}`;
    });

    // ==================== IMU (FIXED GYRO) ====================
    const imuTopic = new ROSLIB.Topic({
        ros: ros,
        name: "/imu/data",
        messageType: "sensor_msgs/Imu"
    });

    imuTopic.subscribe((msg) => {

        const imuEl = document.getElementById("val-gyro");
        if (!imuEl) return;

        // Gyroscope (angular velocity)
        const gx = msg.angular_velocity?.x?.toFixed(2) ?? 0;
        const gy = msg.angular_velocity?.y?.toFixed(2) ?? 0;
        const gz = msg.angular_velocity?.z?.toFixed(2) ?? 0;

        imuEl.innerText =
            `GX: ${gx} | GY: ${gy} | GZ: ${gz}`;
    });
}

setupROS();

// ==================== BUTTONS ====================
function setActiveButton(type) {

    if (!startBtn || !stopBtn) return;

    startBtn.classList.remove("active");
    stopBtn.classList.remove("active");

    if (type === "start") startBtn.classList.add("active");
    if (type === "stop") stopBtn.classList.add("active");
}

if (startBtn) {
    startBtn.addEventListener("click", () => {
        enabled = true;
        setActiveButton("start");

        if (manualStatus) {
            manualStatus.innerText = "ACTIVE";
            manualStatus.classList.add("active");
        }
    });
}

if (stopBtn) {
    stopBtn.addEventListener("click", () => {
        enabled = false;
        setActiveButton("stop");

        if (manualStatus) {
            manualStatus.innerText = "STOPPED";
            manualStatus.classList.remove("active");
        }

        clearArrows();
    });
}

});