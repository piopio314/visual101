const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let currentEffect = 'normalny';
let stream = null;
let detections = null;

// Przyciski efektów
const buttons = {
    normalny: document.getElementById('normalny'),
    maska: document.getElementById('maska'),
    okulary: document.getElementById('okulary'),
    kapelusz: document.getElementById('kapelusz')
};

// Załaduj modele face-api.js
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('https://justadudewhohacks.github.io/face-api.js/weights'),
    faceapi.nets.faceLandmark68Net.loadFromUri('https://justadudewhohacks.github.io/face-api.js/weights')
]).then(initCamera);

// Inicjalizacja kamery
async function initCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        video.srcObject = stream;
        video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            updateCanvas();
        };
    } catch (err) {
        console.error('Błąd dostępu do kamery:', err);
    }
}

// Aktualizacja canvas
async function updateCanvas() {
    if (!stream) return;

    // Wykryj twarz
    detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

    // Rysuj obraz z kamery
    ctx.save();
    ctx.scale(-1, 1); // Odbicie lustrzane
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    // Zastosuj efekt jeśli wykryto twarz
    if (detections && detections.length > 0) {
        applyEffect(detections[0]);
    }

    // Kontynuuj animację
    requestAnimationFrame(updateCanvas);
}

// Aplikowanie efektów
function applyEffect(detection) {
    const landmarks = detection.landmarks;
    const nose = landmarks.getNose();
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    
    // Środek oczu
    const eyesCenter = {
        x: (leftEye[0].x + rightEye[3].x) / 2,
        y: (leftEye[0].y + rightEye[3].y) / 2
    };
    
    // Odległość między oczami (do skalowania efektów)
    const eyeDistance = Math.hypot(rightEye[3].x - leftEye[0].x, rightEye[3].y - leftEye[0].y);

    switch (currentEffect) {
        case 'maska':
            // Czerwony trójkąt
            ctx.beginPath();
            ctx.moveTo(nose[3].x, nose[3].y - eyeDistance/2);
            ctx.lineTo(nose[3].x - eyeDistance/2, nose[3].y + eyeDistance/2);
            ctx.lineTo(nose[3].x + eyeDistance/2, nose[3].y + eyeDistance/2);
            ctx.closePath();
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.fill();
            break;

        case 'okulary':
            // Czarne okulary
            const eyeSize = eyeDistance * 0.4;
            
            // Lewa soczewka
            ctx.beginPath();
            ctx.arc(leftEye[0].x, leftEye[0].y, eyeSize, 0, Math.PI * 2);
            
            // Prawa soczewka
            ctx.arc(rightEye[3].x, rightEye[3].y, eyeSize, 0, Math.PI * 2);
            
            ctx.lineWidth = eyeDistance * 0.05;
            ctx.strokeStyle = 'black';
            ctx.stroke();
            
            // Mostek okularów
            ctx.beginPath();
            ctx.moveTo(leftEye[0].x + eyeSize * 0.7, eyesCenter.y);
            ctx.lineTo(rightEye[3].x - eyeSize * 0.7, eyesCenter.y);
            ctx.stroke();
            break;

        case 'kapelusz':
            // Implementacja kapelusza (możesz dodać później)
            break;
    }
}

// Obsługa przycisków
Object.entries(buttons).forEach(([effect, button]) => {
    button.addEventListener('click', () => {
        // Usuń klasę active ze wszystkich przycisków
        Object.values(buttons).forEach(btn => btn.classList.remove('active'));
        // Dodaj klasę active do klikniętego przycisku
        button.classList.add('active');
        // Ustaw aktualny efekt
        currentEffect = effect;
    });
});

// Aktywuj przycisk "normalny" na start
buttons.normalny.classList.add('active');