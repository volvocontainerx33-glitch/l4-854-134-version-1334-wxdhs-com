(function () {
    var header = document.querySelector("[data-header]");
    var menuToggle = document.querySelector("[data-menu-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");
    var backTop = document.querySelector("[data-back-top]");

    function onScroll() {
        var scrolled = window.scrollY > 40;
        if (header) {
            header.classList.toggle("scrolled", scrolled);
        }
        if (backTop) {
            backTop.classList.toggle("show", window.scrollY > 520);
        }
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (menuToggle && mobilePanel && header) {
        menuToggle.addEventListener("click", function () {
            var open = mobilePanel.classList.toggle("show");
            header.classList.toggle("open", open);
        });
    }

    if (backTop) {
        backTop.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var index = 0;
        var timer = null;

        function show(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
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
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initLocalFilter() {
        var input = document.querySelector("[data-local-search]");
        var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-year-filter]"));
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-search]"));
        if (!cards.length) {
            return;
        }
        var activeYear = "all";

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : "";
            cards.forEach(function (card) {
                var text = card.getAttribute("data-search") || "";
                var year = card.getAttribute("data-year") || "";
                var matchText = !query || text.indexOf(query) !== -1;
                var matchYear = activeYear === "all" || activeYear === year;
                card.style.display = matchText && matchYear ? "" : "none";
            });
        }

        if (input) {
            input.addEventListener("input", apply);
        }

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                activeYear = button.getAttribute("data-year-filter") || "all";
                buttons.forEach(function (item) {
                    item.classList.toggle("active", item === button);
                });
                apply();
            });
        });
    }

    function cardTemplate(item) {
        var tags = (item.tags || []).slice(0, 4).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\">" +
            "<a href=\"" + escapeHtml(item.url) + "\" class=\"movie-poster\" aria-label=\"" + escapeHtml(item.title) + "\">" +
            "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
            "<span class=\"poster-shade\"></span><span class=\"play-dot\">▶</span></a>" +
            "<div class=\"movie-card-body\"><h3><a href=\"" + escapeHtml(item.url) + "\">" + escapeHtml(item.title) + "</a></h3>" +
            "<p class=\"movie-meta\">" + escapeHtml(item.region) + " · " + escapeHtml(item.type) + " · " + escapeHtml(item.year) + "</p>" +
            "<p class=\"movie-line\">" + escapeHtml(item.oneLine) + "</p>" +
            "<div class=\"movie-tags\">" + tags + "</div></div></article>";
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initSearchPage() {
        var container = document.querySelector("[data-search-results]");
        var status = document.querySelector("[data-search-status]");
        var formInput = document.querySelector("[data-search-page-input]");
        if (!container || !window.MovieSearchData) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        if (formInput) {
            formInput.value = query;
        }
        var normalized = query.toLowerCase();
        var data = window.MovieSearchData;
        var results = normalized ? data.filter(function (item) {
            return item.search.indexOf(normalized) !== -1;
        }) : data.slice(0, 60);
        var limited = results.slice(0, 120);
        if (status) {
            status.textContent = normalized ? "搜索到 " + results.length + " 部相关影片" : "为你推荐热门影片";
        }
        container.innerHTML = limited.length ? limited.map(cardTemplate).join("") : "<div class=\"empty-state\">没有找到相关影片</div>";
    }

    initHero();
    initLocalFilter();
    initSearchPage();
}());
