// ==================== CONFIG ====================
const ROBOT_IP = CONFIG.ROBOT_IP;

const ROSBRIDGE_URL = `ws://${ROBOT_IP}:9090`;
const OBJECT_SERVER_URL = `http://${ROBOT_IP}:8090`;
const OBJECT_VIDEO_URL = `${OBJECT_SERVER_URL}/video`;

const OBJECT_STATUS_TOPIC = "/object_detection/status";
const OBJECT_CONTROL_TOPIC = "/object_detection/control";

const GPS_TOPIC = "/gps_data";


const IMU_TOPIC = "/imu/data";


// ==================== CAMERA ====================
function setCameraFeedURL(url) {

    const camImg = document.getElementById('live-camera-feed');
    const placeholderText = document.getElementById('camera-placeholder-text');

    if (url) {

        camImg.src = url;
        camImg.style.display = 'block';

        if (placeholderText) {
            placeholderText.style.display = 'none';
        }
    }
}

setCameraFeedURL(OBJECT_VIDEO_URL);


// ==================== ROS ====================
let ros;
let objectControlTopic;

function setupROSBridge() {

    if (typeof ROSLIB === "undefined") {

        console.log("ROSLIB not loaded");
        return;
    }

    // ==================== CONNECT ====================
    ros = new ROSLIB.Ros({
        url: ROSBRIDGE_URL
    });

    ros.on("connection", () => {
        console.log("Connected to ROSBridge");
    });

    ros.on("error", (error) => {
        console.error("ROS Error:", error);
    });

    ros.on("close", () => {
        console.warn("ROS Connection Closed");
    });


    // ==================== OBJECT STATUS ====================
    const objectStatusTopic = new ROSLIB.Topic({

        ros: ros,
        name: OBJECT_STATUS_TOPIC,
        messageType: "std_msgs/String"
    });

    objectStatusTopic.subscribe((message) => {

        try {

            const data = JSON.parse(message.data);

            updateObjects(data);

        } catch (e) {

            console.log("Invalid Object JSON:", message.data);
        }
    });


    // ==================== OBJECT CONTROL ====================
    objectControlTopic = new ROSLIB.Topic({

        ros: ros,
        name: OBJECT_CONTROL_TOPIC,
        messageType: "std_msgs/String"
    });


    // ==================== GPS ====================

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


    // ==================== IMU ====================
    const imuTopic = new ROSLIB.Topic({

        ros: ros,
        name: IMU_TOPIC,
        messageType: "sensor_msgs/Imu"
    });

    imuTopic.subscribe((message) => {

        console.log("IMU:", message);

        const imuElement = document.getElementById("val-mpu");

        if (!imuElement) return;

        // ==================== QUATERNION -> YAW ====================
        const q = message.orientation;

        // const yaw = Math.atan2(
        //     2.0 * (q.w * q.z + q.x * q.y),
        //     1.0 - 2.0 * (q.y * q.y + q.z * q.z)
        // ) * (180 / Math.PI);

        // ==================== VALUES ====================
        const ax = message.linear_acceleration.x.toFixed(2);
        const ay = message.linear_acceleration.y.toFixed(2);
        const az = message.linear_acceleration.z.toFixed(2);

        const gz = message.angular_velocity.z.toFixed(2);

        imuElement.innerText =
            `ax:${ax} ay:${ay} az:${az} | gz:${gz}`; 
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


// ==================== CONTROL ====================
function publishControl(state) {

    if (!objectControlTopic) return;

    const msg = new ROSLIB.Message({
        data: state
    });

    objectControlTopic.publish(msg);

    console.log("Published:", state);
}


// ==================== BUTTONS ====================
document.getElementById('btn-start-det').addEventListener('click', () => {

    publishControl("start");
});

document.getElementById('btn-stop-det').addEventListener('click', () => {

    publishControl("stop");
});


// ==================== OBJECT UI ====================
function updateObjects(data) {

    const container = document.getElementById("object-list");

    if (!container) return;

    // clear old
    container.innerHTML = "";

    // icons
    const icons = {

        cars: "fa-car",
        persons: "fa-user",
        trees: "fa-tree",
        rocks: "fa-mountain",
        laptops: "fa-laptop",
        bottles: "fa-bottle-water"
    };

    // labels
    const labels = {

        cars: "Cars",
        persons: "Persons",
        trees: "Trees",
        rocks: "Rocks",
        laptops: "Laptops",
        bottles: "Bottles"
    };

    // ==================== NO OBJECTS ====================
    if (Object.keys(data).length === 0) {

        container.innerHTML = `

            <div class="object-row">

                <div class="object-label">
                    <i class="fa-solid fa-eye-slash text-yellow"></i>

                    <span class="btn-font">
                        No Objects Detected
                    </span>
                </div>

            </div>
        `;

        return;
    }

    // ==================== SHOW DETECTED ONLY ====================
    for (let key in data) {

        if (data[key] <= 0) continue;

        const row = document.createElement("div");

        row.className = "object-row";

        row.innerHTML = `

            <div class="object-label">

                <i class="fa-solid ${icons[key] || "fa-circle"} text-blue"></i>

                <span class="btn-font">
                    ${labels[key] || key}
                </span>

            </div>

            <span class="object-count title-font">
                ${data[key]}
            </span>
        `;

        container.appendChild(row);
    }
}


// ==================== TELEMETRY ====================
function updateTelemetry(data) {

    // temperature
    if (data.temperature) {

        document.getElementById('val-temp').innerText =
            data.temperature + "°C";
    }

    // humidity
    if (data.humidity) {

        document.getElementById('val-hum').innerText =
            data.humidity + "%";
    }

    // air
    if (data.air) {

        document.getElementById('val-air').innerText =
            data.air + "%";
    }

    // co2
    if (data.co2) {

        document.getElementById('val-co2').innerText =
            data.co2 + "%";
    }

    // alarm
    const alarmPanel = document.querySelector('.alarm-panel');
    const alarmText = document.getElementById('val-alarm');

    if (data.obstacleDetected) {

        alarmPanel.style.display = "block";

        alarmText.innerText =
            data.obstacleMessage || "Obstacle detected nearby.";
    }
}