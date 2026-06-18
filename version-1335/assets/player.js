(function () {
  function readConfig() {
    var node = document.getElementById('playerConfig');
    if (!node) {
      return null;
    }

    try {
      return JSON.parse(node.textContent || '{}');
    } catch (error) {
      return null;
    }
  }

  function loadHls() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }

      var existing = document.querySelector('script[data-hls-loader="ready"]');
      if (existing) {
        existing.addEventListener('load', function () {
          resolve(window.Hls);
        });
        existing.addEventListener('error', reject);
        return;
      }

      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
      script.async = true;
      script.setAttribute('data-hls-loader', 'ready');
      script.addEventListener('load', function () {
        resolve(window.Hls);
      });
      script.addEventListener('error', reject);
      document.head.appendChild(script);
    });
  }

  function init() {
    var config = readConfig();
    var video = document.getElementById('movieVideo');
    var button = document.getElementById('moviePlayButton');

    if (!config || !config.url || !video || !button) {
      return;
    }

    var attached = false;

    function hideButton() {
      button.classList.add('is-hidden');
    }

    function showButton() {
      if (video.paused) {
        button.classList.remove('is-hidden');
      }
    }

    function attachSource() {
      if (attached) {
        return Promise.resolve();
      }

      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = config.url;
        return Promise.resolve();
      }

      return loadHls().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(config.url);
          hls.attachMedia(video);
          window.addEventListener('beforeunload', function () {
            hls.destroy();
          });
        } else {
          video.src = config.url;
        }
      });
    }

    function startPlay() {
      attachSource().then(function () {
        hideButton();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            button.classList.remove('is-hidden');
          });
        }
      });
    }

    button.addEventListener('click', startPlay);
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlay();
      }
    });
    video.addEventListener('play', hideButton);
    video.addEventListener('pause', showButton);
    video.addEventListener('ended', showButton);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
