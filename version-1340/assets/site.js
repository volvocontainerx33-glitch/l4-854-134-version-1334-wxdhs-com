(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  const searchToggle = document.querySelector('[data-search-toggle]');
  const headerSearch = document.querySelector('[data-header-search]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  if (searchToggle && headerSearch) {
    searchToggle.addEventListener('click', function () {
      headerSearch.classList.toggle('is-open');
      const input = headerSearch.querySelector('input');
      if (input) {
        input.focus();
      }
    });
  }

  const carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    let current = 0;

    const show = function (next) {
      if (!slides.length) {
        return;
      }
      current = (next + slides.length) % slides.length;
      slides.forEach(function (slide, index) {
        slide.classList.toggle('is-active', index === current);
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle('is-active', index === current);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });

    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    const input = scope.querySelector('[data-filter-input]');
    const yearSelect = scope.querySelector('[data-filter-year]');
    const cards = Array.from(scope.querySelectorAll('[data-card]'));
    const empty = scope.querySelector('[data-filter-empty]');

    const filter = function () {
      const query = input ? input.value.trim().toLowerCase() : '';
      const year = yearSelect ? yearSelect.value : '';
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = [
          card.dataset.title || '',
          card.dataset.tags || '',
          card.dataset.region || '',
          card.dataset.type || '',
          card.dataset.year || '',
        ]
          .join(' ')
          .toLowerCase();
        const matchQuery = !query || haystack.includes(query);
        const matchYear = !year || card.dataset.year === year;
        const ok = matchQuery && matchYear;
        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };

    if (input) {
      input.addEventListener('input', filter);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', filter);
    }
  });

  const searchPage = document.querySelector('[data-search-page]');
  if (searchPage && window.SEARCH_DATA) {
    const params = new URLSearchParams(window.location.search);
    const form = searchPage.querySelector('[data-search-form]');
    const input = searchPage.querySelector('[data-search-input]');
    const results = searchPage.querySelector('[data-search-results]');
    const status = searchPage.querySelector('[data-search-status]');
    const buttons = Array.from(searchPage.querySelectorAll('[data-keyword]'));

    const escapeHtml = function (text) {
      return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const cardHtml = function (movie) {
      const tags = (movie.tags || [])
        .slice(0, 3)
        .map(function (tag) {
          return '<span>' + escapeHtml(tag) + '</span>';
        })
        .join('');
      return [
        '<article class="movie-card">',
        '<a href="' + escapeHtml(movie.url) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
        '<div class="movie-poster">',
        '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="movie-type">' + escapeHtml(movie.type) + '</span>',
        '<span class="movie-play">▶</span>',
        '</div>',
        '<div class="movie-card-body">',
        '<h3>' + escapeHtml(movie.title) + '</h3>',
        '<p>' + escapeHtml(movie.oneLine) + '</p>',
        '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
        '<div class="movie-tags">' + tags + '</div>',
        '</div>',
        '</a>',
        '</article>',
      ].join('');
    };

    const runSearch = function (query) {
      const keyword = String(query || '').trim().toLowerCase();
      if (input) {
        input.value = query || '';
      }
      if (!keyword) {
        results.innerHTML = '';
        status.textContent = '输入关键词后显示搜索结果';
        return;
      }

      const matches = window.SEARCH_DATA.filter(function (movie) {
        return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, (movie.tags || []).join(' ')]
          .join(' ')
          .toLowerCase()
          .includes(keyword);
      }).slice(0, 96);

      results.innerHTML = matches.map(cardHtml).join('');
      status.textContent = matches.length ? '搜索结果' : '未找到相关内容';
    };

    const initialQuery = params.get('q') || '';
    runSearch(initialQuery);

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        const query = input ? input.value.trim() : '';
        const next = new URL(window.location.href);
        if (query) {
          next.searchParams.set('q', query);
        } else {
          next.searchParams.delete('q');
        }
        window.history.replaceState({}, '', next.toString());
        runSearch(query);
      });
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        const keyword = button.dataset.keyword || '';
        const next = new URL(window.location.href);
        next.searchParams.set('q', keyword);
        window.history.replaceState({}, '', next.toString());
        runSearch(keyword);
      });
    });
  }
})();
