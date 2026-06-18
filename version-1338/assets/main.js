(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function applyFilter(root, term) {
    var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
    var q = normalize(term);
    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' '));
      card.classList.toggle('is-hidden', q && text.indexOf(q) === -1);
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.filterable-list')).forEach(function (list) {
    var section = list.closest('section') || document;
    var input = section.querySelector('[data-filter-input]');
    var clear = section.querySelector('[data-filter-clear]');
    var chips = Array.prototype.slice.call(section.querySelectorAll('[data-filter-chip]'));
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';

    if (input && q) {
      input.value = q;
      applyFilter(list, q);
    }

    if (input) {
      input.addEventListener('input', function () {
        applyFilter(list, input.value);
      });
    }

    if (clear) {
      clear.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        applyFilter(list, '');
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var value = chip.getAttribute('data-filter-chip') || '';
        if (input) {
          input.value = value;
        }
        applyFilter(list, value);
      });
    });
  });
})();
