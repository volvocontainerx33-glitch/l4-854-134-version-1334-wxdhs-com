(function () {
  var header = document.querySelector('[data-site-header]');
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  var backTop = document.querySelector('[data-back-top]');

  function updateChrome() {
    var scrolled = window.scrollY > 20;
    if (header) {
      header.classList.toggle('is-scrolled', scrolled);
    }
    if (backTop) {
      backTop.classList.toggle('is-visible', window.scrollY > 420);
    }
  }

  updateChrome();
  window.addEventListener('scroll', updateChrome, { passive: true });

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  if (backTop) {
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.querySelectorAll('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || input.value.trim()) {
        return;
      }
      event.preventDefault();
      window.location.href = './search.html';
    });
  });

  function setupHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupSearchPage() {
    var panel = document.querySelector('[data-search-page]');
    if (!panel) {
      return;
    }

    var queryInput = panel.querySelector('[data-filter-query]');
    var categorySelect = panel.querySelector('[data-filter-category]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var empty = document.querySelector('[data-search-empty]');
    var params = new URLSearchParams(window.location.search);

    if (queryInput && params.get('q')) {
      queryInput.value = params.get('q');
    }
    if (categorySelect && params.get('category')) {
      categorySelect.value = params.get('category');
    }
    if (yearSelect && params.get('year')) {
      yearSelect.value = params.get('year');
    }
    if (typeSelect && params.get('type')) {
      typeSelect.value = params.get('type');
    }

    function normalize(value) {
      return (value || '').toString().toLowerCase().trim();
    }

    function apply() {
      var query = normalize(queryInput ? queryInput.value : '');
      var category = categorySelect ? categorySelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var matchesQuery = !query || normalize(card.getAttribute('data-search')).indexOf(query) !== -1;
        var matchesCategory = !category || card.getAttribute('data-category') === category;
        var matchesYear = !year || card.getAttribute('data-year') === year;
        var matchesType = !type || card.getAttribute('data-type') === type;
        var show = matchesQuery && matchesCategory && matchesYear && matchesType;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [queryInput, categorySelect, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }

  function setupPlayers() {
    document.querySelectorAll('[data-hls-url]').forEach(function (wrap) {
      var video = wrap.querySelector('video');
      var trigger = wrap.querySelector('[data-player-trigger]');
      var url = wrap.getAttribute('data-hls-url');
      var loaded = false;
      var hls = null;

      function load() {
        if (loaded || !video || !url) {
          return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(url);
          hls.attachMedia(video);
        }
      }

      function play() {
        load();
        if (trigger) {
          trigger.classList.add('is-hidden');
        }
        if (video) {
          var promise = video.play();
          if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
          }
        }
      }

      if (trigger) {
        trigger.addEventListener('click', play);
      }

      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            play();
          }
        });
      }

      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  }

  setupHero();
  setupSearchPage();
  setupPlayers();
})();
