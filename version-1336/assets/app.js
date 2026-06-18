(function () {
    function $(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function $all(selector, scope) {
        return Array.from((scope || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initMobileNavigation() {
        var button = $(".menu-toggle");
        var menu = $(".mobile-nav");
        if (!button || !menu) {
            return;
        }

        button.addEventListener("click", function () {
            var expanded = button.getAttribute("aria-expanded") === "true";
            button.setAttribute("aria-expanded", String(!expanded));
            menu.hidden = expanded;
        });
    }

    function initSearchForms() {
        $all(".site-search-form").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                if (!query) {
                    event.preventDefault();
                    if (input) {
                        input.focus();
                    }
                    return;
                }

                event.preventDefault();
                var action = form.getAttribute("action") || "search.html";
                window.location.href = action + "?q=" + encodeURIComponent(query);
            });
        });
    }

    function initImageFallbacks() {
        $all("[data-cover-image]").forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("is-hidden");
            }, { once: true });
        });
    }

    function initHero() {
        var hero = $("[data-hero]");
        if (!hero) {
            return;
        }

        var slides = $all("[data-hero-slide]", hero);
        var dots = $all("[data-hero-dot]", hero);
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.dataset.heroDot || 0));
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initLocalFilters() {
        $all("[data-filter-panel]").forEach(function (panel) {
            var targetSelector = panel.getAttribute("data-target");
            var grid = targetSelector ? $(targetSelector) : null;
            if (!grid) {
                return;
            }

            var textInput = $("[data-filter-text]", panel);
            var typeSelect = $("[data-filter-type]", panel);
            var yearSelect = $("[data-filter-year]", panel);
            var emptyState = $("[data-empty-for='" + grid.id + "']");
            var cards = $all(".movie-card", grid);

            function apply() {
                var keyword = textInput ? textInput.value.trim().toLowerCase() : "";
                var type = typeSelect ? typeSelect.value : "";
                var year = yearSelect ? yearSelect.value : "";
                var visibleCount = 0;

                cards.forEach(function (card) {
                    var matchesKeyword = !keyword || (card.dataset.search || "").toLowerCase().includes(keyword);
                    var matchesType = !type || card.dataset.type === type;
                    var matchesYear = !year || card.dataset.year === year;
                    var visible = matchesKeyword && matchesType && matchesYear;
                    card.hidden = !visible;
                    if (visible) {
                        visibleCount += 1;
                    }
                });

                if (emptyState) {
                    emptyState.hidden = visibleCount !== 0;
                }
            }

            [textInput, typeSelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            apply();
        });
    }

    function uniqueSorted(values, descending) {
        var unique = Array.from(new Set(values.filter(Boolean)));
        unique.sort();
        if (descending) {
            unique.reverse();
        }
        return unique;
    }

    function addOptions(select, values) {
        if (!select) {
            return;
        }
        values.forEach(function (value) {
            var option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function movieCardTemplate(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");

        return "" +
            "<article class="movie-card" data-card-id="" + escapeHtml(movie.id) + "">" +
            "<a class="poster-link" href="" + escapeHtml(movie.url) + "" aria-label="" + escapeHtml(movie.title) + "">" +
            "<div class="poster-frame">" +
            "<img src="" + escapeHtml(movie.cover) + "" alt="" + escapeHtml(movie.title) + "" loading="lazy" data-cover-image>" +
            "<span class="poster-glow"></span>" +
            "<span class="type-badge">" + escapeHtml(movie.type) + "</span>" +
            "<span class="play-float">▶</span>" +
            "</div>" +
            "</a>" +
            "<div class="card-body">" +
            "<h3><a href="" + escapeHtml(movie.url) + "">" + escapeHtml(movie.title) + "</a></h3>" +
            "<p>" + escapeHtml(movie.oneLine) + "</p>" +
            "<div class="meta-line"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span></div>" +
            "<div class="tag-list">" + tags + "</div>" +
            "</div>" +
            "</article>";
    }

    function initSearchPage() {
        var results = $("[data-search-results]");
        if (!results || !window.MOVIE_CATALOG) {
            return;
        }

        var queryInput = $("[data-global-search]");
        var typeSelect = $("[data-global-type]");
        var categorySelect = $("[data-global-category]");
        var yearSelect = $("[data-global-year]");
        var status = $("[data-search-status]");
        var params = new URLSearchParams(window.location.search);

        addOptions(typeSelect, uniqueSorted(window.MOVIE_CATALOG.map(function (movie) { return movie.type; })));
        addOptions(yearSelect, uniqueSorted(window.MOVIE_CATALOG.map(function (movie) { return movie.year; }), true));
        addOptions(categorySelect, uniqueSorted(window.MOVIE_CATALOG.map(function (movie) { return movie.categoryName; })));

        if (queryInput) {
            queryInput.value = params.get("q") || "";
        }

        function render() {
            var keyword = queryInput ? queryInput.value.trim().toLowerCase() : "";
            var type = typeSelect ? typeSelect.value : "";
            var category = categorySelect ? categorySelect.value : "";
            var year = yearSelect ? yearSelect.value : "";

            var matched = window.MOVIE_CATALOG.filter(function (movie) {
                var corpus = [
                    movie.title,
                    movie.year,
                    movie.region,
                    movie.type,
                    movie.genre,
                    movie.categoryName,
                    movie.oneLine,
                    (movie.tags || []).join(" ")
                ].join(" ").toLowerCase();

                return (!keyword || corpus.includes(keyword)) &&
                    (!type || movie.type === type) &&
                    (!category || movie.categoryName === category) &&
                    (!year || movie.year === year);
            });

            results.innerHTML = matched.slice(0, 240).map(movieCardTemplate).join("");
            initImageFallbacks();

            if (status) {
                if (!matched.length) {
                    status.textContent = "没有找到符合条件的影片。";
                } else if (matched.length > 240) {
                    status.textContent = "已显示前 240 条匹配影片，可继续输入关键词缩小范围。";
                } else {
                    status.textContent = "已显示匹配影片。";
                }
            }
        }

        [queryInput, typeSelect, categorySelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", render);
                control.addEventListener("change", render);
            }
        });

        render();
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMobileNavigation();
        initSearchForms();
        initImageFallbacks();
        initHero();
        initLocalFilters();
        initSearchPage();
    });
})();
