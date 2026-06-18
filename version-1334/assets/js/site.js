(function () {
    var header = document.getElementById('siteHeader');
    var menuButton = document.querySelector('.menu-toggle');
    var mobileMenu = document.getElementById('mobileMenu');
    var backTop = document.querySelector('.back-top');

    function syncHeader() {
        if (!header) {
            return;
        }
        header.classList.toggle('is-scrolled', window.scrollY > 20);
        if (backTop) {
            backTop.classList.toggle('is-visible', window.scrollY > 420);
        }
    }

    if (menuButton && mobileMenu && header) {
        menuButton.addEventListener('click', function () {
            var expanded = menuButton.getAttribute('aria-expanded') === 'true';
            menuButton.setAttribute('aria-expanded', String(!expanded));
            mobileMenu.classList.toggle('is-open', !expanded);
            header.classList.toggle('menu-open', !expanded);
        });
    }

    if (backTop) {
        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    window.addEventListener('scroll', syncHeader, { passive: true });
    syncHeader();

    document.querySelectorAll('form[action="search.html"]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                window.location.href = 'search.html';
            }
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var previous = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, current) {
            var active = current === activeIndex;
            slide.classList.toggle('is-active', active);
            slide.setAttribute('aria-hidden', active ? 'false' : 'true');
        });
        dots.forEach(function (dot, current) {
            dot.classList.toggle('is-active', current === activeIndex);
        });
    }

    function startHero() {
        stopHero();
        if (slides.length > 1) {
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5000);
        }
    }

    function stopHero() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    if (slides.length) {
        showSlide(0);
        startHero();
        if (previous) {
            previous.addEventListener('click', function () {
                showSlide(activeIndex - 1);
                startHero();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                showSlide(activeIndex + 1);
                startHero();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startHero();
            });
        });
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim().toLowerCase();
    document.querySelectorAll('.page-search input[name="q"], .nav-search input[name="q"], .mobile-search input[name="q"]').forEach(function (input) {
        if (query && !input.value) {
            input.value = query;
        }
    });

    function applyVisibility() {
        var list = document.querySelector('.searchable-list');
        var noResults = document.querySelector('.no-results');
        if (!list) {
            return;
        }
        var items = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
        var visible = 0;
        items.forEach(function (item) {
            var matched = !item.classList.contains('is-filtered-out') && !item.classList.contains('is-search-hidden');
            item.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });
        if (noResults) {
            noResults.classList.toggle('is-visible', visible === 0);
        }
    }

    if (query) {
        document.querySelectorAll('.searchable-list .movie-card').forEach(function (card) {
            var haystack = (card.getAttribute('data-search') || '').toLowerCase();
            card.classList.toggle('is-search-hidden', haystack.indexOf(query) === -1);
        });
    }

    document.querySelectorAll('.filter-chip').forEach(function (chip) {
        chip.addEventListener('click', function () {
            var bar = chip.closest('.filter-bar');
            var field = chip.getAttribute('data-filter-field');
            var value = chip.getAttribute('data-filter-value');
            if (bar) {
                bar.querySelectorAll('.filter-chip').forEach(function (item) {
                    item.classList.toggle('is-active', item === chip);
                });
            }
            document.querySelectorAll('.searchable-list .movie-card').forEach(function (card) {
                var matched = field === 'all' || card.getAttribute('data-' + field) === value;
                card.classList.toggle('is-filtered-out', !matched);
            });
            applyVisibility();
        });
    });

    applyVisibility();
})();
