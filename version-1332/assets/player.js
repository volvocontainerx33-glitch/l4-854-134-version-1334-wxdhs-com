(function () {
    var bound = false;
    var attachedUrl = "";
    var playerInstance = null;

    function attachVideo(video, url) {
        if (attachedUrl === url) {
            return;
        }
        attachedUrl = url;
        if (playerInstance && typeof playerInstance.destroy === "function") {
            playerInstance.destroy();
            playerInstance = null;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            playerInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            playerInstance.loadSource(url);
            playerInstance.attachMedia(video);
            return;
        }
        video.src = url;
    }

    window.setupMoviePlayer = function (url, poster) {
        var video = document.getElementById("main-player");
        var cover = document.getElementById("play-cover");
        if (!video || !cover || bound) {
            return;
        }
        bound = true;
        if (poster) {
            video.setAttribute("poster", poster);
        }
        function start() {
            attachVideo(video, url);
            cover.classList.add("hidden");
            video.setAttribute("controls", "controls");
            var playAction = video.play();
            if (playAction && typeof playAction.catch === "function") {
                playAction.catch(function () {});
            }
        }
        cover.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
    };
}());
