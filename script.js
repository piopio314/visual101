document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('camera');
  const startButton = document.getElementById('start-camera');
  const startContainer = document.getElementById('start-container');

  // Funkcja do określania optymalnych wymiarów wideo
  const getOptimalVideoConstraints = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isLandscape = window.innerWidth > window.innerHeight;

    if (isMobile) {
      if (isLandscape) {
        return {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        };
      } else {
        return {
          width: { ideal: 720 },
          height: { ideal: 1280 }
        };
      }
    } else {
      // Dla komputerów stacjonarnych
      return {
        width: { ideal: 1280 },
        height: { ideal: 960 }
      };
    }
  };

  startButton.addEventListener('click', async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          ...getOptimalVideoConstraints(),
          facingMode: 'user'
        },
        audio: false
      });
      
      video.srcObject = stream;
      startContainer.style.display = 'none';
      
      // Dostosowanie orientacji wideo
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      
      if (capabilities.facingMode && capabilities.facingMode.length > 0) {
        // Jeśli urządzenie obsługuje zmianę kamery, dodaj przycisk do przełączania
        const switchButton = document.createElement('button');
        switchButton.textContent = 'Przełącz kamerę';
        switchButton.style.position = 'absolute';
        switchButton.style.bottom = '10px';
        switchButton.style.right = '10px';
        document.getElementById('camera-container').appendChild(switchButton);
        
        switchButton.addEventListener('click', async () => {
          const currentFacingMode = track.getSettings().facingMode;
          const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
          
          stream.getTracks().forEach(track => track.stop());
          
          const newStream = await navigator.mediaDevices.getUserMedia({
            video: {
              ...getOptimalVideoConstraints(),
              facingMode: newFacingMode
            },
            audio: false
          });
          
          video.srcObject = newStream;
        });
      }

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

  // Nasłuchiwanie zmiany orientacji ekranu
  window.addEventListener('resize', () => {
    if (video.srcObject) {
      const track = video.srcObject.getVideoTracks()[0];
      const constraints = getOptimalVideoConstraints();
      
      track.applyConstraints(constraints).catch(error => {
        console.warn('Nie można zmienić rozdzielczości:', error);
      });
    }
  });
});