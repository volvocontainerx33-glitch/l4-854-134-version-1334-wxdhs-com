(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  if (toggle) {
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var show = function (next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    };
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  var input = document.querySelector('[data-filter-input]');
  var region = document.querySelector('[data-filter-region]');
  var year = document.querySelector('[data-filter-year]');
  var list = document.querySelector('[data-card-list]');

  if (input && list) {
    var params = new URLSearchParams(window.location.search);
    var keyword = params.get('keyword');
    if (keyword) {
      input.value = keyword;
    }

    var filter = function () {
      var q = (input.value || '').trim().toLowerCase();
      var r = region ? region.value : '';
      var y = year ? year.value : '';
      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-tags') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-year') || ''
        ].join(' ').toLowerCase();
        var okText = !q || haystack.indexOf(q) >= 0;
        var okRegion = !r || (card.getAttribute('data-region') || '').indexOf(r) >= 0;
        var okYear = !y || (card.getAttribute('data-year') || '').indexOf(y) >= 0;
        card.style.display = okText && okRegion && okYear ? '' : 'none';
      });
    };

    input.addEventListener('input', filter);
    if (region) {
      region.addEventListener('change', filter);
    }
    if (year) {
      year.addEventListener('change', filter);
    }
    filter();
  }
})();
