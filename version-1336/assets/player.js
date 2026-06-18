import { H as Hls } from "./hls-dru42stk.js";

function showMessage(shell, message) {
    const output = shell.querySelector("[data-player-message]");
    if (output) {
        output.textContent = message || "";
    }
}

function playVideo(video, shell) {
    const promise = video.play();
    if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
            showMessage(shell, "浏览器阻止了自动播放，请再次点击播放器播放。");
        });
    }
}

function attachHlsSource(video, source, shell) {
    if (!source) {
        showMessage(shell, "当前影片没有可用播放源。");
        return;
    }

    shell.classList.add("is-loading");
    video.classList.add("is-active");
    video.controls = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", function () {
            shell.classList.add("is-playing");
            shell.classList.remove("is-loading");
            playVideo(video, shell);
        }, { once: true });
        video.load();
        return;
    }

    if (Hls && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            shell.classList.add("is-playing");
            shell.classList.remove("is-loading");
            showMessage(shell, "");
            playVideo(video, shell);
        });

        hls.on(Hls.Events.ERROR, function (_event, data) {
            if (data && data.fatal) {
                showMessage(shell, "播放源加载失败，请稍后重试或检查网络连接。");
                shell.classList.remove("is-loading");
            }
        });
        return;
    }

    showMessage(shell, "当前浏览器不支持 HLS 播放。");
    shell.classList.remove("is-loading");
}

function initPlayer(shell) {
    const button = shell.querySelector(".player-start");
    const video = shell.querySelector("video");
    const source = shell.dataset.videoUrl;
    let initialized = false;

    if (!button || !video) {
        return;
    }

    button.addEventListener("click", function () {
        if (!initialized) {
            initialized = true;
            attachHlsSource(video, source, shell);
        } else {
            shell.classList.add("is-playing");
            playVideo(video, shell);
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-player]").forEach(initPlayer);
});
