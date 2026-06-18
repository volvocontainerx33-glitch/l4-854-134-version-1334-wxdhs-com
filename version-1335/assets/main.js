(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var nav = document.getElementById('mainNav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var hero = document.getElementById('topHero');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('.hero-control.prev');
    var next = hero.querySelector('.hero-control.next');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-index')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);

    if (slides.length > 1) {
      start();
    }
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('.filter-panel'));

    panels.forEach(function (panel) {
      var input = panel.querySelector('.filter-input');
      var selects = Array.prototype.slice.call(panel.querySelectorAll('.filter-select'));
      var section = panel.closest('.content-section') || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll('.movie-card, .small-card'));

      function filterCards() {
        var query = normalize(input ? input.value : '');
        var selected = {};

        selects.forEach(function (select) {
          selected[select.getAttribute('data-filter')] = normalize(select.value);
        });

        cards.forEach(function (card) {
          var title = normalize(card.getAttribute('data-title'));
          var region = normalize(card.getAttribute('data-region'));
          var year = normalize(card.getAttribute('data-year'));
          var genre = normalize(card.getAttribute('data-genre'));
          var tags = normalize(card.getAttribute('data-tags'));
          var category = normalize(card.getAttribute('data-category'));
          var type = normalize(card.textContent);
          var haystack = [title, region, year, genre, tags, category, type].join(' ');
          var passQuery = !query || haystack.indexOf(query) !== -1;
          var passRegion = !selected.region || region === selected.region;
          var passType = !selected.type || type.indexOf(selected.type) !== -1;
          var passCategory = !selected.category || category === selected.category;

          card.style.display = passQuery && passRegion && passType && passCategory ? '' : 'none';
        });
      }

      if (input) {
        input.addEventListener('input', filterCards);
      }

      selects.forEach(function (select) {
        select.addEventListener('change', filterCards);
      });

      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q && input) {
        input.value = q;
        filterCards();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHero();
    initFilters();
  });
})();
