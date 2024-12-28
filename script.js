document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('camera');
  const startButton = document.getElementById('start-camera');
  const startContainer = document.getElementById('start-container');

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
      
      // Obsługa błędów podczas odtwarzania
      video.onerror = (error) => {
        console.error('Błąd odtwarzania wideo:', error);
        alert('Wystąpił błąd podczas uruchamiania kamery.');
      };

    } catch (error) {
      console.error('Błąd dostępu do kamery:', error);
      alert('Nie udało się uzyskać dostępu do kamery. Upewnij się, że przeglądarka ma uprawnienia do korzystania z kamery.');
    }
  });
});