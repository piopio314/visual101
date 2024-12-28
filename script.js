document.addEventListener('DOMContentLoaded', async () => {
  const video = document.getElementById('camera');
  const overlay = document.getElementById('overlay');
  const startButton = document.getElementById('start-camera');
  const startContainer = document.getElementById('start-container');
  const filtersContainer = document.getElementById('filters-container');
  
  let currentFilter = 'none';
  let isModelLoaded = false;

  // Ładowanie modeli face-api.js
  async function loadModels() {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js/weights/'),
        faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js/weights/'),
      ]);
      isModelLoaded = true;
      console.log('Modele załadowane');
    } catch (error) {
      console.error('Błąd ładowania modeli:', error);
    }
  }

  // Funkcja do rysowania filtrów
  function drawFilter(detection) {
    const ctx = overlay.getContext('2d');
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    if (currentFilter === 'none') return;

    const landmarks = detection.landmarks;
    const nose = landmarks.getNose();
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();

    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;

    switch (currentFilter) {
      case 'dog':
        // Uszy pieska
        ctx.fillStyle = 'brown';
        ctx.beginPath();
        ctx.ellipse(leftEye[0].x - 20, leftEye[0].y - 20, 15, 25, Math.PI / 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(rightEye[3].x + 20, rightEye[3].y - 20, 15, 25, -Math.PI / 4, 0, 2 * Math.PI);
        ctx.fill();
        // Nos pieska
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.ellipse(nose[3].x, nose[3].y, 10, 8, 0, 0, 2 * Math.PI);
        ctx.fill();
        break;

      case 'cat':
        // Uszy kotka
        ctx.fillStyle = 'orange';
        ctx.beginPath();
        ctx.moveTo(leftEye[0].x - 20, leftEye[0].y - 20);
        ctx.lineTo(leftEye[0].x - 35, leftEye[0].y - 50);
        ctx.lineTo(leftEye[0].x - 5, leftEye[0].y - 20);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(rightEye[3].x + 20, rightEye[3].y - 20);
        ctx.lineTo(rightEye[3].x + 35, rightEye[3].y - 50);
        ctx.lineTo(rightEye[3].x + 5, rightEye[3].y - 20);
        ctx.fill();
        // Wąsy
        ctx.strokeStyle = 'white';
        for (let i = -2; i <= 2; i++) {
          ctx.beginPath();
          ctx.moveTo(nose[3].x - 5, nose[3].y + i * 3);
          ctx.lineTo(nose[3].x - 35, nose[3].y + i * 5);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(nose[3].x + 5, nose[3].y + i * 3);
          ctx.lineTo(nose[3].x + 35, nose[3].y + i * 5);
          ctx.stroke();
        }
        break;

      case 'rainbow':
        // Tęczowa aureola
        const gradient = ctx.createLinearGradient(
          detection.box.x,
          detection.box.y - 50,
          detection.box.x + detection.box.width,
          detection.box.y - 50
        );
        gradient.addColorStop(0, 'red');
        gradient.addColorStop(0.2, 'orange');
        gradient.addColorStop(0.4, 'yellow');
        gradient.addColorStop(0.6, 'green');
        gradient.addColorStop(0.8, 'blue');
        gradient.addColorStop(1, 'violet');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(
          detection.box.x + detection.box.width / 2,
          detection.box.y - 20,
          detection.box.width / 2,
          0,
          Math.PI,
          true
        );
        ctx.stroke();
        break;
    }
  }

  // Funkcja do przetwarzania klatki wideo
  async function processVideo() {
    if (!isModelLoaded || !video.srcObject) return;

    const detections = await faceapi.detectAllFaces(
      video,
      new faceapi.TinyFaceDetectorOptions()
    ).withFaceLandmarks();

    if (detections.length > 0) {
      drawFilter(detections[0]);
    }

    requestAnimationFrame(processVideo);
  }

  // Obsługa przycisków filtrów
  filtersContainer.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Inicjalizacja kamery
  startButton.addEventListener('click', async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });
      
      video.srcObject = stream;
      startContainer.style.display = 'none';
      
      // Dostosowanie rozmiaru canvas do wideo
      video.addEventListener('playing', () => {
        overlay.width = video.clientWidth;
        overlay.height = video.clientHeight;
      });

      // Rozpoczęcie przetwarzania wideo po załadowaniu modeli
      if (!isModelLoaded) {
        await loadModels();
      }
      processVideo();

    } catch (error) {
      console.error('Błąd dostępu do kamery:', error);
      alert('Nie udało się uzyskać dostępu do kamery. Upewnij się, że przeglądarka ma uprawnienia do korzystania z kamery.');
    }
  });

  // Załadowanie modeli podczas inicjalizacji strony
  loadModels();
});