// Function to simulate setting a dynamic Camera URL
function setCameraFeedURL(url) {
    const camImg = document.getElementById('live-camera-feed');
    const placeholderText = document.getElementById('camera-placeholder-text');
    
    if(url) {
        camImg.src = url;
        camImg.style.display = 'block';
        placeholderText.style.display = 'none';
    }
}
setCameraFeedURL('http://192.168.1.37:8080/video');


const photoUploadInput = document.getElementById('photo-upload');
const facePreviewContainer = document.getElementById('face-preview-container');
const uploadedFaceImg = document.getElementById('uploaded-face-img');
const uploadedFilename = document.getElementById('uploaded-filename');
const confidenceVal = document.getElementById('val-confidence');

photoUploadInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    
    if (file) {
        
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedFaceImg.src = e.target.result;
            uploadedFilename.innerText = file.name;
            
            facePreviewContainer.style.display = "flex";
           
            fetchConfidenceSensorData();
        }
        reader.readAsDataURL(file);
    }
});


function fetchConfidenceSensorData() {
    const simulatedSensorReading = (Math.random() * (99.9 - 85.0) + 85.0).toFixed(1);
    confidenceVal.innerText = simulatedSensorReading + "%";
    confidenceVal.style.color = "#00A890"; 
}

// Control Panel Buttons
document.getElementById('btn-start-rec').addEventListener('click', () => {
    console.log("Starting Face Recognition model...");
});

document.getElementById('btn-stop-rec').addEventListener('click', () => {
    console.log("Stopping Face Recognition model...");
    facePreviewContainer.style.display = "none";
    photoUploadInput.value = ""; // Clear input
});

// Example:
function updateTelemetry(data) {
    if (data.temperature) document.getElementById('val-temp').innerText = data.temperature + "°C";
    if (data.humidity) document.getElementById('val-hum').innerText = data.humidity + "%";
    if (data.gps) document.getElementById('val-gps').innerText = data.gps;
    if (data.airQuality) document.getElementById('val-air').innerText = data.airQuality + "%";
    if (data.co2) document.getElementById('val-co2').innerText = data.co2 + "%";
    if (data.mpu) document.getElementById('val-mpu').innerText = data.mpu;
    
    // Logic to trigger or hide the safety alarm
    const alarmPanel = document.querySelector('.alarm-panel');
    const alarmText = document.getElementById('val-alarm');
    if (data.obstacleDetected) {
        alarmPanel.style.display = "block";
        alarmText.innerText = data.obstacleMessage || "Obstacle detected nearby.";
    }
}