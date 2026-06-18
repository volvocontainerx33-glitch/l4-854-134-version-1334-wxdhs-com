(function () {
    function attachStream(video, url) {
        return new Promise(function (resolve) {
            if (video.__streamReady) {
                resolve();
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                video.__streamReady = true;
                resolve();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                video.__hlsPlayer = hls;
                video.__streamReady = true;
                resolve();
                return;
            }
            video.src = url;
            video.__streamReady = true;
            resolve();
        });
    }

    window.initMoviePlayer = function (config) {
        var video = document.getElementById(config.videoId);
        var overlay = document.getElementById(config.overlayId);
        if (!video || !config.url) {
            return;
        }

        function play() {
            attachStream(video, config.url).then(function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
                var request = video.play();
                if (request && typeof request.catch === 'function') {
                    request.catch(function () {});
                }
            });
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
    };
})();
