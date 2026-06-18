
(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(i);
        start();
      });
    });

    show(0);
    start();
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var list = document.querySelector("[data-filter-list]");
    if (!panel || !list) {
      return;
    }
    var textInput = panel.querySelector("[data-filter-text]");
    var selects = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-key]"));
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
    var empty = document.querySelector("[data-empty-state]");

    function apply() {
      var text = normalizeText(textInput && textInput.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalizeText([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.tags
        ].join(" "));
        var matched = !text || haystack.indexOf(text) !== -1;
        selects.forEach(function (select) {
          var value = normalizeText(select.value);
          var key = select.getAttribute("data-filter-key");
          if (value && normalizeText(card.dataset[key]).indexOf(value) === -1) {
            matched = false;
          }
        });
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (textInput) {
      textInput.addEventListener("input", apply);
    }
    selects.forEach(function (select) {
      select.addEventListener("change", apply);
    });
    apply();
  }

  function movieCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class="movie-card" data-card data-title="" + escapeHtml(item.title) + "" data-region="" + escapeHtml(item.region) + "" data-type="" + escapeHtml(item.type) + "" data-year="" + escapeHtml(item.year) + "" data-tags="" + escapeHtml((item.tags || []).join(" ") + " " + item.genre) + "">",
      "<a href="" + item.url + "" class="card-link">",
      "<div class="card-poster"><img src="" + item.cover + "" alt="" + escapeHtml(item.title) + "" loading="lazy"><span class="card-type">" + escapeHtml(item.type) + "</span></div>",
      "<div class="card-body"><h3>" + escapeHtml(item.title) + "</h3><p>" + escapeHtml(item.oneLine) + "</p><div class="card-meta"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.region) + "</span></div><div class="tag-row">" + tags + "</div></div>",
      "</a>",
      "</article>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var input = document.querySelector("[data-search-input]");
    var empty = document.querySelector("[data-empty-state]");
    if (!results || !input || !window.SEARCH_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    input.value = params.get("q") || "";

    function render() {
      var q = normalizeText(input.value);
      var list = window.SEARCH_DATA.filter(function (item) {
        var text = normalizeText([
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          item.oneLine,
          (item.tags || []).join(" ")
        ].join(" "));
        return !q || text.indexOf(q) !== -1;
      }).slice(0, q ? 120 : 60);
      results.innerHTML = list.map(movieCard).join("");
      if (empty) {
        empty.classList.toggle("is-visible", list.length === 0);
      }
    }

    input.addEventListener("input", render);
    render();
  }

  window.initMoviePlayer = function (source) {
    var video = document.getElementById("movie-player");
    var overlay = document.getElementById("play-overlay");
    if (!video || !source) {
      return;
    }
    var attached = false;
    var hls = null;

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function startPlayback() {
      hideOverlay();
      if (!attached) {
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.play().catch(function () {});
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && hls) {
              hls.destroy();
              hls = null;
              video.src = source;
            }
          });
          return;
        }
        video.src = source;
      }
      video.play().catch(function () {});
    }

    if (overlay) {
      overlay.addEventListener("click", startPlayback);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });
    video.addEventListener("play", hideOverlay);
  };

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
