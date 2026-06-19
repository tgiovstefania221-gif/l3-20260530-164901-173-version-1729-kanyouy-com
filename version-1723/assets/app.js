(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-hero-panel]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var active = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            panels.forEach(function (panel, panelIndex) {
                panel.classList.toggle("is-active", panelIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }

        function restartHero() {
            if (timer) {
                clearInterval(timer);
            }

            if (slides.length > 1) {
                timer = setInterval(function () {
                    showSlide(active + 1);
                }, 5000);
            }
        }

        if (slides.length) {
            showSlide(0);
            restartHero();
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(active - 1);
                restartHero();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(active + 1);
                restartHero();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                restartHero();
            });
        });

        var catalog = document.querySelector("[data-catalog]");
        var searchInput = document.querySelector("[data-search-input]");
        var typeSelect = document.querySelector("[data-type-filter]");
        var yearSelect = document.querySelector("[data-year-filter]");
        var categoryButtons = Array.prototype.slice.call(document.querySelectorAll("[data-category-filter]"));
        var emptyState = document.querySelector("[data-empty-state]");
        var activeCategory = "all";

        function applyFilters() {
            if (!catalog) {
                return;
            }

            var term = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var typeValue = typeSelect ? typeSelect.value : "all";
            var yearValue = yearSelect ? yearSelect.value : "all";
            var visible = 0;
            var cards = Array.prototype.slice.call(catalog.querySelectorAll("[data-card]"));

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-region") || "",
                    card.getAttribute("data-type") || "",
                    card.getAttribute("data-genre") || ""
                ].join(" ").toLowerCase();
                var matchesTerm = !term || haystack.indexOf(term) !== -1;
                var matchesType = typeValue === "all" || card.getAttribute("data-type") === typeValue;
                var matchesYear = yearValue === "all" || card.getAttribute("data-year") === yearValue;
                var matchesCategory = activeCategory === "all" || card.getAttribute("data-category") === activeCategory;
                var shouldShow = matchesTerm && matchesType && matchesYear && matchesCategory;

                card.hidden = !shouldShow;

                if (shouldShow) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visible === 0);
            }
        }

        if (searchInput) {
            searchInput.addEventListener("input", applyFilters);
        }

        if (typeSelect) {
            typeSelect.addEventListener("change", applyFilters);
        }

        if (yearSelect) {
            yearSelect.addEventListener("change", applyFilters);
        }

        categoryButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                activeCategory = button.getAttribute("data-category-filter") || "all";
                categoryButtons.forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                applyFilters();
            });
        });

        applyFilters();

        var player = document.querySelector("[data-player-root]");

        if (player) {
            var video = player.querySelector("video");
            var cover = player.querySelector("[data-player-cover]");
            var button = player.querySelector("[data-player-button]");
            var streamUrl = player.getAttribute("data-stream");
            var isPrepared = false;
            var hls = null;

            function prepareVideo() {
                if (!video || !streamUrl || isPrepared) {
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                }

                video.controls = true;
                isPrepared = true;
            }

            function startVideo() {
                prepareVideo();

                if (cover) {
                    cover.hidden = true;
                }

                if (video) {
                    var attempt = video.play();
                    if (attempt && typeof attempt.catch === "function") {
                        attempt.catch(function () {});
                    }
                }
            }

            if (button) {
                button.addEventListener("click", startVideo);
            }

            if (cover) {
                cover.addEventListener("click", startVideo);
            }

            if (video) {
                video.addEventListener("click", function () {
                    if (!isPrepared || video.paused) {
                        startVideo();
                    }
                });
            }

            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        }
    });
})();
