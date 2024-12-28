const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let currentEffect = 'normalny';
let stream = null;
let model = null;

// Przyciski efektów
const buttons = {
    normalny: document.getElementById('normalny'),
    maska: document.getElementById('maska'),
    okulary: document.getElementById('okulary'),
    kapelusz: document.getElementById('kapelusz')
};

// Inicjalizacja
async function init() {
    try {
        // Załaduj model
        model = await blazeface.load();
        
        // Inicjalizuj kamerę
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
        console.error('Błąd inicjalizacji:', err);
    }
}

// Aktualizacja canvas
async function updateCanvas() {
    if (!stream || !model) return;

    // Wykryj twarz
    const predictions = await model.estimateFaces(video, false);

    // Rysuj obraz z kamery
    ctx.save();
    ctx.scale(-1, 1); // Odbicie lustrzane
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    // Zastosuj efekt jeśli wykryto twarz
    if (predictions.length > 0) {
        applyEffect(predictions[0]);
    }

    // Kontynuuj animację
    requestAnimationFrame(updateCanvas);
}

// Aplikowanie efektów
function applyEffect(prediction) {
    const landmarks = prediction.landmarks;
    const leftEye = landmarks[1];
    const rightEye = landmarks[0];
    const nose = landmarks[2];
    
    // Środek oczu
    const eyesCenter = {
        x: (leftEye[0] + rightEye[0]) / 2,
        y: (leftEye[1] + rightEye[1]) / 2
    };
    
    // Odległość między oczami (do skalowania efektów)
    const eyeDistance = Math.hypot(rightEye[0] - leftEye[0], rightEye[1] - leftEye[1]);

    switch (currentEffect) {
        case 'maska':
            // Czerwony trójkąt
            ctx.beginPath();
            ctx.moveTo(nose[0], nose[1] - eyeDistance/2);
            ctx.lineTo(nose[0] - eyeDistance/2, nose[1] + eyeDistance/2);
            ctx.lineTo(nose[0] + eyeDistance/2, nose[1] + eyeDistance/2);
            ctx.closePath();
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.fill();
            break;

        case 'okulary':
            // Czarne okulary
            const eyeSize = eyeDistance * 0.4;
            
            // Lewa soczewka
            ctx.beginPath();
            ctx.arc(leftEye[0], leftEye[1], eyeSize, 0, Math.PI * 2);
            
            // Prawa soczewka
            ctx.arc(rightEye[0], rightEye[1], eyeSize, 0, Math.PI * 2);
            
            ctx.lineWidth = eyeDistance * 0.05;
            ctx.strokeStyle = 'black';
            ctx.stroke();
            
            // Mostek okularów
            ctx.beginPath();
            ctx.moveTo(leftEye[0] + eyeSize * 0.7, eyesCenter.y);
            ctx.lineTo(rightEye[0] - eyeSize * 0.7, eyesCenter.y);
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

// Uruchom aplikację
init();