const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let currentEffect = 'normalny';
let stream = null;

// Przyciski efektów
const buttons = {
    normalny: document.getElementById('normalny'),
    maska: document.getElementById('maska'),
    okulary: document.getElementById('okulary'),
    kapelusz: document.getElementById('kapelusz')
};

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
function updateCanvas() {
    if (!stream) return;

    // Rysuj obraz z kamery
    ctx.save();
    ctx.scale(-1, 1); // Odbicie lustrzane
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    // Zastosuj efekt
    applyEffect();

    // Kontynuuj animację
    requestAnimationFrame(updateCanvas);
}

// Aplikowanie efektów
function applyEffect() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const size = canvas.width * 0.3;

    switch (currentEffect) {
        case 'maska':
            // Czerwony trójkąt
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - size/2);
            ctx.lineTo(centerX - size/2, centerY + size/2);
            ctx.lineTo(centerX + size/2, centerY + size/2);
            ctx.closePath();
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.fill();
            break;

        case 'okulary':
            // Czarne okulary
            ctx.beginPath();
            // Lewa soczewka
            ctx.arc(centerX - size/3, centerY, size/4, 0, Math.PI * 2);
            // Prawa soczewka
            ctx.arc(centerX + size/3, centerY, size/4, 0, Math.PI * 2);
            ctx.lineWidth = 10;
            ctx.strokeStyle = 'black';
            ctx.stroke();
            // Mostek okularów
            ctx.beginPath();
            ctx.moveTo(centerX - size/6, centerY);
            ctx.lineTo(centerX + size/6, centerY);
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

// Uruchom kamerę
initCamera();