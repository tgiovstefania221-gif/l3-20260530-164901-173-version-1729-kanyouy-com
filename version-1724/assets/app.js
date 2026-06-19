(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
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

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-box]"));
    panels.forEach(function (panel) {
      var target = panel.getAttribute("data-target") || "";
      var grid = target ? document.querySelector(target) : null;
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card, .rank-row"));
      var search = panel.querySelector(".js-search");
      var category = panel.querySelector(".js-category");
      var year = panel.querySelector(".js-year");
      var type = panel.querySelector(".js-type");
      var clear = panel.querySelector(".js-clear-filter");

      function matches(card) {
        var query = normalize(search ? search.value : "");
        var cardText = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-tags"),
          card.textContent
        ].join(" "));
        var categoryValue = category ? category.value : "";
        var yearValue = year ? year.value : "";
        var typeValue = type ? type.value : "";
        if (query && cardText.indexOf(query) === -1) {
          return false;
        }
        if (categoryValue && card.getAttribute("data-category") !== categoryValue) {
          return false;
        }
        if (yearValue && card.getAttribute("data-year") !== yearValue) {
          return false;
        }
        if (typeValue && card.getAttribute("data-type") !== typeValue) {
          return false;
        }
        return true;
      }

      function apply() {
        cards.forEach(function (card) {
          card.classList.toggle("hidden-card", !matches(card));
        });
      }

      [search, category, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      if (clear) {
        clear.addEventListener("click", function () {
          if (search) {
            search.value = "";
          }
          if (category) {
            category.value = "";
          }
          if (year) {
            year.value = "";
          }
          if (type) {
            type.value = "";
          }
          apply();
        });
      }
    });
  }

  window.setupPlayer = function (source) {
    ready(function () {
      var video = document.getElementById("movieVideo");
      var cover = document.getElementById("playerStart");
      if (!video || !source) {
        return;
      }
      var started = false;

      function playVideo() {
        if (started) {
          video.play().catch(function () {});
          return;
        }
        started = true;
        if (cover) {
          cover.classList.add("is-hidden");
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.play().catch(function () {});
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          return;
        }
        video.src = source;
        video.play().catch(function () {});
      }

      if (cover) {
        cover.addEventListener("click", playVideo);
      }
      video.addEventListener("click", function () {
        if (!started || video.paused) {
          playVideo();
        }
      });
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
