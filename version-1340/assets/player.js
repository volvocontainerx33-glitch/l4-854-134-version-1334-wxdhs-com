const video = document.querySelector('[data-video]');
const overlay = document.querySelector('[data-player-overlay]');
const Hls = window.Hls;
let hlsInstance = null;

function loadSource(src) {
  if (!video || !src) {
    return;
  }

  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = src;
  } else if (Hls && Hls.isSupported()) {
    hlsInstance = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
    });
    hlsInstance.loadSource(src);
    hlsInstance.attachMedia(video);
  } else {
    video.src = src;
  }
}

function startPlayback() {
  if (!video) {
    return;
  }

  const src = video.dataset.src || (overlay && overlay.dataset.src) || '';
  if (!video.src) {
    loadSource(src);
  }

  if (overlay) {
    overlay.classList.add('is-hidden');
  }

  const playPromise = video.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(function () {});
  }
}

if (overlay) {
  overlay.addEventListener('click', startPlayback);
}

if (video) {
  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });
}
