(function () {
  function setupMoviePlayer(id, source) {
    var player = document.getElementById(id);
    if (!player) {
      return;
    }
    var video = player.querySelector('video');
    var button = player.querySelector('.player-start');
    var hlsInstance = null;
    var ready = false;

    var markError = function () {
      player.classList.add('is-error');
    };

    var start = function () {
      if (!video || !source) {
        markError();
        return;
      }
      player.classList.add('is-started');
      video.setAttribute('controls', 'controls');
      if (!ready) {
        ready = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.play().catch(function () {});
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on('hlsManifestParsed', function () {
            video.play().catch(function () {});
          });
        } else {
          markError();
        }
      } else {
        video.play().catch(function () {});
      }
    };

    if (button) {
      button.addEventListener('click', start);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!ready) {
          start();
        }
      });
      video.addEventListener('error', markError);
    }
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;
})();
