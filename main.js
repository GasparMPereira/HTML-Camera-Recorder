const startRecordingButton = document.getElementById('startRecording');
const stopRecordingButton = document.getElementById('stopRecording');
const downloadVideoButton = document.getElementById('downloadVideo');
const uploadVideoButton = document.getElementById('uploadVideo');
const videoPreview = document.getElementById('videoPreview');
const videoDevicesSelect = document.getElementById('videoDevices');

let mediaRecorder;
let recordedChunks = [];

startRecordingButton.addEventListener('click', startRecording);
stopRecordingButton.addEventListener('click', stopRecording);
downloadVideoButton.addEventListener('click', downloadVideo);
uploadVideoButton.addEventListener('click', uploadVideo);

navigator.mediaDevices.enumerateDevices()
    .then(devices => {
        devices.forEach(device => {
            if (device.kind === 'videoinput') {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text = device.label || `Camera ${videoDevicesSelect.length + 1}`;
                videoDevicesSelect.appendChild(option);
            }
        });
    })
    .catch(err => {
        console.error('Erro ao listar dispositivos de vídeo:', err);
    });

async function startRecording() {
    const deviceId = videoDevicesSelect.value;
    const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: deviceId } });
    videoPreview.srcObject = stream;
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start();
    startRecordingButton.disabled = true;
    stopRecordingButton.disabled = false;
    downloadVideoButton.disabled = true;
    uploadVideoButton.disabled = true;
}

function stopRecording() {
    mediaRecorder.stop();
    videoPreview.srcObject = null;
    startRecordingButton.disabled = false;
    stopRecordingButton.disabled = true;
    downloadVideoButton.disabled = false;
    uploadVideoButton.disabled = false;
}

function handleDataAvailable(event) {
    recordedChunks.push(event.data);
}

function downloadVideo() {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'video.webm';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    recordedChunks = [];
}

function uploadVideo() {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const formData = new FormData();
    formData.append('file', blob, 'recording.webm');

    fetch('https://your_server_domain', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            console.log('File uploaded successfully:', data);
            alert('Vídeo enviado com sucesso!');
        })
        .catch(error => {
            console.error('Erro ao enviar o arquivo:', error);
            alert('Erro ao enviar o vídeo.');
        });
}