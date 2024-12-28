document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('camera');
  const output = document.getElementById('output');
  const startButton = document.getElementById('start-camera');
  const startContainer = document.getElementById('start-container');
  const filtersContainer = document.getElementById('filters-container');

  let currentFilter = 'none';
  let faceMesh = null;
  let camera = null;

  // Inicjalizacja Face Mesh
  function initializeFaceMesh() {
    faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      }
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    faceMesh.onResults(onResults);
  }

  // Obsługa wyników detekcji
  function onResults(results) {
    const ctx = output.getContext('2d');
    ctx.clearRect(0, 0, output.width, output.height);

    if (results.multiFaceLandmarks) {
      for (const landmarks of results.multiFaceLandmarks) {
        drawFilter(ctx, landmarks);
      }
    }
  }

  // Rysowanie filtrów
  function drawFilter(ctx, landmarks) {
    switch (currentFilter) {
      case 'mask':
        drawMask(ctx, landmarks);
        break;
      case 'glasses':
        drawGlasses(ctx, landmarks);
        break;
      case 'hat':
        drawHat(ctx, landmarks);
        break;
    }
  }

  // Funkcje rysowania poszczególnych filtrów
  function drawMask(ctx, landmarks) {
    const nose = landmarks[4];
    const chin = landmarks[152];
    const leftCheek = landmarks[234];
    const rightCheek = landmarks[454];

    ctx.beginPath();
    ctx.moveTo(leftCheek.x * output.width, leftCheek.y * output.height);
    ctx.lineTo(rightCheek.x * output.width, rightCheek.y * output.height);
    ctx.lineTo(chin.x * output.width, chin.y * output.height);
    ctx.lineTo(nose.x * output.width, nose.y * output.height);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.fill();
  }

  function drawGlasses(ctx, landmarks) {
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];
    const nose = landmarks[4];

    const width = (rightEye.x - leftEye.x) * output.width * 1.5;
    const height = width * 0.3;

    ctx.beginPath();
    ctx.ellipse(
      leftEye.x * output.width,
      leftEye.y * output.height,
      width / 4,
      height,
      0, 0, 2 * Math.PI
    );
    ctx.ellipse(
      rightEye.x * output.width,
      rightEye.y * output.height,
      width / 4,
      height,
      0, 0, 2 * Math.PI
    );
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 5;
    ctx.stroke();
  }

  function drawHat(ctx, landmarks) {
    const forehead = landmarks[10];
    const leftTemple = landmarks[234];
    const rightTemple = landmarks[454];

    const width = (rightTemple.x - leftTemple.x) * output.width * 1.5;
    const height = width * 0.5;

    ctx.beginPath();
    ctx.moveTo(leftTemple.x * output.width, leftTemple.y * output.height);
    ctx.lineTo(rightTemple.x * output.width, rightTemple.y * output.height);
    ctx.lineTo(forehead.x * output.width, forehead.y * output.height - height);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fill();
  }

  // Inicjalizacja kamery
  startButton.addEventListener('click', async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      video.srcObject = stream;
      startContainer.style.display = 'none';

      video.addEventListener('playing', () => {
        output.width = video.videoWidth;
        output.height = video.videoHeight;
      });

      initializeFaceMesh();

      camera = new Camera(video, {
        onFrame: async () => {
          await faceMesh.send({ image: video });
        },
        width: 640,
        height: 480
      });
      camera.start();

    } catch (error) {
      console.error('Błąd dostępu do kamery:', error);
      alert('Nie udało się uzyskać dostępu do kamery. Upewnij się, że przeglądarka ma uprawnienia do korzystania z kamery.');
    }
  });

  // Obsługa przycisków filtrów
  filtersContainer.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
});