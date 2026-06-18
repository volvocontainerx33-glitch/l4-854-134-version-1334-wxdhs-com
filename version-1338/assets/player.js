(function () {
  function attachPlayer(box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.play-toggle');
    if (!video || !button) {
      return;
    }

    var stream = video.getAttribute('data-stream');
    var ready = false;
    var hlsInstance = null;

    function loadStream() {
      if (ready) {
        return Promise.resolve();
      }
      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        return new Promise(function (resolve) {
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
              resolve();
            }
          });
        });
      }

      video.src = stream;
      return Promise.resolve();
    }

    function play() {
      loadStream().then(function () {
        var result = video.play();
        if (result && result.catch) {
          result.catch(function () {});
        }
      });
    }

    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      box.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      box.classList.remove('is-playing');
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance && hlsInstance.destroy) {
        hlsInstance.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(attachPlayer);
})();
